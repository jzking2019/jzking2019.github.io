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
        // 设置宽度和样式
        updatePostStyle(item);

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

// 更新文章项的宽度样式
function updatePostStyle(item) {
  if (window.innerWidth > 1200) {
    item.style.width = "calc(50% - 20px)"; // 宽屏2列
  } else if (window.innerWidth <= 1200 && window.innerWidth > 768) {
    item.style.width = "calc(33.33% - 20px)"; // 中等屏幕3列
  } else {
    item.style.width = "calc(50% - 20px)"; // 其他屏幕
  }
}

// 处理窗口大小变化
window.addEventListener('resize', () => {
  const container = document.getElementById("latest-posts");
  updateContainerStyle(container);
});

// 确保 DOM 完全加载后再调用
document.addEventListener("DOMContentLoaded", loadLatestPosts);

