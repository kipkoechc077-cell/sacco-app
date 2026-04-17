import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBzh1YiZkIvqKDOhGSSXogPL0ooMiiMs58",
    authDomain: "sacco-app-aac60.firebaseapp.com",
    projectId: "sacco-app-aac60",
    storageBucket: "sacco-app-aac60.firebasestorage.app",
    messagingSenderId: "610913772844",
    appId: "1:610913772844:web:9b0144ea935cce9681b889",
    measurementId: "G-JVKPWEEVYY"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);