async function loadLatestPosts() {
  try {
    const res = await fetch("blog.html");
    if (!res.ok) throw new Error("網路錯誤，無法加載内容");

    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // 抓取所有文章，取最新 6 篇
    const posts = Array.from(doc.querySelectorAll(".post")).slice(0, 6);
    const container = document.getElementById("latest-posts");
    if (!container) return;

    // 清空容器，确保不重复加载
    container.innerHTML = ""; 

    // 创建一个文档片段
    const fragment = document.createDocumentFragment();

    posts.forEach(post => {
      const link = post.querySelector("a")?.href;
      const img = post.querySelector("img")?.src;
      const title = post.querySelector("p")?.innerText;

      if (link && img && title) {
        const item = document.createElement("article");
        item.className = "post"; // 添加类名

        item.innerHTML = `
          <a href="${link}" target="_blank" rel="noopener noreferrer">
            <img src="${img}" alt="${title}" style="width: 100%; height: auto; object-fit: cover;">
            <h3>${title}</h3>
          </a>
        `;
        fragment.appendChild(item);
      }
    });

    // 将文档片段添加到容器
    container.appendChild(fragment);

    // 设置容器展示方式
    updateContainerStyle(container);

  } catch (err) {
    console.error("無法加載最新文章", err);
    const container = document.getElementById("latest-posts");
    if (container) {
      container.innerHTML = `<p>加載失敗，請稍後再試。</p>`;
    }
  }
}

// 更新容器样式以适应行数
function updateContainerStyle(container) {
  // 直接使用媒体查询的适配逻辑
  if (window.innerWidth <= 480) {
    container.style.display = "grid";
    container.style.gridTemplateColumns = "1fr"; // 手机显示1列
  } else if (window.innerWidth <= 768) {
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(2, 1fr)"; // 平板显示2列
  } else {
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(3, 1fr)"; // 中等屏幕显示3列
  }
}

// 处理窗口大小变化
window.addEventListener('resize', () => {
  const container = document.getElementById("latest-posts");
  updateContainerStyle(container);
});

// 确保 DOM 完全加载后再调用
document.addEventListener("DOMContentLoaded", loadLatestPosts);
