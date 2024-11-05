import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import InfluenceGraph from './components/InfluenceGraph.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <InfluenceGraph />
  </StrictMode>,
)
