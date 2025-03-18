import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, updateDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "crypto-waitlist-47686.firebaseapp.com",
  projectId: "crypto-waitlist-47686",
  storageBucket: "crypto-waitlist-47686.firebasestorage.app",
  messagingSenderId: "496617408364",
  appId: "1:496617408364:web:c5d26b5a5a814ca58e5549"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Firestore collections
export const tasksCollection = collection(db, "tasks");
export const usersCollection = collection(db, "users");

