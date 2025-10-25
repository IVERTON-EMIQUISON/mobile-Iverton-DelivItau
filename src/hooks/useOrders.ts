import { useQuery } from '@tanstack/react-query';

// 1. Defina o URL base da sua API.
const API_URL = 'https://r3fw3mr1jj.execute-api.us-east-1.amazonaws.com/v1';
const fetchOrders = async () => {
  // Faz a chamada GET para o endpoint /orders
  const response = await fetch(`${API_URL}/orders`);

  if (!response.ok) {
    throw new Error('Falha ao buscar os pedidos da API');
  }

  const data = await response.json();
  return data;
};

/**
 * Busca os detalhes de UM pedido específico pelo seu ID.
 */
const fetchOrderById = async (id: string) => {
  // Faz a chamada GET para o endpoint /orders/{id}
  const response = await fetch(`${API_URL}/orders/${id}`);

  if (!response.ok) {
    throw new Error('Falha ao buscar os detalhes do pedido');
  }

  const data = await response.json();
  return data;
};

// --- HOOKS ATUALIZADOS QUE USAM AS FUNÇÕES REAIS ---

/**
 * Hook para obter a lista de todos os pedidos do usuário.
 */
export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    // 3. Usamos nossa nova função que chama a API de verdade.
    queryFn: fetchOrders,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 30 * 1000, // Continua atualizando a cada 30 segundos
  });
};

/**
 * Hook para obter os detalhes de um pedido específico.
 */
export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    // 4. E aqui, usamos a função que busca por ID.
    queryFn: () => fetchOrderById(id),
    // A query só será executada se o 'id' existir.
    enabled: !!id,
  });
};