import React from 'react';
import {
  Search,
  Bell,
  Calendar,
  Users,
  DollarSign,
  FileText,
  Mic,
  Clock,
  ChevronRight,
  Activity } from
'lucide-react';
import { useNav } from '../navigation/NavContext';
const stop = (e: React.MouseEvent) => e.stopPropagation();
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area } from
'recharts';
const revenueData = [
{
  name: 'Mon',
  value: 1200
},
{
  name: 'Tue',
  value: 1800
},
{
  name: 'Wed',
  value: 1400
},
{
  name: 'Thu',
  value: 2200
},
{
  name: 'Fri',
  value: 1900
},
{
  name: 'Sat',
  value: 2800
},
{
  name: 'Sun',
  value: 900
}];

export const DoctorDashboard = () => {
  const { navigate } = useNav();
  return (
    <div className="flex h-full bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <Activity className="w-6 h-6 text-primary mr-2" />
          <span className="font-bold text-lg tracking-tight">CLINIDENT</span>
        </div>
        <div className="p-4 space-y-1 flex-1">
          <div className="flex items-center gap-3 px-3 py-2.5 bg-primary/10 text-primary rounded-lg font-medium text-sm cursor-pointer">
            <Activity className="w-4 h-4" /> Dashboard
          </div>
          <div
            onClick={(e) => {
              stop(e);
              navigate('calendar');
            }}
            className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium text-sm cursor-pointer">
            
            <Calendar className="w-4 h-4" /> Appointments
          </div>
          <div
            onClick={(e) => {
              stop(e);
              navigate('patient-profile');
            }}
            className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium text-sm cursor-pointer">
            
            <Users className="w-4 h-4" /> Patients
          </div>
          <div
            onClick={(e) => {
              stop(e);
              navigate('odontogram');
            }}
            className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium text-sm cursor-pointer">
            
            <FileText className="w-4 h-4" /> Charting & Notes
          </div>
          <div
            onClick={(e) => {
              stop(e);
              navigate('prescription');
            }}
            className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium text-sm cursor-pointer">
            
            <DollarSign className="w-4 h-4" /> Billing
          </div>
          <div
            onClick={(e) => {
              stop(e);
              navigate('doctor-speech');
            }}
            className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium text-sm cursor-pointer">
            
            <Mic className="w-4 h-4" /> Speech-to-Text
          </div>
        </div>
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&fit=crop"
              alt="Doctor"
              className="w-10 h-10 rounded-full object-cover border border-slate-200" />
            
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Dr. Sarah Jenkins
              </p>
              <p className="text-xs text-slate-500">Lead Dentist</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="relative w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patients, appointments..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none"
              readOnly />
            
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="w-5 h-5 text-slate-600" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
            </div>
            <button
              onClick={(e) => {
                stop(e);
                navigate('calendar');
              }}
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
              
              + New Appointment
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Good morning, Dr. Sarah
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Here's what's happening at your clinic today.
              </p>
            </div>
            <div className="text-sm font-medium text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
              Today, Oct 24
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {[
            {
              label: "Today's Appointments",
              value: '12',
              icon: Calendar,
              color: 'text-blue-600',
              bg: 'bg-blue-50'
            },
            {
              label: 'Patients in Queue',
              value: '3',
              icon: Users,
              color: 'text-amber-600',
              bg: 'bg-amber-50'
            },
            {
              label: 'Revenue Today',
              value: '$2,450',
              icon: DollarSign,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50'
            },
            {
              label: 'Pending Reports',
              value: '5',
              icon: FileText,
              color: 'text-purple-600',
              bg: 'bg-purple-50'
            }].
            map((stat, i) =>
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              
                <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-8">
            {/* Left Column: Schedule & Queue */}
            <div className="col-span-2 space-y-8">
              {/* Today's Schedule */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="font-bold text-slate-900">Today's Schedule</h2>
                  <button
                    onClick={(e) => {
                      stop(e);
                      navigate('calendar');
                    }}
                    className="text-primary text-sm font-medium flex items-center">
                    
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                  {
                    time: '09:00 AM',
                    name: 'Michael Roberts',
                    type: 'Root Canal',
                    chair: 'Chair 1',
                    status: 'In Progress'
                  },
                  {
                    time: '10:30 AM',
                    name: 'Emma Thompson',
                    type: 'General Checkup',
                    chair: 'Chair 2',
                    status: 'Waiting'
                  },
                  {
                    time: '11:15 AM',
                    name: 'David Chen',
                    type: 'Teeth Whitening',
                    chair: 'Chair 1',
                    status: 'Upcoming'
                  },
                  {
                    time: '01:00 PM',
                    name: 'Olivia Davis',
                    type: 'Crown Prep',
                    chair: 'Chair 3',
                    status: 'Upcoming'
                  }].
                  map((apt, i) =>
                  <div
                    key={i}
                    onClick={(e) => {
                      stop(e);
                      navigate('patient-profile');
                    }}
                    className="p-4 flex items-center hover:bg-slate-50 transition-colors cursor-pointer">
                    
                      <div className="w-20 shrink-0">
                        <p className="text-sm font-semibold text-slate-900">
                          {apt.time}
                        </p>
                      </div>
                      <div className="flex-1 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                          <img
                          src={`https://images.unsplash.com/photo-${1500000000000 + i}?w=100&fit=crop`}
                          alt=""
                          className="w-full h-full object-cover" />
                        
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {apt.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {apt.type} • {apt.chair}
                          </p>
                        </div>
                      </div>
                      <div>
                        <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${apt.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : apt.status === 'Waiting' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                        
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-bold text-slate-900">Revenue Overview</h2>
                  <select className="text-sm border-slate-200 rounded-md text-slate-600 bg-slate-50 px-2 py-1">
                    <option>Last 7 Days</option>
                  </select>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient
                          id="colorValue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1">
                          
                          <stop
                            offset="5%"
                            stopColor="#0A84FF"
                            stopOpacity={0.3} />
                          
                          <stop
                            offset="95%"
                            stopColor="#0A84FF"
                            stopOpacity={0} />
                          
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#E2E8F0" />
                      
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 12,
                          fill: '#64748B'
                        }}
                        dy={10} />
                      
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 12,
                          fill: '#64748B'
                        }}
                        dx={-10} />
                      
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#0A84FF"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorValue)" />
                      
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right Column: Sidebar Widgets */}
            <div className="space-y-8">
              {/* Patient Queue */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-secondary" /> Patient Queue
                </h2>
                <div className="space-y-4">
                  {[
                  {
                    name: 'Emma Thompson',
                    wait: '15 mins',
                    type: 'Checkup'
                  },
                  {
                    name: 'James Wilson',
                    wait: '5 mins',
                    type: 'Consultation'
                  }].
                  map((p, i) =>
                  <div
                    key={i}
                    onClick={(e) => {
                      stop(e);
                      navigate('patient-profile');
                    }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer">
                    
                      <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                        <img
                        src={`https://images.unsplash.com/photo-${1550000000000 + i}?w=100&fit=crop`}
                        alt=""
                        className="w-full h-full object-cover" />
                      
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {p.name}
                        </p>
                        <p className="text-xs text-slate-500">{p.type}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-medium text-amber-600">
                          {p.wait}
                        </p>
                        <p className="text-[10px] text-slate-400">waiting</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Treatment Progress */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h2 className="font-bold text-slate-900 mb-4">
                  Treatment Progress
                </h2>
                <div className="space-y-5">
                  {[
                  {
                    name: 'Invisalign - Sarah J.',
                    progress: 75,
                    color: 'bg-primary'
                  },
                  {
                    name: 'Implants - Robert M.',
                    progress: 40,
                    color: 'bg-secondary'
                  },
                  {
                    name: 'Root Canal - Lisa K.',
                    progress: 90,
                    color: 'bg-purple-500'
                  }].
                  map((t, i) =>
                  <div key={i}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium text-slate-700">
                          {t.name}
                        </span>
                        <span className="text-slate-500">{t.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                        className={`${t.color} h-2 rounded-full`}
                        style={{
                          width: `${t.progress}%`
                        }}>
                      </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

};
