
import { Product, Transaction } from './types';

const PRODUCTS_KEY = 'luminapos_products';
const TRANSACTIONS_KEY = 'luminapos_transactions';

const initialProducts: Product[] = [
  { id: '1', name: 'Arabica Coffee Beans 250g', category: 'Coffee', price: 85000, stock: 24, sku: 'COF-001', image: 'https://picsum.photos/seed/coffee/400/400' },
  { id: '2', name: 'Iced Latte', category: 'Beverages', price: 28000, stock: 100, sku: 'BEV-001', image: 'https://picsum.photos/seed/latte/400/400' },
  { id: '3', name: 'Chocolate Croissant', category: 'Pastry', price: 22000, stock: 15, sku: 'PAS-001', image: 'https://picsum.photos/seed/pastry/400/400' },
  { id: '4', name: 'Mineral Water 600ml', category: 'Beverages', price: 5000, stock: 50, sku: 'BEV-002', image: 'https://picsum.photos/seed/water/400/400' },
  { id: '5', name: 'Tote Bag Lumina', category: 'Merchandise', price: 45000, stock: 10, sku: 'MER-001', image: 'https://picsum.photos/seed/bag/400/400' },
];

export const getProducts = (): Product[] => {
  const data = localStorage.getItem(PRODUCTS_KEY);
  if (!data) {
    saveProducts(initialProducts);
    return initialProducts;
  }
  return JSON.parse(data);
};

export const saveProducts = (products: Product[]) => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const getTransactions = (): Transaction[] => {
  const data = localStorage.getItem(TRANSACTIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTransaction = (transaction: Transaction) => {
  const transactions = getTransactions();
  transactions.unshift(transaction);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));

  // Update Stock
  const products = getProducts();
  transaction.items.forEach(item => {
    const pIndex = products.findIndex(p => p.id === item.id);
    if (pIndex !== -1) {
      products[pIndex].stock -= item.quantity;
    }
  });
  saveProducts(products);
};
