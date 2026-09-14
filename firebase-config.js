// =====================================================
// airecipe.onl — Firebase config (public keys — safe to expose)
// Security is enforced by Firestore rules, not by hiding these keys.
// Loaded as an ES module from login.html, index.html and tool.html.
// =====================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBQXU1JPaskxy2wGQPebtpLSFruyr0lw0A",
  authDomain: "airecipe-c9fb1.firebaseapp.com",
  projectId: "airecipe-c9fb1",
  storageBucket: "airecipe-c9fb1.firebasestorage.app",
  messagingSenderId: "725715979157",
  appId: "1:725715979157:web:699ee05f3f14fb58e7c49c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Re-export the helpers we use elsewhere
export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  doc,
  getDoc,
  setDoc
};
