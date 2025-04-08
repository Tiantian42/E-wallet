// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
 apiKey: "AIzaSyD8F8XwuRVSkRL6y5jy2aqxnfCQMF_zN0U",
  authDomain: "fir-auth-3554c.firebaseapp.com",
  projectId: "fir-auth-3554c",
  storageBucket: "fir-auth-3554c.appspot.com",
  messagingSenderId: "347728374225",
  appId: "1:347728374225:web:c0439bca26163e416258f0",
  measurementId: "G-J43XLHCKMT"
}

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

const auth = firebase.auth()
const db = firebase.firestore();

export { auth, firebase, db};