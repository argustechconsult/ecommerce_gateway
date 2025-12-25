
import React, { useState, useEffect, createContext, useContext } from 'react';
import { Product, Category, Order, CartItem, User, Expense, Revenue, Toast } from './types';
import { storage } from './services/storage';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Admin } from './pages/Admin';
import { Checkout } from './pages/Checkout';
import { CheckCircle, X, ShoppingBag } from 'lucide-react';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  orders: Order[];
  cart: CartItem[];
  user: User | null;
  expenses: Expense[];
  revenues: Revenue[];
  search: string;
  setSearch: (s: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  updateQuantity: (productId: string, quantity: number) => void;
  login: (user: User) => void;
  logout: () => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;
  addOrder: (order: Order) => void;
  addExpense: (expense: Expense) => void;
  updateOrderStatus: (id: string, status: Order['status'], trackingCode?: string) => void;
  addToast: (message: string, type: Toast['type'], productImage?: string) => void;
  view: 'home' | 'admin' | 'checkout';
  setView: (v: 'home' | 'admin' | 'checkout') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(storage.getProducts());
  const [categories, setCategories] = useState<Category[]>(storage.getCategories());
  const [orders, setOrders] = useState<Order[]>(storage.getOrders());
  const [expenses, setExpenses] = useState<Expense[]>(storage.getExpenses());
  const [revenues, setRevenues] = useState<Revenue[]>(storage.getRevenues());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'home' | 'admin' | 'checkout'>('home');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    storage.saveProducts(products);
    storage.saveCategories(categories);
    storage.saveOrders(orders);
    storage.saveExpenses(expenses);
    storage.saveRevenues(revenues);
  }, [products, categories, orders, expenses, revenues]);

  const addToast = (message: string, type: Toast['type'], productImage?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { id, message, type, productImage };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    addToast(`${product.name} adicionado ao carrinho!`, 'success', product.image);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    if (quantity > product.stock) quantity = product.stock;
    setCart(prev => prev.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCart([]);

  const login = (userData: User) => {
    setUser(userData);
    if (userData.role === 'admin') {
      setView('admin');
    }
  };

  const logout = () => {
    setUser(null);
    setView('home');
  };

  const addProduct = (p: Product) => setProducts([...products, p]);
  const updateProduct = (p: Product) => setProducts(products.map(item => item.id === p.id ? p : item));
  const deleteProduct = (id: string) => setProducts(products.filter(p => p.id !== id));
  
  const addCategory = (c: Category) => setCategories([...categories, c]);
  const deleteCategory = (id: string) => setCategories(categories.filter(c => c.id !== id));
  
  const addOrder = (o: Order) => {
    setProducts(currentProducts => currentProducts.map(p => {
      const orderItem = o.items.find(item => item.product.id === p.id);
      if (orderItem) {
        return { ...p, stock: Math.max(0, p.stock - orderItem.quantity) };
      }
      return p;
    }));
    setOrders(prev => [...prev, o]);
    const newRevenue: Revenue = {
      id: Math.random().toString(36).substr(2, 9),
      orderId: o.id,
      amount: o.total,
      date: new Date().toISOString()
    };
    setRevenues(prev => [...prev, newRevenue]);
  };

  const updateOrderStatus = (id: string, status: Order['status'], trackingCode?: string) => {
    setOrders(prevOrders => prevOrders.map(o => 
      o.id === id ? { ...o, status, trackingCode: trackingCode || o.trackingCode } : o
    ));
  };

  const addExpense = (e: Expense) => setExpenses([...expenses, e]);

  return (
    <StoreContext.Provider value={{
      products, categories, orders, cart, user, expenses, revenues,
      search, setSearch, selectedCategory, setSelectedCategory,
      addToCart, removeFromCart, clearCart, updateQuantity, login, logout,
      addProduct, updateProduct, deleteProduct, addCategory, deleteCategory, addOrder,
      addExpense, updateOrderStatus, addToast, view, setView
    }}>
      <div className="min-h-screen flex flex-col relative">
        <Navbar currentView={view} setView={setView} />
        <main className="flex-grow container mx-auto px-4 py-8">
          {view === 'home' && <Home />}
          {view === 'admin' && <Admin />}
          {view === 'checkout' && <Checkout onComplete={() => setView('home')} />}
        </main>
        
        {/* Toast Notification Container */}
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 max-w-sm w-full">
          {toasts.map(toast => (
            <div 
              key={toast.id}
              className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 flex items-center gap-4 animate-slideInRight overflow-hidden relative group"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
              {toast.productImage && (
                <img src={toast.productImage} className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm" alt="Product" />
              )}
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-0.5">
                  <CheckCircle size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Sucesso</span>
                </div>
                <p className="text-sm font-bold text-slate-900 leading-tight">{toast.message}</p>
                <button 
                  onClick={() => setView('checkout')}
                  className="mt-2 text-[10px] font-black uppercase text-blue-600 flex items-center gap-1 hover:text-blue-700 transition-colors"
                >
                  Ver Carrinho <ShoppingBag size={12} />
                </button>
              </div>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="p-1 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-all"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <footer className="bg-slate-900 text-slate-400 py-12">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2024 NetStore Pro. Soluções em Redes de Alta Performance.</p>
          </div>
        </footer>
      </div>
    </StoreContext.Provider>
  );
};

export default App;
