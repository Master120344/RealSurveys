import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA7GP-4bnijUNXGBti2nCOJF9iwusuL7c4",
  authDomain: "real-surveys.firebaseapp.com",
  projectId: "real-surveys",
  storageBucket: "real-surveys.appspot.com",
  messagingSenderId: "1024139519354",
  appId: "1:1024139519354:web:a0b11a5a0560ab02ee22c3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

export { auth, storage };
