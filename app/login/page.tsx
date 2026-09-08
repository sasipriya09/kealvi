"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { setCurrentUser, UserRole, UserProfile } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role] = useState<UserRole>("student");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      setError("Please fill in all required fields.");
      return;
    }

    const user: UserProfile = {
      id: "user_" + Date.now(),
      name: name || email.split("@")[0] || "Student Participant",
      email,
      role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || email)}`,
    };

    setCurrentUser(user);
    router.push("/");
  };

  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center p-4">
      <div className="relative w-full max-w-md space-y-6 rounded-2xl border border-purple-500/30 bg-[#0e1126]/95 p-6 shadow-[0_0_50px_rgba(139,92,246,0.15)] backdrop-blur-xl sm:p-8">
        {/* NovaGlow ambient light */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/15 blur-2xl" />

        <div className="text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 font-extrabold text-slate-950 text-lg shadow-[0_0_15px_rgba(139,92,246,0.4)] font-[family-name:var(--font-heading)]">
            K
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white font-[family-name:var(--font-heading)]">
            {isSignUp ? "Create Student Account" : "Access Q&A Room"}
          </h2>
          <p className="mt-1.5 text-xs text-slate-400">
            {isSignUp
              ? "Register your student profile to post questions and save progress"
              : "Enter your email and password to access student discussions"}
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-950/60 p-3 text-xs text-red-300 border border-red-500/40 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Student Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full rounded-xl border border-purple-500/20 bg-[#070913] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-purple-400 focus:shadow-[0_0_15px_rgba(139,92,246,0.2)]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex.r@student.edu"
              className="w-full rounded-xl border border-purple-500/20 bg-[#070913] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-purple-400 focus:shadow-[0_0_15px_rgba(139,92,246,0.2)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-purple-500/20 bg-[#070913] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-purple-400 focus:shadow-[0_0_15px_rgba(139,92,246,0.2)]"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 py-2.5 text-sm font-bold text-white transition-all hover:scale-[1.01] shadow-[0_0_20px_rgba(139,92,246,0.35)] active:scale-98 font-[family-name:var(--font-heading)]"
          >
            {isSignUp ? "Create Student Profile" : "Continue to Room"}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 border-t border-purple-500/20 pt-4">
          {isSignUp ? "Already registered?" : "Don't have an account?"}{" "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="font-bold text-purple-400 hover:underline"
          >
            {isSignUp ? "Sign In" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
