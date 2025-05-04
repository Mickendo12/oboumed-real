
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8wVMbivjoRX-t_Ccv8oVaibtgoQH2d7M",
  authDomain: "tenenka-9f3f9.firebaseapp.com",
  projectId: "tenenka-9f3f9",
  storageBucket: "tenenka-9f3f9.firebasestorage.app",
  messagingSenderId: "83928605191",
  appId: "1:83928605191:web:3d6aee9b00acfc2f89c0a2",
  measurementId: "G-6YR4VPXW9W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { app, auth, db, analytics };
