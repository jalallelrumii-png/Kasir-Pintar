
import React from 'react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const menuItems = [
    { id: View.POS, label: 'Kasir (POS)', icon: 'fa-cash-register' },
    { id: View.DASHBOARD, label: 'Dashboard', icon: 'fa-chart-pie' },
    { id: View.PRODUCTS, label: 'Produk', icon: 'fa-box' },
    { id: View.TRANSACTIONS, label: 'Riwayat', icon: 'fa-receipt' },
    { id: View.AI_INSIGHTS, label: 'AI Insight', icon: 'fa-robot' },
  ];

  return (
    <aside className="w-20 md:w-64 bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
          <i className="fas fa-bolt text-lg"></i>
        </div>
        <span className="hidden md:block font-bold text-xl text-gray-800 tracking-tight">LuminaPOS</span>
      </div>

      <nav className="flex-1 px-3 space-y-2 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
              currentView === item.id
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <i className={`fas ${item.icon} text-lg w-6`}></i>
            <span className="hidden md:block">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-gray-50 cursor-pointer">
          <img src="https://picsum.photos/seed/admin/40/40" className="w-8 h-8 rounded-full border border-gray-200" alt="Admin" />
          <div className="hidden md:block overflow-hidden">
            <p className="text-sm font-semibold text-gray-800 truncate">Super Admin</p>
            <p className="text-xs text-gray-500 truncate">Store Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
