import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyAiUVvrj24VFUxGmcupAkYrPM8VbQs723g",
  authDomain: "swd-store.firebaseapp.com",
  projectId: "swd-store",
  storageBucket: "swd-store.firebasestorage.app",
  messagingSenderId: "885364532961",
  appId: "1:885364532961:web:14677a3af1483a817fb9a0",
  measurementId: "G-MFS3KZZFCR"
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const storage = getStorage(app);

export default app;
