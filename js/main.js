const APP = {
  version: "1.8.0",
  apk: "downloads/ACE.apk",
};

/** 与 CDN app-update.json 同步，不依赖 releases-config.js */
const APP_UPDATE_MANIFEST_URL = "https://wang-bak.pages.dev/app-update.json";

function formatBytes(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function resolveSizeText(data) {
  if (data.sizeLabel && String(data.sizeLabel).trim()) {
    return String(data.sizeLabel).trim();
  }
  return formatBytes(data.sizeBytes);
}

function absoluteUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  const base = window.location.href.replace(/[^/]*$/, "");
  return new URL(path.replace(/^\//, ""), base).href;
}

function releaseUrl(filename) {
  const cfg = window.GITHUB_RELEASE;
  if (!cfg?.enabled || !cfg.base || !cfg.files?.includes(filename)) return null;
  return `${cfg.base.replace(/\/$/, "")}/${encodeURIComponent(filename)}`;
}

function applyDownloadUrl(url) {
  if (!url) return;
  document.querySelectorAll(
    "#hero-download, #launcher-download, .header-cta, .mobile-drawer a.btn-primary",
  ).forEach((link) => {
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    const card = btn.closest(".product-card.featured, .card-actions");
    if (card) btn.setAttribute("data-copy", url);
  });
}

function applyVersionSize(versionName, sizeText) {
  const version = versionName || "—";
  document.getElementById("stat-app-ver")?.textContent = version;
  document.getElementById("launcher-version")?.textContent = `v${version}`;
  const size = sizeText || "—";
  document.getElementById("launcher-size")?.textContent = size;
  document.getElementById("stat-app-size")?.textContent = size;
}

function fetchManifestJson(url) {
  const bust = `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;
  return fetch(bust, {
    cache: "no-store",
    mode: "cors",
    credentials: "omit",
  }).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });
}

function fetchManifestXhr(url) {
  const bust = `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", bust, true);
    xhr.responseType = "text";
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(`HTTP ${xhr.status}`));
        return;
      }
      try {
        resolve(JSON.parse(xhr.responseText));
      } catch (e) {
        reject(e);
      }
    };
    xhr.onerror = () => reject(new Error("network error"));
    xhr.send();
  });
}

function applyFromManifest(data) {
  if (!data) return false;
  applyVersionSize(data.versionName, resolveSizeText(data));
  if (data.downloadUrl) applyDownloadUrl(data.downloadUrl);
  return true;
}

function loadManifestScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;
    script.async = true;
    script.onload = () => resolve(window.__APP_RELEASE_DATA || null);
    script.onerror = () => reject(new Error("script load failed"));
    document.head.appendChild(script);
  });
}

async function loadAppUpdateManifest() {
  // 本地 js/app-release-local.js 已在 main.js 之前同步注入
  applyFromManifest(window.__APP_RELEASE_DATA);

  const scriptUrl = window.APP_UPDATE_SCRIPT_URL || "https://wang-bak.pages.dev/app-update.js";
  try {
    const data = await loadManifestScript(scriptUrl);
    applyFromManifest(data);
  } catch (scriptErr) {
    console.warn("app-update.js 加载失败，使用本地数据", scriptErr);
  }

  const manifestUrl =
    window.APP_UPDATE_MANIFEST_URL || APP_UPDATE_MANIFEST_URL;
  if (!manifestUrl) return;

  try {
    const data = await fetchManifestJson(manifestUrl);
    applyFromManifest(data);
  } catch (fetchErr) {
    console.warn("fetch 失败，尝试 XHR", fetchErr);
    try {
      const data = await fetchManifestXhr(manifestUrl);
      applyFromManifest(data);
    } catch (xhrErr) {
      console.warn("无法加载 app-update.json", xhrErr);
    }
  }
}

function applyReleaseLinks() {
  const cfg = window.GITHUB_RELEASE;
  if (!cfg?.enabled || !cfg.base || cfg.base.includes("你的用户名")) return;

  document.querySelectorAll("[data-copy]").forEach((btn) => {
    const path = btn.getAttribute("data-copy");
    const name = path.split("/").pop();
    const url = releaseUrl(name);
    if (!url) return;

    const actions = btn.closest(".card-actions");
    const link = actions?.querySelector("a.btn-primary");
    if (link) {
      link.href = url;
      link.removeAttribute("download");
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    btn.setAttribute("data-copy", url);
  });

  document.querySelectorAll('a[href*="ACE.apk"]').forEach((link) => {
    const url = releaseUrl("ACE.apk");
    if (!url) return;
    link.href = url;
    link.removeAttribute("download");
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });
}

function showToast(message) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.remove("show"), 2400);
}

function setupCopyButtons() {
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-copy]");
    if (!btn) return;
    const path = btn.getAttribute("data-copy");
    const url = absoluteUrl(path);
    try {
      await navigator.clipboard.writeText(url);
      showToast("链接已复制");
    } catch {
      showToast(url);
    }
  });
}

function setupNav() {
  const toggle = document.querySelector(".nav-toggle");
  const drawer = document.querySelector(".mobile-drawer");
  if (!toggle || !drawer) return;

  toggle.addEventListener("click", () => {
    const open = drawer.hasAttribute("hidden");
    if (open) drawer.removeAttribute("hidden");
    else drawer.setAttribute("hidden", "");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  drawer.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => drawer.setAttribute("hidden", ""));
  });
}

async function init() {
  applyReleaseLinks();
  await loadAppUpdateManifest();
  setupCopyButtons();
  setupNav();
}

init();
