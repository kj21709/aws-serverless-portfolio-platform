document.addEventListener('DOMContentLoaded', function() {
 const darkModeToggle = document.getElementById('dark-mode-toggle');
 const body = document.body;

 // Check for saved user preference, if any, and apply it
 const userPrefersDark = localStorage.getItem('darkMode') === 'true';
 if (userPrefersDark) {
     body.classList.add('dark-mode');
 }

 darkModeToggle.addEventListener('click', function() {
     body.classList.toggle('dark-mode');

     // Save the user preference to local storage
     localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
 });
});
