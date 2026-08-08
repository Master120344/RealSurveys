import {initializeApp} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import {getAuth,signInWithEmailAndPassword,createUserWithEmailAndPassword,sendPasswordResetEmail,onAuthStateChanged,signOut} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import {getFirestore} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
const firebaseConfig={apiKey:'AIzaSyA7GP-4bnijUNXGBti2nCOJF9iwusuL7c4',authDomain:'real-surveys.firebaseapp.com',projectId:'real-surveys',storageBucket:'real-surveys.appspot.com',messagingSenderId:'1024139519354',appId:'1:1024139519354:web:a0b11a5a0560ab02ee22c3'};
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
const signIn=(email,password)=>signInWithEmailAndPassword(auth,email,password),register=(email,password)=>createUserWithEmailAndPassword(auth,email,password),resetPassword=email=>sendPasswordResetEmail(auth,email),logOut=()=>signOut(auth);
export{auth,db,signIn,register,resetPassword,onAuthStateChanged,logOut};