import { create } from "zustand";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export type FulfillmentMethod = "conference-pickup" | "wholeness-pickup" | "delivery";

export type OrderStatus =
  | "awaiting-payment"
  | "payment-submitted"
  | "payment-verified"
  | "preparing-order"
  | "ready-for-conference-pickup"
  | "ready-for-wholeness-pickup"
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
  "ready-for-wholeness-pickup": "Ready for Wholeness House Pickup",
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
  color: string | null;
  quantity: number;
  image: string;
};

export type ConferencePickup = {
  conferenceId: string;
  conferenceName: string;
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

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  membership_number: string;
  items: OrderItem[];
  fulfillment_method: string;
  conference_pickup: ConferencePickup | null;
  delivery: DeliveryInfo | null;
  payment_proof: PaymentProof | null;
  subtotal: number;
  delivery_fee: number;
  grand_total: number;
  status: string;
  timeline: { status: string; date: string; note?: string }[];
  pickup_code: string | null;
  pickup_verified: boolean;
  created_at: string;
  updated_at: string;
};

function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    membershipNumber: row.membership_number ?? "",
    items: row.items ?? [],
    fulfillmentMethod: row.fulfillment_method as FulfillmentMethod,
    conferencePickup: row.conference_pickup ?? undefined,
    delivery: row.delivery ?? undefined,
    paymentProof: row.payment_proof ?? undefined,
    subtotal: row.subtotal,
    deliveryFee: row.delivery_fee,
    grandTotal: row.grand_total,
    status: row.status as OrderStatus,
    timeline: (row.timeline ?? []) as { status: OrderStatus; date: string; note?: string }[],
    createdAt: row.created_at,
    pickupCode: row.pickup_code ?? undefined,
    pickupVerified: row.pickup_verified ?? false,
  };
}

type OrderState = {
  orders: Order[];
  loaded: boolean;
  loading: boolean;

  loadFromSupabase: () => Promise<void>;
  addOrder: (
    order: Omit<
      Order,
      "id" | "orderNumber" | "status" | "timeline" | "createdAt" | "pickupCode" | "pickupVerified"
    >,
  ) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;
  getOrder: (orderId: string) => Order | undefined;
  getOrderByNumber: (orderNumber: string) => Order | undefined;
};

const generateOrderNumber = (count: number) => {
  const num = String(count + 1).padStart(6, "0");
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

export const useOrders = create<OrderState>()((set, get) => ({
  orders: [],
  loaded: false,
  loading: false,

  loadFromSupabase: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Failed to load orders from Supabase:", error.message);
        return;
      }

      const orders = ((data ?? []) as OrderRow[]).map(rowToOrder);
      set({ orders, loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  addOrder: async (orderData) => {
    const state = get();
    const orderNumber = generateOrderNumber(state.orders.length);
    const now = new Date().toISOString();
    const pickupCode = generatePickupCode();
    const orderId = crypto.randomUUID();

    const order: Order = {
      ...orderData,
      id: orderId,
      orderNumber,
      status: "awaiting-payment",
      timeline: [{ status: "awaiting-payment", date: now, note: "Order placed. Awaiting payment." }],
      createdAt: now,
      pickupCode,
      pickupVerified: false,
    };

    const row = {
      id: order.id,
      order_number: order.orderNumber,
      customer_name: order.customerName,
      customer_email: order.customerEmail,
      customer_phone: order.customerPhone,
      membership_number: order.membershipNumber,
      items: order.items,
      fulfillment_method: order.fulfillmentMethod,
      conference_pickup: order.conferencePickup ?? null,
      delivery: order.delivery ?? null,
      payment_proof: order.paymentProof ?? null,
      subtotal: order.subtotal,
      delivery_fee: order.deliveryFee,
      grand_total: order.grandTotal,
      status: order.status,
      timeline: order.timeline,
      pickup_code: order.pickupCode ?? null,
      pickup_verified: order.pickupVerified,
      created_at: order.createdAt,
      updated_at: now,
    };

    const { error } = await supabase.from("orders").insert(row);
    if (error) {
      console.error("Failed to save order to Supabase:", error.message);
      throw error;
    }

    set({ orders: [...state.orders, order] });
    return order;
  },

  updateOrderStatus: async (orderId, status, note) => {
    const now = new Date().toISOString();
    const order = get().orders.find((o) => o.id === orderId);
    if (!order) return;

    const updatedTimeline = [...order.timeline, { status, date: now, note }];
    const { error } = await supabase
      .from("orders")
      .update({
        status,
        timeline: updatedTimeline,
        updated_at: now,
      })
      .eq("id", orderId);

    if (error) {
      console.error("Failed to update order in Supabase:", error.message);
      return;
    }

    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? { ...o, status, timeline: updatedTimeline }
          : o,
      ),
    }));
  },

  getOrder: (orderId) => get().orders.find((o) => o.id === orderId),
  getOrderByNumber: (orderNumber) => get().orders.find((o) => o.orderNumber === orderNumber),
}));

export const STATUS_FLOW: OrderStatus[] = [
  "awaiting-payment",
  "payment-submitted",
  "payment-verified",
  "preparing-order",
  "ready-for-conference-pickup",
  "ready-for-wholeness-pickup",
  "ready-for-delivery",
  "shipped",
  "delivered",
  "completed",
];
