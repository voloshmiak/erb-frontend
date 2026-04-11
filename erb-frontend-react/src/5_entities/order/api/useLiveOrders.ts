import { useState, useEffect } from 'react';
import { orderService } from './orderService';
import { mapBackendOrderStatusToUi, mapWagonTypeToLabel } from '@/6_shared/lib/statusMappers';

interface RawOrder {
  id: string;
  wagonType: string;
  desiredDate?: string;
  createdAt: string;
  stationFromId?: string;
  stationToId: string;
  status: string;
}

export interface FormattedOrder {
  id: string;
  type: string;
  date: string;
  from: string;
  to: string;
  status: string;
}

export const useLiveOrders = () => {
  const [orders, setOrders] = useState<FormattedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const rawOrders = await orderService.getOrders();
      
      const formattedOrders = rawOrders.map((o: RawOrder) => ({
        id: o.id,
        type: mapWagonTypeToLabel(o.wagonType),
        date: o.desiredDate || o.createdAt,
        from: o.stationFromId || '---', // Реальні дані або прочерк
        to: o.stationToId,
        status: mapBackendOrderStatusToUi(o.status),
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