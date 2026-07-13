import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query } from "firebase/firestore";

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
const db = getFirestore(app);

async function check() {
  try {
    const q = query(collection(db, "profiles"));
    const querySnapshot = await getDocs(q);
    console.log("Success! Found", querySnapshot.size, "profiles");
    process.exit(0);
  } catch (error) {
    console.error("Error connecting:", error);
    process.exit(1);
  }
}
check();
