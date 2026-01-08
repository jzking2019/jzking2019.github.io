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
   Blog 搜索（全站）
   ========================= */

let blogCache = null;

async function loadBlogCache() {
  if (blogCache) return blogCache;

  const res = await fetch("/blog.html");
  const html = await res.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  blogCache = Array.from(doc.querySelectorAll(".post"));
  return blogCache;
}

async function searchBlog(keyword) {
  if (!keyword) return;

  // 移除首頁樣式
  document.body.classList.remove("home");

  // 清空所有 section
  document.querySelectorAll("section").forEach(sec => sec.remove());

  const posts = await loadBlogCache();
  let resultHTML = "";

  posts.forEach(post => {
    if (post.innerText.toLowerCase().includes(keyword.toLowerCase())) {
      resultHTML += post.outerHTML;
    }
  });

  const section = document.createElement("section");
  section.className = "blog search-result";

  section.innerHTML = `
    <h2>搜尋結果 ${keyword}</h2>
    <div class="blog-posts">
      ${resultHTML || "<p style='opacity:.6'>没有找到相关內容，請檢查您輸入的字符是否有誤並從試。</p>"}
    </div>
  `;

  document
    .querySelector(".site-header")
    .insertAdjacentElement("afterend", section);
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

  const debouncedSearch = debounce(searchBlog, 300);

  icon.addEventListener("click", e => {
    e.stopPropagation();
    container.classList.toggle("active");
    if (container.classList.contains("active")) input.focus();
  });

  input.addEventListener("input", e => {
    debouncedSearch(e.target.value.trim());
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
   部落格分頁
   ========================= */
function initBlogPagination({
  postsPerPage = 6
} = {}) {
  const blog = document.querySelector(".blog");
  if (!blog) return; // 只在 blog 页面生效

  const postsContainer = blog.querySelector(".blog-posts");
  const posts = Array.from(postsContainer.children);
  const pagination = document.getElementById("pagination");

  if (!pagination || posts.length <= postsPerPage) return;

  let currentPage = 1;
  const totalPages = Math.ceil(posts.length / postsPerPage);

  function renderPage(page) {
    currentPage = page;

    posts.forEach((post, index) => {
      const start = (page - 1) * postsPerPage;
      const end = page * postsPerPage;
      post.style.display =
        index >= start && index < end ? "" : "none";
    });

    renderPagination();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderPagination() {
    pagination.innerHTML = "";

    const prev = document.createElement("button");
    prev.textContent = "‹";
    prev.disabled = currentPage === 1;
    prev.onclick = () => renderPage(currentPage - 1);

    pagination.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      if (i === currentPage) btn.classList.add("active");
      btn.onclick = () => renderPage(i);
      pagination.appendChild(btn);
    }

    const next = document.createElement("button");
    next.textContent = "›";
    next.disabled = currentPage === totalPages;
    next.onclick = () => renderPage(currentPage + 1);

    pagination.appendChild(next);
  }

  renderPage(1);
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

  initBlogPagination({ postsPerPage: 6 });
});








