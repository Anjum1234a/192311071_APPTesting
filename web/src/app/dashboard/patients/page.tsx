"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Patient } from "@/types";
import { Search, UserPlus, Filter, MoreHorizontal, ArrowRight, User } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPatients();
    const subscription = supabase
      .channel('patients_all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, () => {
        fetchPatients();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('last_visit', { ascending: false });

    if (data) {
      setPatients(data);
      setFilteredPatients(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    const filtered = patients.filter(p =>
      (p.name?.toLowerCase() || "").includes(query) ||
      (p.dental_condition?.toLowerCase() || "").includes(query)
    );
    setFilteredPatients(filtered);
  }, [searchQuery, patients]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Patient Records</h1>
          <p className="text-slate-500 mt-1 font-medium font-medium">Manage and monitor all clinic patients</p>
        </div>
        <Link href="/dashboard/patients/new" title="New Patient" className="btn-primary flex items-center gap-2 self-start shadow-lg shadow-primary/20">
          <UserPlus size={20} />
          Add New Patient
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or condition..."
            className="input-field pl-12 h-12 text-sm font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button title="Filter" className="inline-flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-xl bg-white text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">
          <Filter size={18} />
          Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
            Array(6).fill(0).map((_, i) => (
                <div key={i} className="card h-48 animate-pulse bg-slate-100 border-none" />
            ))
        ) : filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <Link key={patient.id} href={`/dashboard/patients/${patient.id}`} title={patient.name} className="card p-6 hover:shadow-xl transition-all group border-slate-100 hover:border-primary/20">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-primary/5 transition-colors">
                  <User className="text-slate-400 group-hover:text-primary transition-colors" size={28} />
                </div>
                <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${patient.dental_condition.includes('[DONE]') ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-primary'}`}>
                  {patient.dental_condition.includes('[DONE]') ? 'Treated' : 'Scheduled'}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-primary transition-colors truncate">
                    {patient.name}
                </h3>
                <p className="text-slate-500 text-sm font-bold mt-1">
                    {patient.age} years • {patient.gender}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Condition</span>
                    <p className="text-xs font-bold text-slate-700 truncate max-w-[150px]">
                        {patient.dental_condition?.replace('[DONE]', '').trim() || "General Checkup"}
                    </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Visit</p>
                  <p className="text-sm font-bold text-slate-900">{patient.last_visit.split(' ')[0]}</p>
                </div>
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                  <ArrowRight size={20} />
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <Search className="text-slate-300" size={32} />
            </div>
            <p className="text-slate-500 font-bold">No patient records found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
