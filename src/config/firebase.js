// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAiUVvrj24VFUxGmcupAkYrPM8VbQs723g",
  authDomain: "swd-store.firebaseapp.com",
  projectId: "swd-store",
  storageBucket: "swd-store.firebasestorage.app",
  messagingSenderId: "885364532961",
  appId: "1:885364532961:web:14677a3af1483a817fb9a0",
  measurementId: "G-MFS3KZZFCR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

export default app;
