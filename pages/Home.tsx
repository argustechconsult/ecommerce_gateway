
import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../App';
import { 
  Package, 
  ChevronRight, 
  ShoppingCart, 
  X, 
  ArrowRight, 
  ChevronLeft,
  Zap,
  ShieldCheck,
  Server,
  Truck,
  FileText
} from 'lucide-react';
import { Product } from '../types';

const PROMO_SLIDES = [
  {
    id: 1,
    title: "Performance Enterprise: Switches L3",
    subtitle: "Gerenciamento avançado e PoE+ para infraestruturas de alto desempenho. Até 40% OFF.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=1600",
    cta: "Ver Ofertas",
    category: "Switches",
    accent: "from-blue-600 via-blue-900 to-slate-900"
  },
  {
    id: 2,
    title: "Wi-Fi 6: A Era da Velocidade",
    subtitle: "Conectividade sem gargalos para múltiplos dispositivos. Soluções Mesh profissionais.",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=1600",
    cta: "Explorar Wireless",
    category: "Roteadores",
    accent: "from-slate-800 via-indigo-950 to-black"
  },
  {
    id: 3,
    title: "Rack & Data Center: Soluções",
    subtitle: "Acessórios, patch panels e cabeamento blindado para projetos de missão crítica.",
    image: "https://images.unsplash.com/photo-1516315139561-9991ff326993?auto=format&fit=crop&q=80&w=1600",
    cta: "Ver Acessórios",
    category: "Cabos e Acessórios",
    accent: "from-blue-900 via-slate-900 to-black"
  }
];

export const Home: React.FC = () => {
  const { products, addToCart, search, setSearch, selectedCategory, setSelectedCategory } = useStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + PROMO_SLIDES.length) % PROMO_SLIDES.length);
  };

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setActiveImage(product.image);
    setSelectedVariant(product.variants?.[0] || '');
  };

  const handleCtaClick = (category: string) => {
    setSelectedCategory(category);
    const element = document.getElementById('catalog-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-16 animate-fadeIn pb-24">
      
      {/* Enhanced Promo Carousel */}
      <section 
        className="relative h-[500px] md:h-[650px] w-full rounded-[3rem] overflow-hidden group shadow-2xl bg-slate-950"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {PROMO_SLIDES.map((slide, index) => (
          <div 
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'}`}
          >
            {/* Image Layer */}
            <div className="absolute inset-0">
              <img 
                src={slide.image} 
                alt={slide.title} 
                className={`w-full h-full object-cover transition-transform duration-[10s] ease-linear ${index === currentSlide ? 'scale-110' : 'scale-100'}`} 
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.accent} opacity-80 mix-blend-multiply`}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
            </div>

            {/* Content Layer */}
            <div className="absolute inset-0 flex items-center px-10 md:px-24">
              <div className="max-w-4xl space-y-8">
                <div className={`inline-flex items-center gap-3 bg-blue-500/20 backdrop-blur-xl border border-blue-400/30 px-5 py-2 rounded-full text-blue-200 text-xs font-black uppercase tracking-[0.25em] shadow-lg transition-all duration-1000 delay-300 ${index === currentSlide ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                  <Zap size={16} className="text-yellow-400 fill-yellow-400" /> Destaque do Mês
                </div>
                
                <h2 className={`text-5xl md:text-8xl font-black text-white leading-[1.05] tracking-tight transition-all duration-1000 delay-500 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                  {slide.title.split(':').map((part, i) => (
                    <span key={i} className={i > 0 ? 'text-blue-500 block' : 'block'}>{part.trim()}</span>
                  ))}
                </h2>
                
                <p className={`text-slate-200/90 text-xl md:text-2xl max-w-2xl font-medium transition-all duration-1000 delay-700 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                  {slide.subtitle}
                </p>

                <div className={`flex flex-wrap gap-5 pt-4 transition-all duration-1000 delay-[900ms] ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                  <button 
                    onClick={() => handleCtaClick(slide.category)}
                    className="bg-white text-slate-950 px-12 py-5 rounded-[2rem] font-black text-lg flex items-center gap-3 hover:bg-blue-600 hover:text-white transition-all shadow-2xl hover:shadow-blue-500/40 active:scale-95 group/btn"
                  >
                    {slide.cta} <ArrowRight size={22} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Progress Bar Container */}
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/5 z-20">
          <div 
            className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] transition-all duration-[7000ms] linear"
            key={currentSlide}
            style={{ width: isPaused ? '0%' : '100%' }}
          ></div>
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-12 right-12 flex items-center gap-4 z-30">
          <button 
            onClick={prevSlide}
            className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-2xl flex items-center justify-center hover:bg-white hover:text-slate-950 transition-all active:scale-90 group"
          >
            <ChevronLeft size={30} />
          </button>
          <div className="flex gap-2.5">
            {PROMO_SLIDES.map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2.5 rounded-full transition-all duration-700 ${currentSlide === i ? 'w-10 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'w-2.5 bg-white/20 hover:bg-white/40'}`}
              />
            ))}
          </div>
          <button 
            onClick={nextSlide}
            className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-2xl flex items-center justify-center hover:bg-white hover:text-slate-950 transition-all active:scale-90"
          >
            <ChevronRight size={30} />
          </button>
        </div>
      </section>

      {/* Trust Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {[
          { label: 'Projetos de Rede', value: '15.000+', icon: Server, color: 'text-blue-500', bg: 'bg-blue-50/50' },
          { label: 'Uptime Garantido', value: '99.9%', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50/50' },
          { label: 'Garantia Enterprise', value: '12 Meses', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50/50' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all">
            <div className={`w-20 h-20 rounded-3xl ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
              <item.icon size={36} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{item.value}</p>
              <p className="text-xs font-black uppercase text-slate-400 tracking-widest">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Product List Header */}
      <div id="catalog-section" className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-10 px-4">
        <div className="space-y-2">
          <h3 className="text-4xl font-black text-slate-900 tracking-tight">Equipamentos Profissionais</h3>
          <p className="text-slate-500 font-medium text-lg">Selecione as melhores ferramentas para sua infraestrutura.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-2 rounded-[1.5rem] flex gap-2">
             <button 
                onClick={() => setSelectedCategory('All')}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${selectedCategory === 'All' ? 'bg-white text-blue-600 shadow-lg shadow-blue-100' : 'text-slate-500 hover:text-slate-800'}`}
             >
               Todos
             </button>
             {['Switches', 'Roteadores', 'Access Points'].map(cat => (
               <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${selectedCategory === cat ? 'bg-white text-blue-600 shadow-lg shadow-blue-100' : 'text-slate-500 hover:text-slate-800'}`}
               >
                 {cat}
               </button>
             ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 px-4">
        {filteredProducts.map(product => (
          <div 
            key={product.id} 
            className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden group hover:shadow-2xl hover:shadow-blue-900/10 transition-all hover:-translate-y-3 cursor-pointer flex flex-col p-3"
            onClick={() => openProductDetails(product)}
          >
            <div className="aspect-[1/1] overflow-hidden bg-slate-50 rounded-[2rem] relative">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-md text-blue-700 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border border-white">
                {product.category}
              </div>
              {product.stock < 10 && (
                <div className="absolute bottom-5 right-5 bg-red-500 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase animate-pulse shadow-lg">
                  Estoque Crítico
                </div>
              )}
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <h4 className="font-black text-slate-900 text-xl mb-2 truncate group-hover:text-blue-600 transition-colors">{product.name}</h4>
              <p className="text-slate-400 text-sm mb-8 line-clamp-2 h-10 font-medium leading-relaxed">{product.description}</p>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Investimento</span>
                  <span className="text-3xl font-black text-slate-900">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product);
                  }}
                  className="bg-slate-900 p-5 rounded-2xl text-white hover:bg-blue-600 transition-all active:scale-90 shadow-xl shadow-slate-200"
                >
                  <ShoppingCart size={24} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-40 text-center animate-fadeIn bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="bg-slate-50 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
              <Package size={64} />
            </div>
            <h4 className="text-2xl font-black text-slate-900">Nenhum equipamento encontrado</h4>
            <p className="text-slate-400 font-medium max-w-sm mx-auto mt-3">Ajuste seus filtros ou tente uma nova busca para encontrar o que precisa.</p>
            <button onClick={() => { setSearch(''); setSelectedCategory('All'); }} className="mt-10 bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase hover:bg-blue-600 transition-all shadow-lg">Limpar Filtros</button>
          </div>
        )}
      </div>

      {/* Detail Modal (Glassmorphism & High End) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-slate-950/80 backdrop-blur-2xl animate-fadeIn">
          <div className="bg-white w-full max-w-7xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-scaleUp max-h-[95vh]">
            <button 
              onClick={() => setSelectedProduct(null)} 
              className="absolute top-10 right-10 z-20 p-4 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full text-slate-900 shadow-xl transition-all active:scale-90"
            >
              <X size={28} />
            </button>

            {/* Visuals */}
            <div className="w-full md:w-1/2 p-10 bg-slate-50 flex flex-col h-full border-r border-slate-100">
              <div className="flex-grow flex items-center justify-center bg-white rounded-[3rem] overflow-hidden border border-slate-200 mb-8 shadow-inner relative">
                <img src={activeImage} alt={selectedProduct.name} className="max-w-[90%] max-h-[500px] object-contain p-10 animate-fadeIn" key={activeImage} />
                <div className="absolute top-8 left-8 flex flex-col gap-3">
                   <div className="bg-emerald-500 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                     <ShieldCheck size={14} /> Garantia Vitalícia
                   </div>
                </div>
              </div>
              <div className="flex gap-4 overflow-x-auto py-2 no-scrollbar px-2">
                {[selectedProduct.image, ...(selectedProduct.gallery || [])].map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`flex-shrink-0 w-28 h-28 rounded-[2rem] overflow-hidden border-4 transition-all ${activeImage === img ? 'border-blue-600 shadow-2xl shadow-blue-500/20 scale-95' : 'border-white hover:border-blue-200'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="w-full md:w-1/2 p-12 md:p-20 overflow-y-auto custom-scrollbar bg-white">
              <div className="space-y-10">
                <div className="space-y-4">
                  <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] bg-blue-50 px-6 py-2 rounded-full border border-blue-100 inline-block">{selectedProduct.category}</span>
                  <h2 className="text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">{selectedProduct.name}</h2>
                </div>

                <div className="flex items-center gap-6">
                  <div className="bg-slate-950 px-8 py-5 rounded-[2.5rem] shadow-2xl shadow-slate-900/20">
                    <span className="text-[10px] text-slate-400 font-black uppercase block mb-1 tracking-widest">Preço Enterprise</span>
                    <span className="text-5xl font-black text-white tracking-tighter">R$ {selectedProduct.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-lg line-through font-bold">R$ {(selectedProduct.price * 1.3).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <span className="text-blue-600 text-sm font-black uppercase tracking-wider">Desconto Corporativo Ativo</span>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                    <FileText size={18} className="text-blue-600" /> Descrição Técnica
                  </h4>
                  <p className="text-slate-600 leading-relaxed text-lg font-medium">
                    {selectedProduct.description}
                  </p>
                </div>

                {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                  <div className="space-y-5">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Escolha a Configuração</h4>
                    <div className="flex flex-wrap gap-4">
                      {selectedProduct.variants.map((v, i) => (
                        <button 
                          key={i}
                          onClick={() => setSelectedVariant(v)}
                          className={`px-8 py-4 rounded-2xl border-2 text-sm font-black transition-all ${selectedVariant === v ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-xl shadow-blue-500/10 scale-105' : 'border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-200'}`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6 py-8 border-y border-slate-100">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Disponibilidade</span>
                    <div className="flex items-center gap-2">
                       <div className={`w-3 h-3 rounded-full ${selectedProduct.stock > 0 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>
                       <span className="text-lg font-black text-slate-900">{selectedProduct.stock > 0 ? `${selectedProduct.stock} Unid. em Estoque` : 'Indisponível'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Logística Expressa</span>
                    <div className="flex items-center gap-2">
                       <Truck size={20} className="text-blue-600" />
                       <span className="text-lg font-black text-slate-900">Entrega em 24h</span>
                    </div>
                  </div>
                </div>

                <button 
                  disabled={selectedProduct.stock === 0}
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="w-full bg-blue-600 text-white py-8 rounded-[2.5rem] font-black text-2xl hover:bg-blue-700 shadow-2xl shadow-blue-600/30 transition-all flex items-center justify-center gap-5 active:scale-[0.98] disabled:bg-slate-200 disabled:shadow-none"
                >
                  <ShoppingCart size={32} />
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
