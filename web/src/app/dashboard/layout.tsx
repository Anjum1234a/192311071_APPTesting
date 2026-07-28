"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Calendar,
  User as UserIcon,
  LogOut,
  Stethoscope,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Patients", href: "/dashboard/patients", icon: Users },
  { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { name: "Profile", href: "/dashboard/profile", icon: UserIcon },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
      } else {
        setUser(session.user);
      }
    };
    checkUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (!user) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Stethoscope className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">Smart Dental</span>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl transition-all group",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-4">
                  <item.icon className="w-5 h-5" />
                  <span className="font-bold">{item.name}</span>
                </div>
                <ChevronRight className={cn(
                  "w-4 h-4 transition-transform",
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1"
                )} />
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-4 w-full p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Stethoscope className="text-primary w-6 h-6" />
           <span className="font-bold text-lg">Smart Dental</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-slate-100 rounded-lg">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Mobile Sidebar Content */}
      <aside className={cn(
        "lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-white z-50 transform transition-transform duration-300 border-r border-slate-200",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <span className="font-bold text-xl">Smart Dental</span>
          <button onClick={() => setIsSidebarOpen(false)}><X className="w-6 h-6 text-slate-400" /></button>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl font-bold transition-all",
                pathname === item.href ? "bg-primary text-white" : "text-slate-500"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-4 w-full p-4 rounded-xl text-red-500 font-bold mt-4"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 lg:p-10 p-4 pt-24 lg:pt-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
