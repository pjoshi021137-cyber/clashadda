
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", function(event) {
  event.preventDefault();

  message.textContent =
    "Firebase Authentication अभी सेटअप नहीं हुआ है। असली Login के लिए Firebase जोड़ना जरूरी है।";
});
