
import React, { useState, useEffect } from 'react';
import { useStore } from '../App';
import { 
  ShoppingCart, 
  LogOut, 
  LayoutDashboard, 
  ShieldCheck, 
  User as UserIcon, 
  X, 
  Lock, 
  Search, 
  Menu,
  ChevronDown,
  Store,
  Globe,
  Layers
} from 'lucide-react';

// Fix: Augment the Window interface to include the 'google' property
declare global {
  interface Window {
    google: any;
  }
}

interface NavbarProps {
  currentView: 'home' | 'admin' | 'checkout';
  setView: (view: 'home' | 'admin' | 'checkout') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const { 
    cart, user, logout, login, search, setSearch, categories, selectedCategory, setSelectedCategory 
  } = useStore();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID",
        callback: (resp: any) => {
          login({
            id: 'google-user',
            name: 'Usuário Google',
            email: 'google@email.com',
            picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google',
            role: 'customer'
          });
          setShowLoginModal(false);
        }
      });
    }
  }, [login]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      login({
        id: 'admin-1',
        name: 'Administrador NetStore',
        email: 'admin@netstorepro.com',
        picture: `https://api.dicebear.com/7.x/initials/svg?seed=AD`,
        role: 'admin'
      });
      setShowLoginModal(false);
    } else if (username === 'user' && password === 'user') {
      login({
        id: 'user-1',
        name: 'Cliente NetStore',
        email: 'cliente@email.com',
        picture: `https://api.dicebear.com/7.x/initials/svg?seed=CL`,
        role: 'customer'
      });
      setShowLoginModal(false);
    } else {
      setError('Acesso negado.');
    }
  };

  const handleCatClick = (catName: string) => {
    setSelectedCategory(catName);
    setShowMobileMenu(false);
    setView('home');
  };

  return (
    <>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        {/* Main Nav Bar */}
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => setView('home')}>
            <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-100">
              <ShieldCheck size={24} />
            </div>
            <span className="font-black text-xl text-slate-900 tracking-tighter">NetStore<span className="text-blue-600">Pro</span></span>
          </div>

          <div className="flex-grow max-w-xl relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" placeholder="Buscar equipamentos de rede..."
              className="w-full pl-11 pr-4 py-3 bg-slate-100 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-all"
              value={search} onChange={(e) => { setSearch(e.target.value); if(currentView !== 'home') setView('home'); }}
            />
          </div>

          <div className="flex items-center gap-3">
            {user?.role === 'admin' && (
              <button 
                onClick={() => setView(currentView === 'admin' ? 'home' : 'admin')}
                className={`p-2.5 rounded-xl transition-all ${currentView === 'admin' ? 'bg-orange-600 text-white' : 'bg-slate-900 text-white'}`}
                title="Painel Administrativo"
              >
                {currentView === 'admin' ? <Store size={20} /> : <LayoutDashboard size={20} />}
              </button>
            )}

            <button onClick={() => setView('checkout')} className="relative p-2.5 text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
              <ShoppingCart size={22} />
              {cartCount > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{cartCount}</span>}
            </button>

            {user ? (
              <div className="flex items-center gap-2 pl-3 border-l border-slate-100">
                <img src={user.picture} className="w-9 h-9 rounded-full border border-slate-200" />
                <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><LogOut size={20} /></button>
              </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                <UserIcon size={22} />
              </button>
            )}
            
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-2 text-slate-600"><Menu size={24} /></button>
          </div>
        </div>

        {/* Categories Bar (Visible when not in admin view) */}
        {currentView !== 'admin' && (
          <div className="bg-slate-50 border-t border-slate-100 hidden md:block overflow-hidden">
            <div className="container mx-auto px-4 h-11 flex items-center">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
                <button 
                  onClick={() => handleCatClick('All')}
                  className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${selectedCategory === 'All' ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'text-slate-500 hover:text-blue-600 hover:bg-white'}`}
                >
                  Todos
                </button>
                <div className="w-px h-4 bg-slate-200 mx-2"></div>
                {categories.map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => handleCatClick(cat.name)}
                    className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${selectedCategory === cat.name ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'text-slate-500 hover:text-blue-600 hover:bg-white'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-[60] bg-white animate-fadeIn md:hidden">
          <div className="p-4 border-b flex justify-between items-center">
             <span className="font-black text-xl text-slate-900">Menu</span>
             <button onClick={() => setShowMobileMenu(false)} className="p-2 text-slate-600"><X size={24} /></button>
          </div>
          <div className="p-6 space-y-8">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categorias</h3>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => handleCatClick('All')}
                  className={`w-full text-left p-4 rounded-2xl font-bold flex items-center justify-between ${selectedCategory === 'All' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-50 text-slate-600'}`}
                >
                  Todos os Produtos <ChevronDown size={16} className="-rotate-90" />
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => handleCatClick(cat.name)}
                    className={`w-full text-left p-4 rounded-2xl font-bold flex items-center justify-between ${selectedCategory === cat.name ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-50 text-slate-600'}`}
                  >
                    {cat.name} <ChevronDown size={16} className="-rotate-90" />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="pt-8 border-t border-slate-100 space-y-4">
              <button 
                onClick={() => { setShowMobileMenu(false); setView('checkout'); }}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} /> Ver Carrinho ({cartCount})
              </button>
              {!user && (
                <button 
                  onClick={() => { setShowMobileMenu(false); setShowLoginModal(true); }}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold"
                >
                  Entrar / Cadastrar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-scaleUp">
            <div className="p-8 text-center space-y-4">
              <button onClick={() => setShowLoginModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"><X size={24} /></button>
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-blue-600">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Bem-vindo à NetStore</h2>
              <p className="text-slate-500 text-sm">Acesse sua conta para gerenciar seus pedidos e infraestrutura.</p>
            </div>

            <div className="px-8 pb-8 space-y-4">
              <button 
                onClick={() => {
                   login({ id: 'g-1', name: 'Cliente Google', email: 'google@test.com', picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google', role: 'customer' });
                   setShowLoginModal(false);
                }}
                className="w-full flex items-center justify-center gap-3 py-4 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-600"
              >
                <Globe size={18} className="text-blue-500" /> Entrar com Google
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-[10px] font-black uppercase text-slate-300">ou use credenciais</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              <form onSubmit={handleManualLogin} className="space-y-4">
                {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                <div className="space-y-1">
                  <input 
                    type="text" placeholder="Usuário (admin ou user)" required
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                    value={username} onChange={e => setUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <input 
                    type="password" placeholder="Senha" required
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                    value={password} onChange={e => setPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98]">
                  Acessar Painel
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
