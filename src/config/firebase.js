// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// Firebase configuration for SWD-Store project
const firebaseConfig = {
  apiKey: "AIzaSyC-your-actual-api-key-here", // Replace with your actual API key
  authDomain: "swd-store.firebaseapp.com",
  projectId: "swd-store",
  storageBucket: "swd-store.appspot.com",
  messagingSenderId: "885364532961",
  appId: "1:885364532961:web:your-app-id-here" // Replace with your actual app ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
export const storage = getStorage(app);

export default app;
