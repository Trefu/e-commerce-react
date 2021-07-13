import firebase from "firebase/app";
import "@firebase/firestore"
require('dotenv').config();
export const firebaseConfig = firebase.initializeApp({
    apiKey: process.env.API_KEY,
    authDomain: "react-ecommerce-trefu.firebaseapp.com",
    projectId: "react-ecommerce-trefu",
    storageBucket: "react-ecommerce-trefu.appspot.com",
    messagingSenderId: "314756587257",
    appId: process.env.API_ID
});


export const getFirebase = () => {
    return firebaseConfig
}

export const getFirestore = () => {
    return firebase.firestore(firebaseConfig)
}

export const db = getFirestore();
// Initialize Cloud Firestore through Firebase
