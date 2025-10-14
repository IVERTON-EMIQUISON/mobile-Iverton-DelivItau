
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Simulação de dados de produtos
let mockProducts = [
  {
    id: '1',
    name: 'Burger Clássico',
    description: 'Hambúrguer artesanal com carne 180g, queijo, alface, tomate e molho especial',
    price: 25.90,
    image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=300',
    category: 'Hambúrguer',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Pizza Margherita',
    description: 'Pizza tradicional com molho de tomate, mussarela e manjericão fresco',
    price: 32.90,
    image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300',
    category: 'Pizza',
    rating: 4.6,
  },
  {
    id: '3',
    name: 'Açaí 500ml',
    description: 'Açaí cremoso com granola, banana e mel',
    price: 18.90,
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300',
    category: 'Açaí',
    rating: 4.9,
  },
  {
    id: '4',
    name: 'Brownie Premium',
    description: 'Brownie de chocolate belga com sorvete de baunilha',
    price: 15.90,
    image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=300',
    category: 'Doces',
    rating: 4.7,
  },
];

// Simulação de API AWS
const apiSimulation = {
  fetchProducts: async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [...mockProducts];
  },

  searchProducts: async (query: string, category: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    let filtered = [...mockProducts];
    
    if (category !== 'Todos') {
      filtered = filtered.filter(p => p.category === category);
    }
    
    if (query) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    return filtered;
  },

  createProduct: async (productData: any) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newProduct = {
      id: Date.now().toString(),
      ...productData,
      rating: 4.5,
    };
    mockProducts.push(newProduct);
    return newProduct;
  },

  updateProduct: async (id: string, productData: any) => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Produto não encontrado');
    
    mockProducts[index] = { ...mockProducts[index], ...productData };
    return mockProducts[index];
  },

  deleteProduct: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Produto não encontrado');
    
    mockProducts.splice(index, 1);
    return { success: true };
  },
};

// Hooks
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: apiSimulation.fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useSearchProducts = (query: string, category: string) => {
  return useQuery({
    queryKey: ['products', 'search', query, category],
    queryFn: () => apiSimulation.searchProducts(query, category),
    enabled: true,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiSimulation.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiSimulation.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiSimulation.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
