import firebase from 'firebase'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'

const firebaseConfig = {
    apiKey: "AIzaSyASAsOm45C_KmDEBsHgbb-vmbbCUSonHtk",
    authDomain: "ecommerce-819cb.firebaseapp.com",
    projectId: "ecommerce-819cb",
    storageBucket: "ecommerce-819cb.appspot.com",
    messagingSenderId: "381845361649",
    appId: "1:381845361649:web:c6c78dd2947fa85e72ea50",
    measurementId: "G-N6ZFBQXLXL"

};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth()
const fs = firebase.firestore();
const storage = firebase.storage();

export {auth,fs,storage}