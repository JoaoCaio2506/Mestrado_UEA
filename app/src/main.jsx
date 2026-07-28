import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import { AuthProvider } from './auth/AuthContext.jsx'
import RootGate from './shell/RootGate.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RootGate />
    </AuthProvider>
  </StrictMode>,
)
