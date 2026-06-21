import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDqtMo8xujMCzj9ZsiIOJaNpP_1UEHBmwE",
  authDomain: "mathpowerapps.firebaseapp.com",
  projectId: "mathpowerapps",
  storageBucket: "mathpowerapps.firebasestorage.app",
  messagingSenderId: "367328347913",
  appId: "1:367328347913:web:14bd6920feebcd598e35d8",
  measurementId: "G-9N7RY1BBSK"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
