/* =========================
   主題切換（全站）
   ========================= */
function toggleTheme() {
  document.body.classList.toggle("dark-mode");

  const theme = document.body.classList.contains("dark-mode")
    ? "dark"
    : "light";

  localStorage.setItem("theme", theme);
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
   搜索框（僅 blog 頁）
   ⚠️ 必須在 header 注入後調用
   ========================= */
function initSearch() {
  const searchContainer = document.getElementById("searchContainer");
  const searchIcon = document.getElementById("searchIcon");
  const searchInput = document.getElementById("searchInput");
  const posts = document.querySelectorAll(".post");

  if (!searchContainer || !searchIcon || !searchInput) return;

  searchIcon.addEventListener("click", e => {
    e.stopPropagation();
    searchContainer.classList.toggle("active");
    if (searchContainer.classList.contains("active")) {
      searchInput.focus();
    }
  });

  document.addEventListener("click", e => {
    if (!searchContainer.contains(e.target)) {
      searchContainer.classList.remove("active");
    }
  });

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase().trim();

    posts.forEach(post => {
      post.style.display = post.innerText.toLowerCase().includes(q)
        ? ""
        : "none";
    });
  });
}

/* =========================
   Header 載入（全站核心）
   ========================= */
async function loadHeader() {
  const header = document.getElementById("site-header");
  if (!header) return;

  try {
    const res = await fetch("/header.html");
    if (!res.ok) throw new Error("Header load failed");

    header.innerHTML = await res.text();

    /* 主題切換 icon */
    const themeBtn = document.getElementById("themeToggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", e => {
        e.preventDefault();
        toggleTheme();
      });
    }

    // 菜单（⭐关键）
    initMenu();
    
    /* ⭐ 搜索框一定要在 header 完成後 */
    initSearch();

  } catch (err) {
    console.error("Header 載入失敗", err);
  }
}

/* 菜單 */
function initMenu() {
  const menuBtn = document.getElementById("menuToggle");
  const menu = document.getElementById("mobileMenu");

  if (!menuBtn || !menu) {
    console.warn("菜单 DOM 未找到");
    return;
  }

  // 点击按钮：开 / 关
  menuBtn.addEventListener("click", e => {
    e.stopPropagation();
    menu.classList.toggle("open");
  });

  // 点击菜单内部不关闭
  menu.addEventListener("click", e => {
    e.stopPropagation();
  });

  // 点击页面其它地方关闭
  document.addEventListener("click", () => {
    menu.classList.remove("open");
  });
}

/* =========================
   Footer 載入（全站）
   ========================= */
async function loadFooter() {
  const footer = document.getElementById("site-footer");
  if (!footer) return;

  try {
    const res = await fetch("/footer.html");
    if (!res.ok) throw new Error("Footer load failed");

    footer.innerHTML = await res.text();

    const yearEl = footer.querySelector("#footer-year");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }

    relocateFooterForMobile(); // ⭐ 在这里

  } catch (err) {
    console.error("Footer 載入失敗", err);
  }
}

window.addEventListener("resize", () => {
  relocateFooterForMobile();
});

function relocateFooterForMobile() {
  const menu = document.getElementById("mobileMenu");
  const footer = document.getElementById("site-footer");

  if (!menu || !footer) return;

  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  if (isMobile) {
    // 防止重复插入
    if (!menu.contains(footer)) {
      menu.appendChild(footer);
    }
  } else {
    // 回到 body 底部（PC）
    if (footer.parentElement !== document.body) {
      document.body.appendChild(footer);
    }
  }
}

/* =========================
   Service Worker（可選）
   ========================= */
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .catch(() => {});
  });
}

/* =========================
   IP 檢測（僅首頁，非阻塞）
   ========================= */
function checkAccess() {
  if (!document.body.classList.contains("home")) return;

  fetch(
    "https://api.ipgeolocation.io/ipgeo?apiKey=fc63e8edf7884c8a8f7662af23899450"
  )
    .then(res => res.json())
    .then(data => {
      if (data.country_code === "CN") {
        window.location.href = "PRC.html";
      }
    })
    .catch(() => {});
}

/* =========================
   全站入口（順序已固定）
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  loadHeader();
// 菜单（⭐关键）
  initMenu();
  initSearch();
  loadFooter();

  registerServiceWorker();
  checkAccess();      // ⚠️ 最後，永不影響 UI
});

