
import { useQuery } from '@tanstack/react-query';

// Simulação de dados de pedidos
const mockOrders = [
  {
    id: '001',
    status: 'delivering',
    date: '15/12/2024 - 14:30',
    restaurant: {
      name: 'Burger Palace',
      image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=300',
    },
    items: [
      { name: 'Burger Clássico', quantity: 2 },
      { name: 'Batata Frita', quantity: 1 },
      { name: 'Refrigerante', quantity: 2 },
    ],
    total: 67.80,
  },
  {
    id: '002',
    status: 'preparing',
    date: '15/12/2024 - 13:15',
    restaurant: {
      name: 'Pizza Suprema',
      image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300',
    },
    items: [
      { name: 'Pizza Margherita', quantity: 1 },
      { name: 'Refrigerante 2L', quantity: 1 },
    ],
    total: 42.90,
  },
  {
    id: '003',
    status: 'delivered',
    date: '14/12/2024 - 19:45',
    restaurant: {
      name: 'Açaí do Vale',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300',
    },
    items: [
      { name: 'Açaí 500ml', quantity: 2 },
      { name: 'Granola Extra', quantity: 1 },
    ],
    total: 43.80,
  },
  {
    id: '004',
    status: 'delivered',
    date: '13/12/2024 - 16:20',
    restaurant: {
      name: 'Doce Tentação',
      image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=300',
    },
    items: [
      { name: 'Brownie Premium', quantity: 1 },
      { name: 'Sorvete Artesanal', quantity: 2 },
    ],
    total: 31.80,
  },
  {
    id: '005',
    status: 'cancelled',
    date: '12/12/2024 - 12:10',
    restaurant: {
      name: 'Burger Palace',
      image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=300',
    },
    items: [
      { name: 'Burger Duplo', quantity: 1 },
    ],
    total: 35.90,
  },
];

const fetchOrders = async () => {
  // Simula uma chamada para API AWS
  await new Promise(resolve => setTimeout(resolve, 1200));
  return mockOrders;
};

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 30 * 1000, // Atualiza a cada 30 segundos para pedidos ativos
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      const order = mockOrders.find(o => o.id === id);
      if (!order) throw new Error('Pedido não encontrado');
      return {
        ...order,
        tracking: {
          confirmed: '14:30',
          preparing: '14:35',
          delivering: order.status === 'delivering' ? '15:10' : null,
          delivered: order.status === 'delivered' ? '15:25' : null,
        },
        deliveryAddress: 'Rua das Palmeiras, 456 - Apt 302',
        paymentMethod: 'Cartão de Crédito **** 1234',
        deliveryFee: 5.90,
        subtotal: order.total - 5.90,
      };
    },
    enabled: !!id,
  });
};
