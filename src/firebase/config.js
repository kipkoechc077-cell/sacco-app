import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCA1iwJ6kxHI5LwN6OIZ4iBhX3ykmYdzpk",
    authDomain: "sacco-app-1c4c4.firebaseapp.com",
    projectId: "sacco-app-1c4c4",
    storageBucket: "sacco-app-1c4c4.firebasestorage.app",
    messagingSenderId: "578980827252",
    appId: "1:578980827252:web:224811cf2897a55bdd8121",
    measurementId: "G-B5S8P9Z7WE"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);