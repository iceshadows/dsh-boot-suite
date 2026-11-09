# 安装

## 普通用户：Windows 一键安装（推荐）

1. 下载 **`dsh-boot-suite-win.zip`**（不是 `.tgz`，见下方 FAQ）
2. 右键 → **全部解压**（不要在压缩包里直接双击）
3. **完全退出** DeepSeek Harness Desktop（托盘图标也要退出）
4. 双击解压出来的 **`安装.cmd`**
5. 弹出 PowerShell 窗口 → 一路确认；安装完成后重新打开 DSH
6. 设置页应多出「启动动画」「聊天背景」两项

> 如果双击后一闪而过：右键 `安装.cmd` → 以管理员身份运行，或在 PowerShell 里执行
> `powershell -ExecutionPolicy Bypass -File .\tools\install.ps1`

## 下载了 `.tgz` 找不到安装.cmd？

`.tgz` 是给 `npm` / 命令行用户的压缩包，Windows 资源管理器**不能直接打开**，
有些解压软件还会把里面的中文文件名解成乱码（`��װ.cmd`）。

**请改下 `dsh-boot-suite-win.zip`**：解压后根目录第一个文件就是 `安装.cmd`。

## 认证（v3.0.0 起）

3.0.0 起本插件已经包含完整认证网关，**不需要再单独安装 `dsh-ui-auth`**（同时装会让两层闸门互相套）。

1. 装好重启 DSH，第一次打开会跳到 `/auth/login`（登录页）
2. 用户名 `admin`，密码看两处：DSH 控制台日志里 `[dsh-ui-auth]` 那段，或进程工作目录下的
   `dsh-ui-auth-bootstrap.txt`
3. 登录后进【设置】→【用户管理】立即改密；改密成功后引导文件会自动删除
4. 想给家人/同事开账号：在【用户管理】新增用户或生成邀请码；每个用户的模型与 API Key 相互独立
5. 想开两步验证：同一个页面里「两步验证（TOTP）」扫码绑定；也可以添加通行密钥（Passkey）

> 忘记管理员密码：删掉 `~/.dsh/.credentials.yaml` 里的 `dsh-auth/admin` 记录，重启后重新引导。
> 详细说明与救援路径见 [AUTH.md](AUTH.md)。
> `dsh-boot-suite-win.zip` 自带认证依赖（`node_modules`），离线/`link:` 安装也能直接跑；
> npm 安装则由 npm 自动装依赖。

## Linux / NAS（web profile）

**不要用 `dsh-boot-suite-win.zip` 在 Linux 上解压**：那个包的文件名分隔符是 Windows 的 `\`，
Linux 的 `unzip` 会把 `lib\index.js` 当成一个普通文件名，结果根本没有 `lib/` 目录，
DSH 的插件管理器就会报「该路径不存在或是无效的插件包」。

用 Linux 包 `dsh-boot-suite-linux.zip`（文件名用正斜杠、UTF-8 标记，已带 `node_modules`，不需要联网装依赖）：

```bash
# 解到 DSH_HOME 下（以飞牛 NAS 的 /vol1/@appshare/Harness/.dsh 为例）；
# 压缩包头就是 package.json，解到单独目录里正好是插件目录
mkdir -p /vol1/@appshare/Harness/.dsh/dsh-boot-suite
unzip -o dsh-boot-suite-linux.zip -d /vol1/@appshare/Harness/.dsh/dsh-boot-suite

# 自查：必须直接看到 package.json、lib/、cordis.patch.yml
ls -l /vol1/@appshare/Harness/.dsh/dsh-boot-suite
ls -l /vol1/@appshare/Harness/.dsh/dsh-boot-suite/lib/index.js
```

> 用 NAS 自带的解压工具也行：解出来的目录里只要有 `package.json`，那个目录就是插件目录。
> 别用 `dsh-boot-suite-win.zip` 替代——它的路径分隔符是 `\`，Linux 解压会散成一堆平铺文件。

然后在「设置 → 插件 → 添加插件」里填：

    /vol1/@appshare/Harness/.dsh/dsh-boot-suite

或者走命令行（等价）：

```bash
dsh plugin --profile web add /vol1/@appshare/Harness/.dsh/dsh-boot-suite
```

两个常见坑：

- 用 `dsh-boot-suite.tgz`（npm 包）解压会多一层 `package/`，填路径时要填到 **有 package.json 的那一层**。
- 运行时 Node 需要 **≥ 22.19**（认证依赖 `@simplewebauthn/server` 要求 Node 22+）；`node -v` 确认一下。

## 开发者 / 命令行安装

## 桌面端（DeepSeek Harness Desktop）

    1) 完全退出桌面端（任务管理器里不要留进程）
    2) dsh plugin --profile desktop add link:<本仓库路径>\01-源码
    3) 重新打开桌面端

桌面端必须在**完全退出**的状态下装 —— profile 的 package.json 由桌面端进程加锁管理。

装之前若还装着旧的两个插件，先卸掉：

    dsh plugin --profile desktop remove dsh-startup-screen
    dsh plugin --profile desktop remove dsh-chat-wallpaper

## web profile

    dsh plugin --profile web add link:<本仓库路径>\01-源码

## 换装后要确认的四件事

1. 打开面板先出现**登录页**（`/auth/login`），用 `admin` + 引导密码能登进去
2. 设置页多出**三项**：「用户管理」「启动动画」（顶部显示当前版本号）和「聊天背景」
3. 冷启动播六幕动画，播完进聊天；随后落在聊天底图上（大字横幅可选）
4. 左下角不再有浮层「🖼 背景」按钮（设置已并入设置页）

## 卸载

    dsh plugin --profile desktop remove dsh-boot-suite

配置文件不会自动删除，要清干净手动删：

    ~/.dsh/dsh-startup.json
    ~/.dsh/chat-wallpaper.json

认证数据在宿主的凭据文档与会话文件里，卸载插件不会自动删除：
`dsh-auth/*` 记录、`dsh-ui-auth-sessions.json`、`dsh-ui-auth-bootstrap.txt`。

## 排错：安装时提示「找不到 DeepSeek Harness 的命令行（dsh）」

这不是你没装桌面端，而是你的桌面端**没有携带命令行工具**（精简安装 / 便携版 / 商店版常见）。

### v2.7.1 起

安装脚本会自动：

1. 依次查 PATH → `%LOCALAPPDATA%\Programs` → 注册表卸载项 → 运行中进程 → 常见目录递归
2. 仍找不到时改为**手动安装**（直接写 profile 配置 + 建 `node_modules` 目录联接），不需要 CLI

### 旧版（≤ v2.7.0）临时办法

1. 右键桌面快捷方式 → 打开文件所在位置
2. 看是否存在 `resources\runtime\cli\bin\dsh.cmd`
3. 有 → 把该目录加进 PATH 后重跑安装脚本
4. 没有 → 升级到 v2.7.1，或手动安装：
   - 编辑 `%USERPROFILE%\.dsh\profiles\desktop\package.json`，在 `dependencies` 里加 `"dsh-boot-suite": "link:你的插件绝对路径"`
   - 在 `dsh.profile.bundles` 里加 `dsh-boot-suite`
   - 用管理员 CMD 执行 `mklink /J "%USERPROFILE%\.dsh\profiles\desktop\node_modules\dsh-boot-suite" "你的插件绝对路径"`
