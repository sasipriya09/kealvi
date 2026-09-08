"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCurrentUser, logoutUser, UserProfile } from "@/lib/auth";

export default function Navbar() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setUser(getCurrentUser());

    const handleAuthChange = () => {
      setUser(getCurrentUser());
    };

    window.addEventListener("kealvi_auth_change", handleAuthChange);
    return () => {
      window.removeEventListener("kealvi_auth_change", handleAuthChange);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-purple-500/20 bg-[#070913]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 font-extrabold text-slate-950 shadow-[0_0_15px_rgba(139,92,246,0.4)] font-[family-name:var(--font-heading)] transition-transform group-hover:scale-105">
              K
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-sm font-[family-name:var(--font-heading)] bg-gradient-to-r from-white via-purple-100 to-cyan-300 bg-clip-text text-transparent">
                  KEALVI
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-950/80 px-2 py-0.5 text-[9px] font-bold text-purple-300 border border-purple-500/30 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                  Q&amp;A
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block tracking-wide font-medium">NovaGlow Student Hub</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-bold font-[family-name:var(--font-heading)]">
            <Link
              href="/"
              className={`rounded-xl px-3.5 py-1.5 transition-all ${
                pathname === "/"
                  ? "bg-purple-950/60 text-purple-300 border border-purple-500/40 shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              📊 Dashboard
            </Link>
            <Link
              href="/live"
              className={`rounded-xl px-3.5 py-1.5 transition-all ${
                pathname === "/live"
                  ? "bg-purple-950/60 text-purple-300 border border-purple-500/40 shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              💬 Q&amp;A Room
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Nav Links */}
          <div className="flex md:hidden items-center gap-1 text-[11px] font-bold font-[family-name:var(--font-heading)]">
            <Link
              href="/"
              className={`px-2 py-1 rounded ${pathname === "/" ? "text-purple-300" : "text-slate-400"}`}
            >
              Dashboard
            </Link>
            <Link
              href="/live"
              className={`px-2 py-1 rounded ${pathname === "/live" ? "text-purple-300" : "text-slate-400"}`}
            >
              Q&amp;A Room
            </Link>
          </div>

          {user ? (
            <div className="flex items-center gap-3 bg-[#0e1126] border border-purple-500/20 rounded-xl px-3.5 py-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center font-bold text-xs text-slate-950 shadow-xs">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    {user.name}
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-purple-950/80 text-purple-300 border border-purple-500/40">
                      Student
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    {user.email}
                  </div>
                </div>
              </div>

              <button
                onClick={() => logoutUser()}
                className="text-xs text-slate-400 hover:text-red-400 transition-colors ml-1 font-medium"
                title="Log out"
              >
                Exit
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-4 py-2 text-xs font-bold text-white transition-all hover:scale-105 shadow-[0_0_15px_rgba(139,92,246,0.3)] font-[family-name:var(--font-heading)]"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
