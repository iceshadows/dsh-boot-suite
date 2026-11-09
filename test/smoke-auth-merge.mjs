/* ============================================================================
 * 合并包宿主半侧冒烟测试（开机动画 + 壁纸 + 认证 一起 apply）
 * ----------------------------------------------------------------------------
 * 用假 ctx 把 lib/index.js 真跑起来，验证三件事：
 *   1) 三段都成功挂载（开机动画路由 / 壁纸配置路由 / 认证闸门）；
 *   2) 未登录时整站被闸门拦住（页面 302 到 /auth/login，API 401），
 *      连开机动画自己的 /dsh-startup/config 也不能漏；
 *   3) 用引导文件里的管理员口令登录后，请求正常转发给宿主，
 *      开机动画路由仍按原样工作。
 * 用法：node smoke-auth-merge.mjs
 * ========================================================================== */
import { EventEmitter } from 'node:events'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

/* 必须在 import 插件之前定好 DSH_HOME：开机动画在模块加载时就算配置路径。 */
const SMOKE_HOME = path.join(os.tmpdir(), 'dsh-boot-suite-merge-' + Date.now())
fs.mkdirSync(SMOKE_HOME, { recursive: true })
process.env.DSH_HOME = SMOKE_HOME

let pass = 0
let fail = 0
function check(label, ok, extra) {
  if (ok) { pass++; console.log('  ok   ' + label) }
  else { fail++; console.log('  FAIL ' + label + (extra !== undefined ? '  → ' + extra : '')) }
}

/* ── 假 http server + 宿主路由表 ─────────────────────────────────────────── */
const server = new EventEmitter()
const ROUTES = new Map()
const TAPS = []
let hostDispatches = 0
let bootRouteHits = 0

/* 模拟 DSH 自己的 request 监听器（网关要把它套在闸门后面）。 */
server.on('request', async (req, res) => {
  hostDispatches++
  const url = String(req.url || '/')
  const pathname = url.split('?')[0]
  const method = String(req.method || 'GET').toUpperCase()
  for (const [key, route] of ROUTES) {
    if (route.kind === 'exact' && route.path === pathname) {
      bootRouteHits++
      await route.handler(req, res)
      return
    }
    if (route.kind === 'prefix' && pathname.startsWith(route.path)) {
      bootRouteHits++
      await route.handler(req, res)
      return
    }
  }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
  res.end('<html><body>DSH SPA</body></html>')
})

const webServer = {
  server,
  register(route) {
    const key = route.kind + ' ' + route.path
    if (ROUTES.has(key)) throw new Error('duplicate route ' + key)
    ROUTES.set(key, route)
    return () => ROUTES.delete(key)
  },
  tapIndex(fn) { TAPS.push(fn); return () => TAPS.splice(TAPS.indexOf(fn), 1) },
  on() { return () => {} },
}

/* ── credentials / fs 桩（与 dsh-ui-auth 宿主测试同契约） ────────────────── */
const records = new Map()
const credentials = {
  async listRecords() { return [...records.keys()].map((key) => ({ key, kind: records.get(key).kind })) },
  async readRecord(key) { return records.get(key) },
  async modifyRecord(key, mutate) {
    const next = await mutate(records.get(key))
    if (next === undefined) return records.get(key)
    records.set(key, next)
    return next
  },
  async deleteRecord(key) { records.delete(key) },
}
const fsFiles = new Map()
const fsMock = {
  async resolve(p) { return { path: p } },
  async writeText(target, content) { fsFiles.set(target.path, content) },
  async readText(target) {
    const v = fsFiles.get(target.path)
    if (v === undefined) throw Object.assign(new Error('not found'), { code: 'FS_NOT_FOUND' })
    return v
  },
  async unlink(target) { fsFiles.delete(target.path) },
}

const modernConnection = {
  authorizeIndex(_req, res) {
    res.writeHead(200, { 'set-cookie': 'dsh-auth-carrier=1; Path=/; HttpOnly' })
    return true
  },
  authenticatedUrl(baseUrl) { return baseUrl },
  requestRejection() { return undefined },
  createSharedFetchHandler() {
    return { fetch: async () => new Response('{}', { status: 404, headers: { 'content-type': 'application/json' } }) }
  },
}

const disposers = []
const ctx = {
  webServer,
  get(name) {
    if (name === 'webServer') return webServer
    if (name === 'credentials') return credentials
    if (name === 'fs') return fsMock
    if (name === 'connection') return modernConnection
    return undefined
  },
  /* 真实 cordis 的 ctx.inject(deps, cb) 回调收到的是一个派生 ctx（有 get/on），
     不是服务对象本身；这里按同一形状给。 */
  inject(_deps, cb) {
    const derived = {
      webServer,
      get: (n) => ctx.get(n),
      on: () => () => {},
      effect: (fn) => ctx.effect(fn),
      logger: ctx.logger,
    }
    try { cb(derived) } catch (e) { /* noop */ }
    return () => {}
  },
  on() { return () => {} },
  /* cordis 的 effect 是「立即执行、返回即释放」；壁纸半侧的路由就长在 effect 里。 */
  effect(cb) {
    const dispose = cb()
    if (typeof dispose === 'function') disposers.push(dispose)
    return () => {}
  },
  interval() { return () => {} },
  logger: { warn() {}, error() {}, info() {} },
}

/* ── 请求工具 ────────────────────────────────────────────────────────────── */
const COOKIE_NAME = 'dsh_auth_' + (() => {
  const seed = process.env.DSH_HOME ?? process.cwd()
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return hash.toString(36)
})()

function makeReq(method, url, cookie, body, accept) {
  const req = new EventEmitter()
  req.method = method
  req.url = url
  req.headers = { host: 'localhost:3080', accept: accept || 'text/html' }
  if (cookie !== undefined) req.headers.cookie = COOKIE_NAME + '=' + cookie
  req.socket = { remoteAddress: '127.0.0.1' }
  req.destroy = () => {}
  const chunks = body !== undefined ? [Buffer.from(body)] : []
  req[Symbol.asyncIterator] = () => {
    let i = 0
    return { next: () => Promise.resolve(i < chunks.length ? { value: chunks[i++], done: false } : { value: undefined, done: true }) }
  }
  if (body !== undefined) {
    process.nextTick(() => { req.emit('data', Buffer.from(body)); req.emit('end') })
  }
  return req
}
function makeRes() {
  const res = { headersSent: false, status: 0, headers: {}, body: '', destroyed: false }
  res.writeHead = (s, h) => { res.status = s; Object.assign(res.headers, h || {}); res.headersSent = true }
  res.setHeader = (k, v) => { res.headers[k] = v }
  res.write = (b) => { res.body += (b === undefined ? '' : String(b)); return true }
  res.end = (b) => { if (b !== undefined) res.body += String(b); res.ended = true }
  res.destroy = () => { res.destroyed = true }
  return res
}
const settle = () => new Promise((r) => setImmediate(r))
/* /auth 页面与 RPC 是异步渲染/读体的，必须给足时间（与真实宿主上的时序一致）。 */
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
async function get(url, cookie, accept) {
  const res = makeRes()
  server.emit('request', makeReq('GET', url, cookie, undefined, accept), res)
  await settle()
  await wait(120)
  return res
}
async function post(url, cookie, body) {
  const res = makeRes()
  server.emit('request', makeReq('POST', url, cookie, body), res)
  await settle()
  await wait(150)
  return res
}
function parseJson(res) { try { return JSON.parse(res.body) } catch (e) { return null } }
function cookieOf(res) {
  const sc = res.headers['set-cookie']
  if (!sc) return undefined
  const m = new RegExp(COOKIE_NAME + '=([^;]+)').exec(sc)
  return m ? m[1] : undefined
}

/* ── 启动 ────────────────────────────────────────────────────────────────── */
console.log('\n[1] 合并包导出形状')
const plugin = await import('../lib/index.js')
check('name = dsh-boot-suite', plugin.name === 'dsh-boot-suite', plugin.name)
check('default 导出与具名导出是同一个对象', plugin.default && plugin.default.apply === plugin.apply)
check('inject 含 webServer / connection',
  plugin.inject.includes('webServer') && plugin.inject.includes('connection'), JSON.stringify(plugin.inject))
check('认证工具函数也透传出来（totpCodeAt）', typeof plugin.totpCodeAt === 'function')

plugin.apply(ctx)
await new Promise((r) => setTimeout(r, 400))

console.log('\n[2] 三段都挂上了')
check('开机动画路由已注册（/dsh-startup/config）', ROUTES.has('exact /dsh-startup/config'), [...ROUTES.keys()].join(','))
check('壁纸路由已注册（/chat-wallpaper）', [...ROUTES.keys()].some((k) => k.includes('/chat-wallpaper')), [...ROUTES.keys()].join(','))
check('index.html 注入钩子已注册', TAPS.length > 0, String(TAPS.length))
check('认证闸门已接管 request 监听器', server.listenerCount('request') === 1, String(server.listenerCount('request')))

const bootstrap = fsFiles.get('dsh-ui-auth-bootstrap.txt')
const pwMatch = bootstrap ? /密码:\s+(\S+)/.exec(bootstrap) : null
const adminPassword = pwMatch ? pwMatch[1] : null
check('引导文件已写出（管理员首次口令）', bootstrap !== undefined)
check('能取到管理员口令', adminPassword !== null)
check('管理员记录已落盘', records.has('dsh-auth/admin'))

console.log('\n[3] 未登录：整站被闸门挡住（包括开机动画自己的路由）')
{
  const res = await get('/')
  check('GET / → 302 /auth/login', res.status === 302 && res.headers.location === '/auth/login', res.status + ' ' + res.headers.location)
}
{
  const before = bootRouteHits
  const res = await post('/dsh-startup/config', undefined, JSON.stringify({ patch: {} }))
  check('未登录写 /dsh-startup/config → 401', res.status === 401, String(res.status))
  check('未登录时开机动画路由根本没有被执行', bootRouteHits === before)
}
{
  const res = await get('/auth/login')
  check('登录页可匿名访问（200）', res.status === 200 && res.body.includes('请登录后继续访问'), String(res.status))
}
{
  const res = await post('/api/remote/call', undefined, '{}')
  check('未登录调用 /api → 401', res.status === 401, String(res.status))
}

console.log('\n[4] 登录后：请求转发给宿主，开机动画照常工作')
let adminCookie
{
  const res = await post('/auth/login', undefined, JSON.stringify({ username: 'admin', password: adminPassword }))
  adminCookie = cookieOf(res)
  check('管理员登录成功', res.status === 200 && parseJson(res).ok === true, res.status + ' ' + res.body)
  check('签发会话 Cookie', adminCookie !== undefined, String(res.headers['set-cookie']))
}
{
  const before = hostDispatches
  const res = await get('/', adminCookie)
  check('登录后 GET / 到达宿主监听器', hostDispatches === before + 1)
  check('宿主返回 SPA 页面', res.status === 200 && res.body.includes('DSH SPA'), res.body.slice(0, 60))
}
{
  const res = await get('/dsh-startup/config', adminCookie, 'application/json')
  const j = parseJson(res)
  check('登录后 /dsh-startup/config 返回配置', res.status === 200 && j && j.ok === true, res.status + ' ' + res.body.slice(0, 80))
  check('配置里带插件版本号', j && typeof j.version === 'string' && /^\d+\.\d+\.\d+/.test(j.version), j && j.version)
}
{
  const res = await post('/auth/rpc/me', adminCookie, '{}')
  const j = parseJson(res)
  check('会话可查当前用户（admin）', res.status === 200 && j && j.me && j.me.role === 'admin', res.body.slice(0, 80))
}
{
  const res = await post('/auth/logout', adminCookie)
  check('注销成功', parseJson(res) && parseJson(res).ok === true, res.body)
  const res2 = await get('/')
  check('注销后 GET / 重新 302', res2.status === 302, String(res2.status))
}

/* 清理：释放 effect，避免定时器拖着进程 */
for (const dispose of disposers) {
  try { dispose() } catch (e) { /* noop */ }
}
fs.rmSync(SMOKE_HOME, { recursive: true, force: true })

console.log('\n' + (fail === 0 ? 'MERGE HOST SMOKE PASSED' : fail + ' FAILURES'))
process.exit(fail === 0 ? 0 : 1)
