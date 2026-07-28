"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Patient } from "@/types";
import { ArrowLeft, FileUp, CheckCircle2, Search, User, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UploadReportPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentUploads, setRecentUploads] = useState<any[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPatients();
    fetchRecentUploads();
  }, []);

  const fetchPatients = async () => {
    const { data } = await supabase.from('patients').select('*').order('name');
    if (data) setPatients(data);
  };

  const fetchRecentUploads = async () => {
    const { data } = await supabase
        .from('patient_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
    if (data) setRecentUploads(data);
  };

  const filteredPatients = patients.filter(p =>
    (p.name?.toLowerCase() || "").includes(searchQuery.toLowerCase().trim())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError(null);

      if (selectedFile.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(selectedFile));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedPatient) return setError("Please select a patient first");
    if (!file) return setError("Please select a file to upload");

    setUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `report_${Date.now()}_${selectedPatient.name.replace(/\s+/g, '_')}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('reports')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('reports')
        .getPublicUrl(filePath);

      // 3. Save to database
      const { error: dbError } = await supabase
        .from('patient_reports')
        .insert([{
          patient_name: selectedPatient.name,
          file_name: file.name,
          file_path: publicUrl
        }]);

      if (dbError) throw dbError;

      alert("Report successfully uploaded and saved ✅");
      setFile(null);
      setPreviewUrl(null);
      setSearchQuery("");
      setSelectedPatient(null);
      fetchRecentUploads();
    } catch (err: any) {
      setError(err.message || "Failed to upload report. Ensure 'reports' bucket exists in Supabase.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors group">
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-sm">Back to Dashboard</span>
      </Link>

      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Upload Clinical Reports</h1>
        <p className="text-slate-500 mt-2 font-medium">Add X-rays, PDFs, or scans to patient records</p>
      </div>

      {/* Patient Selector */}
      <section className="card p-1">
        <div className="relative p-8">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4 ml-1">Assign to Patient</p>
            <div className="relative group">
                <Search className="absolute left-5 top-5 text-slate-400" size={24} />
                <input
                    type="text"
                    placeholder="Search patient by name..."
                    className="w-full pl-16 pr-6 h-16 bg-white border-2 border-slate-100 rounded-2xl font-bold text-lg text-slate-900 focus:outline-none focus:border-primary transition-all"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowDropdown(true);
                        if (selectedPatient) setSelectedPatient(null);
                    }}
                    onFocus={() => setShowDropdown(true)}
                />
            </div>

            {showDropdown && searchQuery && filteredPatients.length > 0 && (
                <div className="absolute top-full left-8 right-8 z-50 bg-white border-2 border-slate-100 rounded-3xl mt-2 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                    {filteredPatients.map(p => (
                        <button
                            key={p.id}
                            className="w-full p-6 flex items-center gap-5 hover:bg-primary/5 text-left border-b border-slate-50 last:border-none"
                            onClick={() => {
                                setSelectedPatient(p);
                                setSearchQuery(p.name);
                                setShowDropdown(false);
                            }}
                        >
                            <User className="text-slate-400" size={24} />
                            <div>
                                <p className="font-black text-slate-900">{p.name}</p>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{p.age} yrs • {p.gender}</p>
                            </div>
                        </button>
                    ))}
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

      {/* File Upload Section */}
      <section className="card p-10 space-y-10">
        <div className="flex items-center gap-3">
            <FileUp className="text-secondary" size={24} />
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Select Clinical Document</h3>
        </div>

        <div className="relative group">
            <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleFileChange}
                accept=".pdf,image/*"
            />
            <div className={`p-16 border-4 border-dashed rounded-[40px] text-center transition-all ${file ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'}`}>
                {previewUrl ? (
                  <div className="mb-6 relative w-48 h-48 mx-auto">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-3xl shadow-lg border-4 border-white" />
                  </div>
                ) : (
                  <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 transition-colors ${file ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white text-slate-300 shadow-sm'}`}>
                      <FileUp size={36} />
                  </div>
                )}
                <h4 className="text-xl font-black text-slate-900 mb-2">
                    {file ? file.name : "Drag & drop or click to upload"}
                </h4>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : "Supports PDF, JPEG, PNG"}
                </p>
            </div>
        </div>

        {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-3 leading-relaxed">
                <AlertCircle className="shrink-0" size={20} />
                {error}
            </div>
        )}

        <button
            onClick={handleUpload}
            disabled={uploading || !file || !selectedPatient}
            className="btn-primary w-full h-16 flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 text-lg"
        >
            {uploading ? (
                <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Uploading Clinical Report...</span>
                </>
            ) : (
                <>
                    <CheckCircle2 size={24} />
                    <span>Upload to Patient Record</span>
                </>
            )}
        </button>
      </section>

      {recentUploads.length > 0 && (
          <section className="card p-10">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Recently Uploaded</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentUploads.map(r => (
                      <a key={r.id} href={r.file_path} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary transition-all">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400"><FileUp size={20} /></div>
                          <div className="truncate">
                              <p className="font-bold text-slate-900 text-sm truncate">{r.file_name}</p>
                              <p className="text-[10px] font-black text-primary uppercase tracking-widest">{r.patient_name}</p>
                          </div>
                      </a>
                  ))}
              </div>
          </section>
      )}
    </div>
  );
}
