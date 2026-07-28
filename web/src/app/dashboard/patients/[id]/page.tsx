"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Patient, ClinicalNote, PrescriptionRecord } from "@/types";
import {
  ArrowLeft,
  User,
  Clock,
  Stethoscope,
  CheckCircle2,
  FileText,
  Plus,
  AlertCircle,
  Phone,
  FileUp,
  Pill,
  Trash2,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import DentalComparison from "@/components/DentalComparison";

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingHistory, setIsEditingHistory] = useState(false);
  const [editHistory, setEditHistory] = useState({ allergies: "", systemic_conditions: "", emergency_contact: "" });
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPatientData();
  }, [params.id]);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const { data: p, error: pError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', params.id)
        .single();

      if (p) {
        setPatient(p);
        setEditHistory({
          allergies: p.allergies || "",
          systemic_conditions: p.systemic_conditions || "",
          emergency_contact: p.emergency_contact || ""
        });

        // Fetch notes using patient_name
        const { data: n } = await supabase
          .from('clinical_notes')
          .select('*')
          .eq('patient_name', p.name)
          .order('created_at', { ascending: false });
        if (n) setNotes(n);

        // Fetch prescriptions using patient_name
        const { data: pr } = await supabase
          .from('prescriptions')
          .select('*')
          .eq('patient_name', p.name)
          .order('created_at', { ascending: false });
        if (pr) setPrescriptions(pr);

        // Fetch reports using patient_name
        const { data: rep } = await supabase
          .from('patient_reports')
          .select('*')
          .eq('patient_name', p.name)
          .order('created_at', { ascending: false });
        if (rep) setReports(rep);
      }
    } catch (err) {
      console.error("Error fetching patient data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateHistory = async () => {
    if (!patient) return;
    const { error } = await supabase
      .from('patients')
      .update({
          allergies: editHistory.allergies,
          systemic_conditions: editHistory.systemic_conditions,
          emergency_contact: editHistory.emergency_contact
      })
      .eq('id', patient.id);

    if (!error) {
      setIsEditingHistory(false);
      fetchPatientData();
    } else {
      alert("Update failed: " + error.message);
    }
  };

  const markAsDone = async () => {
    if (!patient) return;
    const currentCondition = patient.dental_condition || "";
    const updatedCondition = currentCondition.includes("[DONE]")
        ? currentCondition
        : `${currentCondition} [DONE]`.trim();

    const { error } = await supabase
        .from('patients')
        .update({ dental_condition: updatedCondition })
        .eq('id', patient.id);

    if (!error) {
        alert("Patient status updated to Done ✅");
        fetchPatientData();
    }
  };

  const deletePatient = async () => {
    if (!confirm("Are you sure you want to delete this record permanently?")) return;
    const { error } = await supabase.from('patients').delete().eq('id', params.id);
    if (!error) router.push("/dashboard/patients");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Synchronizing clinical data...</div>;
  if (!patient) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">Record not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/patients" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm">Back to List</span>
        </Link>
        <button onClick={deletePatient} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
          <Trash2 size={22} />
        </button>
      </div>

      {/* Header Profile Card */}
      <div className="card p-10 flex flex-col md:flex-row items-center gap-10 bg-white relative">
        <div className="w-32 h-32 bg-slate-100 rounded-[40px] flex items-center justify-center border-4 border-slate-50 shadow-inner">
          <User className="text-slate-300" size={64} />
        </div>
        <div className="text-center md:text-left flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{patient.name}</h1>
            <span className={`self-center md:self-auto px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest ${patient.dental_condition.includes('[DONE]') ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'}`}>
                {patient.dental_condition.includes('[DONE]') ? 'Patient Done ✓' : 'In Progress'}
            </span>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
             <span className="bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-100 text-sm font-bold text-slate-600">{patient.age} years old</span>
             <span className="bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-100 text-sm font-bold text-slate-600 uppercase tracking-wide">{patient.gender}</span>
             <span className="bg-blue-50 px-4 py-1.5 rounded-xl border border-blue-100 text-sm font-black text-primary uppercase tracking-widest">ID: PT-00{patient.id}</span>
          </div>
        </div>
        {!patient.dental_condition.includes('[DONE]') && (
          <button onClick={markAsDone} className="btn-primary flex items-center gap-2 shadow-xl shadow-primary/20 scale-105">
            <CheckCircle2 size={20} />
            Complete Visit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-1 space-y-8">
          <section className="card p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-400" size={20} />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Medical Alerts</h3>
              </div>
              <button
                onClick={() => setIsEditingHistory(!isEditingHistory)}
                className="text-xs font-bold text-primary hover:underline"
              >
                {isEditingHistory ? "Cancel" : "Edit"}
              </button>
            </div>

            {isEditingHistory ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Allergies</label>
                  <input
                    className="input-field py-2 text-sm"
                    value={editHistory.allergies}
                    onChange={(e) => setEditHistory({...editHistory, allergies: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conditions</label>
                  <input
                    className="input-field py-2 text-sm"
                    value={editHistory.systemic_conditions}
                    onChange={(e) => setEditHistory({...editHistory, systemic_conditions: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emergency</label>
                  <input
                    className="input-field py-2 text-sm"
                    value={editHistory.emergency_contact}
                    onChange={(e) => setEditHistory({...editHistory, emergency_contact: e.target.value})}
                  />
                </div>
                <button
                  onClick={handleUpdateHistory}
                  className="btn-primary w-full py-2 text-xs"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Known Allergies</p>
                  <p className="font-bold text-slate-900 bg-red-50/50 p-3 rounded-xl border border-red-100/50">{patient.allergies || "None reported"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Systemic Conditions</p>
                  <p className="font-bold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100">{patient.systemic_conditions || "Healthy"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Emergency Contact</p>
                  <p className="font-bold text-slate-900 flex items-center gap-2">
                      <Phone size={14} className="text-primary" />
                      {patient.emergency_contact || "Not provided"}
                  </p>
                </div>
              </div>
            )}
          </section>

          <section className="card p-8 bg-slate-900 text-white border-none shadow-xl shadow-slate-200">
             <div className="flex items-center gap-3 mb-6">
                <Clock className="text-primary" size={20} />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Visit History</h3>
             </div>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Last Examination</p>
             <p className="text-xl font-black">
                {patient.last_visit.includes('T')
                    ? format(new Date(patient.last_visit), "MMM dd, yyyy")
                    : patient.last_visit.split(' ')[0]}
             </p>
             <p className="text-slate-400 text-xs font-bold mt-1">
                Visit Time: {patient.last_visit.includes('T')
                    ? format(new Date(patient.last_visit), "hh:mm a")
                    : (patient.last_visit.split(' ')[1] || "—")}
             </p>

             <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Initial Condition</p>
                <p className="text-sm font-medium leading-relaxed">{patient.dental_condition.replace('[DONE]', '')}</p>
             </div>
          </section>
        </div>

        {/* Right Column: Actions & History */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
                onClick={() => router.push(`/dashboard/reports/upload?name=${patient.name}`)}
                className="card p-6 flex items-center gap-5 hover:bg-slate-50 transition-all border-slate-100 group"
            >
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <FileUp size={24} />
                </div>
                <div className="text-left">
                    <p className="font-black text-slate-900 uppercase text-[11px] tracking-widest">Reports</p>
                    <p className="text-sm font-bold text-slate-500">Upload PDF/X-ray</p>
                </div>
            </button>
            <button
                onClick={() => router.push(`/dashboard/prescriptions?name=${patient.name}`)}
                className="card p-6 flex items-center gap-5 hover:bg-slate-50 transition-all border-slate-100 group"
            >
                <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                    <Pill size={24} />
                </div>
                <div className="text-left">
                    <p className="font-black text-slate-900 uppercase text-[11px] tracking-widest">Pharmacy</p>
                    <p className="text-sm font-bold text-slate-500">New Prescription</p>
                </div>
            </button>
          </div>

          <section className="card p-8">
             <div className="flex items-center gap-3 mb-10">
                <FileUp className="text-primary" size={24} />
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Patient Reports</h3>
             </div>
             <div className="space-y-4">
                {reports.length > 0 ? reports.map((r) => (
                    <a
                      key={r.id}
                      href={r.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/30 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                <FileText size={20} className="text-slate-400 group-hover:text-primary transition-colors" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900">{r.file_name}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Uploaded {format(new Date(r.created_at!), "MMM dd, yyyy")}</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </a>
                )) : (
                    <p className="text-slate-400 text-center py-6 font-bold uppercase text-[10px] tracking-widest">No reports uploaded yet</p>
                )}
             </div>
          </section>

          <section className="card p-8">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                    <FileText className="text-primary" size={24} />
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Clinical SOAP Notes</h3>
                </div>
                <button
                    onClick={() => router.push(`/dashboard/notes?name=${patient.name}`)}
                    className="inline-flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-primary/10 hover:text-primary transition-all"
                >
                    <Plus size={16} /> Add Note
                </button>
            </div>

            <div className="space-y-6">
                {notes.length > 0 ? notes.map((note) => (
                    <div key={note.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{format(new Date(note.created_at!), "MMM dd, yyyy")}</span>
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Clinical Observation</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed font-medium">{note.note_text}</p>
                    </div>
                )) : (
                    <div className="py-12 text-center text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-[40px]">
                        No clinical notes recorded for this patient yet
                    </div>
                )}
            </div>
          </section>

          <section className="card p-8">
             <div className="flex items-center gap-3 mb-10">
                <Stethoscope className="text-secondary" size={24} />
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Active Medications</h3>
             </div>
             <div className="space-y-4">
                {prescriptions.length > 0 ? prescriptions.map((p) => (
                    <div key={p.id} className="flex items-start gap-4 p-5 rounded-2xl bg-teal-50/30 border border-teal-100/50">
                        <div className="mt-1"><Pill size={18} className="text-secondary" /></div>
                        <div>
                            <p className="text-sm font-black text-slate-900 leading-snug whitespace-pre-wrap">{p.medications.replace(/\|/g, '\n')}</p>
                            <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mt-2">Issued on {format(new Date(p.created_at!), "MMM dd")}</p>
                        </div>
                    </div>
                )) : (
                    <p className="text-slate-400 text-center py-6 font-bold uppercase text-[10px] tracking-widest">No active prescriptions</p>
                )}
             </div>
          </section>

          <DentalComparison patientName={patient.name} />
        </div>
      </div>
    </div>
  );
}
