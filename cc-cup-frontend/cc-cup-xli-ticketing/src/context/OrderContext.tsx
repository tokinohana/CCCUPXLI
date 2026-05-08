import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Order, CartItem, PaymentMethod } from '@/types';
import { mockOrders } from '@/mockData/orders';
import { generateOrderId, generateOrderCode } from '@/utils/format';

interface OrderContextType {
  orders: Order[];
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateCartItem: (ticketId: string, quantity: number) => void;
  clearCart: () => void;
  setCart: (items: CartItem[]) => void;
  placeOrder: (customerData: {
    name: string;
    email: string;
    phone: string;
    id?: string;
  }, paymentMethod: PaymentMethod) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getOrder: (orderId: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.ticketTier.id === item.ticketTier.id);
      if (existing) {
        return prev.map(i =>
          i.ticketTier.id === item.ticketTier.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const updateCartItem = (ticketId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(i => i.ticketTier.id !== ticketId));
    } else {
      setCart(prev => prev.map(i =>
        i.ticketTier.id === ticketId ? { ...i, quantity } : i
      ));
    }
  };

  const clearCart = () => setCart([]);

  const placeOrder = (
    customerData: { name: string; email: string; phone: string; id?: string },
    paymentMethod: PaymentMethod
  ): Order => {
    const totalAmount = cart.reduce((sum, item) => sum + item.ticketTier.price * item.quantity, 0);
    const initialStatus = paymentMethod === 'qris_manual'
      ? 'pending_payment'
      : paymentMethod === 'cash_booth' || paymentMethod === 'cash_event_day'
        ? 'waiting_offline_payment'
        : 'pending_payment';

    const order: Order = {
      id: generateOrderId(),
      customerName: customerData.name,
      customerEmail: customerData.email,
      customerPhone: customerData.phone,
      customerId: customerData.id,
      items: [...cart],
      totalAmount,
      paymentMethod,
      status: initialStatus,
      createdAt: new Date().toISOString(),
      orderCode: generateOrderCode(),
    };

    setOrders(prev => [order, ...prev]);
    setCart([]);
    return order;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const getOrder = (orderId: string) => orders.find(o => o.id === orderId);

  return (
    <OrderContext.Provider value={{ orders, cart, addToCart, updateCartItem, clearCart, setCart, placeOrder, updateOrderStatus, getOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within OrderProvider');
  return context;
}
