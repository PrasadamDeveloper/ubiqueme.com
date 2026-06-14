import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDFGdlu8fLVe0osO_OYCewHU0UA0wmlaLE',
  authDomain: 'ubiqueme-system.firebaseapp.com',
  projectId: 'ubiqueme-system',
  storageBucket: 'ubiqueme-system.firebasestorage.app',
  messagingSenderId: '313357118395',
  appId: '1:313357118395:web:399c08ecb384cd4570f29e',
  measurementId: 'G-3XT4RFF2Q0',
}

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig)
const _analytics = getAnalytics(firebaseApp)

const auth = getAuth(firebaseApp)
const db = getFirestore(firebaseApp)

export { auth, db }
