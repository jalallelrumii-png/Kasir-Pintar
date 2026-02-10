
import React, { useState, useEffect } from 'react';
import { Transaction, Product } from '../types';
import { analyzeBusiness } from '../geminiService';

interface AIInsightsViewProps {
  transactions: Transaction[];
  products: Product[];
}

const AIInsightsView: React.FC<AIInsightsViewProps> = ({ transactions, products }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsight = async () => {
    setLoading(true);
    try {
      const result = await analyzeBusiness(transactions, products);
      setInsight(result || "Tidak ada data yang cukup untuk dianalisis.");
    } catch (err) {
      setInsight("Gagal memuat analisis. Silakan periksa kunci API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (transactions.length > 0) {
      fetchInsight();
    } else {
      setInsight("Silakan buat beberapa transaksi terlebih dahulu untuk mendapatkan insight AI.");
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 text-white rounded-3xl shadow-2xl shadow-indigo-200 mb-2">
          <i className="fas fa-robot text-3xl"></i>
        </div>
        <h1 className="text-3xl font-black text-gray-800">Lumina AI Insight</h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          Asisten cerdas Anda yang menganalisis tren penjualan dan memberikan rekomendasi strategi bisnis secara otomatis.
        </p>
      </header>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="flex space-x-2">
                <div className="w-4 h-4 bg-indigo-600 rounded-full animate-bounce"></div>
                <div className="w-4 h-4 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-4 h-4 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
              <p className="text-gray-500 font-medium animate-pulse">Lumina sedang berpikir...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-800">Laporan Analisis Hari Ini</h3>
              </div>
              
              <div className="prose prose-indigo max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                  {insight}
                </p>
              </div>

              <div className="pt-10 flex justify-center">
                <button 
                  onClick={fetchInsight}
                  className="px-8 py-4 bg-gray-50 text-indigo-600 border border-indigo-100 rounded-2xl font-bold hover:bg-indigo-50 transition-all flex items-center gap-3"
                >
                  <i className="fas fa-sync-alt"></i>
                  Perbarui Analisis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-indigo-600 p-8 rounded-[32px] text-white">
          <i className="fas fa-lightbulb text-3xl mb-4 opacity-50"></i>
          <h4 className="text-lg font-bold mb-2">Tahukah Anda?</h4>
          <p className="text-indigo-100 text-sm leading-relaxed">
            Menyusun produk yang sering dibeli bersamaan di rak yang berdekatan dapat meningkatkan penjualan sebesar 15-20%. Lumina AI dapat membantu mengidentifikasi produk-produk tersebut.
          </p>
        </div>
        <div className="bg-emerald-500 p-8 rounded-[32px] text-white">
          <i className="fas fa-magic text-3xl mb-4 opacity-50"></i>
          <h4 className="text-lg font-bold mb-2">Tips Cepat</h4>
          <p className="text-emerald-50 text-sm leading-relaxed">
            Gunakan QRIS untuk transaksi yang lebih cepat. Rata-rata transaksi QRIS 40% lebih cepat dibandingkan tunai, membantu mengurangi antrean di jam sibuk.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsView;
