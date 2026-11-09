# 身份验证（v3.0.0 起并入）

> 本包从 **3.0.0** 起把 [dsh-ui-auth](https://github.com/0QwQ0/dsh-ui-auth)（v0.7.1）整套认证网关
> 合并了进来：**开机动画 + 聊天壁纸 + 真实身份验证**，仍然只有一个插件、一条 bundle 行。

## 1. 它会做什么

| 能力 | 说明 |
|---|---|
| 全站闸门 | 未登录时页面请求 302 到 `/auth/login`，`/api/*`、`/plugins/*`、HMR、静态资源与 WebSocket 升级一律拒绝 |
| 登录保护 | 登录页、注册页（邀请码）、注销、改密全部走 `/auth/*` |
| 用户管理 | 设置页「用户管理」：新增/删除用户、重置密码、切换角色、邀请码、审计 |
| 两步验证 | TOTP（动态码，带二维码）；开启后登录需要「密码 + 动态码」 |
| 通行密钥 | Passkey / WebAuthn：本机添加、手机扫码添加、重命名、删除；管理员可清除某人丢失的密钥 |
| 按用户隔离 | 每个用户自己的模型配置与 API Key（私有配置加密存储），管理员可在「分享管理」里授权 |
| 普通用户只读 | 普通用户看不到插件安装/卸载入口，模型页按用户裁剪 |

认证**默认强制开启**，没有"跳过登录"的开关。首次启动会自动创建管理员 `admin`。

## 2. 启动与请求顺序

```
浏览器 ──▶ 认证闸门（最外层）
              ├─ /auth/*                    → 登录/注册/用户管理页面与 RPC
              ├─ 未登录                     → 302 /auth/login（页面）或 401（API/WS）
              └─ 已登录                     → 宿主路由
                                               ├─ /dsh-startup/*   开机动画
                                               ├─ /chat-wallpaper/* 聊天壁纸
                                               └─ 其它             DSH 本体
```

所以登录成功后才看得到开机动画；开机动画与壁纸自己的接口同样受登录保护。
宿主编译期顺序：壁纸 → 开机动画 → 认证（认证必须最后起，才能把已有监听器套进闸门）。

## 3. 首次登录

用户表为空时自动创建 `admin`，随机密码同时出现在两处：

1. 面板/桌面端控制台日志（`[dsh-ui-auth]` 开头）；
2. 进程工作目录下的 `dsh-ui-auth-bootstrap.txt`。

用 `admin` + 该密码登录，**登录后立刻在【设置】→【用户管理】里改密**；任意用户改密成功后引导文件会自动删除。

## 4. 忘记密码 / 救援

- **忘记管理员密码**：删除凭据文档里 `dsh-auth/admin` 记录（`~/.dsh/.credentials.yaml` 里同名段），
  重启后会重新生成 `admin` 与新的随机密码（该账号的 TOTP、通行密钥、私有配置会丢）。
  其他用户的密码可由管理员重置。
- **通行密钥设备丢了**：若还绑定了 TOTP，用「密码 + 动态码」登录后自行删除；
  否则请管理员在用户管理里点「清除通行密钥」。
- **认证半侧启动失败**：合并入口按 **fail-closed** 处理——所有请求返回 503，
  绝不放开未认证的 UI。出错原因在宿主日志里（`[dsh-boot-suite] 认证半侧启动失败`）。

## 5. 数据与配置

| 位置 | 内容 |
|---|---|
| 宿主凭据文档 `dsh-auth/*` | 用户记录（口令 PBKDF2 哈希 + 盐）、TOTP、通行密钥、私有/分享配置、uid 映射 |
| `dsh-ui-auth-sessions.json` | 会话（token 哈希落盘，不含明文） |
| `dsh-ui-auth-bootstrap.txt` | 首次引导口令（改密后自动删除） |
| `~/.dsh/dsh-startup.json` | 开机动画配置（与认证无关） |
| `~/.dsh/chat-wallpaper.json` | 聊天壁纸配置（与认证无关） |

会话 Cookie 名按 `DSH_HOME` 派生：同一实例重启不掉线，同机多实例互不踢线。

### 环境变量

| 变量 | 作用 |
|---|---|
| `DSH_AUTH_TRUST_PROXY=1` | 反向代理后按 `X-Forwarded-For` 取客户端 IP（否则限流按代理 IP 聚合） |
| `DSH_AUTH_MAX_FAILS` / `DSH_AUTH_LOCK_MS` | 登录失败次数与锁定时长 |
| `DSH_AUTH_RP_ID` / `DSH_AUTH_ORIGIN` / `DSH_AUTH_RP_NAME` | 通行密钥的 RP ID / Origin / 显示名（反代或多域名时必须显式指定） |
| `DSH_AUTH_MUX_PROXY=0` | **仅排障**：关闭 `remote.mux` 逐帧过滤（跨用户泄漏会重现） |

## 6. 与独立版 dsh-ui-auth 的关系

- **不要同时安装** `dsh-ui-auth` 与新版 `dsh-boot-suite`：两层闸门会互相套、`/auth` 路由还会撞名。
  升级到 3.0.0 前先 `dsh plugin remove dsh-ui-auth`。
- 认证的宿主文件原样放在 `lib/auth/`（源码零改写），浏览器半侧内嵌进 `lib/client.js` 的第三段 IIFE。
- 独立版的 npm 依赖（`@simplewebauthn/server`、`ws`、`qrcode`）已声明在 `package.json`，
  并使用 `link:` 方式安装时也随 `dsh-boot-suite-win.zip` 一并分发 `node_modules`，离线可用。
- 独立版文档（架构、RBAC、兼容矩阵）见上游仓库；本包只在 `lib/auth/` 内保留运行所需代码。

## 7. 自测

```bash
npm test                          # 全量：原有 15 个冒烟 + 下面 3 个
node test/smoke-auth-host.mjs     # 认证宿主：引导、闸门、登录、用户/RPC、Passkey、会话持久化
node test/smoke-auth-client.mjs   # 合并客户端：单次注册、三段 IIFE、认证设置页、UI 关键实现
node test/smoke-auth-merge.mjs    # 合并宿主：三段同时挂载、未登录全站拦截、登录后开机动画路由照常
```
