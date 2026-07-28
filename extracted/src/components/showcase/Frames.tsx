import React from 'react';
export const PhoneFrame = ({
  children,
  title



}: {children: React.ReactNode;title?: string;}) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-[300px] h-[640px] bg-white rounded-[3rem] border-[10px] border-slate-800 shadow-2xl overflow-hidden shrink-0">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-50 flex justify-center items-center">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full"></div>
        </div>

        {/* Screen Content */}
        <div className="w-full h-full overflow-y-auto bg-slate-50 relative hide-scrollbar">
          {children}
        </div>
      </div>
      {title && <p className="text-slate-500 font-medium text-sm">{title}</p>}
    </div>);

};
export const BrowserFrame = ({
  children,
  title



}: {children: React.ReactNode;title?: string;}) => {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-6xl mx-auto">
      <div className="w-full bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Browser Header */}
        <div className="h-12 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-4 shrink-0">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-white rounded-md border border-slate-200 px-4 py-1 text-xs text-slate-400 w-full max-w-md text-center flex items-center justify-center gap-2">
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                
              </svg>
              clinident.app/dashboard
            </div>
          </div>
          <div className="w-12"></div> {/* Spacer for balance */}
        </div>

        {/* Browser Content */}
        <div className="w-full bg-slate-50 relative flex-1 min-h-[600px]">
          {children}
        </div>
      </div>
      {title && <p className="text-slate-500 font-medium text-sm">{title}</p>}
    </div>);

};
export const SectionHeader = ({
  number,
  title,
  description




}: {number: string;title: string;description: string;}) => {
  return (
    <div className="mb-12 max-w-3xl">
      <div className="flex items-center gap-4 mb-3">
        <span className="text-primary font-bold text-xl tracking-tight">
          {number}
        </span>
        <div className="h-px w-12 bg-slate-300"></div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
          {title}
        </h2>
      </div>
      <p className="text-slate-500 text-lg pl-20">{description}</p>
    </div>);

};