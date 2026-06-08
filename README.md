# ACE游戏管家 · 官方下载站

静态下载站，提供 **ACE游戏管家 APK**、刷机 ROOT 工具、常用电脑工具与网站导航。  
可部署到 Cloudflare Pages / Nginx / GitHub Pages / 任意静态主机，手机、平板、电脑浏览器均可访问。

## 目录结构

```text
.1.网站/
├── index.html
├── css/style.css
├── js/main.js
├── tools.json          # 工具清单（可由脚本重新生成）
├── assets/icon.png
├── downloads/          # APK 已移至 ../.1.网站-大文件/
└── 2/
    ├── 刷机与ROOT/     # 刷机相关 exe / zip
    ├── 常用工具/       # 电脑辅助工具
    ├── 网站跳转.txt    # 常用网站链接
    └── 激活windows.bat
```

## 本地预览

```powershell
cd "E:\共享文件\.1.网站"
.\scripts\serve-local.ps1
```

浏览器打开：`http://127.0.0.1:8080`

## 部署

将整个 `.1.网站` 目录上传到静态主机，绑定域名即可。

**Nginx 示例：**

```nginx
server {
    listen 80;
    server_name 你的域名.com;
    root /path/to/.1.网站;
    index index.html;

    location /downloads/ {
        add_header Content-Disposition attachment;
    }
}
```

## 更新内容

**APK**

1. 将新包放入 `downloads/`（如 `ACE.apk`）
2. 修改 `index.html` 中所有 APK 链接
3. 修改 `js/main.js` 中 `APP.version` 与 `APP.apk`

**工具文件**

1. 将新文件放入 `2/刷机与ROOT/` 或 `2/常用工具/`
2. 重新生成清单：`python scripts/gen-tools-json.py`
3. 或直接编辑 `tools.json`

**常用网站**

编辑 `2/网站跳转.txt`，每行格式：`名称 https://网址`

## 注意事项

- 建议部署 HTTPS，避免部分 Android 设备拦截下载
- 本地请用 HTTP 服务预览，不要直接用 `file://` 打开

## GitHub 25MB 限制

**当前方案**：[DEPLOY-蓝奏.md](DEPLOY-蓝奏.md) — 全部安装包走蓝奏，网页走 GitHub。

- 安装包：`E:\共享文件\.1.网站-大文件\`（13 个，上传蓝奏）
- 网页：`E:\共享文件\.1.网站\`（仅 html/css/js 等，上传 GitHub）
- 直链配置：`js/external-links.js`

---

## 上传到 Git（exe / apk 不进仓库）

**exe、apk、zip 体积大，Git 推送容易失败或极慢**，所以已配置 `.gitignore` 排除这些二进制。

| 内容 | 是否进 Git | 说明 |
|------|-----------|------|
| index.html、css、js、txt | ✅ 进 Git | 网页代码，体积小 |
| ACE.apk、各 exe / zip | ❌ 不进 Git | 部署时单独上传 |

### 推荐流程：Git 管代码 + 打包部署整站

**1. 安装 Git**  
[https://git-scm.com/download/win](https://git-scm.com/download/win)（勾选 Add Git to PATH）

**2. 只提交网页代码**

```powershell
cd "E:\共享文件\.1.网站"
.\scripts\init-git.ps1
.\scripts\init-git.ps1 -RemoteUrl "https://github.com/你的用户名/ace-download.git"
```

**3. 打包完整网站（含 exe、apk）用于上线**

```powershell
.\scripts\pack-deploy.ps1
```

会生成 `ace-site-deploy.zip`（约 240 MB），上传到：

- **Cloudflare Pages**：项目 → 上传资产（直接拖 zip 或文件夹）
- **服务器 / 网盘**：解压后整目录放到网站根目录

这样 Git 只同步代码，下载文件靠打包部署，互不影响。

### 方案二：GitHub Releases 放安装包（可选）

若希望安装包也在 GitHub 上：

1. 仓库 → **Releases** → **Create a new release**
2. 把 `ACE.apk`、常用 exe 拖到 **Attach binaries**
3. 发布后在 Release 页面提供直链下载

注意：Release 里的文件**不会**自动出现在 GitHub Pages 的 `2/xxx.exe` 路径，除非改网站链接指向 Release 地址。

### 方案三：Git LFS（不推荐新手）

大文件用 [Git LFS](https://git-lfs.com/) 追踪，免费额度有限，配置稍复杂。见 `.gitattributes` 注释。

### 仅 GitHub Pages 的注意

只 push Git 仓库时，**Pages 上不会有 exe/apk 下载**。必须：

- 用 `pack-deploy.ps1` 把完整目录部署到 Cloudflare Pages 等，或
- 二进制放 Releases / 网盘，并修改网站下载链接
