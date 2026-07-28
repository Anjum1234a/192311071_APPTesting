"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Send } from "lucide-react";

export default function OtpPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) throw error;

      // Navigate to verification page
      router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      if (err.message.includes("rate limit")) {
        setError("Email rate limit exceeded (3 per hour). Please try again in 1 hour.");
      } else {
        setError(err.message || "Failed to send code");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-6 group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm">Back to Login</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">OTP Verification</h1>
          <p className="text-slate-500 mt-2 font-medium text-sm">
            Enter your email to receive a 6-digit verification code.
          </p>
        </div>

        <form onSubmit={handleSendOtp} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
              <input
                type="email"
                placeholder="doctor@clinic.com"
                className="input-field pl-12 h-14 font-bold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 leading-relaxed">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full h-14 flex items-center justify-center gap-3" disabled={loading}>
            {loading ? "Sending..." : (
                <>
                    <Send size={20} />
                    <span>Send Verification Code</span>
                </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
