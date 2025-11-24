import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, TouchableOpacity, Modal } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRestaurant } from '../../src/hooks/useRestaurants';
import { useCart } from '../../src/context/CartContext';

export default function RestaurantDetailsScreen() {
  const { id } = useLocalSearchParams() as { id: string };
  const { data: restaurant, isLoading, isError } = useRestaurant(id);
  const { addToCart, items, total } = useCart();

  // --- ESTADOS DO MODAL ---
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#FF6B35" /></View>;
  }

  if (isError || !restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Text>Restaurante não encontrado.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.errorBackButton}>
            <Text style={{color: '#fff'}}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- LÓGICA DO MODAL ---
  
  const openModal = (product: any) => {
    setSelectedProduct(product);
    setQuantity(1); // Reseta a quantidade para 1 sempre que abrir
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  const incrementQty = () => setQuantity(q => q + 1);
  const decrementQty = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  const handleConfirmAdd = () => {
    if (!selectedProduct) return;

    // Adiciona o item ao carrinho X vezes (baseado na quantidade escolhida)
    // Como nosso Contexto atual adiciona 1 por vez, fazemos um loop simples
    for (let i = 0; i < quantity; i++) {
      addToCart(selectedProduct, restaurant.name);
    }
    
    closeModal();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: restaurant.image }} style={styles.headerImage} />
        
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{restaurant.name}</Text>
          <View style={styles.detailRow}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.detailText}>{restaurant.rating} • {restaurant.category}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={styles.detailText}>{restaurant.deliveryTime} • Entrega Grátis</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cardápio</Text>
          
          {restaurant.products?.map((product: any) => {
            const hasStock = product.estoque === undefined || product.estoque > 0;
            return (
              <TouchableOpacity 
                key={product.id} 
                style={[styles.productCard, !hasStock && styles.soldOutCard]}
                onPress={() => hasStock && openModal(product)} // Abre o modal ao clicar no CARD INTEIRO
                activeOpacity={hasStock ? 0.7 : 1}
              >
                <View style={styles.imageContainer}>
                  <Image source={{ uri: product.image }} style={[styles.productImage, !hasStock && {opacity:0.5}]} />
                  {!hasStock && <View style={styles.soldOutBadge}><Text style={styles.soldOutText}>ESGOTADO</Text></View>}
                </View>

                <View style={styles.productInfo}>
                  <Text style={[styles.productName, !hasStock && {color: '#999'}]}>{product.name}</Text>
                  <Text style={styles.productDescription} numberOfLines={2}>{product.description}</Text>
                  <Text style={[styles.productPrice, !hasStock && {color: '#999'}]}>R$ {(product.price || 0).toFixed(2)}</Text>
                </View>

                {/* Ícone indicativo de clique */}
                {hasStock && (
                    <View style={styles.addIconContainer}>
                        <Ionicons name="add-circle" size={28} color="#FF6B35" />
                    </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* BOTÃO VOLTAR */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* BARRA FLUTUANTE DO CARRINHO */}
      {items.length > 0 && (
        <TouchableOpacity 
          style={styles.cartFloatingBar} 
          onPress={() => router.push('/(tabs)/orders')}
        >
          <View style={styles.cartInfo}>
            <View style={styles.qtyBadge}>
              <Text style={styles.qtyText}>{items.reduce((acc, i) => acc + i.quantity, 0)}</Text>
            </View>
            <Text style={styles.viewCartText}>Ver Carrinho</Text>
          </View>
          <Text style={styles.totalText}>R$ {total.toFixed(2)}</Text>
        </TouchableOpacity>
      )}

      {/* ================= MODAL DE PRODUTO ================= */}
      <Modal
        visible={!!selectedProduct}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedProduct && (
              <>
                <Image source={{ uri: selectedProduct.image }} style={styles.modalImage} />
                
                <TouchableOpacity style={styles.closeModalButton} onPress={closeModal}>
                   <Ionicons name="close-circle" size={32} color="#fff" />
                </TouchableOpacity>

                <View style={styles.modalBody}>
                  <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
                  <Text style={styles.modalDescription}>{selectedProduct.description}</Text>
                  <Text style={styles.modalPrice}>R$ {selectedProduct.price.toFixed(2)}</Text>

                  {/* CONTROLE DE QUANTIDADE */}
                  <View style={styles.quantityContainer}>
                     <Text style={styles.quantityLabel}>Quantidade:</Text>
                     <View style={styles.counterBox}>
                        <TouchableOpacity onPress={decrementQty} style={styles.counterBtn}>
                            <Ionicons name="remove" size={24} color={quantity > 1 ? "#FF6B35" : "#ccc"} />
                        </TouchableOpacity>
                        <Text style={styles.counterValue}>{quantity}</Text>
                        <TouchableOpacity onPress={incrementQty} style={styles.counterBtn}>
                            <Ionicons name="add" size={24} color="#FF6B35" />
                        </TouchableOpacity>
                     </View>
                  </View>

                  <TouchableOpacity style={styles.addToOrderButton} onPress={handleConfirmAdd}>
                    <Text style={styles.addToOrderText}>
                        Adicionar • R$ {(selectedProduct.price * quantity).toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerImage: { width: '100%', height: 220 },
  infoContainer: { padding: 16, backgroundColor: '#fff', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginBottom: 10, elevation: 2 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  detailText: { marginLeft: 6, fontSize: 14, color: '#666' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  
  productCard: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, flexDirection: 'row', padding: 12, elevation: 2, alignItems: 'center' },
  soldOutCard: { backgroundColor: '#f0f0f0' },
  imageContainer: { position: 'relative' },
  productImage: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#eee' },
  soldOutBadge: { position: 'absolute', top:0, bottom:0, left:0, right:0, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'center', alignItems:'center', borderRadius:8 },
  soldOutText: { color:'#fff', fontSize:10, fontWeight:'bold', backgroundColor:'red', padding:2 },
  productInfo: { flex: 1, marginLeft: 12, marginRight: 8 },
  productName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  productDescription: { fontSize: 12, color: '#777', marginTop: 2 },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50', marginTop: 4 },
  
  addIconContainer: { justifyContent: 'center', alignItems: 'center' },
  
  backButton: { position: 'absolute', top: 40, left: 16, backgroundColor: '#fff', padding: 8, borderRadius: 20, elevation: 5 },
  errorBackButton: { marginTop: 20, backgroundColor: '#FF6B35', padding: 10, borderRadius: 8 },

  // Barra Flutuante
  cartFloatingBar: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#FF6B35', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, elevation: 10 },
  cartInfo: { flexDirection: 'row', alignItems: 'center' },
  qtyBadge: { backgroundColor: '#fff', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  qtyText: { color: '#FF6B35', fontWeight: 'bold', fontSize: 12 },
  viewCartText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  totalText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },

  // ESTILOS DO MODAL
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, minHeight: 400 },
  modalImage: { width: '100%', height: 250, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  closeModalButton: { position: 'absolute', top: 15, right: 15, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20 },
  modalBody: { padding: 20 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  modalDescription: { fontSize: 16, color: '#666', marginBottom: 16, lineHeight: 22 },
  modalPrice: { fontSize: 22, fontWeight: 'bold', color: '#4CAF50', marginBottom: 20 },
  
  quantityContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  quantityLabel: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  counterBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  counterBtn: { padding: 10 },
  counterValue: { fontSize: 18, fontWeight: 'bold', paddingHorizontal: 15 },
  
  addToOrderButton: { backgroundColor: '#FF6B35', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  addToOrderText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});