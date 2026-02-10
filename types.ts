
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
