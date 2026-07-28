import React, { useState, Component } from 'react';
import { PhoneFrame, BrowserFrame } from './components/showcase/Frames';
import {
  Splash,
  Login,
  Signup,
  ForgotPassword,
  RoleSelection } from
'./components/auth/AuthScreens';
import {
  PatientRegistration,
  PatientProfile,
  ESignature } from
'./components/patient-mgmt/PatientMgmtScreens';
import {
  SmartCalendar,
  AppointmentBooking } from
'./components/appointments/AppointmentScreens';
import { ESignAppointment } from './components/appointments/ESignAppointment';
import { OdontogramUI } from './components/charting/ChartingScreens';
import {
  SoapNotes,
  VoiceToText,
  Prescription } from
'./components/notes/NotesScreens';
import {
  ImageGallery,
  ComparisonViewer } from
'./components/imaging/ImagingScreens';
import {
  PatientDashboard,
  SOSScreen } from
'./components/patient-app/PatientAppScreens';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DoctorSpeechToText } from './components/doctor/SpeechToText';
import { Activity, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { NavProvider, ScreenId } from './components/navigation/NavContext';
type ScreenType = 'mobile' | 'web';
interface Screen {
  id: string;
  title: string;
  section: string;
  type: ScreenType;
  component: React.FC;
}
const screens: Screen[] = [
// Authentication
{
  id: 'splash',
  title: 'Splash Screen',
  section: '01 — Authentication',
  type: 'mobile',
  component: Splash
},
{
  id: 'login',
  title: 'Login',
  section: '01 — Authentication',
  type: 'mobile',
  component: Login
},
{
  id: 'signup',
  title: 'Sign Up',
  section: '01 — Authentication',
  type: 'mobile',
  component: Signup
},
{
  id: 'forgot',
  title: 'Forgot Password',
  section: '01 — Authentication',
  type: 'mobile',
  component: ForgotPassword
},
{
  id: 'role',
  title: 'Role Selection',
  section: '01 — Authentication',
  type: 'mobile',
  component: RoleSelection
},
// Doctor Tools
{
  id: 'doctor-speech',
  title: 'Doctor Speech-to-Text',
  section: '02 — Doctor Tools',
  type: 'web',
  component: DoctorSpeechToText
},
// Patient Management
{
  id: 'patient-profile',
  title: 'Patient Profile',
  section: '03 — Patient Management',
  type: 'web',
  component: PatientProfile
},
{
  id: 'patient-registration',
  title: 'Patient Registration',
  section: '03 — Patient Management',
  type: 'web',
  component: PatientRegistration
},
{
  id: 'e-signature',
  title: 'E-Signature',
  section: '03 — Patient Management',
  type: 'mobile',
  component: ESignature
},
// Appointments
{
  id: 'calendar',
  title: 'Smart Calendar',
  section: '04 — Appointments',
  type: 'web',
  component: SmartCalendar
},
{
  id: 'booking',
  title: 'Appointment Booking',
  section: '04 — Appointments',
  type: 'mobile',
  component: AppointmentBooking
},
{
  id: 'e-signature-appointment',
  title: 'E-Sign Appointment',
  section: '04 — Appointments',
  type: 'mobile',
  component: ESignAppointment
},
// Charting
{
  id: 'odontogram',
  title: 'Odontogram UI',
  section: '05 — Dental Charting',
  type: 'web',
  component: OdontogramUI
},
// Notes
{
  id: 'soap',
  title: 'SOAP Notes',
  section: '06 — Clinical Notes',
  type: 'web',
  component: SoapNotes
},
{
  id: 'prescription',
  title: 'Prescription',
  section: '06 — Clinical Notes',
  type: 'web',
  component: Prescription
},
{
  id: 'voice',
  title: 'Voice Dictation',
  section: '06 — Clinical Notes',
  type: 'mobile',
  component: VoiceToText
},
// Imaging
{
  id: 'gallery',
  title: 'Image Gallery',
  section: '07 — Imaging',
  type: 'web',
  component: ImageGallery
},
{
  id: 'comparison',
  title: 'Comparison Viewer',
  section: '07 — Imaging',
  type: 'web',
  component: ComparisonViewer
},
// Patient App
{
  id: 'patient-dashboard',
  title: 'Patient Dashboard',
  section: '08 — Patient App',
  type: 'mobile',
  component: PatientDashboard
},
{
  id: 'sos',
  title: 'Emergency SOS',
  section: '08 — Patient App',
  type: 'mobile',
  component: SOSScreen
},
// Admin
{
  id: 'admin',
  title: 'Admin Dashboard',
  section: '09 — Admin',
  type: 'web',
  component: AdminDashboard
}];

// Group screens by section for the sidebar
const groupedScreens = screens.reduce(
  (acc, screen, index) => {
    if (!acc[screen.section]) acc[screen.section] = [];
    acc[screen.section].push({
      ...screen,
      index
    });
    return acc;
  },
  {} as Record<
    string,
    (Screen & {
      index: number;
    })[]>

);
export function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const currentScreen = screens[currentIndex];
  const ScreenComponent = currentScreen.component;
  const goNext = () => {
    if (currentIndex < screens.length - 1) setCurrentIndex(currentIndex + 1);
  };
  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };
  const navigateById = (id: ScreenId) => {
    const idx = screens.findIndex((s) => s.id === id);
    if (idx >= 0) setCurrentIndex(idx);
  };
  return (
    <NavProvider
      value={{
        navigate: navigateById
      }}>
      
      <div className="h-screen w-screen bg-slate-100 font-sans text-slate-900 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? 'w-72' : 'w-0'} bg-white border-r border-slate-200 flex flex-col transition-all duration-300 overflow-hidden shrink-0`}>
          
          {/* Brand Header */}
          <div className="h-16 flex items-center px-5 border-b border-slate-100 shrink-0">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center mr-3">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900 leading-tight">
                CLINIDENT
              </p>
              <p className="text-[10px] text-slate-500 leading-tight">
                Smart Dental Management
              </p>
            </div>
          </div>

          {/* Screen List */}
          <div className="flex-1 overflow-y-auto p-3">
            {Object.entries(groupedScreens).map(([section, sectionScreens]) =>
            <div key={section} className="mb-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                  {section}
                </p>
                <div className="space-y-0.5">
                  {sectionScreens.map((screen) =>
                <button
                  key={screen.id}
                  onClick={() => setCurrentIndex(screen.index)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2.5 transition-colors ${currentIndex === screen.index ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                  
                      <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${currentIndex === screen.index ? 'bg-primary' : 'bg-slate-300'}`}>
                  </span>
                      <span className="flex-1 truncate">{screen.title}</span>
                      <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${screen.type === 'mobile' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                    
                        {screen.type === 'mobile' ? 'M' : 'W'}
                      </span>
                    </button>
                )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-100 text-[10px] text-slate-400 shrink-0">
            {screens.length} screens • Click any to jump
          </div>
        </aside>

        {/* Main Viewport */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50">
                
                {sidebarOpen ?
                <X className="w-4 h-4" /> :

                <Menu className="w-4 h-4" />
                }
              </button>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {currentScreen.section}
                </p>
                <h1 className="text-base font-bold text-slate-900 leading-tight">
                  {currentScreen.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 font-medium">
                {currentIndex + 1} <span className="text-slate-300">/</span>{' '}
                {screens.length}
              </span>
            </div>
          </div>

          {/* Screen Display Area - Click to advance */}
          <div
            onClick={goNext}
            className="flex-1 overflow-auto bg-slate-100 flex items-center justify-center p-8 cursor-pointer relative group">
            
            {currentScreen.type === 'mobile' ?
            <div className="w-[400px] h-full bg-white shadow-xl border-x border-slate-200 overflow-y-auto">
                <ScreenComponent />
              </div> :

            <div className="w-full h-full bg-white overflow-auto">
                <ScreenComponent />
              </div>
            }

            {/* Tap hint */}
            {currentIndex < screens.length - 1 &&
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur text-white text-xs font-medium px-4 py-2 rounded-full flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none">
                <span>Tap anywhere to go to next screen</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            }
          </div>

          {/* Bottom Navigation Bar */}
          <div className="h-20 bg-white border-t border-slate-200 flex items-center justify-between px-8 shrink-0">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-medium text-sm transition-colors ${currentIndex === 0 ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'}`}>
              
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {/* Progress Dots */}
            <div className="flex items-center gap-1.5">
              {screens.map((_, i) =>
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === currentIndex ? 'w-8 bg-primary' : 'w-1.5 bg-slate-300 hover:bg-slate-400'}`} />

              )}
            </div>

            <button
              onClick={goNext}
              disabled={currentIndex === screens.length - 1}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm ${currentIndex === screens.length - 1 ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-primary text-white hover:bg-blue-600'}`}>
              
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
    </NavProvider>);

}
