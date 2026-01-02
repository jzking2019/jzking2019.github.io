/* =========================
   Footer 加载
   ========================= */
async function loadFooter() {
  const footer = document.getElementById("site-footer");
  if (!footer) return;

  try {
    const res = await fetch("/footer.html");
    if (!res.ok) throw new Error("Footer load failed");

    footer.innerHTML = await res.text();

    // 年份
    const yearEl = footer.querySelector("#footer-year");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  } catch (err) {
    console.error("無法加載 footer", err);
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
   IP 檢測
   ========================= */
async function checkAccess() {
  try {
    const res = await fetch(
      "https://api.ipgeolocation.io/ipgeo?apiKey=fc63e8edf7884c8a8f7662af23899450"
    );
    const data = await res.json();
    if (data.country_code === "CN") {
      window.location.href = "PRC.html";
    }
  } catch (e) {
    console.error("IP check failed", e);
  }
}

/* =========================
   主題切換
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

  // blog.html 没有搜索框就直接跳过
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
   年份（非 footer 的情况）
   ========================= */
function updateCopyrightYear() {
  const el = document.getElementById("current-year");
  if (el) {
    el.textContent = new Date().getFullYear();
  }
}

/* =========================
   页面统一入口
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initSearch();
  updateCopyrightYear();
  checkAccess();
  loadFooter();
  registerServiceWorker();
});