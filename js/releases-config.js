// 默认关闭。安装包直接放网站目录，用 Cloudflare Pages 整站上传即可。
// 只有用 GitHub Releases 时才设 enabled: true 并填写 base。
window.GITHUB_RELEASE = {
  enabled: false,
  base: "https://github.com/你的用户名/你的仓库/releases/download/v1.0",
  files: [],
};
