document.addEventListener("DOMContentLoaded", () => {
  injectFooter();
});

/**
 * 注入全站共用 Footer
 */
function injectFooter() {
  const footer = document.getElementById("site-footer");
  if (!footer) return;

function injectFooter() {
  const footer = document.getElementById("site-footer");
  if (!footer) return;

  const year = new Date().getFullYear();

  footer.innerHTML = `
    <div class="footer-inner">
      <ul class="social-links">
        <li>
          <a href="https://www.youtube.com/@Tung_talk" target="_blank" aria-label="YouTube">
            <img src="https://duckduckgo.com/assets/icons/favicons/youtube.2x.png" alt="YouTube">
          </a>
        </li>
        <li>
          <a href="https://www.ganjingworld.com/zh-TW/@Tung" target="_blank" aria-label="乾淨世界">
            <img src="https://external-content.duckduckgo.com/ip3/www.ganjingworld.com.ico" alt="乾淨世界">
          </a>
        </li>
        <li>
          <a href="https://twitter.com/jzking_tw" target="_blank" aria-label="Twitter">
            <img src="https://external-content.duckduckgo.com/ip3/about.x.com.ico" alt="Twitter">
          </a>
        </li>
        <li>
          <a href="mailto:Tung@jzking.tw" aria-label="Email">
            <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48ZyBmaWxsPSJub25lIj48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMjMuMjQ5IDMuODJILjc1djE2LjM2aDIyLjV6Ii8+PHBhdGggZmlsbD0iI2JiZDhmZiIgZD0iTTIwLjk5OSAxOC4xMzZIMy4wMDFMLjc1MSAyMC4xOEgyMy4yNXoiLz48cGF0aCBzdHJva2U9IiMwOTJmNjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNMjMuMjQ5IDMuODJMMTIgMTUuMzc0TC43NTEgMy44MTltMCAxNi4zNjJsOC4yODMtNy42N209LjkzMiAwbDguMjgzIDcuNjciIHN0cm9rZS13aWR0aD0iMSIvPjxwYXRoIHN0cm9rZT0iIzA5MmY2MyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGQ9Ik0yMy4yNDkgMy44MkguNzV2MTYuMzZoMjIuNXoiIHN0cm9rZS13aWR0aD0iMSIvPjxwYXRoIHN0cm9rZT0iIzA5MmY2MyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGQ9Ik0yMy4yNDkgMy44MkguNzV2MTYuMzZoMjIuNXoiIHN0cm9rZS13aWR0aD0iMSIvPjwvZz48L3N2Zz4" alt="Email">
          </a>
        </li>
        <li>
          <a href="https://www.instagram.com/tung_talk/" target="_blank" aria-label="Instagram">
            <img src="https://external-content.duckduckgo.com/ip3/www.instagram.com.ico" alt="Instagram">
          </a>
        </li>
        <li>
          <a href="https://lin.ee/GQlQZAE" target="_blank" aria-label="LINE">
            <img src="https://external-content.duckduckgo.com/ip3/line.me.ico" alt="LINE">
          </a>
        </li>
        <li>
          <a href="https://podcasts.apple.com/us/channel/落寒說道/id6749576041" target="_blank" aria-label="Podcast">
            <img src="https://encrypted-tbn0.gstatic.com/favicon-tbn?q=tbn:ANd9GcQ4IX7VcjZFvjbixRhGdSP8VE9VoT1IiA3DuAn8lHhNq5yHkls4yeRBt2YlFk85GpM4z4i0ZcOhPhFtOl4nVDjwxrZ1qB2Ika7zH11HPGozDz6TmZAynOk" alt="Podcast">
          </a>
        </li>
      </ul>

      <p class="copyright">
        © ${year} 沈落寒
      </p>
    </div>
  `; `;

  // 自动年份
  footer.querySelector("#footer-year").textContent =
    new Date().getFullYear();
}