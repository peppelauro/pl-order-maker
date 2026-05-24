import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useStore } from '@/src/store/useStore';

interface OrderProduct {
  product_id: string;
  product_name: string;
  barcode: string;
  quantity: number;
  price: number;
  total: number;
}

export default function ReviewOrderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { agent, addOrder } = useStore();

  const customerId = params.customerId as string;
  const customerName = params.customerName as string;
  const posId = params.posId as string;
  const posName = params.posName as string;
  const products: OrderProduct[] = JSON.parse(params.products as string);

  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const totalAmount = products.reduce((sum, p) => sum + p.total, 0);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDeliveryDate(selectedDate);
    }
  };

  const handleSaveOrder = () => {
    if (!agent) {
      Alert.alert('Error', 'Agent information not found');
      return;
    }

    Alert.alert(
      'Save Order',
      'Do you want to save this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async () => {
            try {
              setSaving(true);

              const order = {
                id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                agent_id: agent.id,
                agent_name: agent.name,
                customer_id: customerId,
                customer_name: customerName,
                pos_id: posId,
                pos_name: posName,
                products: products,
                delivery_date: deliveryDate.toISOString(),
                total_amount: totalAmount,
                status: 'pending' as const,
                created_at: new Date().toISOString(),
              };

              addOrder(order);

              Alert.alert(
                'Order Saved',
                'Order has been saved locally. Sync from Orders tab to send to server.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      router.replace('/(tabs)/orders');
                    },
                  },
                ]
              );
            } catch (error) {
              console.error('Save error:', error);
              Alert.alert('Error', 'Failed to save order');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Details</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={20} color="#007AFF" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Agent</Text>
              <Text style={styles.infoValue}>{agent?.name}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Ionicons name="business" size={20} color="#007AFF" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Customer</Text>
              <Text style={styles.infoValue}>{customerName}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color="#007AFF" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{posName}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Date</Text>
        <TouchableOpacity
          style={styles.dateCard}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar" size={24} color="#007AFF" />
          <View style={styles.dateContent}>
            <Text style={styles.dateLabel}>Selected Date</Text>
            <Text style={styles.dateValue}>
              {deliveryDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={deliveryDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Products ({products.length})</Text>
        <View style={styles.card}>
          {products.map((product, index) => (
            <View key={index}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.productRow}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.product_name}</Text>
                  <Text style={styles.productDetail}>
                    {product.quantity} × ${product.price.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.productTotal}>${product.total.toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.totalCard}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.grandTotalLabel}>Total Amount</Text>
          <Text style={styles.grandTotalValue}>${totalAmount.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.buttonDisabled]}
        onPress={handleSaveOrder}
        disabled={saving}
      >
        <Ionicons name="checkmark-circle" size={24} color="#fff" />
        <Text style={styles.saveButtonText}>
          {saving ? 'Saving...' : 'Save Order'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateContent: {
    flex: 1,
    marginLeft: 12,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 2,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  productDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  productTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  totalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  grandTotalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#34C759',
    paddingVertical: 16,
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
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
