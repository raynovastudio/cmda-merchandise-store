import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FulfillmentMethod = "conference-pickup" | "delegate-pickup" | "delivery";

export type OrderStatus =
  | "awaiting-payment"
  | "payment-submitted"
  | "payment-verified"
  | "preparing-order"
  | "ready-for-conference-pickup"
  | "ready-for-delegate-pickup"
  | "ready-for-delivery"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  "awaiting-payment": "Awaiting Payment",
  "payment-submitted": "Payment Submitted",
  "payment-verified": "Payment Verified",
  "preparing-order": "Preparing Order",
  "ready-for-conference-pickup": "Ready for Conference Pickup",
  "ready-for-delegate-pickup": "Ready for Delegate Pickup",
  "ready-for-delivery": "Ready for Delivery",
  "shipped": "Shipped",
  "delivered": "Delivered",
  "completed": "Completed",
  "cancelled": "Cancelled",
};

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  size: string | null;
  quantity: number;
  image: string;
};

export type ConferencePickup = {
  conferenceId: string;
  conferenceName: string;
};

export type DelegatePickup = {
  fullName: string;
  phone: string;
  email: string;
  relationship: string;
  instructions: string;
};

export type DeliveryInfo = {
  recipientName: string;
  phone: string;
  state: string;
  city: string;
  address: string;
  instructions: string;
};

export type PaymentProof = {
  fileName: string;
  fileDataUrl: string;
  amountPaid: number;
  paymentDate: string;
  paymentReference: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  membershipNumber: string;
  items: OrderItem[];
  fulfillmentMethod: FulfillmentMethod;
  conferencePickup?: ConferencePickup;
  delegatePickup?: DelegatePickup;
  delivery?: DeliveryInfo;
  paymentProof?: PaymentProof;
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  status: OrderStatus;
  timeline: { status: OrderStatus; date: string; note?: string }[];
  createdAt: string;
  pickupCode?: string;
  pickupVerified?: boolean;
};

type OrderState = {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "orderNumber" | "status" | "timeline" | "createdAt" | "pickupCode" | "pickupVerified">) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  getOrder: (orderId: string) => Order | undefined;
  getOrderByNumber: (orderNumber: string) => Order | undefined;
};

const generateOrderNumber = (index: number) => {
  const num = String(index + 1).padStart(6, "0");
  return `CMDA-2026-${num}`;
};

const generatePickupCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

export const useOrders = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (orderData) => {
        const state = get();
        const orderNumber = generateOrderNumber(state.orders.length);
        const now = new Date().toISOString();
        const order: Order = {
          ...orderData,
          id: crypto.randomUUID(),
          orderNumber,
          status: "awaiting-payment",
          timeline: [
            { status: "awaiting-payment", date: now, note: "Order placed. Awaiting payment." },
          ],
          createdAt: now,
          pickupCode: generatePickupCode(),
          pickupVerified: false,
        };
        set({ orders: [...state.orders, order] });
        return order;
      },
      updateOrderStatus: (orderId, status, note) => {
        const now = new Date().toISOString();
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status,
                  timeline: [
                    ...o.timeline,
                    { status, date: now, note },
                  ],
                }
              : o,
          ),
        }));
      },
      getOrder: (orderId) => get().orders.find((o) => o.id === orderId),
      getOrderByNumber: (orderNumber) =>
        get().orders.find((o) => o.orderNumber === orderNumber),
    }),
    { name: "cmda-orders" },
  ),
);

export const STATUS_FLOW: OrderStatus[] = [
  "awaiting-payment",
  "payment-submitted",
  "payment-verified",
  "preparing-order",
  "ready-for-conference-pickup",
  "ready-for-delegate-pickup",
  "ready-for-delivery",
  "shipped",
  "delivered",
  "completed",
];
