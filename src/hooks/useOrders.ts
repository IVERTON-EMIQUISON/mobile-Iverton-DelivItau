import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

const API_URL = 'https://r3fw3mr1jj.execute-api.us-east-1.amazonaws.com/v1';

// -----------------------------
// 🔥 BUSCAR PEDIDOS
// -----------------------------
const fetchOrders = async () => {
  try {
    const response = await fetch(`${API_URL}/orders`);
    if (!response.ok) {
      if (response.status === 404) return [];
      throw new Error('Erro ao buscar pedidos');
    }
    return response.json();
  } catch (error) {
    return [];
  }
};

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    refetchInterval: 5000,
  });
};

// -----------------------------
// 🔥 CRIAR PEDIDO (POST)
// -----------------------------
const createOrder = async (newOrder: any) => {
  
  // AQUI ESTÁ A MUDANÇA: Não reformatamos mais.
  // Confiamos que o orders.tsx já mandou o JSON pronto com restaurantId.
  console.log("🚀 ENVIANDO PARA AWS:\n", JSON.stringify(newOrder, null, 2));

  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ivertondelive' // Sua senha correta
    },
    body: JSON.stringify(newOrder),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ ERRO AWS:", response.status, errorText);
    throw new Error(errorText);
  }
  
  return response.json();
};

// -----------------------------
// 🔥 HOOK
// -----------------------------
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      Alert.alert("Sucesso!", "Pedido enviado para a cozinha!");
    },
    onError: (error: any) => {
      Alert.alert("Erro", "Falha ao enviar: " + error.message);
    }
  });
};
const cancelOrder = async (orderId: string) => {
  const response = await fetch(`${API_URL}/orders/${orderId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ivertondelive' // Sua senha
    },
    body: JSON.stringify({ status: 'cancelled' }),
  });

  if (!response.ok) {
    throw new Error('Erro ao cancelar pedido');
  }
  return response.json();
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      // Atualiza a lista na hora para mostrar "Cancelado"
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      Alert.alert("Cancelado", "O pedido foi cancelado com sucesso.");
    },
    onError: () => {
      Alert.alert("Erro", "Não foi possível cancelar o pedido.");
    }
  });
};