export type PaymentMethod = 'qris_manual' | 'cash_booth' | 'cash_event_day' | 'midtrans';

export type OrderStatus = 
  | 'pending_payment'
  | 'waiting_manual_verification'
  | 'waiting_offline_payment'
  | 'paid'
  | 'cancelled'
  | 'used';

export type TicketType = 'regular' | 'vip' | 'vvip';

export interface TicketTier {
  id: string;
  type: TicketType;
  name: string;
  price: number;
  description: string;
  benefits: string[];
  available: number;
}

export interface CartItem {
  ticketTier: TicketTier;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerId?: string;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  orderCode: string;
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  qris_manual: 'Manual QRIS',
  cash_booth: 'Pay at Booth',
  cash_event_day: 'Pay on Event Day',
  midtrans: 'Midtrans',
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Pending Payment',
  waiting_manual_verification: 'Waiting Verification',
  waiting_offline_payment: 'Waiting Offline Payment',
  paid: 'Paid',
  cancelled: 'Cancelled',
  used: 'Used',
};
