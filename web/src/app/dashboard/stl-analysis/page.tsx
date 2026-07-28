"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import DentalComparison from "@/components/DentalComparison";

export default function StlAnalysisPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientName, setSelectedPatientName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchPatients() {
      try {
        const { data, error } = await supabase
          .from("patients")
          .select("id, name")
          .order("name", { ascending: true });
        
        if (data) {
          setPatients(data);
          if (data.length > 0) {
            setSelectedPatientName(data[0].name);
          }
        }
      } catch (e) {
        console.error("Failed to load patients:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchPatients();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors group">
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-sm">Back to Command Center</span>
      </Link>

      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">AI Treatment Scan &amp; Photo Analysis</h1>
        <p className="text-slate-500 mt-2 font-medium">Compare 3D STL meshes or 2D dental photographs with real-time AI validation</p>
      </div>

      <div className="card p-6 bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <User size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Patient Profile</p>
            <p className="font-bold text-slate-800 text-sm">Select patient to record comparison results</p>
          </div>
        </div>
        
        {loading ? (
          <div className="text-xs font-bold text-slate-400">Loading patients...</div>
        ) : (
          <select 
            value={selectedPatientName}
            onChange={(e) => setSelectedPatientName(e.target.value)}
            className="input-field max-w-xs font-bold text-sm text-slate-700 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
          >
            {patients.map(p => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
            {patients.length === 0 && <option value="">No patients found</option>}
          </select>
        )}
      </div>

      {selectedPatientName && (
        <DentalComparison patientName={selectedPatientName} />
      )}
    </div>
  );
}
