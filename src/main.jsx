import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CoupleProvider } from './CoupleContext.jsx'
import { SoundProvider } from './SoundContext.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <CoupleProvider>
        <SoundProvider>
          <App />
        </SoundProvider>
      </CoupleProvider>
    </BrowserRouter>
  </StrictMode>,
)
