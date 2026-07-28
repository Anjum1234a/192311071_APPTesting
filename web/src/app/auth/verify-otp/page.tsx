"use client";

import { useState, useEffect, Suspense } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "magiclink", // This matches the "Login with OTP" type in Supabase
      });

      if (error) throw error;

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <Link href="/auth/otp" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-6 group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm">Back</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Verify Code</h1>
          <p className="text-slate-500 mt-2 font-medium text-sm">
            Enter the 6-digit code sent to <span className="text-slate-900 font-bold">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 text-center">6-Digit Code</label>
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 h-20 text-center text-4xl font-black tracking-[0.5em] text-primary focus:outline-none focus:border-primary focus:bg-white transition-all"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 text-center">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full h-16 text-lg" disabled={loading}>
            {loading ? "Verifying..." : "Verify and Login"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-bold text-slate-400">
          Didn't receive a code?{" "}
          <button onClick={() => router.back()} className="text-primary hover:underline">
            Try again
          </button>
        </p>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-slate-400 uppercase tracking-widest">Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
