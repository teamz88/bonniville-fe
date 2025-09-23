import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ComprehensiveDashboard from './pages/ComprehensiveDashboard'
import Chat from './pages/Chat'
import Files from './pages/Files'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import UserManagement from './pages/UserManagement'
import Profile from './pages/Profile'
import QAManagement from './pages/QAManagement'
import ClientInfoModal from './components/ClientInfoModal'
import { useAuth } from './hooks/useAuth'
import { ChatProvider } from './contexts/ChatContext'

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Layout Component for all users
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, checkClientInfoStatus } = useAuth()
  const [showClientInfoModal, setShowClientInfoModal] = useState(false)
  const [isCheckingClientInfo, setIsCheckingClientInfo] = useState(true)

  useEffect(() => {
    // Hide company info modal for everyone
    setIsCheckingClientInfo(false)
  }, [user, checkClientInfoStatus])

  const handleClientInfoComplete = () => {
    setShowClientInfoModal(false)
    // Clear the skip flag when user completes the form
    if (user) {
      sessionStorage.removeItem(`client_info_skipped_${user.id}`)
    }
  }

  const handleClientInfoClose = () => {
    setShowClientInfoModal(false)
    // Mark as skipped for this session
    if (user) {
      sessionStorage.setItem(`client_info_skipped_${user.id}`, 'true')
    }
  }

  if (isCheckingClientInfo) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <ChatProvider>
      <Layout>{children}</Layout>
      <ClientInfoModal
        isOpen={showClientInfoModal}
        onClose={handleClientInfoClose}
        onComplete={handleClientInfoComplete}
      />
    </ChatProvider>
  )
}

function App() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Navigate to={isAdmin ? "/dashboard" : "/chat"} replace />} />
                {isAdmin && <Route path="/dashboard" element={<ComprehensiveDashboard />} />}
                <Route 
                  path="/chat" 
                  element={<Chat />} 
                />
                <Route 
                  path="/profile" 
                  element={<Profile />} 
                />
                {isAdmin && <Route path="/files" element={<Files />} />}
                {isAdmin && <Route path="/users" element={<UserManagement />} />}
                {isAdmin && <Route path="/qa-management" element={<QAManagement />} />}
                {/* Redirect non-admin users away from admin-only routes */}
                {!isAdmin && <Route path="/dashboard" element={<Navigate to="/chat" replace />} />}
                {!isAdmin && <Route path="/files" element={<Navigate to="/chat" replace />} />}
                {!isAdmin && <Route path="/qa-management" element={<Navigate to="/chat" replace />} />}
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App