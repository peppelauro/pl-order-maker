import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/src/store/useStore';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export default function SelectCustomerScreen() {
  const router = useRouter();
  const { customers } = useStore();
  const [search, setSearch] = useState('');

  const filteredCustomers = customers.filter((customer: Customer) =>
    customer.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectCustomer = (customer: Customer) => {
    router.push({
      pathname: '/order/select-pos',
      params: { 
        customerId: customer.id,
        customerName: customer.name,
      },
    });
  };

  const renderCustomer = ({ item }: { item: Customer }) => (
    <TouchableOpacity
      style={styles.customerCard}
      onPress={() => handleSelectCustomer(item)}
    >
      <View style={styles.customerIcon}>
        <Ionicons name="business" size={24} color="#007AFF" />
      </View>
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{item.name}</Text>
        {item.address && (
          <Text style={styles.customerDetail}>
            <Ionicons name="location" size={12} color="#666" /> {item.address}
          </Text>
        )}
        {item.phone && (
          <Text style={styles.customerDetail}>
            <Ionicons name="call" size={12} color="#666" /> {item.phone}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={24} color="#666" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search customers..."
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.resultHeader}>
        <Text style={styles.resultText}>
          {filteredCustomers.length} customer(s) found
        </Text>
      </View>

      <FlatList
        data={filteredCustomers}
        renderItem={renderCustomer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  resultHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  customerCard: {
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
  customerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  customerDetail: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
  },
  separator: {
    height: 12,
  },
});
