async function loadLatestPosts() {
  try {
    const res = await fetch("blog.html");
    if (!res.ok) throw new Error("網路錯誤，無法加載内容");

    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // 抓取所有文章，取最新 6 篇
    const posts = Array.from(doc.querySelectorAll(".post")).slice(6);
    const container = document.getElementById("latest-posts");
    if (!container) return;

    // 创建一个文档片段
    const fragment = document.createDocumentFragment();

    posts.forEach(post => {
      const link = post.querySelector("a")?.href;
      const img = post.querySelector("img")?.src;
      const title = post.querySelector("p")?.innerText;

      if (link && img && title) {
        const item = document.createElement("article");
        item.className = "post";
        item.style.margin = "10px"; // 设置外边距

        item.innerHTML = `
          <a href="${link}" target="_blank" rel="noopener noreferrer">
            <img src="${img}" alt="${title}">
            <h3>${title}</h3>
          </a>
        `;
        fragment.appendChild(item);
      }
    });

    // 将文档片段添加到容器
    container.appendChild(fragment);

    // 设置容器样式以实现行数限制
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
  if (window.innerWidth > 1200) {
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(3, 1fr)"; // 宽屏3行
  } else {
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(3, 1fr)"; // 中等屏幕仍然3列
  }
}

// 处理窗口大小变化
window.addEventListener('resize', () => {
  const container = document.getElementById("latest-posts");
  updateContainerStyle(container);
});

// 确保 DOM 完全加载后再调用
document.addEventListener("DOMContentLoaded", loadLatestPosts);
