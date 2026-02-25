import { Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn, useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'
import { setAuthTokenGetter } from './services/api'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import InterviewSetup from './pages/InterviewSetup'
import InterviewSession from './pages/InterviewSession'
import Report from './pages/Report'
import EmailAutomation from './pages/EmailAutomation'
import ATSUpload from './pages/ATSChecker/Upload'
import ATSReport from './pages/ATSChecker/Report'

function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

function App() {
  const { getToken } = useAuth()

  useEffect(() => {
    // Set up the token getter for API calls
    setAuthTokenGetter(getToken)
  }, [getToken])


  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview/setup"
        element={
          <ProtectedRoute>
            <InterviewSetup />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview/:sessionId"
        element={
          <ProtectedRoute>
            <InterviewSession />
          </ProtectedRoute>
        }
      />
      <Route
        path="/report/:sessionId"
        element={
          <ProtectedRoute>
            <Report />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tools/email-automation"
        element={
          <ProtectedRoute>
            <EmailAutomation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tools/ats-checker"
        element={
          <ProtectedRoute>
            <ATSUpload />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tools/ats-checker/report/:reportId"
        element={
          <ProtectedRoute>
            <ATSReport />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
