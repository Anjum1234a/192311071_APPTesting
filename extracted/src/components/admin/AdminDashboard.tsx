import React from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Activity,
  Package } from
'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell } from
'recharts';
const revenueData = [
{
  name: 'Jan',
  value: 45000
},
{
  name: 'Feb',
  value: 52000
},
{
  name: 'Mar',
  value: 48000
},
{
  name: 'Apr',
  value: 61000
},
{
  name: 'May',
  value: 59000
},
{
  name: 'Jun',
  value: 65000
}];

const serviceData = [
{
  name: 'General',
  value: 400
},
{
  name: 'Orthodontics',
  value: 300
},
{
  name: 'Surgery',
  value: 300
},
{
  name: 'Cosmetic',
  value: 200
}];

const COLORS = ['#0A84FF', '#00C2A8', '#8B5CF6', '#F59E0B'];
import { useNav } from '../navigation/NavContext';
const stop = (e: React.MouseEvent) => e.stopPropagation();
export const AdminDashboard = () => {
  const { navigate } = useNav();
  return (
    <div className="flex h-full bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="h-16 flex items-center px-6 bg-slate-950">
          <Activity className="w-6 h-6 text-primary mr-2" />
          <span className="font-bold text-lg text-white tracking-tight">
            CLINIDENT
          </span>
        </div>
        <div className="p-4 space-y-1 flex-1">
          <div className="flex items-center gap-3 px-3 py-2.5 bg-primary/20 text-primary rounded-lg font-medium text-sm cursor-pointer">
            <TrendingUp className="w-4 h-4" /> Analytics
          </div>
          <div
            onClick={(e) => {
              stop(e);
              navigate('doctor-speech');
            }}
            className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 hover:text-white rounded-lg font-medium text-sm cursor-pointer">
            
            <Users className="w-4 h-4" /> Staff
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 hover:text-white rounded-lg font-medium text-sm cursor-pointer">
            <Package className="w-4 h-4" /> Inventory
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shrink-0">
          <h1 className="text-xl font-bold text-slate-900">Clinic Analytics</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {/* KPIs */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {[
            {
              label: 'Total Revenue (MTD)',
              value: '$124,500',
              trend: '+12.5%',
              color: 'text-emerald-600'
            },
            {
              label: 'Total Patients',
              value: '3,420',
              trend: '+5.2%',
              color: 'text-blue-600'
            },
            {
              label: 'Appointments',
              value: '845',
              trend: '+8.1%',
              color: 'text-blue-600'
            },
            {
              label: 'Avg Rating',
              value: '4.8/5',
              trend: '+0.2',
              color: 'text-amber-500'
            }].
            map((stat, i) =>
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              
                <p className="text-slate-500 text-sm font-medium mb-2">
                  {stat.label}
                </p>
                <div className="flex items-end gap-3">
                  <p className="text-3xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                  <span className={`text-sm font-bold mb-1 ${stat.color}`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-8 mb-8">
            {/* Revenue Chart */}
            <div className="col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="font-bold text-slate-900 mb-6">
                Revenue Trend (Last 6 Months)
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
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
                      dx={-10}
                      tickFormatter={(val) => `$${val / 1000}k`} />
                    
                    <Tooltip
                      cursor={{
                        fill: '#F1F5F9'
                      }} />
                    
                    <Bar
                      dataKey="value"
                      fill="#0A84FF"
                      radius={[4, 4, 0, 0]}
                      barSize={40} />
                    
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Service Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="font-bold text-slate-900 mb-6">
                Revenue by Service
              </h2>
              <div className="h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value">
                      
                      {serviceData.map((entry, index) =>
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]} />

                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                  <span className="text-2xl font-bold text-slate-900">
                    1.2k
                  </span>
                  <span className="text-xs text-slate-500">Procedures</span>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {serviceData.map((item, i) =>
                <div
                  key={i}
                  className="flex items-center justify-between text-sm">
                  
                    <div className="flex items-center gap-2">
                      <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: COLORS[i]
                      }}>
                    </div>
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900">
                      {item.value}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Doctor Performance */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">Doctor Performance</h2>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Doctor</th>
                    <th className="px-5 py-3 font-medium">Appts</th>
                    <th className="px-5 py-3 font-medium">Revenue</th>
                    <th className="px-5 py-3 font-medium">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                  {
                    name: 'Dr. Sarah Jenkins',
                    appts: 145,
                    rev: '$42,500',
                    rating: '4.9'
                  },
                  {
                    name: 'Dr. Michael Chen',
                    appts: 120,
                    rev: '$38,200',
                    rating: '4.8'
                  },
                  {
                    name: 'Dr. Emily Davis',
                    appts: 98,
                    rev: '$29,400',
                    rating: '4.7'
                  }].
                  map((doc, i) =>
                  <tr
                    key={i}
                    onClick={(e) => {
                      stop(e);
                      navigate('doctor-speech');
                    }}
                    className="hover:bg-slate-50 cursor-pointer">
                    
                      <td className="px-5 py-3 flex items-center gap-3">
                        <img
                        src={`https://images.unsplash.com/photo-${1500000000000 + i}?w=100&fit=crop`}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover" />
                      
                        <span className="font-medium text-slate-900">
                          {doc.name}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{doc.appts}</td>
                      <td className="px-5 py-3 font-medium text-slate-900">
                        {doc.rev}
                      </td>
                      <td className="px-5 py-3 text-amber-500 font-medium flex items-center gap-1">
                        ★ {doc.rating}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Inventory Alerts */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" /> Inventory
                  Alerts
                </h2>
              </div>
              <div className="p-5 space-y-4">
                {[
                {
                  item: 'Lidocaine 2% Cartridges',
                  stock: '12 boxes',
                  status: 'Low Stock',
                  color: 'bg-amber-100 text-amber-700'
                },
                {
                  item: 'Nitrile Gloves (Medium)',
                  stock: '2 boxes',
                  status: 'Critical',
                  color: 'bg-red-100 text-red-700'
                },
                {
                  item: 'Composite Resin (A2)',
                  stock: '5 syringes',
                  status: 'Low Stock',
                  color: 'bg-amber-100 text-amber-700'
                }].
                map((inv, i) =>
                <div
                  key={i}
                  className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-slate-50">
                  
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        {inv.item}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Current: {inv.stock}
                      </p>
                    </div>
                    <span
                    className={`px-2.5 py-1 rounded-md text-xs font-bold ${inv.color}`}>
                    
                      {inv.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

};
