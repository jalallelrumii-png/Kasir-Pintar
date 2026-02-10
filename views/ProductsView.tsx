
import React, { useState } from 'react';
import { Product } from '../types';
import { saveProducts, getProducts } from '../db';

interface ProductsViewProps {
  products: Product[];
  onRefresh: () => void;
}

const ProductsView: React.FC<ProductsViewProps> = ({ products, onRefresh }) => {
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const allProducts = getProducts();
    if (editingProduct.id) {
      const index = allProducts.findIndex(p => p.id === editingProduct.id);
      if (index !== -1) allProducts[index] = editingProduct as Product;
    } else {
      const newProduct = {
        ...editingProduct,
        id: Date.now().toString(),
        image: editingProduct.image || `https://picsum.photos/seed/${Date.now()}/400/400`,
      } as Product;
      allProducts.unshift(newProduct);
    }

    saveProducts(allProducts);
    onRefresh();
    setEditingProduct(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus produk ini?")) {
      const filtered = products.filter(p => p.id !== id);
      saveProducts(filtered);
      onRefresh();
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Inventori</h1>
          <p className="text-gray-500">Kelola daftar produk dan stok barang Anda.</p>
        </div>
        <button 
          onClick={() => setEditingProduct({ name: '', sku: '', category: '', price: 0, stock: 0 })}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <i className="fas fa-plus"></i>
          Produk Baru
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Produk</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Kategori</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Harga</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Stok</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img src={p.image} className="w-12 h-12 rounded-lg object-cover" alt="" />
                    <div>
                      <p className="font-bold text-gray-800 leading-none mb-1">{p.name}</p>
                      <p className="text-xs text-gray-400 font-medium">{p.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase">{p.category}</span>
                </td>
                <td className="px-6 py-4 font-bold text-indigo-600">{formatCurrency(p.price)}</td>
                <td className="px-6 py-4">
                  <span className={`font-bold ${p.stock < 10 ? 'text-rose-500' : 'text-gray-800'}`}>{p.stock}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingProduct(p)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-xl font-bold mb-6">{editingProduct.id ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Nama Produk</label>
                <input 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  value={editingProduct.name || ''}
                  onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">SKU</label>
                  <input 
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                    value={editingProduct.sku || ''}
                    onChange={e => setEditingProduct({...editingProduct, sku: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Kategori</label>
                  <input 
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                    value={editingProduct.category || ''}
                    onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Harga</label>
                  <input 
                    required
                    type="number"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                    value={editingProduct.price || 0}
                    onChange={e => setEditingProduct({...editingProduct, price: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Stok</label>
                  <input 
                    required
                    type="number"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                    value={editingProduct.stock || 0}
                    onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="pt-6 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsView;
