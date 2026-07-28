"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Patient } from "@/types";
import {
  Mic,
  MicOff,
  Save,
  ArrowLeft,
  Search,
  User,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function NotesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialName = searchParams.get('name');

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialName || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const supabase = createClientComponentClient();

  const [noteText, setNoteText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetchPatients();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (transcript) {
          setNoteText(prev => (prev + " " + transcript).trim());
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const fetchPatients = async () => {
    const { data, error } = await supabase.from('patients').select('*').order('name');
    if (data) {
      setPatients(data);
      if (initialName) {
          const match = data.find(p => p.name === initialName);
          if (match) setSelectedPatient(match);
      }
    }
    if (error) console.error("Error loading patients:", error);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (!recognitionRef.current) {
        alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
        return;
      }
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setError(null);
      } catch (e) {
        console.error("Start error:", e);
      }
    }
  };

  const filteredPatients = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return [];
    return patients.filter(p =>
      (p.name?.toLowerCase() || "").includes(query)
    );
  }, [searchQuery, patients]);

  const handleSaveNote = async () => {
    if (!selectedPatient) return setError("Please select a patient first");
    if (!noteText.trim()) return setError("Note text cannot be empty");

    setLoading(true);
    setError(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const doctorEmail = userData.user?.email || "doctor";

      const { error: insertError } = await supabase
        .from('clinical_notes')
        .insert([{
          patient_name: selectedPatient.name,
          doctor_email: doctorEmail,
          note_text: noteText.trim()
        }]);

      if (insertError) throw insertError;

      alert("Clinical note saved successfully ✅");
      router.push(`/dashboard/patients/${selectedPatient.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to save note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors group">
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-sm">Back to Dashboard</span>
      </Link>

      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Clinical SOAP Notes</h1>
        <p className="text-slate-500 mt-2 font-medium font-medium">Dictate or type clinical observations for your patients</p>
      </div>

      {/* Patient Selector */}
      <section className="card p-1 !overflow-visible">
        <div className="relative">
            <div className={`p-8 transition-all ${selectedPatient ? 'bg-slate-50/50' : 'bg-white'}`}>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4 ml-1">Assign to Patient</p>
                <div className="relative group">
                    <Search className="absolute left-5 top-5 text-slate-400 group-focus-within:text-primary transition-colors" size={24} />
                    <input
                        type="text"
                        placeholder="Search patient by name..."
                        className="w-full pl-16 pr-6 h-16 bg-white border-2 border-slate-100 rounded-2xl font-bold text-lg text-slate-900 focus:outline-none focus:border-primary transition-all shadow-sm group-hover:border-slate-200"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowDropdown(true);
                            if (selectedPatient) setSelectedPatient(null);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => {
                            setTimeout(() => setShowDropdown(false), 200);
                        }}
                    />
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
            <div className="px-8 pb-8">
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex items-center gap-4">
                    <CheckCircle2 className="text-primary" size={24} />
                    <div>
                        <p className="font-black text-slate-900 uppercase tracking-tight">{selectedPatient.name}</p>
                        <p className="text-[10px] font-black text-primary tracking-widest uppercase">Target Patient Selected</p>
                    </div>
                </div>
            </div>
        )}
      </section>

      {/* Note Editor */}
      <section className="card p-10 space-y-8">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <FileText className="text-secondary" size={24} />
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Observation Detail</h3>
            </div>
            <button
                onClick={toggleListening}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                {isListening ? "Stop Dictation" : "Start Dictation"}
            </button>
        </div>

        <div className="relative">
            <textarea
                className="w-full h-80 p-8 bg-slate-50 border-2 border-transparent focus:border-primary rounded-[40px] focus:bg-white focus:outline-none transition-all font-medium text-lg text-slate-700 leading-relaxed resize-none"
                placeholder="Start typing or click the microphone to dictate your SOAP notes here..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
            />
            {isListening && (
                <div className="absolute top-4 right-8 flex gap-1">
                    <span className="w-1.5 h-4 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-6 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-4 bg-white/50 rounded-full animate-bounce"></span>
                </div>
            )}
        </div>

        {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-3">
                <AlertCircle size={20} />
                {error}
            </div>
        )}

        <button
            onClick={handleSaveNote}
            disabled={loading}
            className="btn-primary w-full h-16 flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 text-lg"
        >
            {loading ? (
                <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Saving Clinical Note...</span>
                </>
            ) : (
                <>
                    <Save size={24} />
                    <span>Save Clinical Note</span>
                </>
            )}
        </button>
      </section>
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold text-slate-400">Loading Clinical Tools...</div>}>
      <NotesContent />
    </Suspense>
  );
}
