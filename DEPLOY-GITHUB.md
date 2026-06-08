# GitHub 上传说明

GitHub 网页上传有两个限制：

1. **不支持 exe / apk / bat 等格式**（会提示 We don't support that file type）
2. **单文件不能超过 25MB**

所以必须分开上传：

---

## 第一步：上传安装包到 Releases

1. 打开 `E:\共享文件\.1.网站-大文件\`
2. GitHub 仓库 → **Releases** → **Create a new release**
3. Tag 填 `v1.0`，标题填 `v1.0`
4. 把大文件文件夹里 **13 个文件**（不含 README）全部拖进 **Attach binaries**
5. 点 **Publish release**
6. 复制下载链接前缀，例如：

```text
https://github.com/你的用户名/你的仓库/releases/download/v1.0
```

7. 编辑 `js/releases-config.js`，把 `base` 改成你的地址

---

## 第二步：上传网页到 Git 仓库

`E:\共享文件\.1.网站\` 里只有网页代码，GitHub 网页能传：

```powershell
cd "E:\共享文件\.1.网站"
.\scripts\init-git.ps1 -RemoteUrl "https://github.com/你的用户名/你的仓库.git"
```

或在 GitHub 网页 **Add file → Upload files** 上传 html、css、js 等。

---

## 第三步：开启 GitHub Pages

仓库 → **Settings** → **Pages** → Branch 选 `main` → Save

---

## 分工一览

| 放哪里 | 内容 | 怎么传 |
|--------|------|--------|
| `.1.网站` | 网页代码 | Git push / 网页上传 |
| `.1.网站-大文件` | 全部 exe/apk/zip/bat | **Releases 拖文件** |

---

## 不想用 Releases？

用 **Cloudflare Pages** 直接上传整个 `.1.网站` + 把大文件复制回 `2/` 对应目录，  
并把 `js/releases-config.js` 里 `enabled` 改为 `false`。
