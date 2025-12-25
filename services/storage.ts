
import { Product, Category, Order, Expense, Revenue } from '../types';

const DB_KEYS = {
  PRODUCTS: 'netstore_products',
  CATEGORIES: 'netstore_categories',
  ORDERS: 'netstore_orders',
  EXPENSES: 'netstore_expenses',
  REVENUES: 'netstore_revenues',
};

const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Switches' },
  { id: '2', name: 'Roteadores' },
  { id: '3', name: 'Access Points' },
  { id: '4', name: 'Cabos e Acessórios' },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '101',
    name: 'Switch L3 Gerenciável 24 Portas PoE',
    description: 'Switch enterprise-grade com suporte a VLAN e PoE+. Ideal para infraestruturas que exigem alta densidade de energia e gerenciamento avançado de tráfego L3.',
    price: 1850.00,
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1516315139561-9991ff326993?auto=format&fit=crop&q=80&w=800'
    ],
    variants: ['Padrão Rack 19"', 'Versão Compacta'],
    category: 'Switches',
    stock: 15,
    weightKg: 2.5
  },
  {
    id: '102',
    name: 'Roteador Wi-Fi 6 Mesh Pro',
    description: 'Roteador de ultra velocidade com tecnologia Wi-Fi 6. Cobertura estendida para até 500m² com latência mínima para aplicações críticas.',
    price: 890.00,
    image: 'https://images.unsplash.com/photo-1551708832-6014e3962635?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1631033855076-a481892996e9?auto=format&fit=crop&q=80&w=800'
    ],
    variants: ['Branco Neve', 'Cinza Space'],
    category: 'Roteadores',
    stock: 25,
    weightKg: 0.8
  }
];

export const storage = {
  getProducts: (): Product[] => {
    const data = localStorage.getItem(DB_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : INITIAL_PRODUCTS;
  },
  saveProducts: (products: Product[]) => {
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
  },
  getCategories: (): Category[] => {
    const data = localStorage.getItem(DB_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : INITIAL_CATEGORIES;
  },
  saveCategories: (categories: Category[]) => {
    localStorage.setItem(DB_KEYS.CATEGORIES, JSON.stringify(categories));
  },
  getOrders: (): Order[] => {
    const data = localStorage.getItem(DB_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  },
  saveOrders: (orders: Order[]) => {
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
  },
  getExpenses: (): Expense[] => {
    const data = localStorage.getItem(DB_KEYS.EXPENSES);
    return data ? JSON.parse(data) : [];
  },
  saveExpenses: (expenses: Expense[]) => {
    localStorage.setItem(DB_KEYS.EXPENSES, JSON.stringify(expenses));
  },
  getRevenues: (): Revenue[] => {
    const data = localStorage.getItem(DB_KEYS.REVENUES);
    return data ? JSON.parse(data) : [];
  },
  saveRevenues: (revenues: Revenue[]) => {
    localStorage.setItem(DB_KEYS.REVENUES, JSON.stringify(revenues));
  }
};
