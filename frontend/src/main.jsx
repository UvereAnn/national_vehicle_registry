import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster position="top-right" toastOptions={{
  duration: 4000,
  style: { borderRadius: '8px', background: '#333', color: '#fff' },
  success: { style: { background: '#166534', color: '#fff' }, duration: 3000 },
  error: { 
    style: { background: '#991b1b', color: '#fff' }, 
    duration: 6000
  }
}} />
  </React.StrictMode>
)
