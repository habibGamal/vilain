// Add the payment_id and payment_details to the Order type definition
interface Order {
  id: number;
  user_id: number;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  payment_id: string | null;
  payment_details: string | null; // JSON string
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  coupon_code: string | null;
  shipping_address_id: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  shippingAddress?: Address;
  user?: User;
}
