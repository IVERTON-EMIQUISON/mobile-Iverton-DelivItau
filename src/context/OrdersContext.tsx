import React, { createContext, useState, useContext, ReactNode } from 'react';

// Tipo do Pedido
export interface Order {
  id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
  date: string;
  total: number;
  restaurant: {
    name: string;
    image: string;
  };
  items: {
    name: string;
    quantity: number;
  }[];
}

interface OrdersContextData {
  orders: Order[];
  addOrder: (cartItems: any[], total: number, restaurantName: string) => void;
}

const OrdersContext = createContext<OrdersContextData>({} as OrdersContextData);

export function OrdersProvider({ children }: { children: ReactNode }) {
  // Dados iniciais (Mock) para a tela ficar bonita
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1001',
      status: 'preparing',
      date: 'Hoje, 19:30',
      total: 85.90,
      restaurant: {
        name: 'Burger King',
        image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg',
      },
      items: [
        { name: 'Whopper Duplo', quantity: 2 },
        { name: 'Batata Frita', quantity: 2 },
      ]
    },
    {
      id: '950',
      status: 'delivered',
      date: 'Ontem, 12:15',
      total: 45.00,
      restaurant: {
        name: 'Pizza Hut',
        image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      },
      items: [
        { name: 'Pizza Calabresa', quantity: 1 },
      ]
    }
  ]);

  // Função que recebe os itens do carrinho e cria um novo pedido na lista
  const addOrder = (cartItems: any[], total: number, restaurantName: string) => {
    const newOrder: Order = {
      id: Math.floor(Math.random() * 10000).toString(), // Gera ID aleatório
      status: 'pending', // Começa sempre como Pendente
      date: 'Agora',
      total: total,
      restaurant: {
        name: restaurantName,
        // Usamos a imagem do primeiro produto como "logo" temporário
        image: cartItems[0]?.image || 'https://placehold.co/100', 
      },
      items: cartItems.map(item => ({
        name: item.name,
        quantity: item.quantity
      }))
    };

    // Adiciona o novo pedido no TOPO da lista
    setOrders(prev => [newOrder, ...prev]);
  };

  return (
    <OrdersContext.Provider value={{ orders, addOrder }}>
      {children}
    </OrdersContext.Provider>
  );
}

export const useOrders = () => useContext(OrdersContext);