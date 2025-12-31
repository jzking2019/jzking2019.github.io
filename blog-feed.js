async function loadLatestPosts() {
  try {
    const res = await fetch("/blog.html");
    if (!res.ok) throw new Error("網路錯誤，無法加載内容");

    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // 抓取所有文章，取最新 6 篇
    const posts = Array.from(doc.querySelectorAll(".post")).slice(0, 6);
    const container = document.getElementById("latest-posts");
    if (!container) return;

    // 创建一个文档片段
    const fragment = document.createDocumentFragment();

    posts.forEach(post => {
      const link = post.querySelector("a")?.href;
      const img = post.querySelector("img")?.src;
      const title = post.querySelector("h3")?.innerText;

      if (link && img && title) {
        const item = document.createElement("article");
        item.className = "post";
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

  } catch (err) {
    console.error("無法加載最新文章", err);
    // 可以在这里添加用户反馈，例如：
    const container = document.getElementById("latest-posts");
    if (container) {
      container.innerHTML = `<p>加載失敗，請稍後再試。</p>`;
    }
  }
}

document.addEventListener("DOMContentLoaded", loadLatestPosts);
