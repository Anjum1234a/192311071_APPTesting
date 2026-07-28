import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard, Calendar, Image, Box, Brain, FileText,
  User, LogOut, Menu, X, ChevronRight, Mic
} from 'lucide-react'
import { useState } from 'react'

const patientLinks = [
  { to: '/patient/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/patient/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/patient/xrays', icon: Image, label: 'X-Rays' },
  { to: '/patient/stl', icon: Box, label: '3D STL Scans' },
  { to: '/patient/ai-analysis', icon: Brain, label: 'AI Analysis' },
  { to: '/patient/reports', icon: FileText, label: 'Reports' },
  { to: '/patient/profile', icon: User, label: 'Profile' },
]

const doctorLinks = [
  { to: '/doctor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/doctor/patients', icon: User, label: 'Patients' },
  { to: '/doctor/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/doctor/xrays', icon: Image, label: 'X-Ray Viewer' },
  { to: '/doctor/ai-analysis', icon: Brain, label: 'AI Analysis' },
  { to: '/doctor/soap-notes', icon: Mic, label: 'SOAP Notes' },
  { to: '/doctor/reports', icon: FileText, label: 'Reports' },
]

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const links = user?.role === 'doctor' ? doctorLinks : patientLinks

  return (
    <div className="min-h-screen dashboard-bg flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 shadow-premium z-50
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2">
            <img src="/clinident_logo.png" alt="Clinident" className="h-8 w-auto object-contain" />
            <span className="text-xl font-bold font-display gradient-text">Clinident</span>
          </Link>
        </div>

        {/* User info */}
        <div className="p-4 mx-3 mt-4 mb-2 rounded-xl bg-gradient-to-r from-primary-500 to-cyan-500 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{user?.name}</p>
              <p className="text-xs text-white/70 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={`sidebar-link ${location.pathname === to ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {location.pathname === to && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={logout}
            className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-gray-500">
              {user?.role === 'doctor' ? '🏥 Doctor Portal' : '🦷 Patient Portal'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Online
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
