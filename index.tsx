
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

// --- TYPES & INTERFACES ---
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  sku: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  change: number;
  date: string;
  paymentMethod: 'cash' | 'card' | 'qris';
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  POS = 'POS',
  PRODUCTS = 'PRODUCTS',
  TRANSACTIONS = 'TRANSACTIONS',
  AI_INSIGHTS = 'AI_INSIGHTS'
}

// --- CONSTANTS & INITIAL DATA ---
const PRODUCTS_KEY = 'luminapos_products';
const TRANSACTIONS_KEY = 'luminapos_transactions';

const initialProducts: Product[] = [
  { id: '1', name: 'Arabica Coffee Beans 250g', category: 'Coffee', price: 85000, stock: 24, sku: 'COF-001', image: 'https://picsum.photos/seed/coffee/400/400' },
  { id: '2', name: 'Iced Latte', category: 'Beverages', price: 28000, stock: 100, sku: 'BEV-001', image: 'https://picsum.photos/seed/latte/400/400' },
  { id: '3', name: 'Chocolate Croissant', category: 'Pastry', price: 22000, stock: 15, sku: 'PAS-001', image: 'https://picsum.photos/seed/pastry/400/400' },
  { id: '4', name: 'Mineral Water 600ml', category: 'Beverages', price: 5000, stock: 50, sku: 'BEV-002', image: 'https://picsum.photos/seed/water/400/400' },
  { id: '5', name: 'Tote Bag Lumina', category: 'Merchandise', price: 45000, stock: 10, sku: 'MER-001', image: 'https://picsum.photos/seed/bag/400/400' },
];

// --- DATABASE HELPERS ---
const db = {
  getProducts: (): Product[] => {
    const data = localStorage.getItem(PRODUCTS_KEY);
    if (!data) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(initialProducts));
      return initialProducts;
    }
    return JSON.parse(data);
  },
  saveProducts: (products: Product[]) => {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  },
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveTransaction: (transaction: Transaction) => {
    const transactions = db.getTransactions();
    transactions.unshift(transaction);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));

    const products = db.getProducts();
    transaction.items.forEach(item => {
      const pIndex = products.findIndex(p => p.id === item.id);
      if (pIndex !== -1) {
        products[pIndex].stock -= item.quantity;
      }
    });
    db.saveProducts(products);
  }
};

// --- AI SERVICE ---
const analyzeBusiness = async (transactions: Transaction[], products: Product[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const summary = {
    totalSales: transactions.reduce((acc, t) => acc + t.total, 0),
    count: transactions.length,
    lowStock: products.filter(p => p.stock < 5).map(p => p.name),
  };

  const prompt = `Context: Business analyst for LuminaPOS. Total Revenue: Rp ${summary.totalSales}, Total Transactions: ${summary.count}. Low Stock: ${summary.lowStock.join(', ') || 'None'}. Provide a concise strategic insight in Indonesian about what to restock or promote based on these 10 recent transactions: ${JSON.stringify(transactions.slice(0, 10))}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "Gagal mendapatkan analisis AI. Periksa koneksi atau API Key.";
  }
};

// --- UTILS ---
const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

// --- COMPONENTS ---

const Sidebar = ({ currentView, setView }: { currentView: View, setView: (v: View) => void }) => {
  const menuItems = [
    { id: View.POS, label: 'Kasir', icon: 'fa-cash-register' },
    { id: View.DASHBOARD, label: 'Dashboard', icon: 'fa-chart-pie' },
    { id: View.PRODUCTS, label: 'Produk', icon: 'fa-box' },
    { id: View.TRANSACTIONS, label: 'Riwayat', icon: 'fa-receipt' },
    { id: View.AI_INSIGHTS, label: 'AI Insight', icon: 'fa-robot' },
  ];
  return (
    <aside className="w-20 md:w-64 bg-white border-r border-gray-200 flex flex-col h-full transition-all">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white"><i className="fas fa-bolt"></i></div>
        <span className="hidden md:block font-bold text-xl">LuminaPOS</span>
      </div>
      <nav className="flex-1 px-3 space-y-2 mt-4">
        {menuItems.map(item => (
          <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${currentView === item.id ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-500 hover:bg-gray-100'}`}>
            <i className={`fas ${item.icon} w-6 text-center`}></i>
            <span className="hidden md:block">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

const DashboardView = ({ transactions, products }: { transactions: Transaction[], products: Product[] }) => {
  const totalRevenue = transactions.reduce((acc, t) => acc + t.total, 0);
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayTotal = transactions.filter(t => t.date.startsWith(dateStr)).reduce((acc, t) => acc + t.total, 0);
    return { name: dateStr.split('-').slice(1).join('/'), total: dayTotal };
  }).reverse();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ringkasan Bisnis</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-sm">Total Pendapatan</p>
            <h2 className="text-2xl font-black">{formatCurrency(totalRevenue)}</h2>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-sm">Transaksi</p>
            <h2 className="text-2xl font-black">{transactions.length}</h2>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-sm">Stok Rendah</p>
            <h2 className="text-2xl font-black text-rose-500">{products.filter(p => p.stock < 10).length}</h2>
        </div>
      </div>
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-80">
        <h3 className="font-bold mb-4">Tren Penjualan (7 Hari)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={last7Days}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip />
            <Bar dataKey="total" fill="#4f46e5" radius={[4, 4, 4, 4]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const POSView = ({ products, cart, onAddToCart, onUpdateQty, onCheckout }: any) => {
  const [search, setSearch] = useState('');
  const subtotal = cart.reduce((a: any, b: any) => a + (b.price * b.quantity), 0);
  const total = subtotal * 1.11;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      <div className="flex-1 overflow-y-auto">
        <input type="text" placeholder="Cari produk..." className="w-full p-4 mb-6 rounded-2xl border border-gray-200" value={search} onChange={e => setSearch(e.target.value)} />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase())).map((p: any) => (
            <div key={p.id} onClick={() => onAddToCart(p)} className="bg-white p-4 rounded-2xl border border-gray-100 cursor-pointer hover:shadow-md">
              <img src={p.image} className="w-full aspect-square object-cover rounded-xl mb-3" />
              <h4 className="font-bold text-sm truncate">{p.name}</h4>
              <p className="text-indigo-600 font-bold">{formatCurrency(p.price)}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full lg:w-96 bg-white rounded-3xl p-6 border border-gray-200 flex flex-col">
        <h2 className="font-bold mb-4">Keranjang</h2>
        <div className="flex-1 overflow-y-auto space-y-4">
          {cart.map((item: any) => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <p className="font-bold text-sm">{item.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => onUpdateQty(item.id, -1)} className="w-6 h-6 bg-gray-100 rounded">-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => onUpdateQty(item.id, 1)} className="w-6 h-6 bg-gray-100 rounded">+</button>
                </div>
              </div>
              <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
          <div className="flex justify-between"><span>Total</span><span className="font-black text-xl">{formatCurrency(total)}</span></div>
          <button onClick={() => onCheckout({ method: 'cash', amountPaid: total })} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold mt-4">Bayar Sekarang</button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const App = () => {
  const [currentView, setCurrentView] = useState<View>(View.POS);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setProducts(db.getProducts());
    setTransactions(db.getTransactions());
  }, []);

  const handleAddToCart = (p: Product) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === p.id);
      if (exists) return prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...p, quantity: 1 }];
    });
  };

  const handleUpdateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0));
  };

  const handleCheckout = (payment: any) => {
    if (cart.length === 0) return;
    const subtotal = cart.reduce((a, b) => a + (b.price * b.quantity), 0);
    const total = subtotal * 1.11;
    const tx: Transaction = {
      id: `TX-${Date.now()}`,
      items: [...cart],
      subtotal, tax: subtotal * 0.11, total,
      amountPaid: payment.amountPaid, change: 0, date: new Date().toISOString(), paymentMethod: payment.method
    };
    db.saveTransaction(tx);
    setTransactions(prev => [tx, ...prev]);
    setProducts(db.getProducts());
    setCart([]);
    alert("Transaksi Berhasil!");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      <main className="flex-1 p-8 overflow-y-auto">
        {currentView === View.DASHBOARD && <DashboardView transactions={transactions} products={products} />}
        {currentView === View.POS && <POSView products={products} cart={cart} onAddToCart={handleAddToCart} onUpdateQty={handleUpdateQty} onCheckout={handleCheckout} />}
        {currentView === View.PRODUCTS && (
          <div className="bg-white rounded-3xl p-6 border border-gray-200">
            <h2 className="font-bold text-xl mb-4">Daftar Produk</h2>
            <div className="grid gap-4">
              {products.map(p => (
                <div key={p.id} className="flex items-center justify-between border-b pb-2">
                  <span>{p.name} (Stok: {p.stock})</span>
                  <span className="font-bold text-indigo-600">{formatCurrency(p.price)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {currentView === View.TRANSACTIONS && (
          <div className="space-y-4">
             <h2 className="font-bold text-xl">Riwayat Penjualan</h2>
             {transactions.map(tx => (
               <div key={tx.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="font-bold">{tx.id}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.date).toLocaleString()}</p>
                  </div>
                  <p className="font-black">{formatCurrency(tx.total)}</p>
               </div>
             ))}
          </div>
        )}
        {currentView === View.AI_INSIGHTS && (
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mx-auto text-3xl"><i className="fas fa-robot"></i></div>
            <h1 className="text-2xl font-bold">Lumina AI Business Analyst</h1>
            <button 
              onClick={async () => {
                const text = await analyzeBusiness(transactions, products);
                alert(text);
              }}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold"
            >
              Mulai Analisis Sekarang
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
