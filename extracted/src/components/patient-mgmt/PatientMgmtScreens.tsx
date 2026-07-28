import React from 'react';
import {
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  FileText,
  Activity,
  AlertCircle,
  CheckCircle2,
  Download,
  Edit3 } from
'lucide-react';
import { useNav } from '../navigation/NavContext';
const stop = (e: React.MouseEvent) => e.stopPropagation();
export const PatientRegistration = () => {
  const { navigate } = useNav();
  return (
    <div className="p-8 bg-slate-50 h-full">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900">
            New Patient Registration
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Step 1 of 3: Personal Information
          </p>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 mt-6">
            <div className="h-2 flex-1 bg-primary rounded-full"></div>
            <div className="h-2 flex-1 bg-slate-200 rounded-full"></div>
            <div className="h-2 flex-1 bg-slate-200 rounded-full"></div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 flex items-center gap-6 mb-2">
              <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50">
                <User className="w-8 h-8 mb-1" />
                <span className="text-[10px] font-medium">Upload Photo</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-900 mb-1">
                  Profile Photo
                </h3>
                <p className="text-xs text-slate-500">
                  Upload a clear photo of the patient for easy identification.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                First Name
              </label>
              <input
                type="text"
                placeholder="John"
                className="w-full border border-slate-200 rounded-lg py-2.5 px-3 text-sm"
                readOnly />
              
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Doe"
                className="w-full border border-slate-200 rounded-lg py-2.5 px-3 text-sm"
                readOnly />
              
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="MM/DD/YYYY"
                  className="w-full border border-slate-200 rounded-lg py-2.5 pl-9 pr-3 text-sm"
                  readOnly />
                
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Gender
              </label>
              <select className="w-full border border-slate-200 rounded-lg py-2.5 px-3 text-sm text-slate-500 bg-white">
                <option>Select Gender</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="w-full border border-slate-200 rounded-lg py-2.5 pl-9 pr-3 text-sm"
                  readOnly />
                
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="john.doe@example.com"
                  className="w-full border border-slate-200 rounded-lg py-2.5 pl-9 pr-3 text-sm"
                  readOnly />
                
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <textarea
                  placeholder="Full residential address"
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg py-2.5 pl-9 pr-3 text-sm resize-none"
                  readOnly>
                </textarea>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={(e) => {
                stop(e);
                navigate('doctor-speech');
              }}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium">
              
              Cancel
            </button>
            <button
              onClick={(e) => {
                stop(e);
                navigate('patient-profile');
              }}
              className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium">
              
              Next Step
            </button>
          </div>
        </div>
      </div>
    </div>);

};
export const PatientProfile = () => {
  const { navigate } = useNav();
  return (
    <div className="p-6 bg-slate-50 h-full flex gap-6">
      {/* Left Sidebar - Summary */}
      <div className="w-80 shrink-0 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-md mb-4">
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&fit=crop"
              alt="Patient"
              className="w-full h-full object-cover" />
            
          </div>
          <h2 className="text-xl font-bold text-slate-900">Emma Thompson</h2>
          <p className="text-sm text-slate-500 mb-4">ID: PT-2023-0892</p>

          <div className="flex justify-center gap-2 mb-6">
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
              28 yrs
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
              Female
            </span>
            <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium border border-red-100">
              O+
            </span>
          </div>

          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700">+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700">emma.t@example.com</span>
            </div>
          </div>
        </div>

        {/* Allergies Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" /> Allergies & Alerts
          </h3>
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-md text-xs font-medium">
              Penicillin
            </span>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-xs font-medium">
              Latex (Mild)
            </span>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-xs font-medium">
              Asthma
            </span>
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="flex border-b border-slate-200 px-2">
          {[
          'Overview',
          'Medical History',
          'Dental History',
          'Treatments',
          'Files'].
          map((tab, i) =>
          <button
            key={i}
            className={`px-4 py-4 text-sm font-medium border-b-2 ${i === 2 ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            
              {tab}
            </button>
          )}
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">
              Previous Procedures
            </h3>
            <button
              onClick={(e) => {
                stop(e);
                navigate('odontogram');
              }}
              className="text-sm text-primary font-medium flex items-center gap-1">
              
              <Activity className="w-4 h-4" /> View Odontogram
            </button>
          </div>

          <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pb-4">
            <div className="relative pl-6">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-sm"></div>
              <p className="text-xs font-bold text-primary mb-1">
                Oct 12, 2023
              </p>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-slate-900">
                    Composite Filling
                  </h4>
                  <span className="text-xs font-medium text-slate-500">
                    Tooth #14
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  Mesial-Occlusal composite restoration. Local anesthesia
                  administered (2% Lidocaine with 1:100k epi).
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User className="w-3 h-3" /> Dr. Sarah Jenkins
                </div>
              </div>
            </div>

            <div className="relative pl-6">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-300 border-4 border-white shadow-sm"></div>
              <p className="text-xs font-bold text-slate-500 mb-1">
                Mar 05, 2023
              </p>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-slate-900">
                    Routine Prophylaxis
                  </h4>
                  <span className="text-xs font-medium text-slate-500">
                    Full Mouth
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  Scaling and root planing. Oral hygiene instructions given.
                  Patient advised to floss daily.
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User className="w-3 h-3" /> RDH. Michael Chen
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-900 mt-8 mb-4">
            Consent Forms
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    General Dentistry Consent
                  </p>
                  <p className="text-xs text-slate-500">
                    Signed on Oct 12, 2023
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  <CheckCircle2 className="w-3 h-3" /> Signed
                </span>
                <button className="text-slate-400 hover:text-slate-600">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

};
export const ESignature = () => {
  const { navigate } = useNav();
  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="bg-white p-4 border-b border-slate-200 flex items-center justify-between">
        <span
          onClick={(e) => {
            stop(e);
            navigate('patient-profile');
          }}
          className="text-sm font-medium text-slate-500 cursor-pointer">
          
          Cancel
        </span>
        <h2 className="font-semibold text-slate-900">Sign Consent</h2>
        <span className="text-sm font-medium text-primary cursor-pointer">
          Clear
        </span>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm mb-6">
          <h3 className="font-semibold text-slate-900 mb-1">
            Root Canal Treatment
          </h3>
          <p className="text-xs text-slate-500 line-clamp-3">
            I hereby authorize Dr. Sarah Jenkins to perform a root canal
            treatment on tooth #14. I understand the risks, benefits, and
            alternatives to this procedure...
          </p>
          <button className="text-xs text-primary font-medium mt-2">
            Read full document
          </button>
        </div>

        <div className="flex-1 bg-white rounded-2xl border-2 border-dashed border-slate-300 relative flex flex-col items-center justify-center">
          <Edit3 className="w-8 h-8 text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50" />

          {/* Simulated signature stroke */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 300 200">
            
            <path
              d="M 50 100 C 70 80, 90 120, 110 90 C 130 60, 140 130, 160 100 C 180 70, 200 110, 220 90"
              fill="none"
              stroke="#0F172A"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round" />
            
          </svg>

          <div className="absolute bottom-8 left-8 right-8 border-t-2 border-slate-200 pt-2 text-center">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Sign Here
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            stop(e);
            navigate('patient-profile');
          }}
          className="w-full bg-primary text-white rounded-xl py-3.5 text-sm font-semibold shadow-glow mt-6">
          
          Accept & Sign
        </button>
      </div>
    </div>);

};
