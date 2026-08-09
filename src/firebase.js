import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDMwacsEBFUynWYje2WM9lcFyO56CPmH5w",
  authDomain: "anniversary-site-da0c7.firebaseapp.com",
  projectId: "anniversary-site-da0c7",
  storageBucket: "anniversary-site-da0c7.firebasestorage.app",
  messagingSenderId: "492268930121",
  appId: "1:492268930121:web:1415b52cba2f483a50ab98",
  measurementId: "G-JC4WKS11E8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
