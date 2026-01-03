/* =========================
   Footer 加载（全站共用）
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
  } catch (err) {
    console.error("Footer 載入失敗", err);
  }
}

/* =========================
   主題切換（全站共用）
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

  if (saved === "dark") {
    document.body.classList.add("dark-mode");
  } else if (
    !saved &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    document.body.classList.add("dark-mode");
  }
}

/* =========================
   搜索框（仅 blog.html 生效）
   ========================= */
function initSearch() {
  const searchContainer = document.getElementById("searchContainer");
  const searchIcon = document.getElementById("searchIcon");
  const searchInput = document.getElementById("searchInput");
  const posts = document.querySelectorAll(".post");

  // blog 页面才存在，首页自动跳过
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
        ? "flex"
        : "none";
    });
  });
}

/* =========================
   年份（非 footer 场景兜底）
   ========================= */
function updateCopyrightYear() {
  const el = document.getElementById("current-year");
  if (el) {
    el.textContent = new Date().getFullYear();
  }
}

/* =========================
   Service Worker
   ========================= */
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(reg => {
        console.log("Service Worker registered:", reg.scope);
      })
      .catch(err => {
        console.log("Service Worker failed:", err);
      });
  });
}

/* =========================
   IP 检测（仅首页，永不阻塞）
   ========================= */
function checkAccess() {
  // 只有首页才执行（body 必须有 class="home"）
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
    .catch(err => {
      console.warn("IP 檢測跳過", err);
    });
}

/* =========================
   页面统一入口（顺序极其重要）
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  // UI 永远优先
  initTheme();
  loadFooter();

  // 页面差异功能
  initSearch();

  // 辅助功能
  updateCopyrightYear();
  registerServiceWorker();

  // ⚠️ 最后执行，且不会影响前面
  checkAccess();
});
