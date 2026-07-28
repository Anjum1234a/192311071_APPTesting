import React from 'react';
import { Tooth, ToothState } from '../dental/Tooth';
import { Activity, Save, Printer, Plus, ChevronDown } from 'lucide-react';
import { useNav } from '../navigation/NavContext';
const stop = (e: React.MouseEvent) => e.stopPropagation();
export const OdontogramUI = () => {
  const { navigate } = useNav();
  // Generate adult dentition (1-32)
  const upperTeeth = Array.from(
    {
      length: 16
    },
    (_, i) => i + 1
  );
  const lowerTeeth = Array.from(
    {
      length: 16
    },
    (_, i) => 32 - i
  );
  // Dummy states for realism
  const getToothState = (num: number): ToothState => {
    if (num === 3 || num === 14) return 'filled';
    if (num === 8) return 'rct';
    if (num === 19 || num === 30) return 'caries';
    if (num === 1 || num === 16 || num === 17 || num === 32) return 'missing';
    return 'healthy';
  };
  return (
    <div className="h-full bg-slate-50 flex flex-col p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-white shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Dental Charting
            </h2>
            <p className="text-xs text-slate-500">
              Patient: Emma Thompson • Last updated: Today, 10:45 AM
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                stop(e);
                navigate('prescription');
              }}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium flex items-center gap-2">
              
              <Printer className="w-4 h-4" /> Print
            </button>
            <button
              onClick={(e) => {
                stop(e);
                navigate('soap');
              }}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
              
              <Save className="w-4 h-4" /> Save Chart
            </button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Main Chart Area */}
          <div className="flex-1 p-8 flex flex-col items-center justify-center bg-slate-50/50">
            {/* Upper Arch */}
            <div className="flex gap-1 mb-12">
              {upperTeeth.map((num) =>
              <div key={num} className="flex flex-col items-center">
                  <Tooth
                  number={num}
                  state={getToothState(num)}
                  className="hover:-translate-y-1 cursor-pointer transition-transform" />
                
                  <div className="h-4 w-px bg-slate-200 my-2"></div>
                  <div className="flex gap-0.5">
                    {/* Surface boxes (Buccal, Occlusal, Lingual, Mesial, Distal) */}
                    <div className="w-2 h-2 border border-slate-300 bg-white"></div>
                    <div
                    className={`w-2 h-2 border border-slate-300 ${getToothState(num) === 'filled' ? 'bg-primary' : 'bg-white'}`}>
                  </div>
                    <div className="w-2 h-2 border border-slate-300 bg-white"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-full max-w-4xl h-px bg-slate-200 mb-12 relative">
              <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-slate-50/50 px-4 text-xs font-semibold text-slate-400">
                MIDLINE
              </div>
            </div>

            {/* Lower Arch */}
            <div className="flex gap-1">
              {lowerTeeth.map((num) =>
              <div key={num} className="flex flex-col items-center">
                  <div className="flex gap-0.5 mb-2">
                    <div className="w-2 h-2 border border-slate-300 bg-white"></div>
                    <div
                    className={`w-2 h-2 border border-slate-300 ${getToothState(num) === 'caries' ? 'bg-red-500' : 'bg-white'}`}>
                  </div>
                    <div className="w-2 h-2 border border-slate-300 bg-white"></div>
                  </div>
                  <div className="h-4 w-px bg-slate-200 mb-2"></div>
                  <Tooth
                  number={num}
                  state={getToothState(num)}
                  className="hover:translate-y-1 cursor-pointer transition-transform" />
                
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="mt-16 bg-white px-6 py-3 rounded-full border border-slate-200 shadow-sm flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm border border-slate-300 bg-white"></div>
                <span className="text-xs font-medium text-slate-600">
                  Healthy
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-red-500"></div>
                <span className="text-xs font-medium text-slate-600">
                  Caries
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-primary"></div>
                <span className="text-xs font-medium text-slate-600">
                  Filled
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-secondary"></div>
                <span className="text-xs font-medium text-slate-600">RCT</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-slate-200 flex items-center justify-center">
                  <div className="w-full h-px bg-slate-400 rotate-45"></div>
                </div>
                <span className="text-xs font-medium text-slate-600">
                  Missing
                </span>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Tools & Conditions */}
          <div className="w-80 border-l border-slate-100 bg-white p-5 flex flex-col">
            <h3 className="font-semibold text-slate-900 mb-4">
              Charting Tools
            </h3>

            <div className="grid grid-cols-2 gap-2 mb-6">
              <button className="p-3 border border-slate-200 rounded-xl flex flex-col items-center gap-2 hover:bg-slate-50 hover:border-primary transition-colors">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                </div>
                <span className="text-xs font-medium text-slate-700">
                  Caries
                </span>
              </button>
              <button className="p-3 border border-primary bg-primary/5 rounded-xl flex flex-col items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                </div>
                <span className="text-xs font-medium text-primary">
                  Composite
                </span>
              </button>
              <button className="p-3 border border-slate-200 rounded-xl flex flex-col items-center gap-2 hover:bg-slate-50">
                <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-secondary"></div>
                </div>
                <span className="text-xs font-medium text-slate-700">
                  Root Canal
                </span>
              </button>
              <button className="p-3 border border-slate-200 rounded-xl flex flex-col items-center gap-2 hover:bg-slate-50">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                  <div className="w-4 h-px bg-slate-400 rotate-45"></div>
                  <div className="w-4 h-px bg-slate-400 -rotate-45 absolute"></div>
                </div>
                <span className="text-xs font-medium text-slate-700">
                  Extraction
                </span>
              </button>
            </div>

            <h3 className="font-semibold text-slate-900 mb-3">
              Planned Treatments
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-bold text-slate-900">
                    Tooth #19
                  </span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">
                    PLANNED
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  MOD Composite Restoration
                </p>
                <p className="text-[10px] text-slate-400">
                  Added today by Dr. Jenkins
                </p>
              </div>
              <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-bold text-slate-900">
                    Tooth #30
                  </span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">
                    PLANNED
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  Occlusal Composite Restoration
                </p>
                <p className="text-[10px] text-slate-400">
                  Added today by Dr. Jenkins
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

};