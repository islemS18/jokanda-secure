
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBCiT4mrxfRXfrEfYNKwCVhcxnGjaol05A",
  authDomain: "jokanda-website.firebaseapp.com",
  projectId: "jokanda-website",
  storageBucket: "jokanda-website.firebasestorage.app",
  messagingSenderId: "887676144906",
  appId: "1:887676144906:web:d6db1b7d91bf1bdd033ef3",
  measurementId: "G-2ZL4XK0LF0"
};

// Init Firebase
const app = initializeApp(firebaseConfig);

// Services
const db = getFirestore(app);
const auth = getAuth(app);

// Export
export { db, auth };