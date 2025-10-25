import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRestaurant } from '../../src/hooks/useRestaurants'; // Ajuste o caminho conforme sua estrutura

export default function RestaurantDetailsScreen() {
  // 1. Captura o ID da URL (ex: "a8dc8957..." de /restaurants/a8dc8957...)
  const { id } = useLocalSearchParams() as { id: string };
  const { data: restaurant, isLoading, isError, error } = useRestaurant(id);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Carregando detalhes do restaurante...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={30} color="#FF6B35" />
        <Text style={styles.errorTitle}>Erro ao Carregar!</Text>
        <Text style={styles.errorText}>
          {error instanceof Error ? error.message : "Um erro desconhecido ocorreu."}
        </Text>
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="sad-outline" size={30} color="#999" />
        <Text style={styles.errorTitle}>Restaurante Não Encontrado</Text>
        <Text style={styles.errorText}>Verifique o ID: {id}</Text>
      </View>
    );
  }

  // 3. Exibe os dados do restaurante
 return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Image source={{ uri: restaurant.image }} style={styles.headerImage} />
      
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{restaurant.name}</Text>
        <View style={styles.detailRow}>
          <Ionicons name="star" size={20} color="#FFD700" />
          <Text style={styles.detailText}>{restaurant.rating} ({restaurant.category})</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={20} color="#666" />
          <Text style={styles.detailText}>Tempo de Entrega: {restaurant.deliveryTime}</Text>
        </View>
      </View>
      
      {/* CORREÇÃO 2: Bloco para exibir os produtos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cardápio</Text>
        {restaurant.products && restaurant.products.length > 0 ? (
          restaurant.products.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                {product.description && <Text style={styles.productDescription}>{product.description}</Text>}
              </View>
              <Text style={styles.productPrice}>R$ {(product.price || 0).toFixed(2)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.bodyText}>Nenhum produto encontrado para este restaurante.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  bodyText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  headerImage: {
    width: '100%',
    height: 220,
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  productCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee'
  },
  productInfo: {
    flex: 1,
    marginRight: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productDescription: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});