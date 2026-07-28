import React from 'react';
import {
  Calendar,
  FileText,
  Pill,
  CreditCard,
  MessageCircle,
  Phone,
  Bell,
  User,
  Activity } from
'lucide-react';
import { useNav } from '../navigation/NavContext';
const stop = (e: React.MouseEvent) => e.stopPropagation();
export const PatientDashboard = () => {
  const { navigate } = useNav();
  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-primary px-6 pt-12 pb-6 rounded-b-[2rem] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="flex justify-between items-center relative z-10 mb-6">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&fit=crop"
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-white/20" />
            
            <div>
              <p className="text-xs text-blue-100">Good morning,</p>
              <p className="font-bold">Emma Thompson</p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center relative">
            <Bell className="w-5 h-5" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-primary"></div>
          </button>
        </div>

        {/* Next Appointment Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 relative z-10">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
              Next Appointment
            </span>
            <span className="text-xs font-medium">In 2 days</span>
          </div>
          <h3 className="font-bold text-lg mb-1">General Checkup</h3>
          <p className="text-sm text-blue-100 mb-4">
            Dr. Sarah Jenkins • Chair 2
          </p>
          <div className="flex gap-2">
            <div className="bg-white/20 rounded-lg px-3 py-2 flex-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">Oct 26, 10:00 AM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div
            onClick={(e) => {
              stop(e);
              navigate('booking');
            }}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center gap-2 cursor-pointer">
            
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-semibold text-slate-800">
              Book Appt
            </span>
          </div>
          <div
            onClick={(e) => {
              stop(e);
              navigate('gallery');
            }}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center gap-2 cursor-pointer">
            
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-sm font-semibold text-slate-800">
              My Reports
            </span>
          </div>
          <div
            onClick={(e) => {
              stop(e);
              navigate('prescription');
            }}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center gap-2 cursor-pointer">
            
            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
              <Pill className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-semibold text-slate-800">
              Prescriptions
            </span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center gap-2 cursor-pointer">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-sm font-semibold text-slate-800">
              Payments
            </span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-3">
          <button className="w-full bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-slate-600" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-semibold text-slate-900">Chat with Clinic</h4>
              <p className="text-xs text-slate-500">
                Usually replies in 10 mins
              </p>
            </div>
          </button>

          <button
            onClick={(e) => {
              stop(e);
              navigate('sos');
            }}
            className="w-full bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-4 shadow-sm">
            
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-semibold text-red-700">Emergency SOS</h4>
              <p className="text-xs text-red-500">Call clinic immediately</p>
            </div>
          </button>
        </div>
      </div>
    </div>);

};
export const SOSScreen = () => {
  const { navigate } = useNav();
  return (
    <div className="h-full flex flex-col bg-red-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-100 via-red-50 to-white opacity-50"></div>

      <div className="p-6 relative z-10 flex flex-col h-full">
        <div className="text-center mt-12 mb-auto">
          <h2 className="text-2xl font-bold text-red-700 mb-2">
            Dental Emergency?
          </h2>
          <p className="text-sm text-red-500">
            Don't panic. We are here to help.
          </p>
        </div>

        <div className="flex justify-center my-12 relative">
          {/* Pulsing rings */}
          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
          <div
            className="absolute inset-4 bg-red-500 rounded-full animate-ping opacity-40"
            style={{
              animationDelay: '0.5s'
            }}>
          </div>

          <button
            onClick={(e) => {
              stop(e);
              navigate('patient-dashboard');
            }}
            className="relative z-10 w-48 h-48 bg-red-600 rounded-full shadow-[0_0_40px_rgba(220,38,38,0.5)] border-8 border-red-500 flex flex-col items-center justify-center text-white">
            
            <Phone className="w-12 h-12 mb-2 fill-current" />
            <span className="font-bold text-xl tracking-wider">CALL NOW</span>
          </button>
        </div>

        <div className="mt-auto bg-white rounded-2xl p-5 shadow-sm border border-red-100">
          <h3 className="font-bold text-slate-900 mb-3">Nearest Clinic</h3>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                CLINIDENT Main Branch
              </p>
              <p className="text-xs text-slate-500 mt-1">
                123 Dental Way, Suite 100
                <br />
                New York, NY 10001
              </p>
              <p className="text-xs font-medium text-emerald-600 mt-2">
                Open Now • 2.4 miles away
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>);

};