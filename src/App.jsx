import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { FocusProvider } from './contexts/FocusContext'
import { Navbar } from './components/layout/Navbar'
import { FullscreenOverlay } from './components/layout/FullscreenOverlay'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'

export default function App() {
  return (
    <AuthProvider>
      <FocusProvider>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <Navbar />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </div>
        </div>
        <FullscreenOverlay />
      </FocusProvider>
    </AuthProvider>
  )
}