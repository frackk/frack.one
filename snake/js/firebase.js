
// firebase config
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAxOiDOhHc14-7mz6K8tZD-L2M-yNEDnvs",
  authDomain: "snake-frack-one.firebaseapp.com",
  projectId: "snake-frack-one",
  storageBucket: "snake-frack-one.appspot.com",
  messagingSenderId: "429155382978",
  appId: "1:429155382978:web:16f740d28fdd2de8fd6d5b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, getDocs, query, orderBy, limit, Timestamp };
