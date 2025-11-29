// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAj_Rjt0Wu7_TSNcJ2lRZ9m8We57Lzjyos",
  authDomain: "vecapp-381db.firebaseapp.com",
  projectId: "vecapp-381db",
  storageBucket: "vecapp-381db.appspot.com",
  messagingSenderId: "143386329035",
  appId: "1:143386329035:web:95a8279cb8347337f8004e",
  measurementId: "G-5REP33Q9RS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { db, app };
