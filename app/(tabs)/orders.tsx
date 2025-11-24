import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useCart } from '../../src/context/CartContext';
import { useOrders, useCreateOrder, useCancelOrder } from '../../src/hooks/useOrders';
import CancelModal from '../../src/components/CancelModal';
// --- CONFIGURAÇÃO DE CORES ---
const statusColors: any = {
  'pending': '#FFA500', 'confirmed': '#4ECDC4', 'preparing': '#FF6B35',
  'delivering': '#9C88FF', 'delivered': '#4CAF50', 'cancelled': '#F44336',
};

const statusLabels: any = {
  'pending': 'Pendente', 'confirmed': 'Confirmado', 'preparing': 'Preparando',
  'delivering': 'Saiu para Entrega', 'delivered': 'Entregue', 'cancelled': 'Cancelado',
};

export default function OrdersScreen() {
  // --- 1. DADOS DO CARRINHO ---
  const { items: cartItems, removeFromCart, total, clearCart } = useCart();
  
  // --- 2. DADOS DO HISTÓRICO (API) ---
  const { data: ordersData, isLoading, refetch } = useOrders();
  const createOrderMutation = useCreateOrder();
  
  const cancelOrderMutation = useCancelOrder(); 

  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [refreshing, setRefreshing] = useState(false);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  const handleCheckout = () => {
    Alert.alert(
      "Confirmar Pedido",
      `Total: R$ ${(total || 0).toFixed(2)}\nDeseja finalizar?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Confirmar", 
          onPress: async () => {
            // 👇 A CORREÇÃO ESTÁ AQUI: Adicionamos 'as any' para o TypeScript parar de reclamar
          const firstItem = (cartItems[0] || {}) as any;
            
            // Gera o ID aqui (ou deixa a Lambda gerar, mas vamos enviar pra garantir)
            const orderId = Date.now().toString();

            const newOrderPayload = {
              id: orderId, // Adicionei o ID aqui
              
              restaurantId: firstItem.restaurantId, 

              status: 'pending',
              date: new Date().toLocaleString('pt-BR'), // Formata a data simples
              total: total || 0,
              restaurant: {
                name: firstItem.restaurantName || 'Restaurante',
                image: firstItem.image || 'https://placehold.co/100',
              },
              items: cartItems.map(item => ({
                name: item.name,
                quantity: item.quantity
              }))
            };
            
            try {
              // @ts-ignore
              await createOrderMutation.mutateAsync(newOrderPayload);
              
              clearCart();
              setActiveTab('active');
            } catch (error) {
              Alert.alert("Erro", "Não foi possível enviar o pedido.");
            }
          }
        }
      ]
    );
  };
  const handleCancel = (orderId: string) => {
    Alert.alert(
      "Cancelar Pedido",
      "Tem certeza que deseja cancelar este pedido?",
      [
        { text: "Não", style: "cancel" },
        { 
          text: "Sim", 
          style: 'destructive',
          onPress: () => cancelOrderMutation.mutate(orderId) 
        }
      ]
    ); 
  };
                                             
 // Caso haja itens no carrinho, mostramos a tela de checkout
  if (cartItems && cartItems.length > 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerCart}>
          <Text style={styles.headerTitle}>Finalizar Pedido</Text>
          <TouchableOpacity onPress={clearCart}>
            <Text style={{color: '#F44336'}}>Limpar</Text>
          </TouchableOpacity>
        </View>
        
        {createOrderMutation.isPending && (
            <View style={{padding: 10, backgroundColor: '#FFF3E0', alignItems: 'center'}}>
                <Text style={{color: '#FF6B35'}}>Enviando pedido...</Text>
            </View>
        )}

        <View style={styles.restaurantHeader}>
             <Text style={styles.restaurantLabel}>Pedindo de:</Text>
             {/* Proteção contra nome vazio */}
             <Text style={styles.restaurantName}>
                {cartItems[0]?.restaurantName || 'Restaurante'}
             </Text>
        </View>

        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
          renderItem={({ item }) => {
            // --- BLINDAGEM DOS DADOS DO ITEM ---
            // Garante que o preço seja um número
            const safePrice = typeof item.price === 'number' ? item.price : parseFloat(item.price || '0');
            // Garante que a imagem tenha URL ou usa uma padrão
            const safeImage = item.image ? { uri: item.image } : { uri: 'https://placehold.co/100' };

            return (
              <View style={styles.cartItemCard}>
                <Image source={safeImage} style={styles.cartItemImage} />
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName}>{item.name || 'Produto'}</Text>
                  <Text style={styles.cartItemPrice}>R$ {safePrice.toFixed(2)}</Text>
                  <Text style={styles.cartItemQty}>Qtd: {item.quantity || 1}</Text>
                </View>
                <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeButton}>
                  <Ionicons name="trash-outline" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            );
          }}
        />

        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total a pagar</Text>
            {/* Proteção no Total */}
            <Text style={styles.totalValue}>R$ {(total || 0).toFixed(2)}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.checkoutButton, createOrderMutation.isPending && {opacity: 0.7}]} 
            onPress={handleCheckout}
            disabled={createOrderMutation.isPending}
          >
            {createOrderMutation.isPending ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.checkoutButtonText}>Confirmar Pedido</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ============================================================
  // 📋 MODO HISTÓRICO (BLINDADO)
  // ============================================================
  
  const orders = Array.isArray(ordersData) ? ordersData : []; 

  const activeOrders = orders.filter((order: any) => 
    order.status && ['pending', 'confirmed', 'preparing', 'delivering'].includes(order.status)
  );

  const orderHistory = orders.filter((order: any) => 
    order.status && ['delivered', 'cancelled'].includes(order.status)
  );
  
  const renderOrder = ({ item }: any) => {
    // Proteções para o Histórico
    const totalOrder = typeof item.total === 'number' ? item.total : 0;
    const restName = item.restaurant?.name || 'Restaurante';
    const restImage = item.restaurant?.image ? { uri: item.restaurant.image } : { uri: 'https://placehold.co/100' };
    const statusLabel = statusLabels[item.status] || item.status || 'Desconhecido';
    const statusColor = statusColors[item.status] || '#999';

    return (
      <TouchableOpacity style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderNumber}>Pedido #{item.id ? item.id.substring(0, 6) : '...'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>
        
        <View style={styles.restaurantInfo}>
          <Image source={restImage} style={styles.restaurantImage} />
          <View style={styles.restaurantDetails}>
            <Text style={styles.restaurantName}>{restName}</Text>
            <Text style={styles.orderDate}>{item.date || 'Data desconhecida'}</Text>
          </View>
        </View>

        <View style={styles.orderItems}>
          {item.items && item.items.slice(0, 2).map((orderItem: any, index: number) => (
            <Text key={index} style={styles.itemText}>
              {orderItem.quantity}x {orderItem.name}
            </Text>
          ))}
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.orderTotal}>Total: R$ {totalOrder.toFixed(2)}</Text>
          <View style={styles.orderActions}>
             {['pending', 'confirmed'].includes(item.status) && (
             <TouchableOpacity 
               style={{marginRight: 10, backgroundColor: '#FFEBEE', padding: 6, borderRadius: 8}}
               onPress={() => handleCancel(item.id)}
             >
               <Text style={{color: '#F44336', fontWeight: 'bold', fontSize: 12}}>Cancelar</Text>
             </TouchableOpacity>
           )}
           
           <TouchableOpacity>
             <Text style={{color: '#2196F3', backgroundColor: '#E3F2FD', padding: 6, borderRadius: 8, fontWeight: 'bold'}}>Detalhes</Text>
           </TouchableOpacity>
           
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
          <Text style={styles.headerTitle}>Meus Pedidos</Text>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Ativos ({activeOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            Histórico ({orderHistory.length})
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.emptyContainer}>
             <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : (
        <FlatList
            data={activeTab === 'active' ? activeOrders : orderHistory}
            keyExtractor={(item: any) => item.id ? item.id.toString() : Math.random().toString()}
            renderItem={renderOrder}
            contentContainerStyle={styles.ordersList}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B35']} />
            }
            ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={64} color="#ccc" />
                <Text style={styles.emptyTitle}>
                {activeTab === 'active' ? 'Nenhum pedido ativo' : 'Nenhum pedido no histórico'}
                </Text>
                <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/(tabs)')}>
                    <Text style={styles.browseButtonText}>Fazer um Pedido</Text>
                </TouchableOpacity>
            </View>
            )}
        />
      )}
    </View>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },

  // Estilos do Carrinho
  headerCart: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  restaurantHeader: { paddingHorizontal: 16, paddingTop: 16 },
  restaurantLabel: { fontSize: 12, color: '#666' },
  restaurantName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  cartItemCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, marginHorizontal: 16, marginTop: 12, borderRadius: 12, alignItems: 'center' },
  cartItemImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#eee' },
  cartItemInfo: { flex: 1, marginLeft: 12 },
  cartItemName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cartItemPrice: { fontSize: 14, color: '#4CAF50', marginTop: 2 },
  cartItemQty: { fontSize: 12, color: '#999' },
  removeButton: { padding: 8 },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  totalLabel: { fontSize: 18, color: '#666' },
  totalValue: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  checkoutButton: { backgroundColor: '#FF6B35', padding: 16, borderRadius: 12, alignItems: 'center' },
  checkoutButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  // Estilos do Histórico
  tabsContainer: { flexDirection: 'row', backgroundColor: '#fff', elevation: 2 },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#FF6B35' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#666' },
  activeTabText: { color: '#FF6B35', fontWeight: 'bold' },
  ordersList: { padding: 16 },
  orderCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderNumber: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  restaurantInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  restaurantImage: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  restaurantDetails: { flex: 1 },
  orderDate: { fontSize: 12, color: '#666', marginTop: 2 },
  orderItems: { marginBottom: 12 },
  itemText: { fontSize: 14, color: '#666', marginBottom: 2 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#eee' },
  orderTotal: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  orderActions: { flexDirection: 'row', alignItems: 'center' },
  
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#666', textAlign: 'center' },
  browseButton: { backgroundColor: '#FF6B35', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25, marginTop: 20 },
  browseButtonText: { color: '#fff', fontWeight: 'bold' },
});