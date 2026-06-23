import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { FeedProvider } from './context/FeedContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Tropels } from './pages/Tropels'
import { Feed } from './pages/Feed'
import { SignalDetail } from './pages/SignalDetail'
import { Sectors } from './pages/Sectors'
import { SectorStory } from './pages/SectorStory'

export default function App() {
  return (
    <AuthProvider>
      <FeedProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tropels" element={<Tropels />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/feed/:id" element={<SignalDetail />} />
                <Route path="/sectors" element={<Sectors />} />
                <Route path="/sectors/:id/story" element={<SectorStory />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </FeedProvider>
    </AuthProvider>
  )
}