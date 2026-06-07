function getRequiredConfigValue(key) {
  if (!window.APP_CONFIG || !window.APP_CONFIG[key]) {
    throw new Error(`Missing ${key}. Check /var/www/html/config.js generation from SSM Parameter Store.`);
  }

  return window.APP_CONFIG[key];
}

function updateViewCount() {
  fetch(getRequiredConfigValue("VIEW_COUNTER_API_URL"))
    .then(response => response.json())
    .then(data => {
      if (data && data.ViewCount !== undefined) {
        document.getElementById("view-count").innerText = `Views: ${data.ViewCount}`;
      } else {
        console.error("Invalid response data:", data);
      }
    })
    .catch(error => {
      console.error("Error fetching view count:", error);
    });
}

function submitContactForm(event) {
  event.preventDefault();

  const spinner = document.getElementById("spinner");
  if (spinner) {
    spinner.style.display = "block";
  }

  const submitButton = event.target.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
  }

  const formData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    message: document.getElementById("message").value
  };

  fetch(getRequiredConfigValue("CONTACT_API_URL"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formData)
  })
    .then(response => response.json())
    .then(() => {
      alert("Thank you for your message!");
      document.getElementById("contact-form").reset();
    })
    .catch(error => {
      console.error("Error submitting contact form:", error);
    })
    .finally(() => {
      if (spinner) {
        spinner.style.display = "none";
      }

      if (submitButton) {
        submitButton.disabled = false;
      }
    });
}

document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("view-count")) {
    updateViewCount();
  }

  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", submitContactForm);
  }
});