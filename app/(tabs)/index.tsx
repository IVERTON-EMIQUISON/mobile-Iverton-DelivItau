
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useRestaurants } from '../hooks/useRestaurants';

const { width } = Dimensions.get('window');

const categories = [
  { id: '1', name: 'Todos', icon: '🍽️', color: '#666' },
  { id: '2', name: 'Hambúrguer', icon: '🍔', color: '#FF6B6B' },
  { id: '3', name: 'Pizza', icon: '🍕', color: '#FF8E53' },
  { id: '4', name: 'Açaí', icon: '🍇', color: '#9C88FF' },
  { id: '5', name: 'Doces', icon: '🍰', color: '#FF69B4' },
  { id: '6', name: 'Bebidas', icon: '🥤', color: '#4ECDC4' },
];

export default function HomeScreen() {
  const { data: restaurants, isLoading } = useRestaurants();

  const navigateToRestaurant = (id: string) => {
    router.push(`/restaurant/${id}`);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Banner Promocional */}
      <View style={styles.bannerContainer}>
        <LinearGradient
          colors={['#FF6B35', '#F7931E']}
          style={styles.banner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>Açaí Grátis na Compra de 2</Text>
              <Text style={styles.bannerSubtitle}>Válido até 19/12/2025</Text>
            </View>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300' }}
              style={styles.bannerImage}
            />
          </View>
        </LinearGradient>
      </View>

      {/* Barra de Busca */}
      <View style={styles.searchContainer}>
        <Text style={styles.sectionTitle}>Buscar</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            placeholder="Buscar por restaurante..."
            style={styles.searchInput}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.promoButton}>
            <Text style={styles.promoText}>Apenas promoções</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Categorias */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Categorias</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categories.map((category) => (
            <TouchableOpacity key={category.id} style={[styles.categoryItem, { backgroundColor: category.color }]}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Estabelecimentos */}
      <View style={styles.restaurantsContainer}>
        <Text style={styles.sectionTitle}>Estabelecimentos</Text>
        <View style={styles.restaurantsGrid}>
          {restaurants?.map((restaurant) => (
            <TouchableOpacity
              key={restaurant.id}
              style={styles.restaurantCard}
              onPress={() => navigateToRestaurant(restaurant.id)}
            >
              <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
              {restaurant.promotion && (
                <View style={styles.promotionBadge}>
                  <Text style={styles.promotionText}>Promoção</Text>
                </View>
              )}
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <View style={styles.restaurantDetails}>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.rating}>{restaurant.rating}</Text>
                  </View>
                  <View style={styles.timeContainer}>
                    <Ionicons name="time" size={14} color="#666" />
                    <Text style={styles.time}>{restaurant.deliveryTime}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Botão Admin (para demonstração) */}
      <TouchableOpacity
        style={styles.adminButton}
        onPress={() => router.push('/admin/products')}
      >
        <Ionicons name="settings" size={20} color="#fff" />
        <Text style={styles.adminButtonText}>Gerenciar Produtos</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  bannerContainer: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  banner: {
    padding: 20,
    borderRadius: 12,
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  bannerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  promoButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  promoText: {
    fontSize: 12,
    color: '#666',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  categoriesScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  restaurantsContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  restaurantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  restaurantCard: {
    width: (width - 48) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  restaurantImage: {
    width: '100%',
    height: 120,
  },
  promotionBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  promotionText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  restaurantInfo: {
    padding: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  restaurantDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  adminButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
