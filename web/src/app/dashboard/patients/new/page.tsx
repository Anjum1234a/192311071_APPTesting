"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, User, Calendar, Info, Phone } from "lucide-react";
import Link from "next/link";

export default function NewPatientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "Male",
    appointmentTime: "",
    allergies: "",
    systemicConditions: "",
    emergencyContact: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    const apptTime = formData.appointmentTime || new Date().toISOString().slice(0, 10);

    try {
      const { error } = await supabase
        .from('patients')
        .insert([{
          name: fullName,
          age: parseInt(formData.age) || 0,
          gender: formData.gender,
          last_visit: apptTime,
          dental_condition: `Registered for ${apptTime}`,
          allergies: formData.allergies || "None",
          systemic_conditions: formData.systemicConditions || "Healthy",
          emergency_contact: formData.emergencyContact || "Not provided",
          qr_code: `CLINIDENT-PT-${Date.now()}`
        }]);

      if (error) throw error;

      router.push("/dashboard/patients");
    } catch (err: any) {
      alert(err.message || "Failed to save patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/dashboard/patients" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-8 group">
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-sm">Back to Records</span>
      </Link>

      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">New Patient Registration</h1>
        <p className="text-slate-500 mt-2 font-medium">Add a new patient to your digital clinic records</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="card p-8 space-y-8 border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-50">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-primary">
              <User size={20} />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-wider text-sm">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
              <input
                type="text"
                placeholder="e.g. John"
                className="input-field h-14 font-bold text-slate-700"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
              <input
                type="text"
                placeholder="e.g. Doe"
                className="input-field h-14 font-bold text-slate-700"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Age</label>
              <input
                type="number"
                placeholder="e.g. 25"
                className="input-field h-14 font-bold text-slate-700"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                required
              />
            </div>
                <div className="space-y-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
              <select
                className="input-field h-14 font-bold text-slate-700 appearance-none bg-slate-50 border-transparent focus:bg-white"
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Allergies</label>
              <input
                type="text"
                placeholder="e.g. Penicillin"
                className="input-field h-14 font-bold text-slate-700"
                value={formData.allergies}
                onChange={(e) => setFormData({...formData, allergies: e.target.value})}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Medical Conditions</label>
              <input
                type="text"
                placeholder="e.g. Hypertension, Diabetes"
                className="input-field h-14 font-bold text-slate-700"
                value={formData.systemicConditions}
                onChange={(e) => setFormData({...formData, systemicConditions: e.target.value})}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Emergency Contact</label>
              <input
                type="text"
                placeholder="+1 555 0123"
                className="input-field h-14 font-bold text-slate-700"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="card p-8 space-y-8 border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-50">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-secondary">
              <Calendar size={20} />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-wider text-sm">Schedule Appointment</h2>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Appointment Schedule</label>
            <div className="relative group p-1 bg-gradient-to-r from-teal-400 to-primary rounded-2xl">
              <div className="bg-white rounded-[14px] relative">
                <Calendar className="absolute left-5 top-5 text-primary" size={24} />
                <input
                    type="datetime-local"
                    className="w-full pl-16 pr-6 h-16 bg-transparent border-none rounded-2xl font-black text-lg text-primary focus:outline-none transition-all cursor-pointer"
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({...formData, appointmentTime: e.target.value})}
                    required
                />
              </div>
            </div>
            <p className="text-xs text-slate-400 font-bold ml-1">Tap to select the date and time for the first examination</p>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-4 text-slate-500 font-black uppercase tracking-widest text-sm hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-12 h-14 flex items-center gap-3 shadow-xl shadow-primary/20"
          >
            {loading ? "Saving..." : (
                <>
                    <Save size={20} />
                    <span>Save Patient Record</span>
                </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
