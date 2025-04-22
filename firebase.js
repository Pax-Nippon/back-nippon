const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { getStorage } = require ("firebase/storage");

const firebaseConfig = {
  apiKey: "AIzaSyA-RADohoWifUiqbdKeRPppuzFQ1A4p308",
  authDomain: "enviocobranca-f0737.firebaseapp.com",
  projectId: "enviocobranca-f0737",
  storageBucket: "enviocobranca-f0737.appspot.com",
  messagingSenderId: "277161170950",
  appId: "1:277161170950:web:43ee322c53051abd3b0b87"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

module.exports = { db, storage};
