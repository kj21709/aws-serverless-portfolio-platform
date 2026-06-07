document.addEventListener("DOMContentLoaded", function () {
  fetchBlogPosts();

  function fetchBlogPosts() {
    if (!window.APP_CONFIG || !window.APP_CONFIG.BLOG_API_URL) {
      console.error("Missing BLOG_API_URL. Check config.js generation from SSM Parameter Store.");
      document.getElementById("posts-container").innerHTML = "<p>Blog API URL is not configured.</p>";
      return;
    }

    fetch(window.APP_CONFIG.BLOG_API_URL)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.text();
      })
      .then(htmlContent => {
        document.getElementById("posts-container").innerHTML = htmlContent;
      })
      .catch(error => {
        console.error("Error fetching blog posts:", error);
        document.getElementById("posts-container").innerHTML = "<p>Failed to load blog posts. Please try again later.</p>";
      });
  }
});