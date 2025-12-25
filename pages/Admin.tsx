
import React, { useState, useRef } from 'react';
import { useStore } from '../App';
import { emailService } from '../services/email';
import { 
  BarChart as BarChartIcon, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Plus, 
  Trash2, 
  Edit3, 
  Printer,
  TrendingUp,
  Users,
  Layers,
  Truck,
  X,
  FileText,
  Calendar,
  Loader2,
  Mail,
  Image as ImageIcon,
  Upload,
  QrCode,
  // Fix: Added missing Zap icon import
  Zap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { Product, Order, Expense, Category, Revenue } from '../types';

const roundPrice = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const Admin: React.FC = () => {
  const { 
    products, orders, categories, expenses, revenues, 
    addProduct, updateProduct, deleteProduct, addExpense,
    addCategory, deleteCategory, updateOrderStatus
  } = useStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'finance'>('dashboard');
  const [selectedLabelOrder, setSelectedLabelOrder] = useState<Order | null>(null);
  const [isShippingLoading, setIsShippingLoading] = useState<string | null>(null);
  
  const totalSales = revenues.reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalSales - totalExpenses;

  const salesData = revenues.reduce((acc: any[], rev) => {
    const month = new Date(rev.date).toLocaleDateString('pt-BR', { month: 'short' });
    const existing = acc.find(d => d.name === month);
    if (existing) existing.val += rev.amount;
    else acc.push({ name: month, val: rev.amount });
    return acc;
  }, []).slice(-5);

  const topCustomers = orders.reduce((acc: any[], order) => {
    const existing = acc.find(c => c.name === order.customerName);
    if (existing) existing.value += order.total;
    else acc.push({ name: order.customerName, value: order.total });
    return acc;
  }, []).sort((a, b) => b.value - a.value).slice(0, 5);

  const handleGenerateLabel = (order: Order) => {
    const trackingCode = `NS${Math.random().toString(36).substr(2, 9).toUpperCase()}BR`;
    updateOrderStatus(order.id, order.status, trackingCode);
    setSelectedLabelOrder({ ...order, trackingCode });
  };

  const handleShipOrder = async (order: Order) => {
    if (!order.trackingCode) {
      alert("Gere a etiqueta primeiro para obter o código de rastreio.");
      return;
    }

    setIsShippingLoading(order.id);
    try {
      updateOrderStatus(order.id, 'shipped');
      await emailService.sendShippingUpdate(order);
    } finally {
      setIsShippingLoading(null);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fadeIn">
      <aside className="w-full lg:w-72 space-y-2">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 mb-6 hidden lg:block sticky top-24 shadow-sm">
           <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 px-4">Management Console</h2>
           <div className="space-y-2">
             {[
               { id: 'dashboard', label: 'Dashboard', icon: BarChartIcon },
               { id: 'products', label: 'Catálogo', icon: Package },
               { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
               { id: 'finance', label: 'Financeiro', icon: DollarSign },
             ].map(tab => (
               <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <tab.icon size={20} /> {tab.label}
              </button>
             ))}
           </div>
        </div>
      </aside>

      <div className="flex-grow min-w-0 space-y-10">
        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[
                { label: 'Faturamento', value: `R$ ${totalSales.toLocaleString()}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Lucro Líquido', value: `R$ ${balance.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Ordens de Venda', value: orders.length, icon: ShoppingCart, color: 'text-orange-600', bg: 'bg-orange-50' },
                { label: 'Contas a Pagar', value: `R$ ${totalExpenses.toLocaleString()}`, icon: Trash2, color: 'text-red-600', bg: 'bg-red-50' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm group hover:border-blue-200 transition-all">
                  <div className={`${stat.bg} ${stat.color} w-14 h-14 flex items-center justify-center rounded-2xl mb-6 group-hover:scale-110 transition-transform`}>
                    <stat.icon size={28} strokeWidth={2.5} />
                  </div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-3 mb-10">
                  <TrendingUp size={18} className="text-blue-600" /> Fluxo de Caixa Mensal
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData.length > 0 ? salesData : [{name: 'Empty', val: 0}]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                      <Bar dataKey="val" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-3 mb-10">
                  <Users size={18} className="text-blue-600" /> Distribuição de Receita
                </h3>
                <div className="h-80">
                   <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={topCustomers.length > 0 ? topCustomers : [{name: 'N/A', value: 1}]} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                        {topCustomers.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontWeight: 700}} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <ProductsAndCategories 
            products={products} categories={categories} 
            addProduct={addProduct} updateProduct={updateProduct} 
            deleteProduct={deleteProduct} addCategory={addCategory} 
            deleteCategory={deleteCategory} 
          />
        )}

        {activeTab === 'orders' && (
          <OrdersView 
            orders={orders} 
            isShippingLoading={isShippingLoading}
            onShip={handleShipOrder}
            onGenerateLabel={handleGenerateLabel}
          />
        )}

        {activeTab === 'finance' && (
          <FinanceView expenses={expenses} revenues={revenues} addExpense={addExpense} />
        )}
      </div>

      {/* Professional Shipping Label Modal */}
      {selectedLabelOrder && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-scaleUp no-scrollbar max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50 no-print">
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">Logística Enterprise</h3>
              <button onClick={() => setSelectedLabelOrder(null)} className="p-3 bg-white hover:bg-red-50 hover:text-red-500 rounded-xl transition-all shadow-sm"><X size={24}/></button>
            </div>
            
            <div className="p-10 bg-white" id="shipping-label">
              <div className="border-[3px] border-slate-950 p-6 space-y-6 relative">
                {/* Header Label */}
                <div className="flex justify-between items-center border-b-[3px] border-slate-950 pb-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Remetente</p>
                    <p className="font-black text-sm uppercase">NetStore Pro Logistics</p>
                    <p className="text-[11px] font-medium leading-tight">Av. das Redes, 1024 - Centro Tecnológico<br/>CEP 01234-567 - São Paulo, SP</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <div className="bg-slate-950 text-white px-4 py-2 font-black text-xs uppercase rounded">
                      {selectedLabelOrder.shippingDetails?.service || 'SEDEX'}
                    </div>
                    <Truck size={32} className="text-slate-950" />
                  </div>
                </div>

                {/* Receiver Info */}
                <div className="py-6 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Destinatário</p>
                    <p className="font-black text-2xl uppercase tracking-tight">{selectedLabelOrder.customerName}</p>
                    <div className="text-sm font-bold uppercase space-y-1 pt-2">
                      <p>CEP: {selectedLabelOrder.shippingDetails?.zipCode || '00000-000'}</p>
                      <p>NF-E: {selectedLabelOrder.id}</p>
                      <p>VOL: 01/01</p>
                    </div>
                  </div>
                </div>

                {/* Tracking & Barcode */}
                <div className="bg-slate-50 p-6 border-t-[3px] border-slate-950 text-center space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Rastreamento Internacional</p>
                  <div className="flex flex-col items-center">
                    <div className="h-20 w-full bg-slate-950 mb-2 relative flex items-center justify-center overflow-hidden">
                       {/* Fake SVG Barcode */}
                       <div className="flex w-full h-full">
                         {Array.from({length: 80}).map((_, i) => (
                           <div key={i} className={`h-full bg-white`} style={{ width: `${Math.random() * 4}px`, marginLeft: `${Math.random() * 2}px` }}></div>
                         ))}
                       </div>
                    </div>
                    <p className="text-xl font-mono font-black tracking-[0.4em] pt-2">{selectedLabelOrder.trackingCode}</p>
                  </div>
                </div>

                {/* QR Access */}
                <div className="absolute top-28 right-6 border-2 border-slate-950 p-2">
                   <QrCode size={48} className="text-slate-950" />
                </div>
              </div>
              <div className="mt-4 text-center">
                 <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Etiqueta gerada pelo sistema de gestão NetStore Pro em {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="p-8 bg-slate-50 flex gap-4 no-print">
              <button 
                onClick={() => window.print()}
                className="flex-grow bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-800 shadow-xl transition-all active:scale-95"
              >
                <Printer size={22} /> Imprimir Etiqueta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductsAndCategories: React.FC<any> = ({ 
  products, categories, addProduct, updateProduct, deleteProduct, addCategory, deleteCategory 
}) => {
  const [editing, setEditing] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [loadingImages, setLoadingImages] = useState(false);
  
  const [mainImageBase64, setMainImageBase64] = useState<string | null>(null);
  const [galleryBase64, setGalleryBase64] = useState<string[]>([]);
  
  const mainImageRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0] as File;
      const base64 = await fileToBase64(file);
      setMainImageBase64(base64);
    }
  };

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setLoadingImages(true);
      const filesArray = Array.from(e.target.files).slice(0, 4);
      const promises = filesArray.map(file => fileToBase64(file as File));
      const base64Images = await Promise.all(promises);
      setGalleryBase64(base64Images);
      setLoadingImages(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const rawPrice = parseFloat(formData.get('price') as string);
    const finalPrice = roundPrice(rawPrice);

    const p: Product = {
      id: editing?.id || Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: finalPrice,
      image: mainImageBase64 || editing?.image || 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800',
      category: formData.get('category') as string,
      stock: parseInt(formData.get('stock') as string),
      weightKg: parseFloat(formData.get('weight') as string),
      gallery: galleryBase64.length > 0 ? galleryBase64 : (editing?.gallery || [])
    };
    
    if (editing) updateProduct(p);
    else addProduct(p);
    
    resetForm();
  };

  const resetForm = () => {
    setEditing(null);
    setIsAdding(false);
    setMainImageBase64(null);
    setGalleryBase64([]);
  };

  const startEditing = (p: Product) => {
    setEditing(p);
    setMainImageBase64(null);
    setGalleryBase64(p.gallery || []);
    setIsAdding(false);
  };

  return (
    <div className="space-y-10">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-3 mb-8">
          <Layers size={18} className="text-blue-600" /> Departamentos
        </h2>
        <div className="flex gap-4 mb-8">
          <input 
            type="text" placeholder="Nome da nova categoria..." 
            className="flex-grow p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
          />
          <button 
            onClick={() => { if(newCatName) addCategory({id: Math.random().toString(), name: newCatName}); setNewCatName(''); }}
            className="bg-slate-900 text-white px-10 rounded-2xl font-black text-sm uppercase hover:bg-slate-800 transition-all active:scale-95"
          >
            Adicionar
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {categories.map((cat: Category) => (
            <div key={cat.id} className="bg-slate-50 border border-slate-200 px-5 py-3 rounded-2xl flex items-center gap-4 text-xs font-black text-slate-700">
              {cat.name}
              <button onClick={() => deleteCategory(cat.id)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={16}/></button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">
            <Package size={20} className="text-blue-600" /> Inventário de Equipamentos
          </h2>
          <button onClick={() => { resetForm(); setIsAdding(true); }} className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm uppercase flex items-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
            <Plus size={20}/> Novo Item
          </button>
        </div>

        {(isAdding || editing) && (
          <form onSubmit={handleProductSubmit} className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-200 mb-10 grid grid-cols-1 md:grid-cols-2 gap-8 animate-slideDown">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Nome do Equipamento</label>
              <input name="name" defaultValue={editing?.name} required className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Departamento</label>
              <select name="category" defaultValue={editing?.category} className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold">
                {categories.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Especificações e Detalhes</label>
              <textarea name="description" defaultValue={editing?.description} className="w-full p-4 rounded-2xl border border-slate-200 h-32 focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 md:col-span-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Preço (R$)</label>
                <input name="price" type="number" step="0.01" defaultValue={editing?.price} required className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-black text-blue-600 text-lg" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Qtd. Estoque</label>
                <input name="stock" type="number" defaultValue={editing?.stock} required className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Peso Un. (Kg)</label>
                <input name="weight" type="number" step="0.1" defaultValue={editing?.weightKg} required className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Visual Principal</label>
              <div className="flex gap-4 items-center">
                <button 
                  type="button"
                  onClick={() => mainImageRef.current?.click()}
                  className="flex items-center gap-3 bg-white border border-slate-200 px-6 py-4 rounded-2xl text-xs font-black uppercase text-slate-600 hover:bg-slate-100 transition-all"
                >
                  <Upload size={18} /> Upload Imagem
                </button>
                <input ref={mainImageRef} type="file" accept="image/*" className="hidden" onChange={handleMainImageChange} />
                { (mainImageBase64 || editing?.image) && (
                  <img src={mainImageBase64 || editing?.image} className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-lg" alt="Preview" />
                ) }
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-3 px-1">
                <ImageIcon size={18} /> Galeria Complementar (Máx 4)
              </label>
              <div className="flex flex-wrap gap-5">
                <button 
                  type="button"
                  onClick={() => galleryRef.current?.click()}
                  className="flex flex-col items-center justify-center w-28 h-28 border-3 border-dashed border-slate-200 rounded-[2rem] hover:border-blue-500 hover:bg-blue-50 transition-all text-slate-300 group"
                >
                  <Plus size={32} className="group-hover:text-blue-500 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-black uppercase mt-1">Mídia</span>
                </button>
                <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryChange} />
                
                {loadingImages ? (
                  <div className="w-28 h-28 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
                ) : (
                  galleryBase64.map((img, idx) => (
                    <div key={idx} className="relative group w-28 h-28">
                      <img src={img} className="w-28 h-28 rounded-[2rem] object-cover border-2 border-white shadow-md" alt="Gallery preview" />
                      <button 
                        type="button"
                        onClick={() => setGalleryBase64(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-5 border-t border-slate-200 pt-8 mt-4">
              <button type="button" onClick={resetForm} className="font-black text-sm uppercase text-slate-400 hover:text-slate-600 px-6">Cancelar</button>
              <button type="submit" className="bg-slate-900 text-white px-16 py-5 rounded-2xl font-black text-sm uppercase shadow-2xl hover:bg-slate-800 transition-all active:scale-95">
                Salvar no Catálogo
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-y">
              <tr>
                <th className="px-8 py-5">Equipamento</th>
                <th className="px-8 py-5">Preço Unitário</th>
                <th className="px-8 py-5">Disponibilidade</th>
                <th className="px-8 py-5 text-right">Controles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p: Product) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img src={p.image} className="w-12 h-12 rounded-xl object-cover border shadow-sm" alt={p.name} />
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900">{p.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{p.category}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-black text-slate-700">R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${p.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {p.stock} UN
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right space-x-1">
                    <button onClick={() => startEditing(p)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Editar"><Edit3 size={18}/></button>
                    <button onClick={() => deleteProduct(p.id)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Excluir"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const OrdersView: React.FC<any> = ({ orders, isShippingLoading, onShip, onGenerateLabel }) => {
  return (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
      <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-3 mb-10">
        <ShoppingCart size={20} className="text-blue-600" /> Ordens Ativas
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-y">
            <tr>
              <th className="px-8 py-5">Identificador / Cliente</th>
              <th className="px-8 py-5">Status Logístico</th>
              <th className="px-8 py-5">Montante</th>
              <th className="px-8 py-5 text-right">Fluxo de Despacho</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((o: Order) => (
              <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6">
                  <p className="font-black text-slate-900 text-base">#{o.id}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{o.customerName}</p>
                </td>
                <td className="px-8 py-6 space-y-2">
                  <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${o.status === 'paid' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'}`}>
                    {o.status === 'paid' ? 'Pago' : 'Despachado'}
                  </span>
                  {o.trackingCode && (
                    <div className="flex items-center gap-2 text-[10px] font-mono font-black text-slate-500 bg-slate-100 p-2 rounded-lg w-fit">
                      <Truck size={12}/> {o.trackingCode}
                    </div>
                  )}
                </td>
                <td className="px-8 py-6 font-black text-slate-900 text-lg">R$ {o.total.toLocaleString()}</td>
                <td className="px-8 py-6 text-right space-x-3">
                  {o.status === 'paid' && (
                    <>
                      <button 
                        onClick={() => onGenerateLabel(o)} 
                        className="p-4 text-slate-600 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 hover:border-slate-300 transition-all shadow-sm" 
                        title="Gerar Etiqueta Profissional"
                      >
                        <FileText size={20}/>
                      </button>
                      <button 
                        onClick={() => onShip(o)} 
                        disabled={isShippingLoading === o.id || !o.trackingCode}
                        className={`p-4 rounded-2xl transition-all ${!o.trackingCode ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200' : 'bg-slate-900 text-white hover:bg-black shadow-xl active:scale-95'}`}
                        title={o.trackingCode ? "Confirmar Envio & Notificar" : "Aguardando Etiqueta"}
                      >
                        {isShippingLoading === o.id ? <Loader2 size={20} className="animate-spin" /> : <Truck size={20}/>}
                      </button>
                    </>
                  )}
                  {o.status === 'shipped' && (
                    <div className="flex items-center justify-end gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest pr-4">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                      Cliente Notificado
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={4} className="p-20 text-center text-slate-400 font-bold italic text-lg">Nenhuma ordem registrada no momento.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="mt-8 flex items-center gap-3 bg-blue-50 p-5 rounded-2xl border border-blue-100">
         {/* Fix: Added missing Zap icon import in lucide-react block above */}
         <Zap size={20} className="text-blue-600" />
         <p className="text-xs font-bold text-blue-900 uppercase tracking-tight italic">Fluxo Recomendado: Gerar Etiqueta -> Imprimir -> Colar no Pacote -> Confirmar Envio (Notificação Resend Automática)</p>
      </div>
    </div>
  );
};

const FinanceView: React.FC<any> = ({ expenses, revenues, addExpense }) => {
  const [isAdding, setIsAdding] = useState(false);
  const totalRevenues = revenues.reduce((s, r) => s + r.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-10 rounded-[3rem] text-white shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
           <div className="absolute -right-10 -top-10 text-white/10 group-hover:scale-125 transition-transform duration-700"><TrendingUp size={200} /></div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-4">Receita Acumulada</p>
           <p className="text-5xl font-black tracking-tighter">R$ {totalRevenues.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-700 p-10 rounded-[3rem] text-white shadow-2xl shadow-red-500/20 relative overflow-hidden group">
           <div className="absolute -right-10 -top-10 text-white/10 group-hover:scale-125 transition-transform duration-700"><DollarSign size={200} /></div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-4">Despesas Operacionais</p>
           <p className="text-5xl font-black tracking-tighter">R$ {totalExpenses.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Extrato Geral de Movimentações</h2>
          <button onClick={() => setIsAdding(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl active:scale-95"><Plus size={18}/> Lançar Saída</button>
        </div>
        {isAdding && (
          <form onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            addExpense({id: Math.random().toString(), description: f.get('desc') as string, amount: parseFloat(f.get('val') as string), date: new Date().toISOString(), category: 'Geral'});
            setIsAdding(false);
          }} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200 mb-10 flex flex-col md:flex-row gap-5 animate-slideDown shadow-inner">
            <input name="desc" placeholder="Finalidade do gasto..." required className="flex-grow p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
            <input name="val" type="number" step="0.01" placeholder="Valor R$" required className="w-full md:w-56 p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-black text-red-600" />
            <button type="submit" className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-black uppercase text-xs hover:bg-blue-700 transition-all shadow-lg">Processar</button>
          </form>
        )}
        <div className="space-y-4">
          {[...expenses.map(e => ({...e, type: 'out'})), ...revenues.map(r => ({...r, description: `Receita Ordem #${r.orderId}`, type: 'in'}))]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((item: any) => (
              <div key={item.id} className="flex justify-between items-center p-6 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 hover:shadow-md transition-all">
                <div className="flex items-center gap-5">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.type === 'in' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {item.type === 'in' ? <TrendingUp size={20}/> : <DollarSign size={20}/>}
                   </div>
                   <div>
                     <p className="font-black text-slate-900">{item.description}</p>
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2"><Calendar size={14}/> {new Date(item.date).toLocaleDateString('pt-BR', {day: '2-digit', month: 'long', year: 'numeric'})}</p>
                   </div>
                </div>
                <span className={`font-black text-xl tracking-tighter ${item.type === 'in' ? 'text-emerald-600' : 'text-red-600'}`}>{item.type === 'in' ? '+' : '-'} R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
