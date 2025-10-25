import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProduct } from'../../src/hooks/useProducts'; // Ajuste o caminho conforme sua estrutura

export default function ProductDetailsScreen() {
  // 1. Captura o ID da URL
  const { id } = useLocalSearchParams <{ id: string }>();

  // 2. Busca os detalhes do produto
  const { data: product, isLoading, isError, error } = useProduct(id);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>Carregando detalhes do produto...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="close-circle-outline" size={30} color="#FF6B35" />
        <Text style={styles.errorTitle}>Erro ao Carregar Produto</Text>
        <Text style={styles.errorText}>
          {error instanceof Error ? error.message : "Um erro desconhecido ocorreu."}
        </Text>
      </View>
    );
  }
  
  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="sad-outline" size={30} color="#999" />
        <Text style={styles.errorTitle}>Produto Não Encontrado</Text>
      </View>
    );
  }

  // 3. Exibe os dados do produto
  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: product.image }} style={styles.productImage} />
      <View style={styles.content}>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.price}>R$ {product.price.toFixed(2)}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.bodyText}>{product.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categoria</Text>
          <Text style={styles.bodyText}>{product.category}</Text>
        </View>

        {/* Botão de Adicionar ao Carrinho (Exemplo) */}
        <View style={styles.addButton}>
          <Text style={styles.addButtonText}>Adicionar ao Carrinho</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  productImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 20,
  },
  section: {
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bodyText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  addButton: {
    backgroundColor: '#4ECDC4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Reutilize os estilos de loading/erro do componente anterior se necessário
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#333' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorTitle: { fontSize: 20, fontWeight: 'bold', color: '#FF6B35', marginTop: 10 },
  errorText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 5 },
});