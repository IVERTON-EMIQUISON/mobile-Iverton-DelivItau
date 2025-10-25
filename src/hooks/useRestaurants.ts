import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// 1. Defina o URL base da sua API em um único lugar.
const API_URL = 'https://r3fw3mr1jj.execute-api.us-east-1.amazonaws.com/v1';

/**
 * Busca a lista de TODOS os restaurantes da API.
 */
const fetchRestaurants = async () => {
  // Faz a chamada GET para o endpoint /restaurants
  const response = await fetch(`${API_URL}/restaurants`);

  // Se a resposta não for um sucesso (ex: erro 404 ou 500), lança um erro.
  if (!response.ok) {
    throw new Error('Falha ao buscar os restaurantes da API');
  }

  // Converte a resposta JSON em um objeto JavaScript e retorna.
  const data = await response.json();
  return data;
};

/**
 * Busca os detalhes de UM restaurante específico pelo seu ID.
 */
const fetchRestaurantById = async (id: string) => {
  // Faz a chamada GET para o endpoint /restaurants/{id}
  const response = await fetch(`${API_URL}/restaurants/${id}`);

  if (!response.ok) {
    throw new Error('Falha ao buscar os detalhes do restaurante');
  }

  const data = await response.json();
  return data;
};

/**
 * Hook para obter a lista de todos os restaurantes.
 */
export const useRestaurants = () => {
  return useQuery({
    queryKey: ['restaurants'], // Chave única para esta query
    queryFn: fetchRestaurants,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para obter os detalhes de um restaurante específico.
 */
export const useRestaurant = (id: string) => {
  return useQuery({
    queryKey: ['restaurant', id],
    // 4. E aqui, usamos a função que busca por ID.
    queryFn: () => fetchRestaurantById(id),
    // A query só será executada se o 'id' não for nulo ou indefinido.
    enabled: !!id,
  });
};

// Função que faz a chamada DELETE
const deleteRestaurant = async (id: string) => {
  const response = await fetch(`${API_URL}/restaurants/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Falha ao excluir o restaurante');
  }
  // Não precisa retornar JSON, apenas confirmação de sucesso
};

// Hook para deletar
export const useDeleteRestaurant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteRestaurant,
    // Após o sucesso da exclusão, invalida o cache da lista para forçar o React Query a buscar a lista novamente.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      // Opcional: navegar de volta para a lista se estiver na página de detalhes.
    },
    onError: (error) => {
        console.error("Erro ao deletar:", error);
    }
  });
};