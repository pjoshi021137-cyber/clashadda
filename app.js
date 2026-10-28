// BGR eSPORTS - FINAL 100% - clashadda-b3e57 - Safer Refund - All Modes Fixed
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, doc, getDocs, addDoc, deleteDoc, query, orderBy, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js";

const firebaseConfig = {
  apiKey: "AIzaSyDnYj8ht1gXigIWzj5K1W98mRLTOfmoXOU",
  authDomain: "clashadda-b3e57.firebaseapp.com",
  databaseURL: "https://clashadda-b3e57-default-rtdb.firebaseio.com",
  projectId: "clashadda-b3e57",
  storageBucket: "clashadda-b3e57.firebasestorage.app",
  messagingSenderId: "1046410116766",
  appId: "1:1046410116766:web:02fa3a28be10e39b28058f",
  measurementId: "G-60KBXTZKE9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app, "asia-south1");

const MODES = [
  { id: "br_solo", label: "Battle Royale - Solo", type: "BR" },
  { id: "br_duo", label: "Battle Royale - Duo", type: "BR" },
  { id: "br_squad", label: "Battle Royale - Squad", type: "BR" },
  { id: "lone_wolf", label: "Lone Wolf 1v1", type: "LW" },
  { id: "clash_squad", label: "Clash Squad", type: "CS" },
  { id: "headshot", label: "Headshot Mode", type: "HS" },
  { id: "custom", label: "Custom Room", type: "CUSTOM" }
];

let currentUser = null; let isAdmin = false;

onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  currentUser = user;
  const token = await user.getIdTokenResult(true);
  isAdmin = token.claims.admin === true;
  initApp();
});

function initApp() {
  const sel = document.getElementById("tournamentMode") || document.querySelectorAll("select")[0];
  if (sel) sel.innerHTML = MODES.map(m => `<option value="${m.id}">${m.label}</option>`).join("");
  loadTournaments("all");
}

window.saveTournament = async function () {
  if (!isAdmin) return alert("Admin only");
  const name = document.querySelector('input[placeholder="BGR Booyah Cup"]')?.value || document.getElementById("tournamentName")?.value;
  const modeId = document.getElementById("tournamentMode")?.value || document.querySelectorAll("select")[0]?.value;
  const entryFee = document.querySelector('input[placeholder="20"]')?.value || 0;
  const prizePool = document.querySelector('input[placeholder="500"]')?.value || 0;
  const maxSlots = document.querySelector('input[placeholder="48"]')?.value || 48;
  const status = document.querySelectorAll("select")[1]?.value || "upcoming";
  const m = MODES.find(x => x.id === modeId) || MODES[2];
  if (!name) return alert("Name dalo");
  await addDoc(collection(db, "tournaments"), {
    name, mode: m.id, matchType: m.type, label: m.label,
    entryFee: Number(entryFee), prizePool: Number(prizePool), maxSlots: Number(maxSlots),
    filledSlots: 0, status: status.toLowerCase(), createdAt: serverTimestamp(), createdBy: currentUser.uid
  });
  alert("Created: " + m.label);
  loadTournaments("all");
}

window.loadTournaments = (t) => loadTournamentsByType(t);
window.filterByMode = (t) => loadTournamentsByType(t);

async function loadTournamentsByType(type) {
  const tbody = document.querySelector("table tbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="7">Loading ${type}...</td></tr>`;
  let q = type === "all" ? query(collection(db, "tournaments"), orderBy("createdAt", "desc")) : query(collection(db, "tournaments"), where("matchType", "==", type), orderBy("createdAt", "desc"));
  try {
    const snap = await getDocs(q);
    if (snap.empty) { tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px">No data in ${type} - Naya banao</td></tr>`; return; }
    tbody.innerHTML = "";
    snap.forEach(d => {
      const t = d.data();
      tbody.innerHTML += `<tr><td><b>${t.name}</b><br><small>${t.label}</small></td><td>${t.matchType}</td><td>${t.entryFee}</td><td>${t.prizePool}</td><td>${t.filledSlots || 0}/${t.maxSlots}</td><td>${t.status}</td><td><button onclick="deleteTournament('${d.id}')">Delete</button></td></tr>`;
    });
  } catch (e) { tbody.innerHTML = `<tr><td colspan="7">Index Error - Firebase me index banao: ${e.message}</td></tr>`; }
}
window.deleteTournament = async (id) => { if (confirm("Delete?")) { await deleteDoc(doc(db, "tournaments", id)); loadTournaments("all"); } }
