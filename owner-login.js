
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDnYj8ht1gXigIWzj5K1W98mRLTOfmoXOU",
  authDomain: "clashadda-b3e57.firebaseapp.com",
  databaseURL: "https://clashadda-b3e57-default-rtdb.firebaseio.com",
  projectId: "clashadda-b3e57",
  storageBucket: "clashadda-b3e57.firebasestorage.app",
  messagingSenderId: "1046410116766",
  appId: "1:1046410116766:web:02fa3a28be10e39b28058f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  message.textContent = "Logging in...";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    message.textContent = "Login successful!";
    window.location.href = "index.html";
  } catch (error) {
    console.error(error);
    message.textContent = "Login failed. Please check your email and password.";
  }
});
