import { useState } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";
import { App } from "@/types";

type LoadingState = Record<number | string, boolean>;

export default function useCart() {
  const [isLoading, setIsLoading] = useState<LoadingState>({});
  const [addingToCart, setAddingToCart] = useState<LoadingState>({});

  /**
   * Add a product to the cart
   */
  const addToCart = async (productId: number, quantity: number = 1) => {
    setAddingToCart((prev) => ({ ...prev, [productId]: true }));

    try {
      await axios.post(route("cart.add"), {
        product_id: productId,
        quantity,
      });

      // Show success toast or notification here if needed

      // Refresh to update cart state in the navbar/header
      // Alternative: use a global state manager to update the cart badge only
      router.reload({ only: ['cart_summary'] });
    } catch (error) {
      console.error("Error adding product to cart:", error);
      // Show error toast or notification here if needed
    } finally {
      setAddingToCart((prev) => ({ ...prev, [productId]: false }));
    }
  };

  /**
   * Update the quantity of a cart item
   */
  const updateCartItemQuantity = async (id: number, quantity: number) => {
    setIsLoading((prev) => ({ ...prev, [id]: true }));

    try {
      await axios.patch(route("cart.update", id), { quantity });
      router.reload();
    } catch (error) {
      console.error("Error updating cart item:", error);
      // Show error toast or notification here if needed
    } finally {
      setIsLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  /**
   * Remove an item from the cart
   */
  const removeCartItem = async (id: number) => {
    setIsLoading((prev) => ({ ...prev, [id]: true }));

    try {
      await axios.delete(route("cart.remove", id));
      router.reload();
    } catch (error) {
      console.error("Error removing cart item:", error);
      // Show error toast or notification here if needed
    } finally {
      setIsLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  /**
   * Clear all items from the cart
   */
  const clearCart = async () => {
    try {
      await axios.delete(route("cart.clear"));
      router.reload();
    } catch (error) {
      console.error("Error clearing cart:", error);
      // Show error toast or notification here if needed
    }
  };

  /**
   * Calculate the total price of a cart item
   */
  const calculateItemTotal = (item: App.Models.CartItem) => {
    const price = item.product.sale_price || item.product.price;
    return (price * item.quantity).toFixed(2);
  };

  return {
    isLoading,
    addingToCart,
    addToCart,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    calculateItemTotal,
  };
}
