import React from 'react';
import {
  Mic,
  Square,
  FileText,
  CheckCircle2,
  Stethoscope,
  Pill } from
'lucide-react';
import { useNav } from '../navigation/NavContext';
const stop = (e: React.MouseEvent) => e.stopPropagation();
export const SoapNotes = () => {
  const { navigate } = useNav();
  return (
    <div className="p-6 bg-slate-50 h-full">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">
                Clinical Notes (SOAP)
              </h2>
              <p className="text-xs text-slate-500">
                Oct 24, 2023 • General Checkup
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              stop(e);
              navigate('prescription');
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium shadow-sm">
            
            Sign & Lock Note
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <span className="w-6 h-6 rounded bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                S
              </span>
              Subjective
            </label>
            <textarea
              className="w-full h-32 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 focus:outline-none focus:border-primary resize-none"
              readOnly
              value="Patient complains of mild sensitivity to cold in the lower right quadrant, specifically around tooth #30. Pain started 2 weeks ago, intermittent. No pain on biting. Patient reports brushing twice daily but flossing irregularly." />
            
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <span className="w-6 h-6 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                O
              </span>
              Objective
            </label>
            <textarea
              className="w-full h-32 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 focus:outline-none focus:border-primary resize-none"
              readOnly
              value="Visual exam reveals occlusal caries on #30. No swelling or erythema in surrounding gingiva. Percussion test negative. Cold test positive (mild lingering). Perio probing depths generally 2-3mm, localized 4mm on distal of #30." />
            
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <span className="w-6 h-6 rounded bg-amber-100 text-amber-700 flex items-center justify-center text-xs">
                A
              </span>
              Assessment
            </label>
            <textarea
              className="w-full h-32 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 focus:outline-none focus:border-primary resize-none"
              readOnly
              value="1. Dental Caries, unspecified (K02.9) on tooth #30.
2. Localized mild gingivitis.
Diagnosis: Reversible pulpitis secondary to occlusal caries #30." />


            
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <span className="w-6 h-6 rounded bg-purple-100 text-purple-700 flex items-center justify-center text-xs">
                P
              </span>
              Plan
            </label>
            <textarea
              className="w-full h-32 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 focus:outline-none focus:border-primary resize-none"
              readOnly
              value="1. Discussed findings with patient.
2. Proposed composite restoration for #30. Patient consented.
3. Oral hygiene instruction given (emphasized flossing).
4. Re-evaluate at next restorative appointment." />



            
          </div>
        </div>
      </div>
    </div>);

};
export const VoiceToText = () => {
  const { navigate } = useNav();
  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="bg-white p-4 border-b border-slate-200 flex items-center justify-between">
        <span
          onClick={(e) => {
            stop(e);
            navigate('soap');
          }}
          className="text-sm font-medium text-slate-500 cursor-pointer">
          
          Cancel
        </span>
        <h2 className="font-semibold text-slate-900">Voice Dictation</h2>
        <span
          onClick={(e) => {
            stop(e);
            navigate('soap');
          }}
          className="text-sm font-medium text-primary cursor-pointer">
          
          Save
        </span>
      </div>

      <div className="flex-1 p-6 flex flex-col">
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-slate-700 text-sm leading-relaxed relative">
          <p>
            Patient presents today for a routine checkup.{' '}
            <span className="bg-blue-50 text-blue-800 px-1 rounded">
              Visual examination reveals a small carious lesion on the occlusal
              surface of tooth number 14.
            </span>{' '}
            The patient reports no pain or sensitivity in that area. I recommend
            a composite restoration...
          </p>
          <div className="w-1 h-4 bg-primary animate-pulse inline-block ml-1 align-middle"></div>
        </div>

        <div className="mt-8 flex flex-col items-center">
          {/* Waveform visualization */}
          <div className="flex items-center gap-1 h-12 mb-6">
            {[4, 8, 12, 16, 24, 16, 12, 8, 16, 20, 12, 6, 10, 18, 12, 8, 4].map(
              (h, i) =>
              <div
                key={i}
                className="w-1.5 bg-primary rounded-full"
                style={{
                  height: `${h}px`,
                  opacity: h > 12 ? 1 : 0.5
                }}>
              </div>

            )}
          </div>

          <button
            onClick={(e) => {
              stop(e);
              navigate('soap');
            }}
            className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 border-4 border-red-100">
            
            <Square className="w-8 h-8 text-white fill-current" />
          </button>
          <p className="text-xs font-medium text-slate-500 mt-4">
            Listening... 00:42
          </p>
        </div>
      </div>
    </div>);

};
export const Prescription = () =>
<div className="p-8 bg-slate-50 h-full flex justify-center">
    <div className="w-full max-w-3xl bg-white shadow-lg border border-slate-200 flex flex-col">
      {/* Rx Header */}
      <div className="p-8 border-b-2 border-slate-800 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            CLINIDENT
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            123 Dental Way, Suite 100
          </p>
          <p className="text-sm text-slate-600">New York, NY 10001</p>
          <p className="text-sm text-slate-600">Ph: (555) 123-4567</p>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-bold text-slate-900">
            Dr. Sarah Jenkins, DDS
          </h2>
          <p className="text-sm text-slate-600">Lic #12345678</p>
          <p className="text-sm text-slate-600">DEA #AB1234567</p>
        </div>
      </div>

      {/* Patient Info */}
      <div className="p-6 border-b border-slate-200 flex justify-between bg-slate-50/50">
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase mb-1">
            Patient Name
          </p>
          <p className="font-bold text-slate-900">Emma Thompson</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase mb-1">
            Age / Sex
          </p>
          <p className="font-bold text-slate-900">28 / F</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 font-medium uppercase mb-1">
            Date
          </p>
          <p className="font-bold text-slate-900">Oct 24, 2023</p>
        </div>
      </div>

      {/* Rx Body */}
      <div className="p-8 flex-1 relative">
        <div className="absolute top-8 left-8 text-8xl font-serif text-slate-100 select-none pointer-events-none">
          Rx
        </div>

        <div className="relative z-10 mt-12 space-y-8 pl-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Pill className="w-5 h-5 text-slate-700" />
              <h3 className="text-lg font-bold text-slate-900">
                Amoxicillin 500mg
              </h3>
            </div>
            <p className="text-slate-700 ml-7">
              Dispense: 21 (Twenty-one) Capsules
            </p>
            <p className="text-slate-700 ml-7 font-medium mt-1">
              Sig: Take 1 capsule by mouth every 8 hours for 7 days.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Pill className="w-5 h-5 text-slate-700" />
              <h3 className="text-lg font-bold text-slate-900">
                Ibuprofen 600mg
              </h3>
            </div>
            <p className="text-slate-700 ml-7">
              Dispense: 15 (Fifteen) Tablets
            </p>
            <p className="text-slate-700 ml-7 font-medium mt-1">
              Sig: Take 1 tablet every 6 hours as needed for pain.
            </p>
          </div>
        </div>
      </div>

      {/* Footer / Signature */}
      <div className="p-8 flex justify-between items-end mt-auto">
        <div className="flex items-center gap-2">
          <input
          type="checkbox"
          className="w-4 h-4 rounded border-slate-300 text-primary"
          readOnly />
        
          <span className="text-sm text-slate-600">Dispense as written</span>
        </div>

        <div className="w-64 text-center">
          <div className="border-b border-slate-800 pb-2 mb-2">
            {/* Simulated Signature */}
            <svg className="w-full h-12" viewBox="0 0 200 50">
              <path
              d="M 20 30 C 40 10, 60 40, 80 20 C 100 0, 110 40, 130 20 C 150 0, 170 30, 190 20"
              fill="none"
              stroke="#0F172A"
              strokeWidth="2"
              strokeLinecap="round" />
            
            </svg>
          </div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
            Signature
          </p>
        </div>
      </div>
    </div>
  </div>;