document.addEventListener("DOMContentLoaded", function () {
  if (!window.APP_CONFIG || !window.APP_CONFIG.NEWS_API_URL) {
    console.error("Missing NEWS_API_URL. Check config.js generation from SSM Parameter Store.");
    return;
  }

  fetch(window.APP_CONFIG.NEWS_API_URL)
    .then(response => response.json())
    .then(data => displayNews(data))
    .catch(error => console.error("Error fetching news:", error));
});

function displayNews(newsItems) {
  const container = document.getElementById("posts-container");

  if (!container) {
    console.error("Missing posts-container element.");
    return;
  }

  container.innerHTML = "";

  newsItems.forEach(item => {
    const newsElement = document.createElement("div");

    newsElement.innerHTML = `
      <h3>${item.Title}</h3>
      <p>${item.Summary}</p>
      <a href="${item.Link}" target="_blank" rel="noopener noreferrer">Read more</a>
    `;

    container.appendChild(newsElement);
  });
}