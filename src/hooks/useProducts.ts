import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

// 1. Defina o URL base da sua API.
const API_URL = 'https://r3fw3mr1jj.execute-api.us-east-1.amazonaws.com/v1';


/**
 * Busca a lista de produtos de um restaurante específico.
 * Chama: GET /products?restaurantId={id}
 */
const fetchProductsByRestaurant = async (restaurantId: string) => {
  // Se não houver ID, não faz a busca.
  if (!restaurantId) return [];

  const response = await fetch(`${API_URL}/products?restaurantId=${restaurantId}`);
  if (!response.ok) {
    throw new Error('Falha ao buscar os produtos do restaurante');
  }
  return response.json();
};

/**
 * Cria um novo produto.
 * Chama: POST /products
 */
const createProduct = async (productData: any, adminKey: string | null) => {
  // Se não houver chave, a requisição nem é tentada.
  if (!adminKey) {
    throw new Error("Chave de administrador não fornecida. Acesso negado.");
  }

  const response = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json','Authorization': `Bearer ${adminKey}` },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Falha ao criar o produto');
  }
  return response.json();
};

/**
 * Atualiza um produto existente.
 * Chama: PUT /products/{id}
 */
const updateProduct = async ({ id, adminKey, ...productData }: any) => {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminKey}`
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    throw new Error('Falha ao atualizar o produto');
  }
  return response.json();
};

/**
 * Deleta um produto.
 * Chama: DELETE /products/{id}
 */
const deleteProduct = async ({ id, adminKey }: any) => {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${adminKey}`
    }
  });

  if (!response.ok) {
    throw new Error('Falha ao deletar o produto');
  }
  return true;
};

/**
 * Hook para buscar os produtos de um restaurante específico.
 * Este substitui a necessidade do 'useSearchProducts' para o cliente.
 */
export const useProduct = (restaurantId: string) => {
  return useQuery({
    queryKey: ['products', restaurantId],
    queryFn: () => fetchProductsByRestaurant(restaurantId),
    enabled: !!restaurantId, // Só busca se o ID do restaurante existir
  });
};

/**
 * Hook para criar um novo produto (para a tela de admin).
 */
// export const useCreateProduct = () => {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: createProduct,
//     onSuccess: () => {
//       // Invalida todas as buscas de produtos para forçar a atualização
//       queryClient.invalidateQueries({ queryKey: ['products'] });
//     },
//   });
// };
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { adminKey } = useAuth();
  
  return useMutation({
   mutationFn: (productData: any) => createProduct(productData, adminKey),
    // A mágica acontece aqui, no onSuccess
    onSuccess: (data, variables) => {
      // 'variables' contém os dados que foram enviados para a mutação, incluindo o restaurantId
      const restaurantId = variables.restaurantId;

      // 1. Invalida a lista de todos os produtos (para a tela de admin)
      queryClient.invalidateQueries({ queryKey: ['products', 'all'] });
      
      // Isso força a tela de detalhes do restaurante a buscar os dados novamente.
      if (restaurantId) {
        queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
      }
    },
  });
};
/**
 * Hook para atualizar um produto (para a tela de admin).
 */
// DENTRO DE src/hooks/useProducts.ts

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { adminKey } = useAuth();

  return useMutation({
    mutationFn: ({ id, ...productData }: any) =>
      updateProduct({ id, adminKey, ...productData }),

    onSuccess: (data, variables) => {
      const restaurantId = data?.restaurantId || variables?.restaurantId;

      queryClient.invalidateQueries({ queryKey: ['products', 'all'] });

      if (restaurantId) {
        queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
      }
    },
  });
};


// Para o delete, precisamos passar o objeto do produto inteiro, não apenas o ID
// para que possamos saber qual restaurantId invalidar.
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { adminKey } = useAuth();

  return useMutation({
    mutationFn: (product: any) =>
      deleteProduct({ id: product.id, adminKey }),

    onSuccess: (data, product) => {
      const restaurantId = product.restaurantId;

      queryClient.invalidateQueries({ queryKey: ['products', 'all'] });

      if (restaurantId) {
        queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
      }
    },
  });
};

/**
 * Hook para deletar um produto (para a tela de admin).
 */
// export const useDeleteProduct = () => {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: deleteProduct,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['products'] });
//     },
//   });
// };

/**
 * Busca TODOS os produtos de TODOS os restaurantes.
 * Chama: GET /products
 */
const fetchAllProducts = async () => {
  const response = await fetch(`${API_URL}/products`);
  if (!response.ok) {
    throw new Error('Falha ao buscar todos os produtos');
  }
  return response.json();
};

/**
 * Hook para buscar a lista completa de todos os produtos (para a tela de busca).
 */
export const useAllProducts = () => {
  return useQuery({
    // Uma chave única para esta busca específica
    queryKey: ['products', 'all'], 
    queryFn: fetchAllProducts,
  });
};