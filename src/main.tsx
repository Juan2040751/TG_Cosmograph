import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Display from './pages/Display.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Display />
  </StrictMode>,
)
