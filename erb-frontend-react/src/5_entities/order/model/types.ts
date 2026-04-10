export type OrderStatus = 'У дорозі' | 'Очікує' | 'Підтверджено' | 'Доставлено';

export interface Order {
  id: string;
  type: string;
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