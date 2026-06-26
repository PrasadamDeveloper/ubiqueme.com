import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBUnGSjA5JAstb-l-NukKeNmrBQyTEO1D4',
  authDomain: 'ubiqueme-services.firebaseapp.com',
  projectId: 'ubiqueme-services',
  storageBucket: 'ubiqueme-services.firebasestorage.app',
  messagingSenderId: '239704119257',
  appId: '1:239704119257:web:f77f867a60796c379bebc8',
}

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig)
const _analytics = getAnalytics(firebaseApp)

const auth = getAuth(firebaseApp)
const db = getFirestore(firebaseApp)

export { auth, db }
