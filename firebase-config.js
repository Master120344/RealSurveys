import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';

const firebaseConfig = {
  apiKey: 'AIzaSyA7GP-4bnijUNXGBti2nCOJF9iwusuL7c4',
  authDomain: 'real-surveys.firebaseapp.com',
  projectId: 'real-surveys',
  storageBucket: 'real-surveys.appspot.com',
  messagingSenderId: '1024139519354',
  appId: '1:1024139519354:web:a0b11a5a0560ab02ee22c3'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const database = getDatabase(app);

export { auth, storage, database };
