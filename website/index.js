// Function to update the view count from the API
function updateViewCount() {
  // Replace the URL below with your actual Lambda function URL
  fetch('FUNCTION_URL_HERE')
    .then(response => response.json())
    .then(data => {
      if (data && data.ViewCount !== undefined) {
        document.getElementById('view-count').innerText = `Views: ${data.ViewCount}`;
      } else {
        console.error('Invalid response data:', data);
      }
    })
    .catch(error => {
      console.error('Error fetching view count:', error);
    });
}

// Function to handle contact form submission
function submitContactForm(event) {
  event.preventDefault();

  // Show the spinner and disable the submit button
  var spinner = document.getElementById('spinner');
  spinner.style.display = 'block';
  var submitButton = event.target.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  // Capture form data
  var name = document.getElementById('name').value;
  var email = document.getElementById('email').value;
  var message = document.getElementById('message').value;

  // Construct the request payload
  var formData = {
    name: name,
    email: email,
    message: message
  };

  // Send the data to the Lambda function URL
  // Replace the URL below with your actual Lambda function URL for handling form submissions
  fetch('FUNCTION_URL_HERE', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
    .then(response => response.json())
    .then(data => {
      // Handle a successful submission
      alert('Thank you for your message!');
      // Optionally, clear the form inputs
      document.getElementById('contact-form').reset();
    })
    .catch(error => {
      console.error('Error submitting contact form:', error);
    })
    .finally(() => {
      // Hide the spinner and re-enable the submit button
      spinner.style.display = 'none';
      submitButton.disabled = false;
    });
}

// Attach event listeners when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Update view count on page load
  updateViewCount();

  // Attach the submit event listener to the contact form
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', submitContactForm);
  }
});
