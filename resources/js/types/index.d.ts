import { PageProps } from "@inertiajs/core";

declare namespace App.Models {

    export interface User {
        id: number;
        name: string;
        email: string;
        avatar?: string;
        created_at?: string;
        updated_at?: string;
    }

    export interface Brand {
        id: number;
        name_en: string;
        name_ar: string;
        slug: string;
        image?: string;
        is_active: boolean;
        parent_id?: number;
        display_order: number;
        children?: Brand[];
        products?: Product[];
        created_at?: string;
        updated_at?: string;
    }

    export interface Category {
        id: number;
        name_en: string;
        name_ar: string;
        slug: string;
        image?: string;
        is_active: boolean;
        parent_id?: number;
        display_order: number;
        children?: Category[];
        products?: Product[];
        created_at?: string;
        updated_at?: string;
    }

    export interface Product {
        id: number;
        name_en: string;
        name_ar: string;
        image: string;
        slug: string;
        description_en?: string;
        description_ar?: string;
        price: number;
        sale_price?: number;
        cost_price?: number;
        quantity: number;
        brand_id: number;
        brand?: Brand;
        category_id: number;
        category?: Category;
        is_active: boolean;
        is_featured: boolean;
        dimensions?: {
            width?: number;
            height?: number;
            length?: number;
            weight?: number;
        };
        created_at?: string;
        updated_at?: string;
    }

    export interface Cart {
        id: number;
        user_id: number;
        items: CartItem[];
        created_at?: string;
        updated_at?: string;
    }

    export interface CartItem {
        id: number;
        cart_id: number;
        product_id: number;
        variant_id: number;
        product: Product;
        quantity: number;
        product?: Product;
        variant?: ProductVariant;
        created_at?: string;
        updated_at?: string;
    }

    export interface ProductVariant {
        id: number;
        product_id: number;
        sku: string;
        images?: string[]; // Array of image URLs stored as JSON
        quantity: number;
        price?: number; // Optional override of product price
        sale_price?: number; // Optional override of product sale price
        color?: string;
        size?: string;
    }

    export enum SectionType {
        VIRTUAL = 'VIRTUAL',
        REAL = 'REAL'
    }

    export interface Section {
        id: number;
        title_en: string;
        title_ar: string;
        active: boolean;
        sort_order: number;
        section_type: SectionType;
        products?: Product[];
        created_at?: string;
        updated_at?: string;
    }

    export interface CartSummary {
        totalItems: number;
        totalPrice: number;
    }

    export interface WishlistItem {
        id: number;
        product_id: number;
        product: Product;
    }

    // Promotion-related types
    export interface Promotion {
        id: number;
        name_en: string;
        name_ar: string;
        code: string | null;
        description_en: string | null;
        description_ar: string | null;
        type: 'percentage' | 'fixed' | 'free_shipping' | 'buy_x_get_y';
        value: number | null;
        min_order_value: number | null;
        usage_limit: number | null;
        usage_count: number;
        is_active: boolean;
        starts_at: string | null;
        expires_at: string | null;
        created_at: string;
        updated_at: string;
        conditions?: PromotionCondition[];
        rewards?: PromotionReward[];
    }

    export interface PromotionCondition {
        id: number;
        promotion_id: number;
        type: 'product' | 'category' | 'brand' | 'customer';
        entity_id: number | null;
        quantity: number | null;
        created_at: string;
        updated_at: string;
    }

    export interface PromotionReward {
        id: number;
        promotion_id: number;
        type: 'product' | 'category' | 'brand';
        entity_id: number | null;
        quantity: number;
        discount_percentage: number | null;
        created_at: string;
        updated_at: string;
    }

    export interface PromotionUsage {
        id: number;
        promotion_id: number;
        order_id: number;
        user_id: number;
        discount_amount: number;
        created_at: string;
        updated_at: string;
    }

    // Order-related types
    export interface Gov {
        id: number;
        name_en: string;
        name_ar: string;
        created_at?: string;
        updated_at?: string;
    }

    export interface Area {
        id: number;
        name_en: string;
        name_ar: string;
        gov_id: number;
        gov?: Gov;
        created_at?: string;
        updated_at?: string;
    }

    export interface ShippingCost {
        id: number;
        value: number;
        area_id: number;
        area?: Area;
        created_at?: string;
        updated_at?: string;
    }

    export interface Address {
        id: number;
        content: string;
        area_id: number;
        user_id: number;
        area?: Area;
        user?: User;
        created_at?: string;
        updated_at?: string;
    }

    export type OrderStatus =
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled";
    export type PaymentStatus = "pending" | "paid";

    export interface Order {
        id: number;
        user_id: number;
        order_status: OrderStatus;
        payment_status: PaymentStatus;
        payment_method: string;
        subtotal: string;
        shipping_cost: string;
        discount: string;
        total: string;
        coupon_code?: string;
        promotion_id?: number;
        shipping_address_id: number;
        notes?: string;
        payment_details?: string;
        payment_id?: string;
        user?: User;
        shipping_address?: Address;
        items?: OrderItem[];
        promotion?: Promotion;
        created_at?: string;
        updated_at?: string;
    }

    export interface OrderItem {
        id: number;
        order_id: number;
        product_id: number;
        variant_id?: number;
        quantity: number;
        unit_price: number;
        subtotal: number;
        order?: Order;
        product?: Product;
        variant?: ProductVariant;
        created_at?: string;
        updated_at?: string;
    }
}

declare namespace App.Interfaces {
    export interface AppPageProps extends PageProps {
        auth: {
            user: App.Models.User | null;
        };
        locale: string;
        translations: Record<string, string>;
        flash?: {
            success?: string;
            error?: string;
            warning?: string;
            info?: string;
        };
        categories: App.Models.Category[];
        brands: App.Models.Brand[];
        cartInfo: {
            itemsCount: number;
            totalPrice: number;
        }
    }
}
