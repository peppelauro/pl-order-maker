import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/src/store/useStore';
import { orderAPI } from '@/src/services/api';

interface Order {
  id?: string;
  agent_id: string;
  agent_name: string;
  customer_name: string;
  pos_name: string;
  products: any[];
  delivery_date: string;
  total_amount: number;
  status: 'pending' | 'synced' | 'completed';
  created_at?: string;
}

export default function OrdersScreen() {
  const { agent, orders, addOrder, updateOrderStatus } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const syncedOrders = orders.filter(o => o.status === 'synced');

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (agent?.id) {
        const serverOrders = await orderAPI.getAll(agent.id);
        useStore.getState().setOrders(serverOrders);
      }
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSyncOrders = async () => {
    if (pendingOrders.length === 0) {
      Alert.alert('No Orders', 'No pending orders to sync');
      return;
    }

    setSyncing(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const order of pendingOrders) {
        try {
          const result = await orderAPI.create(order);
          if (order.id) {
            updateOrderStatus(order.id, 'synced');
          }
          successCount++;
        } catch (error) {
          console.error('Failed to sync order:', error);
          failCount++;
        }
      }

      Alert.alert(
        'Sync Complete',
        `${successCount} orders synced successfully${failCount > 0 ? `, ${failCount} failed` : ''}`
      );
    } catch (error) {
      Alert.alert('Sync Failed', 'Failed to sync orders');
    } finally {
      setSyncing(false);
    }
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => setSelectedOrder(selectedOrder?.id === item.id ? null : item)}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderLeft}>
          <Ionicons
            name={item.status === 'synced' ? 'checkmark-circle' : 'time'}
            size={24}
            color={item.status === 'synced' ? '#34C759' : '#FF9500'}
          />
          <View style={styles.orderHeaderText}>
            <Text style={styles.customerName}>{item.customer_name}</Text>
            <Text style={styles.posName}>{item.pos_name}</Text>
          </View>
        </View>
        <View style={styles.orderHeaderRight}>
          <Text style={styles.orderAmount}>${item.total_amount.toFixed(2)}</Text>
          <Text style={styles.orderStatus}>
            {item.status === 'synced' ? 'Synced' : 'Pending'}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.orderDetailRow}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.orderDetailText}>
            Delivery: {new Date(item.delivery_date).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.orderDetailRow}>
          <Ionicons name="cube" size={16} color="#666" />
          <Text style={styles.orderDetailText}>
            {item.products.length} product(s)
          </Text>
        </View>
        {item.created_at && (
          <View style={styles.orderDetailRow}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.orderDetailText}>
              Created: {new Date(item.created_at).toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      {selectedOrder?.id === item.id && (
        <View style={styles.orderProductsList}>
          <Text style={styles.productsTitle}>Products:</Text>
          {item.products.map((product, index) => (
            <View key={index} style={styles.productItem}>
              <Text style={styles.productName}>{product.product_name}</Text>
              <Text style={styles.productDetails}>
                {product.quantity} x ${product.price.toFixed(2)} = $
                {product.total.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.headerStats}>
          <View style={styles.statBadge}>
            <Text style={styles.statNumber}>{pendingOrders.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statNumber}>{syncedOrders.length}</Text>
            <Text style={styles.statLabel}>Synced</Text>
          </View>
        </View>
      </View>

      {pendingOrders.length > 0 && (
        <TouchableOpacity
          style={[styles.syncButton, syncing && styles.buttonDisabled]}
          onPress={handleSyncOrders}
          disabled={syncing}
        >
          {syncing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="cloud-upload" size={20} color="#fff" />
              <Text style={styles.syncButtonText}>
                Sync {pendingOrders.length} Pending Order(s)
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No orders yet</Text>
          <Text style={styles.emptySubtext}>Create your first order from the New Order tab</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item, index) => item.id || `order-${index}`}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  headerStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  syncButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    margin: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  orderHeaderRight: {
    alignItems: 'flex-end',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  posName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  orderStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  orderDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  orderDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  orderProductsList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  productsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  productName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  productDetails: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
