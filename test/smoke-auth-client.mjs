/* ============================================================================
 * 合并包浏览器半侧冒烟测试（认证段）
 * ----------------------------------------------------------------------------
 * 直接按 ModuleLoader 的方式加载合并后的 lib/client.js，验证：
 *   1) 仍然只有一次 __ModuleLoader__.load，注册 id = dsh-boot-suite；
 *   2) 开机动画 / 聊天壁纸 / 认证三段都在同一个 factory 里；
 *   3) 认证段的设置页注册（用户管理 / 模型锁 / 分享管理）在 apply 后正常出现；
 *   4) 认证段的 UI 与安全关键实现没有在合并时丢失。
 * 用法：node smoke-auth-client.mjs
 * ========================================================================== */
import fs from 'node:fs'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

let pass = 0
let fail = 0
function check(label, ok, extra) {
  if (ok) { pass++; console.log('  ok   ' + label) }
  else { fail++; console.log('  FAIL ' + label + (extra !== undefined ? '  → ' + extra : '')) }
}

/* ── 最小 React stub ─────────────────────────────────────────────────────── */
const React = {
  createElement(type, props, ...children) {
    const kids = children.length === 0 ? undefined : children.length === 1 ? children[0] : children
    return { type, props: Object.assign({}, props || {}, { children: kids }) }
  },
  useState(init) { return [typeof init === 'function' ? init() : init, () => {}] },
  useEffect() {},
  useRef(init) { return { current: init === undefined ? null : init } },
  useMemo(fn) { return fn() },
  useCallback(fn) { return fn },
}

/* ── window / document / 浏览器全局 stub ─────────────────────────────────── */
let loaded = null
const styleTags = []
const documentStub = {
  documentElement: { lang: 'zh-CN', classList: { add() {}, remove() {} } },
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: () => null,
  createElement: (tag) => {
    const el = {
      tag, dataset: {}, style: {}, children: [],
      appendChild(child) { this.children.push(child); return child },
      setAttribute() {}, removeAttribute() {}, addEventListener() {}, removeEventListener() {},
      set textContent(v) { this._t = v }, get textContent() { return this._t },
      set innerHTML(v) { this._h = v }, get innerHTML() { return this._h },
    }
    return el
  },
  head: { appendChild: (el) => styleTags.push(el) },
  body: { appendChild() {}, style: {}, classList: { add() {}, remove() {} } },
  addEventListener() {}, removeEventListener() {},
}
const windowStub = {
  __ModuleLoader__: { load: (entry) => { loaded = entry } },
  document: documentStub,
  addEventListener() {}, removeEventListener() {},
  location: { href: 'http://localhost:3080/', origin: 'http://localhost:3080', reload() {} },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
  navigator: { language: 'zh-CN', credentials: {} },
  MutationObserver: class { observe() {} disconnect() {} },
  setTimeout, clearTimeout, requestAnimationFrame: (fn) => setTimeout(fn, 0),
  btoa: (s) => Buffer.from(String(s), 'binary').toString('base64'),
  atob: (s) => Buffer.from(String(s), 'base64').toString('binary'),
  TextEncoder, TextDecoder,
  crypto: globalThis.crypto,
  console,
}

/* fetch stub：/auth/rpc/me 按场景返回；其余给开机动画一份默认配置。 */
let meJson = { ok: true, me: { username: 'admin', role: 'admin' } }
const rpcCalls = []
const fetchStub = async (url, init) => {
  const u = String(url)
  if (u.startsWith('/auth/rpc/')) {
    rpcCalls.push({ url: u, init })
    return { ok: true, status: 200, json: async () => meJson }
  }
  return {
    ok: true, status: 200,
    json: async () => ({
      ok: true, version: '9.9.9',
      config: { enabled: true, identity: 'JOYCE MOORE', identityId: '0087', theme: 'light', voicePack: 'f' },
      defaults: {}, templates: [], hidden: [], packs: [],
    }),
  }
}

/* ── 加载 bundle ─────────────────────────────────────────────────────────── */
const BUNDLE = fileURLToPath(new URL('../lib/client.js', import.meta.url))
const code = fs.readFileSync(BUNDLE, 'utf8')
const sandbox = {
  window: windowStub, document: documentStub, fetch: fetchStub,
  console, Promise, Object, Array, JSON, String, Number, Boolean, Math, Date, Error, RegExp,
  setTimeout, clearTimeout, setInterval, clearInterval, Symbol, Map, Set, Uint8Array, Buffer,
  localStorage: windowStub.localStorage, sessionStorage: windowStub.sessionStorage,
  navigator: windowStub.navigator, MutationObserver: windowStub.MutationObserver,
  requestAnimationFrame: windowStub.requestAnimationFrame, btoa: windowStub.btoa, atob: windowStub.atob,
  TextEncoder, TextDecoder, crypto: globalThis.crypto,
  URL, URLSearchParams,
}
sandbox.globalThis = sandbox
vm.createContext(sandbox)
vm.runInContext(code, sandbox, { filename: 'client.js' })

console.log('\n[1] 合并后的 bundle 协议')
check('只调用了一次 ModuleLoader.load', loaded !== null)
check('注册 id = dsh-boot-suite', loaded && loaded.id === 'dsh-boot-suite', loaded && loaded.id)
const loads = code.match(/__ModuleLoader__\.load\(/g) || []
check('bundle 里只有 1 处 __ModuleLoader__.load', loads.length === 1, String(loads.length))
check('三段 IIFE 都在（壁纸 / 开机动画 / 认证）',
  code.includes('var __wallHalf') && code.includes('var __bootHalf') && code.includes('var __authHalf'))

console.log('\n[2] factory 导出形状')
const mod = loaded.factory((name) => {
  if (name === 'react') return React
  throw new Error('unexpected require: ' + name)
})
check('exports.apply 是函数', typeof mod.apply === 'function')
check('exports.inject = ["slots"]', Array.isArray(mod.inject) && mod.inject.length === 1 && mod.inject[0] === 'slots', JSON.stringify(mod.inject))
check('开机动画测试钩子仍在', typeof mod.__applyNow === 'function' && typeof mod.__teardown === 'function')
check('壁纸测试钩子仍在', typeof mod.__mountBg === 'function' && typeof mod.__applyNow === 'function')

/* ── apply：三个半侧都要起来 ─────────────────────────────────────────────── */
function makeCtx() {
  const recorded = []
  const slots = {
    inject(name, fn) { return fn() },
    register(opts, render) { recorded.push({ opts, render }); return { dispose() {} } },
  }
  return {
    ctx: {
      slots,
      get: (name) => (name === 'slots' ? slots : undefined),
      effect(fn) { try { fn() } catch (e) { /* noop */ } return () => {} },
      on() { return () => {} },
    },
    recorded,
  }
}
const tick = () => new Promise((r) => setTimeout(r, 30))

console.log('\n[3] Admin：认证段注册用户管理 + 分享管理')
const s1 = makeCtx()
mod.apply(s1.ctx)
await tick()
check('开机动画半侧已注册', s1.recorded.some((r) => r.opts.id === 'startup-screen'))
check('认证段：auth-users 已注册', s1.recorded.some((r) => r.opts.id === 'auth-users'))
check('认证段：admin 不注册模型锁', !s1.recorded.some((r) => r.opts.id === 'models'))
check('认证段：auth-shares 已注册', s1.recorded.some((r) => r.opts.id === 'auth-shares'))
check('认证段：apply 后调用了 /auth/rpc/me', rpcCalls.some((c) => c.url === '/auth/rpc/me'))
{
  const authReg = s1.recorded.find((r) => r.opts.id === 'auth-users')
  const inner = authReg && authReg.render().type()
  check('auth-users 面板渲染出 .dshua 根节点', inner && inner.props.className === 'dshua', inner && inner.props.className)
}

console.log('\n[4] 普通用户：模型锁（priority -1）+ 无分享管理')
meJson = { ok: true, me: { username: 'test1', role: 'user' } }
const s2 = makeCtx()
mod.apply(s2.ctx)
await tick()
check('普通用户：auth-users 仍注册', s2.recorded.some((r) => r.opts.id === 'auth-users'))
check('普通用户：auth-shares 不注册', !s2.recorded.some((r) => r.opts.id === 'auth-shares'))
const modelsReg = s2.recorded.find((r) => r.opts.id === 'models')
check('普通用户：模型锁已注册', modelsReg !== undefined)
check('普通用户：模型锁 priority = -1', modelsReg && modelsReg.opts.priority === -1, modelsReg && String(modelsReg.opts.priority))

console.log('\n[5] 认证 UI / 安全关键实现未在合并时丢失（静态断言）')
const mustHave = [
  ['用户管理设置区', 'auth-users'],
  ['TOTP 两步验证', '两步验证（TOTP）'],
  ['TOTP 二维码', 'TOTP 二维码'],
  ['邀请码管理', '邀请码管理（管理员）'],
  ['通行密钥（Passkey）', '通行密钥（Passkey）'],
  ['Passkey 社区库', 'startRegistration'],
  ['Passkey 浏览器端 bundle 引用', '@simplewebauthn/browser'],
  ['改密入口', 'passkeyStepUp'],
  ['插件管理器只读守卫', 'dshuaReadonly'],
  ['两步验证提醒', 'showTotpReminder'],
]
for (const [label, needle] of mustHave) check(label + '（' + needle + '）', code.includes(needle))
check('登录因子提示（动态码）', code.includes('登录需密码 + 动态码'))
check('登录因子提示（通行密钥）', code.includes('登录需密码 + 通行密钥'))
check('删除旧导航 hack', !code.includes('dsh-ui-auth-navhide'))

console.log('\n' + (fail === 0 ? 'AUTH CLIENT SMOKE PASSED' : fail + ' FAILURES'))
process.exit(fail === 0 ? 0 : 1)
