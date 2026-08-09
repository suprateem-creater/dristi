import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CoupleProvider } from './CoupleContext.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <CoupleProvider>
        <App />
      </CoupleProvider>
    </BrowserRouter>
  </StrictMode>,
)
