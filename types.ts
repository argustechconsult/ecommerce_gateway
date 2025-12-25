
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  gallery?: string[]; // Imagens secundárias
  variants?: string[]; // Variantes genéricas (ex: 110v, 220v)
  category: string;
  stock: number;
  weightKg: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped';
  date: string;
  shippingDetails?: ShippingInfo;
  trackingCode?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

export interface Revenue {
  id: string;
  orderId: string;
  amount: number;
  date: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
  role: 'admin' | 'customer';
}

export interface ShippingInfo {
  zipCode: string;
  cost: number;
  deliveryTime: string;
  service: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  productImage?: string;
}
