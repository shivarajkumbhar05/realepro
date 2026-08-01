import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAOgKjiFnMZ_gEVGtgr3eLB-P1J3TN1S78",
  authDomain: "propestate-b493f.firebaseapp.com",
  projectId: "propestate-b493f",
  storageBucket: "propestate-b493f.firebasestorage.app",
  messagingSenderId: "13461070199",
  appId: "1:13461070199:web:c53b35e2ba07c75ffa0172",
  measurementId: "G-K5FE3PV6V0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Set persistence to LOCAL (keep user logged in)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Persistence error:", error);
});

// Initialize Google Auth Provider with custom parameters
export const googleProvider = new GoogleAuthProvider();
// Add custom parameters to reduce popup issues
googleProvider.setCustomParameters({
  prompt: 'select_account',
  flow: 'redirect'
});

export default app;