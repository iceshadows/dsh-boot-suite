/**
 * dsh-boot-suite — 宿主半侧（开机动画 + 聊天壁纸 + 身份认证，三合一）
 * ---------------------------------------------------------------------------
 *   · auth/index.js     身份认证：/auth/* 页面与 RPC、用户/邀请码/审计、
 *                       TOTP 与通行密钥、Cookie 会话、HTTP/WS 全量闸门
 *   · host-startup.js   开机动画：/dsh-startup/* 路由 + index.html 首屏注入
 *   · host-wallpaper.js 聊天壁纸：/chat-wallpaper/* 路由 + 底图/横幅配置与静态图片路由
 *
 * 三份配置刻意**没有合并**，继续读原来的文件，老用户的设置原样生效：
 *   · $DSH_HOME/dsh-startup.json
 *   · $DSH_HOME/chat-wallpaper.json
 *   · 认证数据写在宿主的凭据文档（dsh-auth/* 记录）与会话文件里
 *
 * 启动顺序（从里到外）：
 *   1) 壁纸 / 开机动画先起 —— 它们只注册路由与 index.html 注入，不接管监听器；
 *   2) 认证最后起 —— 它会把 server 上已有的 request/upgrade 监听器摘下来，套一层
 *      闸门再转发，后注册的监听器等于天然落在闸门后面。这个顺序不能反。
 */
import * as startup from './host-startup.js'
import wallpaperPlugin from './host-wallpaper.js'
import * as auth from './auth/index.js'

const name = 'dsh-boot-suite'
const inject = ['webServer', 'connection']

/** 认证半侧启动失败时的兜底：宁可整站 503，也不能把未认证的 UI 暴露出去。
 *
 * 注意：认证半侧可能在**装完自己的闸门之后**才抛错（最典型的是 `/auth` 路由重名——
 * 说明同时还装着独立的 dsh-ui-auth）。那时 server 上已经挂了一层"会话表是空的"闸门，
 * 只追加一个 503 监听器会被它抢先处理，表现为「登录成功又被弹回登录页」的死循环。
 * 所以这里先把已有的 request/upgrade 监听器全部摘掉，再挂唯一的 503，让故障可见。 */
function installDenyAll(ctx, err) {
  const detail = String((err && err.stack) || err)
  const duplicateAuth = /\/auth|register|duplicate|already/i.test(detail)
  const message = '[dsh-boot-suite] 认证半侧启动失败，已按 fail-closed 拒绝全部请求：' + detail
    + (duplicateAuth
      ? '\n[dsh-boot-suite] 提示：如果同时安装过独立的 dsh-ui-auth，请先 `dsh plugin remove dsh-ui-auth` 再重启——'
        + '两层闸门会导致登录后又被弹回登录页。'
      : '')
  try {
    ctx.logger?.error?.(message)
  } catch (e) { /* 日志失败不影响兜底 */ }
  try {
    console.error(message)
  } catch (e) { /* noop */ }
  try {
    const server = ctx.get('webServer')?.server
    if (server && typeof server.removeAllListeners === 'function') {
      server.removeAllListeners('request')
      server.removeAllListeners('upgrade')
      server.on('request', (req, res) => {
        try {
          res.writeHead(503, { 'content-type': 'text/plain; charset=utf-8' })
          res.end(
            'dsh-boot-suite: authentication failed to start (fail-closed).\n'
            + 'If dsh-ui-auth is also installed, remove it and restart DSH.\n'
            + 'See the DSH host log for details.'
          )
        } catch (e) { /* 连接已断 */ }
      })
    }
  } catch (e) { /* 拿不到 server 就只剩日志 */ }
}

function apply(ctx) {
  /* 壁纸半侧"绝不抛异常"：壁纸坏了只能是没有壁纸，绝不能影响 DSH 启动。 */
  try {
    wallpaperPlugin.apply(ctx)
  } catch (err) {
    try {
      ctx.logger?.warn?.('[dsh-boot-suite] 聊天壁纸半侧启动失败，已跳过：' + String((err && err.message) || err))
    } catch (e2) { /* 日志失败不影响加载 */ }
  }

  /* 开机动画同样不应把界面锁死（宿主侧有 try/catch 与 9 秒兜底）。 */
  try {
    startup.apply(ctx)
  } catch (err) {
    try {
      ctx.logger?.warn?.('[dsh-boot-suite] 开机动画半侧启动失败，已跳过：' + String((err && err.message) || err))
    } catch (e2) { /* noop */ }
  }

  /* 认证必须最后起，并且失败时 fail-closed。 */
  try {
    auth.apply(ctx)
  } catch (err) {
    installDenyAll(ctx, err)
  }
}

/* 具名导出给 cordis-plugin-loader（它取 exports.default ?? exports）。
   两边都指向同一个对象，无论走哪条路结果一致。 */
const plugin = { name, inject, apply }
export { apply, inject, name }
export default plugin

/* 壁纸半侧的设置面板测试钩子原样透传：smoke-wallpaper-panel 直接从这里取，
   迁移时不必改断言。 */
export { __alphaOf, __listImages, __imageDir } from './host-wallpaper.js'

/* 认证半侧的可测试导出（与独立版 dsh-ui-auth 的契约保持一致）。 */
export { totpCodeAt, totpVerifyCode, readLockConfig, clientIp } from './auth/index.js'
