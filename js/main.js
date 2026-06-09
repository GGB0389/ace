const APP = {
  version: "1.7.4",
  apk: "downloads/ACE.apk",
};

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
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
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    const card = btn.closest(".product-card.featured, .card-actions");
    if (card) btn.setAttribute("data-copy", url);
  });
}

function applyVersionSize(versionName, sizeBytes) {
  const version = versionName || "—";
  document.getElementById("stat-app-ver")?.textContent = version;
  document.getElementById("launcher-version")?.textContent = `v${version}`;
  const sizeText = formatBytes(sizeBytes);
  document.getElementById("launcher-size")?.textContent = sizeText;
  document.getElementById("stat-app-size")?.textContent = sizeText;
}

async function loadAppUpdateManifest() {
  const manifestUrl = window.APP_UPDATE_MANIFEST_URL;
  if (!manifestUrl) return;

  try {
    const res = await fetch(manifestUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const size = Number(data.sizeBytes) || 0;
    applyVersionSize(data.versionName, size);
    if (data.downloadUrl) applyDownloadUrl(data.downloadUrl);
  } catch (err) {
    console.warn("无法加载 app-update.json，版本/大小保持页面默认值", err);
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
