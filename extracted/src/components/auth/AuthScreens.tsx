import React from 'react';
import {
  Activity,
  Mail,
  Lock,
  User,
  Phone,
  ChevronRight,
  Stethoscope,
  Users,
  Settings } from
'lucide-react';
import { useNav } from '../navigation/NavContext';
const stop = (e: React.MouseEvent) => e.stopPropagation();
export const Splash = () =>
<div className="h-full flex flex-col items-center justify-center bg-white relative overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
    <div className="relative z-10 flex flex-col items-center">
      <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-glow mb-6">
        <Activity className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
        CLINIDENT
      </h1>
      <p className="text-slate-500 font-medium">Smart Dental Management</p>
    </div>
  </div>;

export const Login = () => {
  const { navigate } = useNav();
  return (
    <div className="h-full flex flex-col bg-white p-6">
      <div className="mt-12 mb-10">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
          <Activity className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h2>
        <p className="text-slate-500 text-sm">
          Sign in to your account to continue
        </p>
      </div>

      <div className="space-y-4 flex-1">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="doctor@clinic.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              readOnly
              onClick={stop} />
            
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Password
            </label>
            <span
              onClick={(e) => {
                stop(e);
                navigate('forgot');
              }}
              className="text-xs text-primary font-medium cursor-pointer">
              
              Forgot?
            </span>
          </div>
          <div className="relative">
            <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              readOnly
              onClick={stop} />
            
          </div>
        </div>

        <button
          onClick={(e) => {
            stop(e);
            navigate('role');
          }}
          className="w-full bg-primary text-white rounded-xl py-3.5 text-sm font-semibold shadow-glow mt-4">
          
          Sign In
        </button>

        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink-0 mx-4 text-xs text-slate-400">
            Or continue with
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <button
          onClick={(e) => {
            stop(e);
            navigate('role');
          }}
          className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2">
          
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            
          </svg>
          Google
        </button>
      </div>

      <p className="text-center text-xs text-slate-500 mt-6">
        Don't have an account?{' '}
        <span
          onClick={(e) => {
            stop(e);
            navigate('signup');
          }}
          className="text-primary font-medium cursor-pointer">
          
          Sign up
        </span>
      </p>
    </div>);

};
export const Signup = () => {
  const { navigate } = useNav();
  return (
    <div className="h-full flex flex-col bg-white p-6">
      <div className="mt-8 mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Create Account
        </h2>
        <p className="text-slate-500 text-sm">Join CLINIDENT today</p>
      </div>

      <div className="space-y-4 flex-1">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Dr. Sarah Jenkins"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm"
              readOnly
              onClick={stop} />
            
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="sarah@clinic.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm"
              readOnly
              onClick={stop} />
            
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm"
              readOnly
              onClick={stop} />
            
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm"
              readOnly
              onClick={stop} />
            
          </div>
        </div>

        <div className="flex items-start gap-2 mt-2">
          <div className="w-4 h-4 rounded border border-slate-300 bg-primary flex items-center justify-center mt-0.5">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7" />
              
            </svg>
          </div>
          <p className="text-xs text-slate-500 leading-tight">
            I agree to the{' '}
            <span className="text-primary">Terms of Service</span> and{' '}
            <span className="text-primary">Privacy Policy</span>
          </p>
        </div>

        <button
          onClick={(e) => {
            stop(e);
            navigate('role');
          }}
          className="w-full bg-primary text-white rounded-xl py-3.5 text-sm font-semibold shadow-glow mt-4">
          
          Create Account
        </button>
      </div>
    </div>);

};
export const ForgotPassword = () => {
  const { navigate } = useNav();
  return (
    <div className="h-full flex flex-col bg-white p-6">
      <div className="mt-12 mb-8">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Reset Password
        </h2>
        <p className="text-slate-500 text-sm">
          Enter your email and we'll send you a link to reset your password.
        </p>
      </div>

      <div className="space-y-4 flex-1">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="doctor@clinic.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm"
              readOnly
              onClick={stop} />
            
          </div>
        </div>

        <button
          onClick={(e) => {
            stop(e);
            navigate('login');
          }}
          className="w-full bg-primary text-white rounded-xl py-3.5 text-sm font-semibold shadow-glow mt-4">
          
          Send Reset Link
        </button>
      </div>

      <p className="text-center text-xs text-slate-500 mt-6">
        Back to{' '}
        <span
          onClick={(e) => {
            stop(e);
            navigate('login');
          }}
          className="text-primary font-medium cursor-pointer">
          
          Sign In
        </span>
      </p>
    </div>);

};
export const RoleSelection = () => {
  const { navigate } = useNav();
  return (
    <div className="h-full flex flex-col bg-slate-50 p-6">
      <div className="mt-12 mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Choose your role
        </h2>
        <p className="text-slate-500 text-sm">
          Select how you want to use CLINIDENT
        </p>
      </div>

      <div className="space-y-4 flex-1">
        <div
          onClick={(e) => {
            stop(e);
            navigate('doctor-speech');
          }}
          className="bg-white border-2 border-primary rounded-2xl p-4 flex items-center gap-4 shadow-sm relative overflow-hidden cursor-pointer">
          
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full"></div>
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <Stethoscope className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">Doctor</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage patients & treatments
            </p>
          </div>
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white"></div>
          </div>
        </div>

        <div
          onClick={(e) => {
            stop(e);
            navigate('patient-dashboard');
          }}
          className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm cursor-pointer">
          
          <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-secondary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">Patient</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Book & view appointments
            </p>
          </div>
          <div className="w-5 h-5 rounded-full border border-slate-300"></div>
        </div>

        <div
          onClick={(e) => {
            stop(e);
            navigate('admin');
          }}
          className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm cursor-pointer">
          
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
            <Settings className="w-6 h-6 text-slate-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">Administrator</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage clinic operations
            </p>
          </div>
          <div className="w-5 h-5 rounded-full border border-slate-300"></div>
        </div>
      </div>

      <button
        onClick={(e) => {
          stop(e);
          navigate('doctor-speech');
        }}
        className="w-full bg-primary text-white rounded-xl py-3.5 text-sm font-semibold shadow-glow mt-4 flex items-center justify-center gap-2">
        
        Continue <ChevronRight className="w-4 h-4" />
      </button>
    </div>);

};
