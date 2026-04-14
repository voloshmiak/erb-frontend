export type OrderStatus = 'Очікує' | 'Узгоджено' | 'Виконано' | 'Скасовано';
export type OrderType = 'external' | 'internal';

export interface Order {
  id: string;
  type: OrderType;
  wagonType: string;
  date: string;
  from: string;
  to: string;
  status: OrderStatus; 
  theme?: 'primary' | 'secondary' | 'tertiary' | 'outline'; 
}

export interface OrderEventPayload {
  type: 'orderCreated' | 'assignmentCreated' | 'wagonDispatched' | 'wagonMoved' | 'orderFulfilled';
  orderId: string;
  data?: any;
}