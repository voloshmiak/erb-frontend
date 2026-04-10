import { useState, useEffect } from 'react';
import { orderService } from './orderService';

const mapWagonType = (type: string) => {
  switch(type) {
    case 'gondola': return 'Напіввагон';
    case 'grain_hopper': return 'Зерновоз';
    case 'cement_hopper': return 'Цементовоз';
    default: return type;
  }
};

const mapStatus = (status: string) => {
  switch(status) {
    case 'pending': return 'Очікує';
    case 'approved': return 'Підтверджено';
    case 'in_transit': return 'У дорозі';
    case 'delivered': return 'Доставлено';
    default: return 'Очікує';
  }
};

export const useLiveOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const rawOrders = await orderService.getOrders();
      
      const formattedOrders = rawOrders.map((o: any) => ({
        id: o.id,
        type: mapWagonType(o.wagonType),
        date: o.desiredDate || o.createdAt,
        from: o.stationFromId || '---', // Реальні дані або прочерк
        to: o.stationToId,
        status: mapStatus(o.status),
      }));

      setOrders(formattedOrders.reverse());
    } catch (error) {
      console.error("Помилка отримання даних:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  return { orders, isLoading, refetch: fetchOrders };
};