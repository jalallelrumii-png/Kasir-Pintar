
import React, { useState, useEffect, useMemo } from 'react';
import { View, Product, Transaction, CartItem } from './types';
import { getProducts, getTransactions, saveProducts, saveTransaction } from './db';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import PointOfSale from './views/PointOfSale';
import ProductsView from './views/ProductsView';
import TransactionsView from './views/TransactionsView';
import AIInsightsView from './views/AIInsightsView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.POS);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Initialize data
  useEffect(() => {
    setProducts(getProducts());
    setTransactions(getTransactions());
  }, []);

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        const stockLimit = products.find(p => p.id === productId)?.stock || 0;
        return { ...item, quantity: Math.min(newQty, stockLimit) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleCheckout = (payment: { method: 'cash' | 'card' | 'qris', amountPaid: number }) => {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = subtotal * 0.11; // 11% tax
    const total = subtotal + tax;
    
    const newTransaction: Transaction = {
      id: `TX-${Date.now()}`,
      items: [...cart],
      subtotal,
      tax,
      total,
      amountPaid: payment.amountPaid,
      change: payment.amountPaid - total,
      date: new Date().toISOString(),
      paymentMethod: payment.method
    };

    saveTransaction(newTransaction);
    setTransactions(prev => [newTransaction, ...prev]);
    setProducts(getProducts()); // Refresh stock
    setCart([]);
    alert("Transaksi berhasil!");
  };

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard transactions={transactions} products={products} />;
      case View.POS:
        return (
          <PointOfSale 
            products={products} 
            cart={cart} 
            onAddToCart={handleAddToCart}
            onUpdateCartQty={handleUpdateCartQty}
            onCheckout={handleCheckout}
          />
        );
      case View.PRODUCTS:
        return <ProductsView products={products} onRefresh={() => setProducts(getProducts())} />;
      case View.TRANSACTIONS:
        return <TransactionsView transactions={transactions} />;
      case View.AI_INSIGHTS:
        return <AIInsightsView transactions={transactions} products={products} />;
      default:
        return <PointOfSale products={products} cart={cart} onAddToCart={handleAddToCart} onUpdateCartQty={handleUpdateCartQty} onCheckout={handleCheckout} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      <main className="flex-1 overflow-y-auto relative p-4 md:p-8">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
