async function loadLatestPosts() {
  try {
    const res = await fetch("/blog.html");
    const html = await res.text();

    // 把 blog.html 解析成 DOM
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // 抓取所有文章
    const posts = Array.from(doc.querySelectorAll(".post"));

    // 取最新 6 篇（假设最新在最上面）
    const latest = posts.slice(0, 6);

    const container = document.getElementById("latest-posts");
    if (!container) return;

    latest.forEach(post => {
      const link = post.querySelector("a")?.href;
      const img = post.querySelector("img")?.src;
      const title = post.querySelector("h3")?.innerText;

      if (!link || !img || !title) return;

      const item = document.createElement("article");
      item.className = "post";
      item.innerHTML = `
        <a href="${link}" target="_blank">
          <img src="${img}" alt="">
          <h3>${title}</h3>
        </a>
      `;
      container.appendChild(item);
    });

  } catch (err) {
    console.error("無法加載最新文章", err);
  }
}

document.addEventListener("DOMContentLoaded", loadLatestPosts);
