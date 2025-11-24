import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Alert } from 'react-native';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  restaurantId: string;
  restaurantName?: string;
}

interface CartContextData {
  items: CartItem[];
  addToCart: (product: any, restaurantName: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: any, restaurantName: string) => {
    // Regra: Não misturar restaurantes
    if (items.length > 0 && items[0].restaurantId !== product.restaurantId) {
      Alert.alert(
        "Novo Pedido",
        `Deseja limpar o carrinho atual de ${items[0].restaurantName} para pedir de ${restaurantName}?`,
        [
          { text: "Não", style: "cancel" },
          { 
            text: "Sim", 
            onPress: () => setItems([{ ...product, quantity: 1, restaurantName }]) 
          }
        ]
      );
      return;
    }

    setItems((prevItems) => {
      const itemExists = prevItems.find((item) => item.id === product.id);
      if (itemExists) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1, restaurantName }];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);