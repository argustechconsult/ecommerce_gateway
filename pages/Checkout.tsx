
import React, { useState, useEffect } from 'react';
import { useStore } from '../App';
import { calculateShipping } from '../services/shipping';
import { emailService } from '../services/email';
import { 
  ShoppingCart, 
  Truck, 
  CreditCard, 
  ChevronLeft, 
  CheckCircle, 
  Package, 
  User as UserIcon, 
  Lock, 
  Trash2, 
  Printer, 
  ArrowLeft, 
  Mail,
  Loader2,
  ShieldCheck as ShieldIcon
} from 'lucide-react';
import { ShippingInfo, Order } from '../types';

export const Checkout: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { cart, updateQuantity, removeFromCart, addOrder, clearCart, user, login } = useStore();
  const [zipCode, setZipCode] = useState('');
  const [shipping, setShipping] = useState<ShippingInfo | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [step, setStep] = useState<'cart' | 'payment' | 'success'>('cart');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  
  // Login states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Payment form states
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Auto-fill payment info for mock customer
  useEffect(() => {
    if (user?.role === 'customer' && step === 'payment') {
      setCardName(user.name);
      setCardNumber('4242 4242 4242 4242');
      setCardExpiry('12/28');
      setCardCvv('123');
    }
  }, [user, step]);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalWeight = cart.reduce((sum, item) => sum + item.product.weightKg * item.quantity, 0);
  const total = subtotal + (shipping?.cost || 0);

  const handleCalcShipping = async () => {
    if (zipCode.length < 8) return;
    setLoadingShipping(true);
    try {
      const res = await calculateShipping(zipCode, totalWeight);
      setShipping(res);
    } finally {
      setLoadingShipping(false);
    }
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      login({
        id: 'admin-1',
        name: 'Administrador NetStore',
        email: 'admin@netstorepro.com',
        picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        role: 'admin'
      });
      setError('');
    } else if (username === 'user' && password === 'user') {
      login({
        id: 'user-1',
        name: 'Cliente NetStore',
        email: 'cliente@exemplo.com.br',
        picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
        role: 'customer'
      });
      setError('');
    } else {
      setError('Credenciais inválidas.');
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) {
      alert("Erro: E-mail do cliente não identificado.");
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      customerName: user.name,
      customerEmail: user.email,
      items: [...cart],
      total: total,
      status: 'paid',
      date: new Date().toISOString(),
      shippingDetails: shipping || undefined
    };

    setLastOrder(newOrder);
    addOrder(newOrder);
    clearCart();
    
    setIsProcessing(false);
    setSendingEmail(true);
    await emailService.sendOrderConfirmation(newOrder);
    setSendingEmail(false);
    
    setStep('success');
  };

  const handlePrint = () => {
    window.print();
  };

  if (cart.length === 0 && step !== 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
        <div className="bg-slate-100 p-8 rounded-full mb-6">
          <ShoppingCart size={48} className="text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h2>
        <p className="text-slate-500 mb-8">Adicione alguns equipamentos para continuar.</p>
        <button onClick={onComplete} className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold">Voltar à Loja</button>
      </div>
    );
  }

  if (sendingEmail) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fadeIn space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <Mail className="absolute inset-0 m-auto text-blue-600" size={32} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-900">Finalizando tudo...</h2>
          <p className="text-slate-500 font-medium">Enviando seu comprovante por e-mail via Resend.</p>
        </div>
      </div>
    );
  }

  if (step === 'success' && lastOrder) {
    return (
      <div className="max-w-xl mx-auto py-10 animate-fadeIn print:py-0">
        <div className="text-center mb-8 print:hidden">
          <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Pagamento Confirmado</h2>
          <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-6 py-3 rounded-2xl border border-blue-100 animate-slideDown">
            <Mail size={18} />
            <span className="text-sm font-bold">Comprovante enviado para: <strong className="underline">{lastOrder.customerEmail}</strong></span>
          </div>
        </div>

        <div className="bg-white shadow-2xl rounded-sm relative overflow-hidden print:shadow-none border border-slate-200">
          <div className="absolute top-0 left-0 w-full h-1 bg-[radial-gradient(circle_at_50%_100%,_transparent_5px,_#f1f5f9_5px)] bg-[length:15px_10px] bg-repeat-x print:hidden"></div>
          <div className="p-8 md:p-12 space-y-8">
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-black tracking-tighter uppercase">NetStore Pro</h1>
              <p className="text-xs font-bold text-slate-600">SOLUCOES EM REDES E INFRAESTRUTURA LTDA</p>
            </div>

            <div className="border-t border-dashed border-slate-300 pt-6 space-y-4">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span>Pedido: #{lastOrder.id}</span>
                <span>{new Date(lastOrder.date).toLocaleDateString()}</span>
              </div>
              <div className="text-[10px] text-slate-500 uppercase">
                <p>Cliente: {lastOrder.customerName}</p>
                <p>Email: {lastOrder.customerEmail}</p>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-300 pt-6">
              <div className="space-y-4">
                {lastOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-4">
                    <div className="text-[11px] font-bold uppercase">
                      <p className="text-slate-900">{item.product.name}</p>
                      <p className="text-slate-400 font-medium">unid: R$ {item.product.price.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-10 text-[11px] font-black">
                      <span className="min-w-[20px] text-center">{item.quantity}</span>
                      <span className="min-w-[70px] text-right">R$ {(item.product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-dashed border-slate-300 pt-6 space-y-2">
              <div className="flex justify-between text-lg font-black text-slate-900 uppercase pt-2">
                <span>Valor Total</span>
                <span>R$ {lastOrder.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="text-center pt-8 border-t border-dashed border-slate-300">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-2">NetStore Pro</p>
              <p className="text-[9px] text-slate-400 uppercase leading-relaxed">
                Este documento é um recibo digital gerado e enviado via Resend.<br/>
                Confira sua caixa de entrada para mais detalhes.
              </p>
            </div>
          </div>
          <div className="h-1 bg-[radial-gradient(circle_at_50%_0%,_transparent_5px,_#f1f5f9_5px)] bg-[length:15px_10px] bg-repeat-x print:hidden"></div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 print:hidden">
          <button onClick={handlePrint} className="flex-grow bg-white border border-slate-200 text-slate-900 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm">
            <Printer size={20} /> Imprimir Recibo
          </button>
          <button onClick={onComplete} className="flex-grow bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg">
            <ArrowLeft size={20} /> Voltar para Loja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-fadeIn print:hidden">
      <div className="lg:col-span-8 space-y-8">
        <div className="flex items-center gap-4 mb-2">
           <button onClick={onComplete} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft /></button>
           <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        {step === 'cart' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold flex items-center gap-2"><Package size={18} /> Resumo do Carrinho</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {cart.map(item => (
                  <div key={item.product.id} className="p-6 flex flex-col sm:flex-row items-center gap-6">
                    <img src={item.product.image} className="w-20 h-20 rounded-2xl object-cover border border-slate-100 shadow-sm" />
                    <div className="flex-grow">
                      <h4 className="font-bold text-slate-900">{item.product.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Estoque: {item.product.stock}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="px-3 py-1 hover:bg-slate-200 transition-colors">-</button>
                        <span className="px-3 font-bold text-sm min-w-[30px] text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock} className="px-3 py-1 hover:bg-slate-200 transition-colors disabled:opacity-30">+</button>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-bold text-lg min-w-[100px] text-right">R$ {(item.product.price * item.quantity).toLocaleString()}</span>
                        <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:text-red-700 p-1 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase">
                          <Trash2 size={14} /> Remover
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-bold flex items-center gap-2"><Truck size={18} /> Cálculo de Frete</h3>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="Seu CEP (00000000)" 
                  className="flex-grow p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                />
                <button 
                  onClick={handleCalcShipping}
                  disabled={loadingShipping}
                  className="bg-slate-900 text-white px-8 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md active:scale-95"
                >
                  {loadingShipping ? 'Calculando...' : 'Calcular'}
                </button>
              </div>
              {shipping && (
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between animate-fadeIn">
                  <div>
                    <p className="text-sm font-bold text-blue-900">{shipping.service}</p>
                    <p className="text-xs text-blue-700">Entrega estimada: {shipping.deliveryTime}</p>
                  </div>
                  <span className="font-black text-blue-900">R$ {shipping.cost.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        ) : !user ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm animate-slideDown max-w-lg mx-auto w-full">
            <div className="text-center space-y-4 mb-8">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600">
                <UserIcon size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Identifique-se</h3>
              <p className="text-slate-500">Faça login para continuar. O e-mail é obrigatório para o envio do comprovante.</p>
            </div>

            <form onSubmit={handleManualLogin} className="space-y-6">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100 text-center">{error}</div>}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Usuário</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={username} onChange={(e) => setUsername(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="password" required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 shadow-lg transition-all active:scale-95">Acessar Conta</button>
            </form>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8 animate-slideDown">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-xl flex items-center gap-2"><CreditCard size={20} /> Pagamento via Stripe</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <img src={user.picture} className="w-6 h-6 rounded-full" />
                <span>Logado como <strong>{user.name}</strong></span>
              </div>
            </div>
            
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-start gap-3">
              <Mail className="text-orange-600 shrink-0" size={20} />
              <p className="text-xs font-medium text-orange-800 leading-relaxed">
                Atenção: Ao confirmar o pagamento, enviaremos automaticamente um e-mail de confirmação via <strong>Resend</strong> para <strong className="underline">{user.email}</strong>. Por favor, verifique se este é o seu e-mail correto.
              </p>
            </div>

            <form onSubmit={handlePayment} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 uppercase">Titular do Cartão</label>
                  <input required className="w-full p-3 rounded-xl border border-slate-200" value={cardName} onChange={(e) => setCardName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 uppercase">Número do Cartão</label>
                  <input required className="w-full p-3 rounded-xl border border-slate-200" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 uppercase">Vencimento</label>
                  <input required className="w-full p-3 rounded-xl border border-slate-200" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 uppercase">CVV</label>
                  <input required className="w-full p-3 rounded-xl border border-slate-200" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} />
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 text-sm text-slate-600">
                <ShieldIcon size={24} className="text-blue-600 flex-shrink-0" />
                Seu pagamento é processado de forma segura e criptografada pelos servidores da Stripe.
              </div>
              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all disabled:opacity-70 active:scale-95 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processando Stripe...
                  </>
                ) : `Pagar R$ ${total.toLocaleString()}`}
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="lg:col-span-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg sticky top-24 space-y-6">
          <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Total do Pedido</h3>
          <div className="space-y-4">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-bold">R$ {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Frete</span>
              <span className="font-bold">{shipping ? `R$ ${shipping.cost.toLocaleString()}` : 'A calcular'}</span>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xl font-bold">Total</span>
              <span className="text-3xl font-black text-blue-600">R$ {total.toLocaleString()}</span>
            </div>
          </div>
          {step === 'cart' && (
            <button 
              onClick={() => setStep('payment')}
              disabled={!shipping}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-95"
            >
              Ir para Pagamento
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
