
import React from 'react';
import { Transaction, Product } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface DashboardProps {
  transactions: Transaction[];
  products: Product[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, products }) => {
  const totalRevenue = transactions.reduce((acc, t) => acc + t.total, 0);
  const totalOrders = transactions.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Last 7 days chart data logic
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayTotal = transactions
      .filter(t => t.date.startsWith(dateStr))
      .reduce((acc, t) => acc + t.total, 0);
    return { name: dateStr.split('-').slice(1).join('/'), total: dayTotal };
  }).reverse();

  // Category distribution
  const categoryData = Array.from(new Set(products.map(p => p.category))).map(cat => ({
    name: cat,
    value: products.filter(p => p.category === cat).length
  }));

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Statistik Penjualan</h1>
        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200">
          <i className="far fa-calendar-alt mr-2"></i> {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
            <i className="fas fa-wallet text-xl"></i>
          </div>
          <p className="text-gray-500 text-sm font-medium">Total Pendapatan</p>
          <h2 className="text-2xl font-black text-gray-800 mt-1">{formatCurrency(totalRevenue)}</h2>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
            <i className="fas fa-shopping-cart text-xl"></i>
          </div>
          <p className="text-gray-500 text-sm font-medium">Total Pesanan</p>
          <h2 className="text-2xl font-black text-gray-800 mt-1">{totalOrders}</h2>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
            <i className="fas fa-chart-line text-xl"></i>
          </div>
          <p className="text-gray-500 text-sm font-medium">Rata-rata Pesanan</p>
          <h2 className="text-2xl font-black text-gray-800 mt-1">{formatCurrency(avgOrderValue)}</h2>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
            <i className="fas fa-box text-xl"></i>
          </div>
          <p className="text-gray-500 text-sm font-medium">Inventori Menipis</p>
          <h2 className="text-2xl font-black text-gray-800 mt-1">{products.filter(p => p.stock < 10).length}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm min-h-[400px]">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Tren Penjualan (7 Hari Terakhir)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [formatCurrency(value), 'Pendapatan']}
                />
                <Bar dataKey="total" fill="#4f46e5" radius={[6, 6, 6, 6]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm min-h-[400px]">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Distribusi Kategori</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {categoryData.map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-gray-600 font-medium">{cat.name}</span>
                </div>
                <span className="text-gray-400 font-bold">{cat.value} Item</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
