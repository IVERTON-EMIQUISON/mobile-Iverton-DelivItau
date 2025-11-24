import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// O URL da sua API
const API_URL = 'https://r3fw3mr1jj.execute-api.us-east-1.amazonaws.com/v1';

// --- FUNÇÕES AUXILIARES DE BUSCA (FETCH) ---

// 1. Busca a lista geral de restaurantes
const fetchRestaurants = async () => {
  const response = await fetch(`${API_URL}/restaurants`);
  if (!response.ok) throw new Error('Falha ao buscar restaurantes');
  return response.json();
};

// 2. Busca os detalhes de UM restaurante E monta o cardápio dele
const fetchRestaurantWithMenu = async (id: string) => {
  // A. Busca os dados do restaurante (Nome, Imagem, etc)
  const restaurantPromise = fetch(`${API_URL}/restaurants/${id}`).then(res => res.json());
  
  // B. Busca TODOS os produtos
  // (Nota: Como sua API Lambda atual não filtra no servidor, filtramos aqui no app)
  const productsPromise = fetch(`${API_URL}/products`).then(res => res.json());

  // C. Espera as duas buscas terminarem
  const [restaurant, allProducts] = await Promise.all([restaurantPromise, productsPromise]);

  // D. A MÁGICA ACONTECE AQUI:
  // Filtramos a lista de produtos para pegar SÓ os que têm o ID deste restaurante
  const menu = Array.isArray(allProducts) 
    ? allProducts.filter((product: any) => product.restaurantId === id)
    : [];

  // E. Retorna o restaurante já com o cardápio dentro!
  return {
    ...restaurant,
    products: menu 
  };
};

// --- HOOKS (O QUE VOCÊ USA NAS TELAS) ---

// Hook para a Home (Lista de Restaurantes)
export const useRestaurants = () => {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: fetchRestaurants,
  });
};

// Hook para a Tela de Detalhes (Restaurante + Cardápio)
export const useRestaurant = (id: string) => {
  return useQuery({
    queryKey: ['restaurant', id], // Chave única
    queryFn: () => fetchRestaurantWithMenu(id), // Usa a nossa função nova
    enabled: !!id,
  });
};

// --- HOOKS DE MUTATION (Para deletar, se precisar) ---
const deleteRestaurant = async (id: string) => {
  await fetch(`${API_URL}/restaurants/${id}`, { method: 'DELETE' });
};

export const useDeleteRestaurant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRestaurant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
};