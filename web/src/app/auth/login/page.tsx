"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Stethoscope, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log("Attempting login for:", email);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (loginError) {
        console.error("Login Error Details:", loginError);
        throw loginError;
      }

      console.log("Login successful, session data:", data);

      if (data.session) {
        console.log("Redirecting to dashboard...");
        // Use window.location for a hard redirect if router.push is hanging
        window.location.href = "/dashboard";
      } else {
        throw new Error("No session created. Please check if your account is confirmed in Supabase.");
      }

    } catch (err: any) {
      console.error("Caught Exception:", err);
      setError(err.message || "Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <Stethoscope className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 text-center">Welcome Back</h1>
          <p className="text-slate-500 mt-2 text-center font-medium">Sign in to your doctor portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
              <input
                type="email"
                placeholder="doctor@clinic.com"
                className="input-field pl-12 h-14 font-bold text-slate-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                className="input-field pl-12 h-14 font-bold text-slate-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Link href="/auth/forgot-password" text-sm="true" className="text-sm font-bold text-primary hover:underline">
              Forgot Password?
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full h-14 flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
            disabled={loading}
          >
            {loading ? (
                <>
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                </>
            ) : (
                <>
                    <span>Login</span>
                    <ArrowRight className="w-5 h-5" />
                </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-4 text-slate-400 font-black tracking-widest">Secure Access</span>
            </div>
          </div>

          <Link
            href="/auth/otp"
            className="w-full h-14 inline-flex items-center justify-center border-2 border-slate-100 rounded-xl font-black text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all gap-3"
          >
            <Mail className="w-4 h-4" />
            Login with OTP
          </Link>

          <p className="text-slate-500 font-medium text-sm">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-primary font-black hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
