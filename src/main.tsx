import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import InfluenceGraph from './components/InfluenceGraph.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <InfluenceGraph />
  </StrictMode>,
)
