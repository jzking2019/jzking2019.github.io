/* =========================
   主题切换（全站）
   ========================= */
function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark-mode") ? "dark" : "light"
  );
}

function initTheme() {
  const saved = localStorage.getItem("theme");
  if (
    saved === "dark" ||
    (!saved &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.body.classList.add("dark-mode");
  }
}

/* =========================
   搜索框（header 注入后）
   ========================= */
function initSearch() {
  const container = document.getElementById("searchContainer");
  const icon = document.getElementById("searchIcon");
  const input = document.getElementById("searchInput");

  if (!container || !icon || !input) return;

  icon.addEventListener("click", e => {
    e.stopPropagation();
    container.classList.toggle("active");
    if (container.classList.contains("active")) input.focus();
  });

  document.addEventListener("click", e => {
    if (!container.contains(e.target)) {
      container.classList.remove("active");
    }
  });
}

/* =========================
   菜单（通用：header / bottom）
   ========================= */
function bindMenu(toggleId) {
  const btn = document.getElementById(toggleId);
  const menu = document.getElementById("mobileMenu");

  if (!btn || !menu) return;

  btn.addEventListener("click", e => {
    e.stopPropagation();
    menu.classList.toggle("open");
    document.body.classList.toggle("menu-open", menu.classList.contains("open"));
  });
}

/* 点击空白关闭菜单（只绑一次） */
function bindGlobalMenuClose() {
  document.addEventListener("click", () => {
    const menu = document.getElementById("mobileMenu");
    if (!menu) return;
    menu.classList.remove("open");
    document.body.classList.remove("menu-open");
  });
}

/* =========================
   Header 注入
   ========================= */
async function loadHeader() {
  const mount = document.getElementById("site-header");
  if (!mount) return;

  const res = await fetch("/header.html");
  mount.innerHTML = await res.text();

  // 主题切换
  const themeBtn = document.getElementById("themeToggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", toggleTheme);
  }

  // Header 菜单按钮
  bindMenu("menuToggle");

  // 搜索
  initSearch();

  // ⭐ 菜单存在后，阻止冒泡
  const menu = document.getElementById("mobileMenu");
  if (menu) {
    menu.addEventListener("click", e => e.stopPropagation());
  }
}
/* =========================
   手机底部导航注入
   ========================= */
async function loadBottomNav() {
  const mount = document.getElementById("bottomNav");
  if (!mount) return;

  const res = await fetch("/bottom-nav.html");
  mount.innerHTML = await res.text();

  // 底部「更多」按钮
  bindMenu("menuToggleMobile");
}

/* =========================
   Footer 注入
   ========================= */
async function loadFooter() {
  const footer = document.getElementById("site-footer");
  if (!footer) return;

  const res = await fetch("/footer.html");
  footer.innerHTML = await res.text();

  const year = footer.querySelector("#footer-year");
  if (year) year.textContent = new Date().getFullYear();
}

/* =========================
   Service Worker（可选）
   ========================= */
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("/service-worker.js").catch(() => {});
}

/* =========================
   IP 检测（首页）
   ========================= */
function checkAccess() {
  if (!document.body.classList.contains("home")) return;

  fetch("https://api.ipgeolocation.io/ipgeo?apiKey=fc63e8edf7884c8a8f7662af23899450")
    .then(r => r.json())
    .then(d => {
      if (d.country_code === "CN") {
        location.href = "/PRC.html";
      }
    })
    .catch(() => {});
}

/* =========================
   全站入口（顺序非常重要）
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();

  loadHeader(); // 顶部
  loadBottomNav(); // ⭐ 手机底部
  loadFooter();

  bindGlobalMenuClose();

  registerServiceWorker();
  checkAccess();
});