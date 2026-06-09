# Cloudflare Pages 部署（推荐，最简单）

GitHub 传不了 exe/apk，**用 Cloudflare 直接上传整站**，所有下载都能用。

## 步骤

### 1. 注册 Cloudflare（免费）

打开 [https://dash.cloudflare.com](https://dash.cloudflare.com) 注册登录。

### 2. 创建 Pages 项目

1. 左侧 **Workers 和 Pages**
2. **创建** → **Pages** → **上传资产**（Direct Upload）
3. 项目名称随便填，如 `ace-download`

### 3. 上传网站

把文件夹 **`E:\共享文件\.1.网站`** 整个拖进上传区（含 downloads、2 里所有 exe/apk）。

或先打包再传：

```powershell
cd "E:\共享文件\.1.网站"
.\scripts\pack-deploy.ps1
```

上传生成的 `ace-site-deploy.zip`（若只接受文件夹就解压后拖文件夹）。

### 4. 部署完成

Cloudflare 会给你一个地址，例如：

```text
https://ace-download.pages.dev
```

打开即可下载 APK 和所有工具。

### 5. 绑定自己的域名（可选）

Pages 项目 → **自定义域** → 添加你的域名。

---

## 更新网站

改了文件后，在 Cloudflare Pages 项目里 **重新上传** 整个 `.1.网站` 文件夹即可。

---

## 和 GitHub 的关系

| 用途 | 平台 |
|------|------|
| 网站上线 + 所有下载 | **Cloudflare Pages** |
| 只备份网页代码（可选） | GitHub（不传 exe） |

`js/releases-config.js` 保持 `enabled: false`，下载走站内链接。
