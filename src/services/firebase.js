import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAPRpbqHT6YO1ZX45pXB0TLZDhJ4sNUHyQ",
  authDomain: "facility-service-c7593.firebaseapp.com",
  projectId: "facility-service-c7593",
  storageBucket: "facility-service-c7593.firebasestorage.app",
  messagingSenderId: "977998780432",
  appId: "1:977998780432:web:81c248dd9b5298155f5295",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
