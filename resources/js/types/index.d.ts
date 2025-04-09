import { PageProps } from '@inertiajs/core';

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
    product: Product;
    quantity: number;
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
}

declare namespace App.Interfaces {
  export interface AppPageProps extends PageProps{
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
  }
}
