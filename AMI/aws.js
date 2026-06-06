document.addEventListener('DOMContentLoaded', function() {
 fetch('FUNCTION_URL_HERE')
     .then(response => response.json())
     .then(data => displayNews(data))
     .catch(error => console.error('Error fetching news:', error));
});

function displayNews(newsItems) {
 const container = document.getElementById('posts-container');
 newsItems.forEach(item => {
     const newsElement = document.createElement('div');
     newsElement.innerHTML = `
         <h3>${item.Title}</h3>
         <p>${item.Summary}</p>
         <a href="${item.Link}" target="_blank">Read more</a>
     `;
     container.appendChild(newsElement);
 });
}
