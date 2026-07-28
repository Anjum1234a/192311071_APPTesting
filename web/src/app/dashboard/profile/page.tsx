"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Doctor } from "@/types";
import { ArrowLeft, User, Mail, Shield, BadgeCheck, Camera, Edit2 } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('doctors')
        .select('*')
        .eq('email', user.email)
        .single();
      if (data) setDoctor(data);
    }
    setLoading(false);
  };

  if (loading) return <div className="p-10 text-center font-bold text-slate-400">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors group">
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-sm">Back to Dashboard</span>
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Doctor Profile</h1>
        <button className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-2xl font-bold text-sm hover:bg-primary/20 transition-all">
          <Edit2 size={18} />
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
            <div className="card p-10 flex flex-col items-center text-center">
                <div className="relative group">
                    <div className="w-32 h-32 bg-slate-100 rounded-[40px] flex items-center justify-center border-4 border-slate-50 shadow-inner overflow-hidden">
                        <User className="text-slate-300" size={64} />
                    </div>
                    <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform border-2 border-white">
                        <Camera size={18} />
                    </button>
                </div>
                <h3 className="mt-8 text-2xl font-black text-slate-900">{doctor?.name}</h3>
                <p className="text-sm font-black text-primary uppercase tracking-widest mt-2">{doctor?.specialization}</p>
                <div className="mt-8 pt-8 border-t border-slate-50 w-full flex justify-center gap-10">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience</p>
                        <p className="font-black text-slate-900 mt-1">12 Years</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Treated</p>
                        <p className="font-black text-slate-900 mt-1">4.8k+</p>
                    </div>
                </div>
            </div>

            <div className="card p-8 bg-slate-900 text-white border-none shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <Shield className="text-primary" size={20} />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Security</h3>
                </div>
                <div className="space-y-4">
                    <p className="text-xs text-slate-400 font-bold leading-relaxed">Your account is secured with end-to-end encryption for all patient clinical records.</p>
                    <button className="text-sm font-black text-primary hover:underline">Change Password</button>
                </div>
            </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
            <div className="card p-10 space-y-10">
                <div>
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <User size={12} className="text-primary" /> Full Name
                            </label>
                            <p className="text-lg font-black text-slate-900 bg-slate-50 p-4 rounded-2xl border border-slate-100">{doctor?.name}</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Mail size={12} className="text-primary" /> Registered Email
                            </label>
                            <p className="text-lg font-black text-slate-900 bg-slate-50 p-4 rounded-2xl border border-slate-100 truncate">{doctor?.email}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Clinic Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <BadgeCheck size={12} className="text-secondary" /> Clinic Identifier
                            </label>
                            <p className="text-lg font-black text-slate-900 bg-slate-50 p-4 rounded-2xl border border-slate-100">CLIN-DXB-092</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Shield size={12} className="text-secondary" /> License Status
                            </label>
                            <p className="text-lg font-black text-green-600 bg-green-50 p-4 rounded-2xl border border-green-100 uppercase tracking-widest text-xs">Active & Verified</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
