/* =========================
   Google AdSense 全站注入（最終版）
   ========================= */
(function loadAdSense() {
  // ❌ Turnstile / 驗證頁不載入廣告
  if (location.pathname.includes("Turnstile")) return;

  // ❌ 防止重複載入（SPA / 多次 inject）
  if (window.__adsenseLoaded) return;
  window.__adsenseLoaded = true;

  // ❌ 若頁面本來就有 adsbygoogle.js
  if (document.querySelector('script[src*="adsbygoogle.js"]')) return;

  const script = document.createElement("script");
  script.async = true;
  script.src =
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6680517509530631";
  script.crossOrigin = "anonymous";

  document.head.appendChild(script);
})();

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
   Cloudflare Turnstile（全站・JS 注入）
   ========================= */

function initTurnstileGate() {
  const verified = sessionStorage.getItem("cf_verified");
  if (verified === "true") return;

  // === 建立 Overlay HTML ===
  const overlay = document.createElement("div");
  overlay.id = "cf-overlay";

  overlay.innerHTML = `
    <div class="cf-box">
      <h2>請稍後…</h2>
      <p>我們正在驗證您的連線安全性</p>

      <div id="cf-turnstile"></div>

      <div class="cf-error" id="cf-error">
        驗證失敗或逾時，請從新整理頁面再試。
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.classList.add("cf-lock");

  const errorBox = overlay.querySelector("#cf-error");
  const mount = overlay.querySelector("#cf-turnstile");

  // === 超時顯示錯誤（45 秒） ===
  const timeout = setTimeout(() => {
    errorBox.style.display = "block";
  }, 45000);

  // === 載入 Turnstile SDK ===
  const script = document.createElement("script");
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
  script.async = true;
  script.defer = true;

  script.onload = () => {
    turnstile.render(mount, {
      sitekey: "0x4AAAAAACLdRXyJTn20t0BK",

      callback: () => {
        clearTimeout(timeout);
        sessionStorage.setItem("cf_verified", "true");

        overlay.classList.add("fade-out");
        document.body.classList.remove("cf-lock");

        setTimeout(() => {
          overlay.remove();
        }, 400);
      },

      "error-callback": () => {
        errorBox.style.display = "block";
      },

      "expired-callback": () => {
        errorBox.style.display = "block";
      }
    });
  };

  document.head.appendChild(script);
}

/* =========================
   首页：最新文章注入（仅首页）
   ========================= */
async function loadHomeLatestPosts() {
  // ⭐ 只在首页执行
  if (!document.body.classList.contains("home")) return;

  const container = document.querySelector(".home .blog-posts");
  if (!container) return;

  try {
    const res = await fetch("/blog.html");
    if (!res.ok) throw new Error("无法加载 blog.html");

    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // 取最新 6 篇
    const posts = Array.from(doc.querySelectorAll(".post")).slice(0, 6);
    const fragment = document.createDocumentFragment();

    posts.forEach(post => {
      const link = post.querySelector("a")?.href;
      const img = post.querySelector("img")?.src;
      const title = post.querySelector("p, h3")?.innerText;

      if (!link || !img || !title) return;

      const item = document.createElement("div");
      item.className = "post";
      item.innerHTML = `
        <a href="${link}" target="_blank" rel="noopener noreferrer">
          <div class="post-thumb">
            <img src="${img}" alt="${title}">
          </div>
          <div class="post-body">
            <p class="post-title">${title}</p>
          </div>
        </a>
      `;
      fragment.appendChild(item);
    });

    container.appendChild(fragment);

  } catch (err) {
    console.error("首页最新文章加载失败", err);
    container.innerHTML = `<p style="opacity:.6">最新内容加载失败</p>`;
  }
}

/* =========================
   Blog 搜索（全站）
   ========================= */

function initSearch() {
  const input = document.getElementById("searchInput");
  const icon = document.getElementById("searchIcon");
  const container = document.getElementById("searchContainer");

  if (!input || !icon || !container) return;

  // 展开搜索框
  icon.addEventListener("click", e => {
    e.stopPropagation();
    container.classList.add("active");
    input.focus();
  });

  // Enter 直接跳 blog.html
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const q = input.value.trim();
      if (!q) return;
      location.href = `/blog.html?q=${encodeURIComponent(q)}&page=1`;
    }
  });

  // 点击空白关闭
  document.addEventListener("click", e => {
    if (!container.contains(e.target)) {
      container.classList.remove("active");
    }
  });
}

// blog 搜索 + 分頁 JS
function initBlogSearchAndPagination() {
  if (!document.body.classList.contains("blog")) return;

  const params = new URLSearchParams(location.search);
  const query = (params.get("q") || "").toLowerCase();
  const intro = document.getElementById("blog-intro");

if (query && intro) {
  intro.remove(); // ⭐ 搜索時移除「部落格 在這裡…」
}
   
  const page = parseInt(params.get("page") || "1", 10);

  const POSTS_PER_PAGE = 7;

  const posts = Array.from(document.querySelectorAll(".blog .post"));
  if (!posts.length) return;

if (query) {
  let resultTitle = document.getElementById("search-title");

  if (!resultTitle) {
    resultTitle = document.createElement("h2");
    resultTitle.id = "search-title";
    resultTitle.textContent = `搜尋結果 ${query}`;
    document.querySelector("section").prepend(resultTitle);
  }
}
   
  // 搜索过滤
  const filtered = query
    ? posts.filter(post =>
        post.innerText.toLowerCase().includes(query)
      )
    : posts;
   // 移除舊的空狀態（防止重複）
const oldEmpty = document.querySelector(".empty-state");
if (oldEmpty) oldEmpty.remove();

// 如果搜尋沒結果
if (query && filtered.length === 0) {
  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.innerHTML = `
    <h3>沒有找到相關內容</h3>
    <p>請嘗試其他關鍵字，或瀏覽全部內容。</p>
    <a href="/blog.html" class="empty-action">查看全部內容</a>
  `;

  document.querySelector("section").appendChild(empty);
}

  // 全部先隐藏
  posts.forEach(p => (p.style.display = "none"));

  // 分页
  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const start = (page - 1) * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE;

  filtered.slice(start, end).forEach(p => {
    p.style.display = "";
  });

  // 分页按钮
  const pager = document.getElementById("pagination");
  if (!pager) return;

  pager.innerHTML = "";
  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.disabled = i === page;

    btn.addEventListener("click", () => {
      const newParams = new URLSearchParams();
      if (query) newParams.set("q", query);
      newParams.set("page", i);
      location.search = newParams.toString();
    });

    pager.appendChild(btn);
  }
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
   時間節點摺疊
   ========================= */
function initTimelineCollapse() {
  document.querySelectorAll(".timeline-year-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const year = btn.closest(".timeline-year");
      year.classList.toggle("open");
    });
  });
}

/* =========================
   圖片點擊放大
   ========================= */
function initImageViewer() {
  document.addEventListener("click", e => {
    const img = e.target.closest(".article-image img");
    if (!img) return;

    const viewer = document.createElement("div");
    viewer.className = "image-viewer";
    viewer.innerHTML = `<img src="${img.src}" alt="">`;

    viewer.addEventListener("click", () => viewer.remove());
    document.addEventListener("keydown", esc => {
      if (esc.key === "Escape") viewer.remove();
    }, { once: true });

    document.body.appendChild(viewer);
  });
}

/* =========================
   全站入口（顺序非常重要）
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();

  loadHeader(); // 顶部
  loadBottomNav(); // ⭐ 手机底部
  loadFooter();

  loadHomeLatestPosts(); // 首頁動態推薦注入
  bindGlobalMenuClose();

  registerServiceWorker();
  checkAccess();
  // ⭐ 最终兜底
  setTimeout(syncFooterToMobileMenu, 0);

  initBlogSearchAndPagination();
  initTurnstileGate(); // Turnstile 驗證
  initTimelineCollapse(); // 時間節點摺疊
  initImageViewer(); // 圖片點擊放大
});

























