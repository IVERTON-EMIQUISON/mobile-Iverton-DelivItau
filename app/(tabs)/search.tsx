
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAllProducts } from '../../src/hooks/useProducts';

const categories = ['Todos', 'Hambúrguer', 'Pizza', 'Açaí', 'Doces', 'Bebidas'];
const sortOptions = ['Relevância', 'Menor Preço', 'Maior Avaliação', 'Tempo de Entrega'];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedSort, setSelectedSort] = useState('Relevância');
  
const { data: allProducts, isLoading } = useAllProducts();

  const filteredProducts = useMemo(() => {
    return allProducts?.filter((product) => {
      const categoryMatch = selectedCategory === 'Todos' || product.category === selectedCategory;
      const nameMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && nameMatch;
    });
  }, [allProducts, selectedCategory, searchQuery,selectedSort]);

  const renderProduct = ({ item }: any) => (
    <TouchableOpacity style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription}>{item.description}</Text>
        <View style={styles.productDetails}>
          <Text style={styles.productPrice}>R$ {item.price.toFixed(2)}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const filteredAndSortedProducts = useMemo(() => {
    // Se a lista da API ainda não chegou, retorna uma lista vazia para evitar erros.
    if (!allProducts) return [];

    // --- PASSO 1: FILTRAGEM (O que você já tem) ---
    let filtered = allProducts.filter((product) => {
      const categoryMatch = selectedCategory === 'Todos' || product.category === selectedCategory;
      const nameMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      // Você pode adicionar a busca na descrição aqui se quiser:
      // const descriptionMatch = product.description.toLowerCase().includes(searchQuery.toLowerCase());
      // return categoryMatch && (nameMatch || descriptionMatch);
      return categoryMatch && nameMatch;
    });

    // --- PASSO 2: ORDENAÇÃO (A parte que faltava) ---
    // Usamos .slice() para criar uma cópia do array antes de ordenar,
    // o que é uma boa prática para evitar mutações inesperadas.
    let sorted = [...filtered]; 

    switch (selectedSort) {
      case 'Menor Preço':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'Maior Avaliação':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      // O caso 'Tempo de Entrega' não é possível com os dados atuais do produto.
      // O 'Relevância' é o padrão, então não fazemos nada.
      default:
        // Nenhuma ordenação extra, mantém a ordem da API.
        break;
    }

    return sorted;
  }, [allProducts, selectedCategory, searchQuery, selectedSort]); // Adicionamos 'selectedSort' às dependências

  return (
    <View style={styles.container}>
      {/* Barra de Busca */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            placeholder="Buscar produtos..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </View>
      
      {/* Filtros de Categoria */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterTitle}>Categorias</Text>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryFilter,
                selectedCategory === item && styles.categoryFilterActive
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryFilterText,
                  selectedCategory === item && styles.categoryFilterTextActive
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Ordenação */}
      <View style={styles.sortContainer}>
        <Text style={styles.filterTitle}>Ordenar por</Text>
        <FlatList
          horizontal
          data={sortOptions}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.sortFilter,
                selectedSort === item && styles.sortFilterActive
              ]}
              onPress={() => setSelectedSort(item)}
            >
              <Text
                style={[
                  styles.sortFilterText,
                  selectedSort === item && styles.sortFilterTextActive
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Resultados */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>
          {/* 1. Use a nova variável aqui para a contagem */}
          {filteredAndSortedProducts?.length || 0} resultados encontrados
        </Text>
        <FlatList
          // 2. E use a MESMA variável aqui, apenas uma vez
          data={filteredAndSortedProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productsList}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  categoryFilter: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 16,
  },
  categoryFilterActive: {
    backgroundColor: '#FF6B35',
  },
  categoryFilterText: {
    color: '#666',
    fontWeight: '500',
  },
  categoryFilterTextActive: {
    color: '#fff',
  },
  sortContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sortFilter: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 16,
  },
  sortFilterActive: {
    backgroundColor: '#4ECDC4',
  },
  sortFilterText: {
    color: '#666',
    fontWeight: '500',
  },
  sortFilterTextActive: {
    color: '#fff',
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  productsList: {
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 150,
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
});
