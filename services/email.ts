
import { Order } from '../types';

export const emailService = {
  sendOrderConfirmation: async (order: Order) => {
    console.log("%c[Resend API] Enviando confirmação de COMPRA...", "color: #3b82f6; font-weight: bold;");
    console.log(`Para: ${order.customerEmail} | Pedido: #${order.id}`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { success: true };
  },
  
  sendShippingUpdate: async (order: Order) => {
    console.log("%c[Resend API] Enviando atualização de ENVIO...", "color: #f59e0b; font-weight: bold;");
    console.log(`Para: ${order.customerEmail} | Rastreio: ${order.trackingCode}`);
    // Simula o template HTML com o código de rastreio
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true };
  }
};
