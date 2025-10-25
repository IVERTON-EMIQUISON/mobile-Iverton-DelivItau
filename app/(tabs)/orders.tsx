
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOrders } from '../../src/hooks/useOrders';

const statusColors = {
  'pending': '#FFA500',
  'confirmed': '#4ECDC4',
  'preparing': '#FF6B35',
  'delivering': '#9C88FF',
  'delivered': '#4CAF50',
  'cancelled': '#F44336',
};

const statusLabels = {
  'pending': 'Pendente',
  'confirmed': 'Confirmado',
  'preparing': 'Preparando',
  'delivering': 'Entregando',
  'delivered': 'Entregue',
  'cancelled': 'Cancelado',
};

export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const { data: orders, isLoading, refetch } = useOrders();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const activeOrders = orders?.filter(order => 
    ['pending', 'confirmed', 'preparing', 'delivering'].includes(order.status)
  );

  const orderHistory = orders?.filter(order => 
    ['delivered', 'cancelled'].includes(order.status)
  );

  const renderOrder = ({ item }: any) => (
    <TouchableOpacity style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>Pedido #{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
          <Text style={styles.statusText}>{statusLabels[item.status]}</Text>
        </View>
      </View>
      
      <View style={styles.restaurantInfo}>
        <Image source={{ uri: item.restaurant.image }} style={styles.restaurantImage} />
        <View style={styles.restaurantDetails}>
          <Text style={styles.restaurantName}>{item.restaurant.name}</Text>
          <Text style={styles.orderDate}>{item.date}</Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        {item.items.slice(0, 2).map((orderItem: any, index: number) => (
          <Text key={index} style={styles.itemText}>
            {orderItem.quantity}x {orderItem.name}
          </Text>
        ))}
        {item.items.length > 2 && (
          <Text style={styles.moreItems}>+{item.items.length - 2} itens</Text>
        )}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>Total: R$ {item.total.toFixed(2)}</Text>
        <View style={styles.orderActions}>
          {item.status === 'delivered' && (
            <TouchableOpacity style={styles.rateButton}>
              <Ionicons name="star-outline" size={16} color="#FFD700" />
              <Text style={styles.rateText}>Avaliar</Text>
            </TouchableOpacity>
          )}
          {['pending', 'confirmed'].includes(item.status) && (
            <TouchableOpacity style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.detailsButton}>
            <Text style={styles.detailsText}>Detalhes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Ativos ({activeOrders?.length || 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            Histórico ({orderHistory?.length || 0})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Pedidos */}
      <FlatList
        data={activeTab === 'active' ? activeOrders : orderHistory}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.ordersList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF6B35']}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>
              {activeTab === 'active' ? 'Nenhum pedido ativo' : 'Nenhum pedido no histórico'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'active' 
                ? 'Faça seu primeiro pedido!'
                : 'Seus pedidos anteriores aparecerão aqui'
              }
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF6B35',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  ordersList: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  restaurantImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  restaurantDetails: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  orderItems: {
    marginBottom: 12,
  },
  itemText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  moreItems: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  orderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  rateText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  cancelButton: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  cancelText: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailsButton: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  detailsText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
