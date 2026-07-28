"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Patient } from "@/types";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, User } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfMonth as endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import Link from "next/link";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [patients, setPatients] = useState<Patient[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchAppointments();
  }, [currentMonth]);

  const fetchAppointments = async () => {
    const { data } = await supabase
      .from('patients')
      .select('*');
    if (data) setPatients(data);
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-4 py-6 bg-white rounded-t-3xl border-b border-slate-100">
        <div className="flex flex-col">
          <span className="text-sm font-black text-primary uppercase tracking-widest">Clinic Schedule</span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{format(currentMonth, "MMMM yyyy")}</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-3 hover:bg-slate-50 rounded-xl transition-all border border-slate-100">
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-3 hover:bg-slate-50 rounded-xl transition-all border border-slate-100">
            <ChevronRight size={20} className="text-slate-600" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="grid grid-cols-7 bg-slate-50/50 border-b border-slate-100">
        {days.map(day => (
          <div key={day} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7">
        {days.map(day => {
          const dayAppointments = patients.filter(p => isSameDay(new Date(p.last_visit.split(' ')[0]), day));
          return (
            <div
              key={day.toString()}
              className={`min-h-[140px] p-2 border-r border-b border-slate-100 transition-all ${
                !isSameMonth(day, monthStart) ? "bg-slate-50/30 opacity-40" : "bg-white"
              } ${isToday(day) ? "bg-blue-50/20" : ""}`}
            >
              <div className="flex justify-between items-center mb-2 px-1">
                <span className={`text-sm font-black ${isToday(day) ? "w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/20" : "text-slate-400"}`}>
                  {format(day, "d")}
                </span>
                {dayAppointments.length > 0 && (
                  <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    {dayAppointments.length} appt
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map(p => (
                  <Link
                    key={p.id}
                    href={`/dashboard/patients/${p.id}`}
                    className="block p-1.5 rounded-lg bg-slate-50 border border-slate-100 hover:border-primary/30 hover:bg-white transition-all overflow-hidden"
                  >
                    <p className="text-[10px] font-bold text-slate-700 truncate">{p.name}</p>
                    <p className="text-[8px] text-slate-400 font-medium truncate">{p.last_visit.split(' ')[1] || "All Day"}</p>
                  </Link>
                ))}
                {dayAppointments.length > 3 && (
                  <p className="text-[9px] font-black text-slate-300 text-center py-1 uppercase tracking-widest">+ {dayAppointments.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="card shadow-xl shadow-slate-200 border-none overflow-hidden">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>
    </div>
  );
}
