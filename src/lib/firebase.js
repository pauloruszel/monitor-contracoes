import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyA-_D5ZWRs5O0KTHGYjrn9D1ALOU6U6Bpo',
  authDomain: 'monitor-contracoes.firebaseapp.com',
  databaseURL: 'https://monitor-contracoes-default-rtdb.firebaseio.com',
  projectId: 'monitor-contracoes',
  storageBucket: 'monitor-contracoes.firebasestorage.app',
  messagingSenderId: '337105211708',
  appId: '1:337105211708:web:99fc3d1744e3907b2d0e39',
}

const app = initializeApp(firebaseConfig)

export const db = getDatabase(app)
export const isFirebaseConfigured = Boolean(firebaseConfig.databaseURL)
