import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/src/store/useStore';

interface PointOfSale {
  id: string;
  customer_id: string;
  name: string;
  address: string;
  city?: string;
  phone?: string;
}

export default function SelectPosScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { pointsOfSale } = useStore();
  const [search, setSearch] = useState('');

  const customerId = params.customerId as string;
  const customerName = params.customerName as string;

  const customerPointsOfSale = pointsOfSale.filter(
    (pos: PointOfSale) => pos.customer_id === customerId
  );

  const filteredPOS = customerPointsOfSale.filter((pos: PointOfSale) =>
    pos.name.toLowerCase().includes(search.toLowerCase()) ||
    pos.address.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectPOS = (pos: PointOfSale) => {
    router.push({
      pathname: '/order/add-products',
      params: {
        customerId,
        customerName,
        posId: pos.id,
        posName: pos.name,
      },
    });
  };

  const renderPOS = ({ item }: { item: PointOfSale }) => (
    <TouchableOpacity
      style={styles.posCard}
      onPress={() => handleSelectPOS(item)}
    >
      <View style={styles.posIcon}>
        <Ionicons name="location" size={24} color="#007AFF" />
      </View>
      <View style={styles.posInfo}>
        <Text style={styles.posName}>{item.name}</Text>
        <Text style={styles.posDetail}>
          <Ionicons name="navigate" size={12} color="#666" /> {item.address}
        </Text>
        {item.city && (
          <Text style={styles.posDetail}>
            <Ionicons name="business" size={12} color="#666" /> {item.city}
          </Text>
        )}
        {item.phone && (
          <Text style={styles.posDetail}>
            <Ionicons name="call" size={12} color="#666" /> {item.phone}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={24} color="#666" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerInfo}>
        <Ionicons name="business" size={20} color="#007AFF" />
        <Text style={styles.headerText}>Customer: {customerName}</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search locations..."
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
          {filteredPOS.length} location(s) found
        </Text>
      </View>

      {filteredPOS.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="location-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No locations found</Text>
          <Text style={styles.emptySubtext}>This customer has no registered locations</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPOS}
          renderItem={renderPOS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
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
  posCard: {
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
  posIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  posInfo: {
    flex: 1,
  },
  posName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  posDetail: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
  },
  separator: {
    height: 12,
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
