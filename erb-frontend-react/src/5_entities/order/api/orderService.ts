const BASE_URL = 'https://erb-backend-762050733390.europe-central2.run.app/api';

export type WagonType = 'gondola' | 'grain_hopper' | 'cement_hopper';
export type OrderType = 'external' | 'internal';

export interface CreateOrderDto {
  clientName: string;
  desiredDate: string;
  quantity: number;
  stationToId: string;
  wagonType: WagonType;
  type: OrderType;
}

export const orderService = {
  async getOrders() {
    const response = await fetch(`${BASE_URL}/orders`);
    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Помилка завантаження заявок (${response.status}): ${details || 'невідома помилка'}`);
    }
    const data = await response.json();
    return data.orders || [];
  },

  async createOrder(payload: CreateOrderDto) {
    const response = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Помилка створення заявки (${response.status}): ${details || 'невідома помилка'}`);
    }
    return response.json();
  }
};

export interface Asset {
  id: string;
  type: 'gondola' | 'grain_hopper' | 'cement_hopper' | 'locomotive';
  status: 'available' | 'maintenance' | 'in_transit';
  location: string;
  lastInspection: string;
}