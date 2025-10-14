
import { useQuery } from '@tanstack/react-query';

// Simulação de dados de restaurantes
const mockRestaurants = [
  {
    id: '1',
    name: 'Burger Palace',
    image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=300',
    rating: 4.8,
    deliveryTime: '25-35 min',
    promotion: true,
    category: 'Hambúrguer',
  },
  {
    id: '2',
    name: 'Pizza Suprema',
    image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300',
    rating: 4.6,
    deliveryTime: '30-40 min',
    promotion: true,
    category: 'Pizza',
  },
  {
    id: '3',
    name: 'Açaí do Vale',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300',
    rating: 4.9,
    deliveryTime: '15-25 min',
    promotion: true,
    category: 'Açaí',
  },
  {
    id: '4',
    name: 'Doce Tentação',
    image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=300',
    rating: 4.7,
    deliveryTime: '20-30 min',
    promotion: false,
    category: 'Doces',
  },
];

const fetchRestaurants = async () => {
  // Simula uma chamada para API AWS
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockRestaurants;
};

export const useRestaurants = () => {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: fetchRestaurants,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useRestaurant = (id: string) => {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: async () => {
      // Simula uma chamada para API AWS
      await new Promise(resolve => setTimeout(resolve, 800));
      const restaurant = mockRestaurants.find(r => r.id === id);
      if (!restaurant) throw new Error('Restaurante não encontrado');
      return {
        ...restaurant,
        description: 'Descrição detalhada do restaurante com informações sobre especialidades, horário de funcionamento e localização.',
        address: 'Rua das Flores, 123 - Centro',
        phone: '(11) 99999-9999',
        isOpen: true,
        products: [
          {
            id: '1',
            name: 'Burger Clássico',
            description: 'Hambúrguer artesanal com carne 180g, queijo, alface, tomate e molho especial',
            price: 25.90,
            image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=300',
            category: 'Hambúrguer',
          },
          {
            id: '2',
            name: 'Pizza Margherita',
            description: 'Pizza tradicional com molho de tomate, mussarela e manjericão fresco',
            price: 32.90,
            image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300',
            category: 'Pizza',
          },
        ],
      };
    },
    enabled: !!id,
  });
};
