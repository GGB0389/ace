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

function isCoarseTouchDevice() {
  return (
    window.matchMedia("(pointer: coarse)").matches
    || window.matchMedia("(max-width: 1024px)").matches
    || "ontouchstart" in window
  );
}

function applyExternalLinkTarget(link) {
  // 平板/手机同页跳转，避免 Android 新开标签慢、二次点击
  if (isCoarseTouchDevice()) {
    link.removeAttribute("target");
  } else {
    link.target = "_blank";
  }
  link.rel = "noopener noreferrer";
}

function applyDownloadUrl(url) {
  if (!url) return;
  document.querySelectorAll(
    "#hero-download, #launcher-download, .header-cta, .mobile-drawer a.btn-primary",
  ).forEach((link) => {
    link.href = url;
    applyExternalLinkTarget(link);
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
      applyExternalLinkTarget(link);
    }
    btn.setAttribute("data-copy", url);
  });

  document.querySelectorAll('a[href*="ACE.apk"]').forEach((link) => {
    const url = releaseUrl("ACE.apk");
    if (!url) return;
    link.href = url;
    link.removeAttribute("download");
    applyExternalLinkTarget(link);
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

function setupHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function setupNavSectionHighlight() {
  const links = document.querySelectorAll(
    ".nav-links a[href^='#'], .mobile-drawer a[href^='#']",
  );
  const sectionIds = [...new Set(
    [...links]
      .map((a) => a.getAttribute("href"))
      .filter((href) => href && href.length > 1),
  )];
  const sections = sectionIds
    .map((id) => document.querySelector(id))
    .filter(Boolean);
  if (!sections.length) return;

  const setActive = (id) => {
    links.forEach((a) => {
      a.classList.toggle("is-active", a.getAttribute("href") === id);
    });
  };

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible.length) {
        setActive(`#${visible[0].target.id}`);
      }
    },
    { rootMargin: "-42% 0px -52% 0px", threshold: [0, 0.15, 0.4] },
  );
  sections.forEach((s) => io.observe(s));
}

function setupLiquidSpecular() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const targets = document.querySelectorAll(
    ".liquid-glass, .glass-card, .promo-frame, .btn, .nav-links a, .stat",
  );

  targets.forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--lg-x", `${x}%`);
      el.style.setProperty("--lg-y", `${y}%`);
    });
    el.addEventListener("mouseleave", () => {
      el.style.setProperty("--lg-x", "50%");
      el.style.setProperty("--lg-y", "20%");
    });
  });
}

function setupPromoTilt() {
  const frame = document.querySelector(".promo-frame");
  const visual = document.querySelector(".hero-visual");
  if (!frame || !visual) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.matchMedia("(max-width: 900px)").matches) return;

  visual.addEventListener("mousemove", (e) => {
    const rect = visual.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    frame.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
  });
  visual.addEventListener("mouseleave", () => {
    frame.style.transform = "";
  });
}

function setupTouchFocusFix() {
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (!isTouch) return;

  document.documentElement.classList.add("is-touch");

  const selector =
    ".btn, .nav-links a, .mobile-drawer a, .nav-toggle, .brand, .header-cta, .card-actions a, .link-card a, .tool-dl-card a, [data-copy]";

  const clearTapArtifacts = (target) => {
    const el = target instanceof Element ? target.closest(selector) : null;
    if (!(el instanceof HTMLElement)) return;

    window.getSelection()?.removeAllRanges();

    // 链接不 blur：Android 上 touchend/click 前 blur 会拖慢或吞掉跳转
    if (el instanceof HTMLAnchorElement) return;

    setTimeout(() => el.blur(), 0);
  };

  document.addEventListener(
    "touchend",
    (e) => {
      clearTapArtifacts(e.target);
    },
    { passive: true },
  );

  document.addEventListener(
    "click",
    (e) => {
      const el =
        e.target instanceof Element ? e.target.closest(selector) : null;
      if (el instanceof HTMLAnchorElement) {
        window.getSelection()?.removeAllRanges();
        return;
      }
      clearTapArtifacts(e.target);
    },
    { passive: true },
  );

  document.addEventListener(
    "touchstart",
    (e) => {
      const el = e.target instanceof Element ? e.target.closest(selector) : null;
      if (el instanceof HTMLElement) {
        window.getSelection()?.removeAllRanges();
      }
    },
    { passive: true },
  );
}

function init() {
  applyReleaseLinks();
  applyFromManifest(window.__APP_RELEASE_DATA);
  setupCopyButtons();
  setupNav();
  setupNavSectionHighlight();
  setupHeaderScroll();
  setupLiquidSpecular();
  setupPromoTilt();
  setupTouchFocusFix();
  loadAppUpdateManifest();
}

init();
