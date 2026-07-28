import React from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  Search } from
'lucide-react';
import { useNav } from '../navigation/NavContext';
const stop = (e: React.MouseEvent) => e.stopPropagation();
export const SmartCalendar = () => {
  const { navigate } = useNav();
  return (
    <div className="h-full bg-white flex flex-col">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-900">October 2023</h2>
          <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200 p-1">
            <button className="p-1 hover:bg-slate-50 rounded">
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button className="p-1 hover:bg-slate-50 rounded">
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-lg border border-slate-200 p-1">
            <button className="px-3 py-1 text-sm font-medium bg-slate-100 text-slate-900 rounded-md">
              Month
            </button>
            <button className="px-3 py-1 text-sm font-medium text-slate-500 hover:text-slate-900 rounded-md">
              Week
            </button>
            <button className="px-3 py-1 text-sm font-medium text-slate-500 hover:text-slate-900 rounded-md">
              Day
            </button>
          </div>
          <button
            onClick={(e) => {
              stop(e);
              navigate('booking');
            }}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
            
            + New
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-7 grid-rows-6">
        {/* Days Header */}
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) =>
        <div
          key={i}
          className="border-b border-r border-slate-200 p-2 text-right">
          
            <span className="text-xs font-semibold text-slate-500 uppercase">
              {day}
            </span>
          </div>
        )}

        {/* Calendar Grid (Simulated) */}
        {Array.from({
          length: 35
        }).map((_, i) => {
          const dayNum = i - 1; // offset for visual
          const isCurrentMonth = dayNum > 0 && dayNum <= 31;
          const hasAppt1 = i === 12 || i === 15 || i === 22;
          const hasAppt2 = i === 15 || i === 18;
          return (
            <div
              key={i}
              className={`border-b border-r border-slate-100 p-2 min-h-[100px] ${!isCurrentMonth ? 'bg-slate-50' : 'bg-white'}`}>
              
              <div
                className={`text-right mb-1 ${i === 15 ? 'text-primary font-bold' : isCurrentMonth ? 'text-slate-700' : 'text-slate-300'}`}>
                
                {isCurrentMonth ?
                dayNum :
                dayNum <= 0 ?
                30 + dayNum :
                dayNum - 31}
              </div>

              <div className="space-y-1">
                {hasAppt1 &&
                <div className="bg-blue-50 border border-blue-100 text-blue-700 text-[10px] px-1.5 py-1 rounded truncate font-medium">
                    09:00 - Checkup
                  </div>
                }
                {hasAppt2 &&
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] px-1.5 py-1 rounded truncate font-medium">
                    14:30 - Root Canal
                  </div>
                }
                {i === 15 &&
                <div className="bg-purple-50 border border-purple-100 text-purple-700 text-[10px] px-1.5 py-1 rounded truncate font-medium">
                    16:00 - Consult
                  </div>
                }
              </div>
            </div>);

        })}
      </div>
    </div>);

};
export const AppointmentBooking = () => {
  const { navigate } = useNav();
  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="bg-white p-4 border-b border-slate-200 flex items-center gap-3">
        <ChevronLeft
          onClick={(e) => {
            stop(e);
            navigate('patient-dashboard');
          }}
          className="w-5 h-5 text-slate-600 cursor-pointer" />
        
        <h2 className="font-semibold text-slate-900">Book Appointment</h2>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            Select Service
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary/5 border-2 border-primary rounded-xl p-3 relative">
              <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
              <h4 className="font-semibold text-slate-900 text-sm mb-1">
                General Checkup
              </h4>
              <p className="text-xs text-slate-500">30 mins</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3">
              <h4 className="font-semibold text-slate-900 text-sm mb-1">
                Teeth Whitening
              </h4>
              <p className="text-xs text-slate-500">60 mins</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3">
              <h4 className="font-semibold text-slate-900 text-sm mb-1">
                Consultation
              </h4>
              <p className="text-xs text-slate-500">15 mins</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3">
              <h4 className="font-semibold text-slate-900 text-sm mb-1">
                Root Canal
              </h4>
              <p className="text-xs text-slate-500">90 mins</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3">Select Date</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
            {['Mon 12', 'Tue 13', 'Wed 14', 'Thu 15', 'Fri 16'].map(
              (day, i) =>
              <div
                key={i}
                className={`shrink-0 w-16 py-3 rounded-xl border flex flex-col items-center justify-center gap-1 ${i === 2 ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-slate-200 text-slate-700'}`}>
                
                  <span
                  className={`text-[10px] uppercase font-semibold ${i === 2 ? 'text-blue-100' : 'text-slate-400'}`}>
                  
                    {day.split(' ')[0]}
                  </span>
                  <span className="text-lg font-bold">{day.split(' ')[1]}</span>
                </div>

            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            Available Time
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
            '09:00 AM',
            '09:30 AM',
            '10:00 AM',
            '11:30 AM',
            '02:00 PM',
            '03:30 PM'].
            map((time, i) =>
            <div
              key={i}
              className={`py-2.5 rounded-lg border text-center text-sm font-medium ${i === 1 ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-slate-200 text-slate-600'}`}>
              
                {time}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&fit=crop"
            alt="Doctor"
            className="w-12 h-12 rounded-full object-cover" />
          
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Assigned Doctor</p>
            <p className="text-sm font-semibold text-slate-900">
              Dr. Sarah Jenkins
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <button
          onClick={(e) => {
            stop(e);
            navigate('e-signature-appointment');
          }}
          className="w-full bg-primary text-white rounded-xl py-3.5 text-sm font-semibold shadow-glow">
          
          Confirm Booking
        </button>
      </div>
    </div>);

};
