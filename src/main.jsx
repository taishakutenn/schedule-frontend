// Import css files
import "./css/reset.css" 
import "./css/index.css"

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Add styles for body and html, because react doesnt see body and html in css file
document.documentElement.style.height = '100%';
document.body.style.height = '100%';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
