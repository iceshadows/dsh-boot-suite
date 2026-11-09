/* ============================================================================
 * 重复安装的自救测试（2026-11-09 线上事故）
 * ----------------------------------------------------------------------------
 * 场景：用户先装了独立的 dsh-ui-auth，又装了本合并包。两个插件都想注册
 * `/auth` 前缀路由，第二次 register 会抛错；而此时它自己的闸门已经挂到
 * server 上（会话表却是空的），表现就是「输入密码后又被弹回登录页」。
 *
 * 期望：合并包在认证半侧失败时摘掉已有监听器并只留一个 503，
 * 让故障可见、可诊断，而不是静默死循环。
 *
 * 用法：node smoke-auth-duplicate.mjs
 * ========================================================================== */
import { EventEmitter } from 'node:events'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const SMOKE_HOME = path.join(os.tmpdir(), 'dsh-boot-suite-dup-' + Date.now())
fs.mkdirSync(SMOKE_HOME, { recursive: true })
process.env.DSH_HOME = SMOKE_HOME

let pass = 0
let fail = 0
function check(label, ok, extra) {
  if (ok) { pass++; console.log('  ok   ' + label) }
  else { fail++; console.log('  FAIL ' + label + (extra !== undefined ? '  → ' + extra : '')) }
}

const server = new EventEmitter()
const ROUTES = new Set()
let hostHits = 0
server.on('request', (req, res) => {
  hostHits++
  res.writeHead(200, { 'content-type': 'text/html' })
  res.end('<html>DSH SPA</html>')
})

const webServer = {
  server,
  register(route) {
    const key = route.kind + ' ' + route.path
    if (ROUTES.has(key)) {
      /* 真实宿主就是抛错拦住重名路由（认证插件正是靠这个避免两层 /auth） */
      throw new Error('route already registered: ' + key)
    }
    ROUTES.add(key)
    return () => ROUTES.delete(key)
  },
  tapIndex(fn) { return () => {} },
  on() { return () => {} },
}

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
const files = new Map()
const fsMock = {
  async resolve(p) { return { path: p } },
  async writeText(target, content) { files.set(target.path, content) },
  async readText(target) {
    const v = files.get(target.path)
    if (v === undefined) throw Object.assign(new Error('not found'), { code: 'FS_NOT_FOUND' })
    return v
  },
  async unlink(target) { files.delete(target.path) },
}
const connection = {
  authorizeIndex(_req, res) { res.writeHead(200, {}); return true },
  authenticatedUrl(baseUrl) { return baseUrl },
  requestRejection() { return undefined },
  createSharedFetchHandler() { return { fetch: async () => new Response('{}', { status: 404 }) } },
}

const disposers = []
function makeCtx() {
  return {
    webServer,
    get(name) {
      if (name === 'webServer') return webServer
      if (name === 'credentials') return credentials
      if (name === 'fs') return fsMock
      if (name === 'connection') return connection
      return undefined
    },
    inject(_deps, cb) {
      const derived = { webServer, get: (n) => ctx.get(n), on: () => () => {}, effect: (fn) => ctx.effect(fn), logger: ctx.logger }
      try { cb(derived) } catch (e) { /* noop */ }
      return () => {}
    },
    on() { return () => {} },
    effect(cb) {
      const dispose = cb()
      if (typeof dispose === 'function') disposers.push(dispose)
      return () => {}
    },
    interval() { return () => {} },
    logger: { warn() {}, error() {}, info() {} },
  }
}
const ctx = makeCtx()

function makeRes() {
  const res = { headersSent: false, status: 0, headers: {}, body: '' }
  res.writeHead = (s, h) => { res.status = s; Object.assign(res.headers, h || {}); res.headersSent = true }
  res.setHeader = (k, v) => { res.headers[k] = v }
  res.write = (b) => { res.body += String(b === undefined ? '' : b); return true }
  res.end = (b) => { if (b !== undefined) res.body += String(b) }
  res.destroy = () => {}
  return res
}
async function get(url) {
  const req = new EventEmitter()
  req.method = 'GET'
  req.url = url
  req.headers = { host: 'localhost:3080', accept: 'text/html' }
  req.socket = { remoteAddress: '127.0.0.1' }
  req.destroy = () => {}
  const res = makeRes()
  server.emit('request', req, res)
  await new Promise((r) => setTimeout(r, 120))
  return res
}

const plugin = await import('../lib/index.js')

console.log('\n[1] 第一次安装：认证正常，未登录会跳登录页')
plugin.apply(ctx)
await new Promise((r) => setTimeout(r, 400))
{
  const res = await get('/')
  check('未登录 GET / → 302 /auth/login', res.status === 302 && res.headers.location === '/auth/login', res.status + ' ' + res.headers.location)
}
const bootHits = hostHits
check('请求确实经过宿主监听器（闸门在转发）', bootHits >= 0)

console.log('\n[2] 模拟「又装了一遍 / 另一个认证插件已在」：/auth 路由重名')
plugin.apply(ctx)
await new Promise((r) => setTimeout(r, 200))

console.log('\n[3] 失败后必须 fail-closed，而不是登录页死循环')
{
  const before = hostHits
  const res = await get('/')
  check('GET / → 503（不再 302 回登录页）', res.status === 503, String(res.status))
  check('响应写明 fail-closed', res.body.includes('fail-closed'), res.body.slice(0, 80))
  check('502/503 不再转发给宿主', hostHits === before, 'hostHits=' + hostHits)
  check('server 上只剩一个 request 监听器', server.listenerCount('request') === 1, String(server.listenerCount('request')))
}

for (const dispose of disposers) {
  try { dispose() } catch (e) { /* noop */ }
}
fs.rmSync(SMOKE_HOME, { recursive: true, force: true })

console.log('\n' + (fail === 0 ? 'DUPLICATE-AUTH GUARD PASSED' : fail + ' FAILURES'))
process.exit(fail === 0 ? 0 : 1)
