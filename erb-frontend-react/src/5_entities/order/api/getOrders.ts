import type { Order } from '../model/types';

export const getOrders = async (): Promise<Order[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: '#REQ-92841', type: 'Стандартний вантаж', date: '24 жовтня 2026', from: 'Київ', to: 'Львів', status: 'У дорозі', theme: 'primary' },
        { id: '#REQ-92840', type: 'Небезпечні матеріали', date: '24 жовтня 2026', from: 'Одеса', to: 'Дніпро', status: 'Очікує', theme: 'tertiary' },
        { id: '#REQ-92839', type: 'Пріоритетний холодовий ланцюг', date: '23 жовтня 2026', from: 'Харків', to: 'Луцьк', status: 'Підтверджено', theme: 'secondary' },
        { id: '#REQ-92838', type: 'Зерновий навалочний вантаж', date: '23 жовтня 2026', from: 'Полтава', to: 'Одеський порт', status: 'Доставлено', theme: 'outline' },
      ]);
    }, 1500);
  });
};
