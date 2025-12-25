
import { ShippingInfo } from '../types';

export const calculateShipping = async (zipCode: string, weightKg: number): Promise<ShippingInfo> => {
  // Use CepCerto API format as requested
  // Note: Since this is an SPA demo without a backend proxy, we simulate the API call logic
  // URL provided: https://www.cepcerto.com/api-para-calculo-de-frete-dos-correios
  
  try {
    // Simulated API response based on provided service specs
    const baseCost = 25.00;
    const weightFactor = weightKg * 5;
    const distanceFactor = parseInt(zipCode.substring(0, 2)) / 10;
    
    return {
      zipCode,
      cost: baseCost + weightFactor + distanceFactor,
      deliveryTime: '3-7 dias úteis',
      service: 'Correios SEDEX'
    };
  } catch (error) {
    console.error("Error calculating shipping:", error);
    throw error;
  }
};
