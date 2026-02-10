
import React, { useState, useMemo } from 'react';
import { Product, CartItem } from '../types';

interface POSProps {
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onUpdateCartQty: (productId: string, delta: number) => void;
  onCheckout: (payment: { method: 'cash' | 'card' | 'qris', amountPaid: number }) => void;
}

const PointOfSale: React.FC<POSProps> = ({ products, cart, onAddToCart, onUpdateCartQty, onCheckout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [amountPaid, setAmountPaid] = useState('');
  
  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category)))], [products]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'All' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.11;
  const total = subtotal + tax;

  const handleFinish = (method: 'cash' | 'card' | 'qris') => {
    const paidVal = method === 'cash' ? parseFloat(amountPaid) : total;
    if (isNaN(paidVal) || paidVal < total) {
      alert("Pembayaran kurang!");
      return;
    }
    onCheckout({ method, amountPaid: paidVal });
    setAmountPaid('');
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Product Selection Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <header className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Kasir Pintar</h1>
            <div className="relative w-full md:w-96">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input 
                type="text" 
                placeholder="Cari nama produk atau SKU..." 
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  category === cat 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
          {filteredProducts.map(product => (
            <div 
              key={product.id}
              onClick={() => onAddToCart(product)}
              className={`group bg-white rounded-2xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition-all cursor-pointer relative ${product.stock <= 0 ? 'opacity-60 grayscale' : ''}`}
            >
              <div className="aspect-square rounded-xl overflow-hidden mb-3 relative">
                <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={product.name} />
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded">STOK RENDAH</span>
                )}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xs">HABIS</div>
                )}
              </div>
              <p className="text-xs text-gray-400 font-medium mb-1">{product.sku}</p>
              <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2 min-h-[40px] leading-tight">{product.name}</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold text-indigo-600 text-sm">{formatCurrency(product.price)}</span>
                <span className="text-[10px] text-gray-500">Stok: {product.stock}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart / Summary Area */}
      <div className="w-full lg:w-[400px] flex flex-col shrink-0">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl flex flex-col h-full overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Keranjang Belanja</h2>
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
              {cart.reduce((a, b) => a + b.quantity, 0)} Items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                <i className="fas fa-shopping-basket text-6xl opacity-20"></i>
                <p className="text-sm">Keranjang masih kosong</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center gap-4 animate-in fade-in slide-in-from-right-2">
                  <img src={item.image} className="w-16 h-16 rounded-xl object-cover shrink-0" alt="" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 text-sm truncate leading-none mb-1">{item.name}</h4>
                    <p className="text-xs text-indigo-600 font-bold">{formatCurrency(item.price)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => onUpdateCartQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 text-xs">
                        <i className="fas fa-minus"></i>
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => onUpdateCartQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 text-xs">
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800 text-sm">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span className="font-medium text-gray-800">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Pajak (11%)</span>
              <span className="font-medium text-gray-800">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-black border-t border-gray-200 pt-3">
              <span className="text-gray-800">TOTAL</span>
              <span className="text-indigo-600">{formatCurrency(total)}</span>
            </div>

            <div className="pt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Bayar Tunai</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</span>
                  <input 
                    type="number" 
                    placeholder="0"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-800"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => handleFinish('cash')}
                  disabled={cart.length === 0}
                  className="flex flex-col items-center justify-center gap-1 p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-money-bill-wave"></i>
                  <span className="text-[10px] font-bold uppercase">Tunai</span>
                </button>
                <button 
                  onClick={() => handleFinish('qris')}
                  disabled={cart.length === 0}
                  className="flex flex-col items-center justify-center gap-1 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-qrcode"></i>
                  <span className="text-[10px] font-bold uppercase">QRIS</span>
                </button>
                <button 
                  onClick={() => handleFinish('card')}
                  disabled={cart.length === 0}
                  className="flex flex-col items-center justify-center gap-1 p-3 bg-gray-800 hover:bg-gray-900 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-credit-card"></i>
                  <span className="text-[10px] font-bold uppercase">Kartu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointOfSale;
