"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Stethoscope, User, Mail, Lock, Phone, ArrowLeft } from "lucide-react";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Sign up with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone: phone,
          }
        }
      });

      if (signUpError) {
        console.error("Supabase Auth Error:", signUpError);
        throw new Error(signUpError.message);
      }

      // 2. Insert into 'doctors' table (mirroring Android logic)
      const { error: dbError } = await supabase
        .from('doctors')
        .upsert([{
          name,
          email,
          specialization: "General Dentist"
        }], { onConflict: 'email' });

      if (dbError) {
        console.warn("Could not sync to doctors table:", dbError.message);
      }

      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch (err: any) {
      console.error("Caught Exception:", err);
      const userMsg = err.message || "Registration failed. This email may already be in use.";
      setError(userMsg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Check your email</h1>
          <p className="text-slate-500 mb-8">
            We've sent a verification link to <span className="font-bold text-slate-900">{email}</span>. Please verify your account to continue.
          </p>
          <p className="text-sm text-slate-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-6 group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm">Back to Login</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
          <p className="text-slate-500 mt-2">Join Smart Dental today</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Dr. Sarah Jenkins"
                className="input-field pl-12"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="email"
                placeholder="sarah@clinic.com"
                className="input-field pl-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="input-field pl-12"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                className="input-field pl-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-start gap-3 py-2">
            <input type="checkbox" id="terms" className="mt-1 w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" required />
            <label htmlFor="terms" className="text-sm text-slate-500">
              I agree to the <span className="font-bold text-primary">Terms of Service</span> and <span className="font-bold text-primary">Privacy Policy</span>
            </label>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
