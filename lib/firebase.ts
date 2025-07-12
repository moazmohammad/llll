import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyCEt8j6viDMU8pLW6TZWp0Jl9sguSTYwxg",
  authDomain: "alamal-592e2.firebaseapp.com",
  projectId: "alamal-592e2",
  storageBucket: "alamal-592e2.firebasestorage.app",
  messagingSenderId: "328658685577",
  appId: "1:328658685577:web:0e9e094e1d720bd520c058",
  measurementId: "G-HL1EHV6LTK"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)


