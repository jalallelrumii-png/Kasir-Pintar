
import React from 'react';
import { Transaction } from '../types';

interface TransactionsViewProps {
  transactions: Transaction[];
}

const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions }) => {
  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Riwayat Transaksi</h1>
        <p className="text-gray-500">Daftar semua penjualan yang telah diproses.</p>
      </div>

      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-gray-100">
            <i className="fas fa-receipt text-6xl text-gray-200 mb-4 block"></i>
            <p className="text-gray-400 font-medium">Belum ada transaksi</p>
          </div>
        ) : (
          transactions.map(tx => (
            <div key={tx.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    tx.paymentMethod === 'cash' ? 'bg-green-50 text-green-600' : 
                    tx.paymentMethod === 'qris' ? 'bg-indigo-50 text-indigo-600' : 
                    'bg-slate-50 text-slate-600'
                  }`}>
                    <i className={`fas ${
                      tx.paymentMethod === 'cash' ? 'fa-money-bill-wave' : 
                      tx.paymentMethod === 'qris' ? 'fa-qrcode' : 
                      'fa-credit-card'
                    } text-xl`}></i>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-800">{tx.id}</span>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-bold uppercase">{tx.paymentMethod}</span>
                    </div>
                    <p className="text-xs text-gray-400 font-medium">
                      {new Date(tx.date).toLocaleDateString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tx.items.map(item => (
                        <span key={item.id} className="text-[10px] bg-gray-50 text-gray-600 border border-gray-100 px-2 py-1 rounded">
                          {item.name} x{item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Bayar</p>
                    <p className="text-xl font-black text-gray-800">{formatCurrency(tx.total)}</p>
                  </div>
                  <button className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-indigo-600 rounded-xl transition-all">
                    <i className="fas fa-print"></i>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionsView;
