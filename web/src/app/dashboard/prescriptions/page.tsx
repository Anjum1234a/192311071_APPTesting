"use client";

import { useEffect, useState, useMemo } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Patient, PrescriptionRecord } from "@/types";
import {
  Search,
  Plus,
  Trash2,
  ArrowLeft,
  Pill,
  CheckCircle2,
  AlertCircle,
  User,
  ChevronDown
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PrescriptionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialName = searchParams.get('name');
  const supabase = createClientComponentClient();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialName || "");
  const [showDropdown, setShowDropdown] = useState(false);

  const [medications, setMedications] = useState<{ name: string, dosage: string }[]>([
    { name: "Amoxicillin 500mg", dosage: "1 capsule every 8 hours for 7 days" },
    { name: "Ibuprofen 400mg", dosage: "1 tablet every 6 hours as needed for pain" }
  ]);

  const [newMed, setNewMed] = useState({ name: "", dosage: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const { data, error } = await supabase.from('patients').select('*').order('name');
    if (error) {
        console.error("Error fetching patients for prescription:", error.message);
    }
    if (data) {
      console.log("Prescription search loaded", data.length, "patients");
      setPatients(data);
      if (initialName) {
        const p = data.find(p => p.name === initialName);
        if (p) setSelectedPatient(p);
      }
    }
  };

  const filteredPatients = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return [];
    return patients.filter(p => (p.name?.toLowerCase() || "").includes(query));
  }, [searchQuery, patients]);

  const addMedication = () => {
    if (!newMed.name || !newMed.dosage) return;
    setMedications([...medications, { ...newMed }]);
    setNewMed({ name: "", dosage: "" });
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!selectedPatient) return alert("Please select a patient first");
    if (medications.length === 0) return alert("Please add at least one medication");

    setLoading(true);
    const doctorEmail = (await supabase.auth.getUser()).data.user?.email || "doctor";
    const medicationsText = medications.map(m => `${m.name} | ${m.dosage}`).join("\n");

    try {
      const { error } = await supabase
        .from('prescriptions')
        .insert([{
          patient_name: selectedPatient.name,
          doctor_email: doctorEmail,
          medications: medicationsText
        }]);

      if (error) throw error;

      alert("Prescription issued successfully ✅");
      router.push(`/dashboard/patients/${selectedPatient.id}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors group">
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-sm">Back to Dashboard</span>
      </Link>

      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Digital Prescription</h1>
        <p className="text-slate-500 mt-2 font-medium font-medium">Issue and manage patient medications securely</p>
      </div>

      {/* Patient Search Section */}
      <section className="card p-1 !overflow-visible">
        <div className="relative">
            <div className={`p-8 transition-all ${selectedPatient ? 'bg-slate-50/50' : 'bg-white'}`}>
                <div className="relative group p-1 bg-gradient-to-r from-primary to-primary-variant rounded-[20px]">
                    <div className="bg-white rounded-[18px] p-6">
                        <div className="relative">
                            <Search className="absolute left-5 top-5 text-slate-400 group-focus-within:text-primary transition-colors" size={24} />
                            <input
                                type="text"
                                placeholder="Search patient record by name..."
                                className="w-full pl-16 pr-6 h-16 bg-white border-2 border-slate-100 rounded-2xl font-bold text-lg text-slate-900 focus:outline-none focus:border-primary transition-all shadow-sm group-hover:border-slate-200"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowDropdown(true);
                                    if (selectedPatient) setSelectedPatient(null);
                                }}
                                onFocus={() => setShowDropdown(true)}
                                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {showDropdown && searchQuery.trim().length > 0 && (
                <div className="absolute top-[calc(100%-20px)] left-8 right-8 z-[100] bg-white border-2 border-slate-100 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                    {filteredPatients.length > 0 ? filteredPatients.map(p => (
                        <button
                            key={p.id}
                            className="w-full p-6 flex items-center gap-5 hover:bg-primary/5 text-left border-b border-slate-50 last:border-none transition-colors"
                            onClick={() => {
                                setSelectedPatient(p);
                                setSearchQuery(p.name);
                                setShowDropdown(false);
                            }}
                        >
                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                <User size={24} />
                            </div>
                            <div>
                                <p className="font-black text-slate-900">{p.name}</p>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{p.age} yrs • {p.gender}</p>
                            </div>
                        </button>
                    )) : (
                        <div className="p-10 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest bg-slate-50/50">
                            No matching patient records
                        </div>
                    )}
                </div>
            )}
        </div>

        {selectedPatient && (
            <div className="px-8 pb-8 pt-2">
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="font-black text-slate-900 text-lg uppercase tracking-tight">{selectedPatient.name}</p>
                            <p className="text-xs font-bold text-primary tracking-widest uppercase">Verified Patient Record</p>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </section>

      {/* Medication Builder */}
      <section className="card p-10 space-y-10">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-secondary">
                    <Pill size={20} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Medications List</h3>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{medications.length} ITEMS</span>
        </div>

        <div className="space-y-4">
          {medications.map((med, index) => (
            <div key={index} className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100 group">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm font-black text-slate-400 text-sm">{index + 1}</div>
              <div className="flex-1">
                <p className="font-black text-slate-900 uppercase text-xs tracking-widest mb-1">{med.name}</p>
                <p className="text-slate-600 font-bold leading-relaxed">{med.dosage}</p>
              </div>
              <button
                onClick={() => removeMedication(index)}
                className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-100 shadow-sm"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-slate-50 p-8 rounded-[32px] border-2 border-dashed border-slate-200 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Drug Name</label>
                    <input
                        type="text"
                        placeholder="e.g. Paracetamol 500mg"
                        className="input-field h-14 font-bold border-2 border-transparent focus:border-primary transition-all"
                        value={newMed.name}
                        onChange={(e) => setNewMed({...newMed, name: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dosage Instructions</label>
                    <input
                        type="text"
                        placeholder="e.g. 1 tab as needed"
                        className="input-field h-14 font-bold border-2 border-transparent focus:border-primary transition-all"
                        value={newMed.dosage}
                        onChange={(e) => setNewMed({...newMed, dosage: e.target.value})}
                    />
                </div>
            </div>
            <button
                onClick={addMedication}
                className="w-full h-14 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white hover:border-primary hover:text-primary transition-all shadow-sm"
            >
                <Plus size={20} />
                Add to List
            </button>
        </div>

        <div className="pt-6">
            <button
                onClick={handleSave}
                disabled={loading}
                className="btn-primary w-full h-16 flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 text-lg"
            >
                {loading ? "Issuing Digital Record..." : (
                    <>
                        <CheckCircle2 size={24} />
                        <span>Sign and Issue Prescription</span>
                    </>
                )}
            </button>
        </div>
      </section>
    </div>
  );
}
