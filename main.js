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
let blogCache = null;

async function loadBlogCache() {
  if (blogCache) return blogCache;

  const res = await fetch("/blog.html");
  const html = await res.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  blogCache = Array.from(doc.querySelectorAll(".blog .post"));
  return blogCache;
}

async function liveSearch(keyword) {
  if (!keyword) return;

  // 1️⃣ 移除首页样式
  document.body.classList.remove("home");

  // 2️⃣ 删除所有 section（不动 header / footer / bottom-nav）
  document.querySelectorAll("section").forEach(sec => sec.remove());

  // 3️⃣ 载入 blog 内容（只一次）
  const posts = await loadBlogCache();

  let resultHTML = "";

  posts.forEach(post => {
    if (post.innerText.toLowerCase().includes(keyword.toLowerCase())) {
      resultHTML += post.outerHTML;
    }
  });

  // 4️⃣ 构造搜索结果 section
  const section = document.createElement("section");
  section.className = "blog search-result";

  section.innerHTML = `
    <h2>搜尋結果 ${keyword}</h2>
    <div class="blog-posts">
      ${resultHTML || "<p style='opacity:.6'>没有找到相关內容，請檢查您輸入的內容是否有誤並從試。</p>"}
    </div>
  `;

  // 5️⃣ 插入到 header 之后
  const header = document.querySelector(".site-header");
  header.insertAdjacentElement("afterend", section);
}

function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function initSearch() {
  const container = document.getElementById("searchContainer");
  const icon = document.getElementById("searchIcon");
  const input = document.getElementById("searchInput");

  if (!container || !icon || !input) return;

  const liveSearchDebounced = debounce(liveSearch, 300);

  icon.addEventListener("click", e => {
    e.stopPropagation();
    container.classList.toggle("active");
    if (container.classList.contains("active")) input.focus();
  });

  input.addEventListener("input", e => {
    liveSearchDebounced(e.target.value.trim());
  });

  document.addEventListener("click", e => {
    if (!container.contains(e.target)) {
      container.classList.remove("active");
    }
  });
}

async function searchBlog(keyword) {
  const res = await fetch("/blog.html");
  const html = await res.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const posts = [...doc.querySelectorAll(".post")];

  const results = posts.filter(post =>
    post.innerText.toLowerCase().includes(keyword.toLowerCase())
  );

  renderSearchResults(results, keyword);
}

function renderSearchResults(results, keyword) {
  const main =
    document.querySelector("main") ||
    document.querySelector("section") ||
    document.body;

  main.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = `搜索結果：「${keyword}」`;
  main.appendChild(title);

  if (results.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "沒有找到相關内容";
    main.appendChild(empty);
    return;
  }

  const list = document.createElement("div");
  list.className = "blog-posts";

  results.forEach(post => {
    list.appendChild(post.cloneNode(true));
  });

  main.appendChild(list);
}

async function searchBlog(keyword) {
  if (!keyword) return;

  // ① 切換語境（避免首頁樣式污染）
  document.body.classList.remove("home");
  document.body.classList.add("search-page");

  // ② 清空主內容（一次清乾淨）
  const main = document.querySelector("main");
  if (main) main.innerHTML = "";

  // ③ 載入 blog.html
  const res = await fetch("/blog.html");
  const html = await res.text();

  // ④ 解析 HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const posts = doc.querySelectorAll(".blog .post");
  let resultHtml = "";

  posts.forEach(post => {
    const text = post.innerText.toLowerCase();
    if (text.includes(keyword.toLowerCase())) {
      resultHtml += post.outerHTML;
    }
  });

  // ⑤ 沒結果
  if (!resultHtml) {
    resultHtml = `<p style="opacity:.6">沒有找到相關文章</p>`;
  }

  // ⑥ 插入結果（使用 blog 結構）
  main.innerHTML = `
    <section class="blog">
      <h2>搜尋結果：${keyword}</h2>
      <div class="blog-posts">
        ${resultHtml}
      </div>
    </section>
  `;
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

/* 按ESC關閉菜單 */
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;

  // ⭐ 只在 PC 執行
  if (window.matchMedia("(max-width: 767px)").matches) return;

  const menu = document.getElementById("mobileMenu");
  if (!menu || !menu.classList.contains("open")) return;

  menu.classList.remove("open");
  document.body.classList.remove("menu-open");
});

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

  try {
    const res = await fetch("/footer.html");
    if (!res.ok) throw new Error("Footer load failed");

    footer.innerHTML = await res.text();

    const yearEl = footer.querySelector("#footer-year");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }

    // ⭐ 关键
  syncFooterToMobileMenu();

  } catch (err) {
    console.error("Footer 載入失敗", err);
  }
}

window.addEventListener("resize", syncFooterToMobileMenu);

/* =========================
   Mobile：Footer 注入菜单（JS Clone）
   ========================= */

function syncFooterToMobileMenu() {
  const menu = document.getElementById("mobileMenu");
  const footer = document.getElementById("site-footer");

  if (!menu || !footer) return;

  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  // 先清理旧的 menu footer（防止重复）
  const old = menu.querySelector(".menu-footer");
  if (old) old.remove();

  if (!isMobile) {
    // PC：什么都不做，footer 仍在 body 底部
    footer.style.display = "";
    return;
  }

  // Mobile：隐藏原 footer
  footer.style.display = "none";

  // clone footer
  const clone = footer.cloneNode(true);
  clone.classList.add("menu-footer");
  clone.style.display = "block";

  menu.appendChild(clone);
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
  // ⭐ 最终兜底
  setTimeout(syncFooterToMobileMenu, 0);

});





