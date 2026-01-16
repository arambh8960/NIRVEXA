// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "nirvexa-14dce.firebaseapp.com",
  projectId: "nirvexa-14dce",
  storageBucket: "nirvexa-14dce.firebasestorage.app",
  messagingSenderId: "347166850456",
  appId: "1:347166850456:web:7550f00f605f9c5de07fed"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
