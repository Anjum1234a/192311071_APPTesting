import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Public Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard'
import PatientAppointments from './pages/patient/Appointments'
import PatientXrays from './pages/patient/Xrays'
import PatientSTL from './pages/patient/STL'
import PatientAIAnalysis from './pages/patient/AIAnalysis'
import PatientReports from './pages/patient/Reports'
import PatientProfile from './pages/patient/Profile'

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard'
import DoctorPatients from './pages/doctor/Patients'
import DoctorAppointments from './pages/doctor/Appointments'
import DoctorXrays from './pages/doctor/Xrays'
import DoctorAIAnalysis from './pages/doctor/AIAnalysis'
import DoctorSOAPNotes from './pages/doctor/SOAPNotes'
import DoctorReports from './pages/doctor/Reports'

// Loading spinner
const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-cyan-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      <p className="text-primary-600 font-medium text-sm">Loading Clinident...</p>
    </div>
  </div>
)

// Route guards
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} replace />
  }
  return children
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (user) return <Navigate to={user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

      {/* Patient Routes */}
      <Route path="/patient/dashboard" element={<ProtectedRoute allowedRole="patient"><PatientDashboard /></ProtectedRoute>} />
      <Route path="/patient/appointments" element={<ProtectedRoute allowedRole="patient"><PatientAppointments /></ProtectedRoute>} />
      <Route path="/patient/xrays" element={<ProtectedRoute allowedRole="patient"><PatientXrays /></ProtectedRoute>} />
      <Route path="/patient/stl" element={<ProtectedRoute allowedRole="patient"><PatientSTL /></ProtectedRoute>} />
      <Route path="/patient/ai-analysis" element={<ProtectedRoute allowedRole="patient"><PatientAIAnalysis /></ProtectedRoute>} />
      <Route path="/patient/reports" element={<ProtectedRoute allowedRole="patient"><PatientReports /></ProtectedRoute>} />
      <Route path="/patient/profile" element={<ProtectedRoute allowedRole="patient"><PatientProfile /></ProtectedRoute>} />

      {/* Doctor Routes */}
      <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/doctor/patients" element={<ProtectedRoute allowedRole="doctor"><DoctorPatients /></ProtectedRoute>} />
      <Route path="/doctor/appointments" element={<ProtectedRoute allowedRole="doctor"><DoctorAppointments /></ProtectedRoute>} />
      <Route path="/doctor/xrays" element={<ProtectedRoute allowedRole="doctor"><DoctorXrays /></ProtectedRoute>} />
      <Route path="/doctor/ai-analysis" element={<ProtectedRoute allowedRole="doctor"><DoctorAIAnalysis /></ProtectedRoute>} />
      <Route path="/doctor/soap-notes" element={<ProtectedRoute allowedRole="doctor"><DoctorSOAPNotes /></ProtectedRoute>} />
      <Route path="/doctor/reports" element={<ProtectedRoute allowedRole="doctor"><DoctorReports /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
