
// Наприклад: 'https://api.your-backend.com/orders'
const API_URL = 'http:localhost/api/orders';

export interface CreateOrderPayload {
  type: string;
  from: string;
  to: string;
  dispatchDate: string;
  priorityLevel: string;
}

export const createOrder = async (orderData: CreateOrderPayload) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Форматуємо дані під ту структуру, яку чекає твій бекендер
      body: JSON.stringify({
        clientName: "УЗ Логістика (Демо)",
        desiredDate: orderData.dispatchDate,
        quantity: 1, 
        stationToId: orderData.to,
        wagonType: orderData.type,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result; 
    
  } catch (error) {
    console.error("Помилка при створенні заявки:", error);
    throw error;
  }
};