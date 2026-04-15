import type { Order } from '../model/types';

export const getOrders = async (): Promise<Order[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: '#REQ-92841', type: 'external', wagonType: 'gondola', date: '24 жовтня 2026', from: 'Київ', to: 'Львів', status: 'Узгоджено', theme: 'primary' },
        { id: '#REQ-92840', type: 'external', wagonType: 'gondola', date: '24 жовтня 2026', from: 'Одеса', to: 'Дніпро', status: 'Очікує', theme: 'tertiary' },
        { id: '#REQ-92839', type: 'internal', wagonType: 'grain_hopper', date: '23 жовтня 2026', from: 'Харків', to: 'Луцьк', status: 'Узгоджено', theme: 'secondary' },
        { id: '#REQ-92838', type: 'external', wagonType: 'grain_hopper', date: '23 жовтня 2026', from: 'Полтава', to: 'Одеський порт', status: 'Виконано', theme: 'outline' },
      ]);
    }, 1500);
  });
};