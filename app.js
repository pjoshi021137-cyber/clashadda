
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = id => document.getElementById(id);

let currentUser = null;
let isAdmin = false;
let tournaments = [];

const views = {
  overview: "Dashboard Overview",
  tournaments: "Tournament Management",
  registrations: "Player Registrations",
  rooms: "Room Management",
  results: "Results & Winners"
};

function showAlert(message) {
  const box = $("alert");
  box.textContent = message;
  box.classList.remove("hidden");
}

function clearAlert() {
  $("alert").textContent = "";
  $("alert").classList.add("hidden");
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function money(value) {
  return "₹" + Number(value || 0).toLocaleString("en-IN");
}

function formatDate(value) {
  if (!value) return "Time pending";

  const date = typeof value.toDate === "function"
    ? value.toDate()
    : new Date(value);

  return Number.isNaN(date.getTime())
    ? "Time pending"
    : date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
      });
}

function goto(view) {
  if (!views[view]) return;

  document.querySelectorAll(".view").forEach(section => {
    section.classList.toggle("hidden", section.id !== view);
  });

  document.querySelectorAll(".nav").forEach(button => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  $("title").textContent = views[view];
  clearAlert();
}

document.querySelectorAll(".nav[data-view]").forEach(button => {
  button.addEventListener("click", () => goto(button.dataset.view));
});

document.querySelectorAll("[data-goto]").forEach(button => {
  button.addEventListener("click", () => goto(button.dataset.goto));
});

$("loginBtn").addEventListener("click", async () => {
  const email = prompt("Enter admin email:");
  if (!email) return;

  const password = prompt("Enter password:");
  if (!password) return;

  $("loginBtn").disabled = true;

  try {
    await signInWithEmailAndPassword(auth, email.trim(), password);
    clearAlert();
  } catch (error) {
    showAlert("Sign in failed: " + error.message);
  } finally {
    $("loginBtn").disabled = false;
  }
});

$("logoutBtn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    goto("overview");
    showAlert("You have signed out.");
  } catch (error) {
    showAlert("Sign out failed: " + error.message);
  }
});

onAuthStateChanged(auth, async user => {
  currentUser = user;
  isAdmin = false;

  $("userStatus").textContent = user ? user.email : "Not signed in";
  $("loginBtn").classList.toggle("hidden", Boolean(user));
  $("logoutBtn").classList.toggle("hidden", !user);

  if (!user) {
    tournaments = [];
    renderTournaments();

    $("countT").textContent = "—";
    $("countR").textContent = "—";
    $("countP").textContent = "—";

    showAlert("Sign in with your authorized admin account to load tournament data.");
    return;
  }

  try {
    const token = await user.getIdTokenResult(true);
    isAdmin = token.claims.admin === true;

    if (!isAdmin) {
      showAlert("This account is signed in but does not have the admin permission. Ask the project owner to grant it securely.");
      return;
    }

    clearAlert();
    await loadTournaments();
  } catch (error) {
    showAlert("Could not verify admin access: " + error.message);
  }
});

async function loadTournaments() {
  if (!currentUser || !isAdmin) return;

  try {
    const snapshot = await getDocs(
      query(collection(db, "tournaments"), orderBy("startAt", "asc"))
    );

    tournaments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    renderTournaments();
  } catch (error) {
    showAlert("Could not load tournaments: " + error.message);
  }
}

function renderTournaments() {
  const openCount = tournaments.filter(item => item.status === "open").length;
  const joinedCount = tournaments.reduce(
    (total, item) => total + Number(item.joinedCount || 0), 0
  );

  $("countT").textContent = openCount;
  $("countR").textContent = joinedCount;

  const rows = tournaments.map(item => `
    <div class="row">
      <div>
        <b>${escapeHTML(item.name)}</b>
        <div class="muted">
          ${escapeHTML(item.mode)} · ${escapeHTML(item.map)}
        </div>
        <div class="muted">${escapeHTML(formatDate(item.startAt))}</div>
      </div>
      <div>
        <b>${money(item.prizePool)}</b>
        <div class="muted">${escapeHTML(item.status || "draft")}</div>
        <div class="muted">
          ${Number(item.joinedCount || 0)} / ${Number(item.maxSlots || 0)} slots
        </div>
      </div>
    </div>
  `).join("");

  const emptyMessage = isAdmin
    ? "No tournaments created yet."
    : "Sign in as an authorized admin to load tournaments.";

  $("tournamentRows").innerHTML =
    rows || `<p class="muted">${emptyMessage}</p>`;

  $("recent").innerHTML =
    rows
      ? tournaments.slice(0, 5).map(item => `
          <div class="row">
            <div>
              <b>${escapeHTML(item.name)}</b>
              <div class="muted">${escapeHTML(item.mode)} · ${escapeHTML(item.map)}</div>
            </div>
            <div>
              <b>${money(item.prizePool)}</b>
              <div class="muted">${escapeHTML(item.status || "draft")}</div>
            </div>
          </div>
        `).join("")
      : `<p class="muted">${emptyMessage}</p>`;
}

$("createForm").addEventListener("submit", async event => {
  event.preventDefault();

  if (!currentUser || !isAdmin) {
    showAlert("Only an authorized admin can create tournaments.");
    return;
  }

  const name = $("name").value.trim();
  const entryFee = Number($("fee").value);
  const prizePool = Number($("prize").value);
  const maxSlots = Number($("slots").value);
  const startAt = new Date($("startAt").value);

  if (!name || !Number.isFinite(entryFee) || entryFee < 0 ||
      !Number.isFinite(prizePool) || prizePool < 0 ||
      !Number.isInteger(maxSlots) || maxSlots < 2 ||
      Number.isNaN(startAt.getTime())) {
    showAlert("Please check every tournament field and try again.");
    return;
  }

  const submitButton = event.submitter;
  if (submitButton) submitButton.disabled = true;

  try {
    await addDoc(collection(db, "tournaments"), {
      name,
      mode: $("mode").value,
      map: $("map").value,
      entryFee,
      prizePool,
      maxSlots,
      joinedCount: 0,
      startAt,
      status: "open",
      createdAt: serverTimestamp(),
      createdBy: currentUser.uid
    });

    event.target.reset();
    $("fee").value = "0";
    $("prize").value = "500";
    $("slots").value = "48";

    showAlert("Tournament created successfully.");
    await loadTournaments();
    goto("tournaments");
  } catch (error) {
    showAlert("Tournament creation failed: " + error.message);
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});
  
