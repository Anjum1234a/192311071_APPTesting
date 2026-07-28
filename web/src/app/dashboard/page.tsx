"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Patient } from "@/types";
import {
  Plus,
  Search,
  Activity,
  Calendar as CalendarIcon,
  FileText,
  FileUp,
  Scan,
  TrendingUp,
  UserPlus,
  Users
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorName, setDoctorName] = useState("Doctor");
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchData();
    const subscription = supabase
      .channel('public:patients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, payload => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('doctors')
          .select('name')
          .eq('email', user.email)
          .single();
        if (profile) setDoctorName(profile.name);
      }

      const { data: patientsData } = await supabase
        .from('patients')
        .select('*')
        .order('last_visit', { ascending: false });

      if (patientsData) setPatients(patientsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const today = format(new Date(), "yyyy-MM-dd");
  const todayPatients = patients.filter(p => p.last_visit.includes(today));
  const treatedToday = todayPatients.filter(p => p.dental_condition.toLowerCase().includes("[done]")).length;
  const nextPatient = todayPatients.find(p => !p.dental_condition.toLowerCase().includes("[done]"));

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Good morning, Dr. <span className="text-primary">{doctorName.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-500 mt-2 font-medium">AI dental command center for today's clinic flow</p>
        </div>
        <div className="bg-secondary/10 text-secondary px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 border border-secondary/20 self-start">
          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
          Live Clinic
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Next Patient Card */}
        <div className="lg:col-span-2 card bg-gradient-to-br from-primary to-primary-variant p-8 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Activity size={180} />
          </div>
          <div className="relative z-10">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Next Patient Ready</span>
            <div className="mt-8 flex items-center gap-6">
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center border border-white/20 backdrop-blur-sm">
                <Scan size={36} />
              </div>
              <div>
                <h3 className="text-3xl font-extrabold truncate max-w-md">
                  {nextPatient?.name || "All caught up"}
                </h3>
                <p className="text-white/80 mt-1 font-medium">
                  {nextPatient ? `${nextPatient.dental_condition.replace('[DONE]', '').trim()}` : "No more appointments for today"}
                </p>
              </div>
            </div>
            {nextPatient && (
              <Link href={`/dashboard/patients/${nextPatient.id}`} title="View patient" className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-xl mt-8 font-bold text-sm hover:bg-slate-50 transition-all shadow-xl shadow-black/10">
                View Full Records
                <Plus size={18} />
              </Link>
            )}
          </div>
        </div>

        {/* Stats Column */}
        <div className="space-y-6">
          <div className="card p-6 flex flex-col justify-between h-[calc(50%-12px)]">
            <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Total Patients</p>
            <div className="flex items-end justify-between mt-4">
              <span className="text-5xl font-black text-slate-900">{patients.length}</span>
              <div className="bg-blue-50 text-primary p-3 rounded-2xl border border-blue-100">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>
          <div className="card p-6 flex flex-col justify-between h-[calc(50%-12px)]">
            <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Treated Today</p>
            <div className="flex items-end justify-between mt-4">
              <span className="text-5xl font-black text-slate-900">{treatedToday}</span>
              <div className="bg-teal-50 text-secondary p-3 rounded-2xl border border-teal-100">
                <CalendarIcon size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Section */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-6">One-tap clinical workflow</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: "Add Patient", icon: UserPlus, href: "/dashboard/patients/new", color: "bg-blue-50 text-primary border-blue-100" },
            { name: "Upload X-ray", icon: Scan, href: "/dashboard/stl-analysis", color: "bg-teal-50 text-secondary border-teal-100" },
            { name: "Create Notes", icon: FileText, href: "/dashboard/notes", color: "bg-teal-50 text-secondary border-teal-100" },
            { name: "Prescription", icon: Users, href: "/dashboard/prescriptions", color: "bg-blue-50 text-primary border-blue-100" },
          ].map((action) => (
            <Link key={action.name} href={action.href} title={action.name} className={`flex flex-col items-center justify-center p-6 rounded-3xl border transition-all hover:shadow-xl group ${action.color}`}>
              <action.icon size={28} className="mb-3 group-hover:scale-110 transition-transform" />
              <span className="font-extrabold text-sm text-slate-900">{action.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Timeline & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900">Calendar timeline</h2>
            <Link href="/calendar" className="text-primary font-bold text-sm hover:underline">View all</Link>
          </div>
          <div className="space-y-6">
            {todayPatients.length > 0 ? todayPatients.map((p, i) => (
              <Link key={p.id} href={`/dashboard/patients/${p.id}`} className="flex items-center gap-4 group w-full text-left">
                <span className="text-slate-400 font-bold text-sm w-20">
                    {p.last_visit.split(' ')[1] || "All Day"}
                </span>
                <div className="flex-1 flex items-center justify-between bg-slate-50 p-4 rounded-2xl group-hover:bg-white border border-transparent group-hover:border-slate-200 transition-all cursor-pointer">
                    <div>
                        <p className="font-extrabold text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{p.dental_condition.replace('[DONE]', '')}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${p.dental_condition.includes('[DONE]') ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                        {p.dental_condition.includes('[DONE]') ? 'Done' : (i === 0 ? 'In Progress' : 'Upcoming')}
                    </span>
                </div>
              </Link>
            )) : (
              <p className="text-slate-400 text-center py-10 font-medium">No appointments scheduled for today</p>
            )}
          </div>
        </div>

        <div className="card p-8 bg-white flex flex-col">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">AI clinical summary</h2>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex-1 leading-relaxed text-slate-600 font-medium">
                {treatedToday > 0 ? (
                    `You've successfully treated ${treatedToday} patients today. ${nextPatient ? `Next up is ${nextPatient.name} for ${nextPatient.dental_condition}.` : "All scheduled procedures for today are completed."}`
                ) : (
                    "Welcome back, Dr. Start your day by reviewing the upcoming appointments in the timeline."
                )}
                <br /><br />
                Recent X-rays for {patients[0]?.name || "patients"} are ready for review. Overall clinic utilization is optimized.
            </div>
        </div>
      </div>
    </div>
  );
}
