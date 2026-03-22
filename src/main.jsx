import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { registerServiceWorker } from './registerServiceWorker'
import './styles.css'

registerServiceWorker()

window.document.documentElement.classList.add('app-ready')
window.requestAnimationFrame(() => {
  const splashElement = window.document.getElementById('app-splash')
  splashElement?.classList.add('app-splash-hidden')
  window.setTimeout(() => splashElement?.remove(), 320)
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

