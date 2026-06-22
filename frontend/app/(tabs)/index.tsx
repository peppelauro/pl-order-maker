import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/src/store/useStore';
import { customerAPI, posAPI, productAPI, seedData } from '@/src/services/api';

export default function NewOrderScreen() {
  const router = useRouter();
  const { agent, customers, setCustomers, setPointsOfSale, setProducts, setLastSyncTime, lastSyncTime } = useStore();
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!lastSyncTime) {
      handleSync();
    }
  }, []);

  const handleSync = async (showAlert = false) => {
    try {
      setSyncing(true);
      
      // First try to seed data if not already done
      try {
        await seedData();
      } catch (e) {
        console.log('Data already seeded or seed failed');
      }
      
      // Fetch all data
      const [customersData, posData, productsData] = await Promise.all([
        customerAPI.getAll(),
        posAPI.getAll(),
        productAPI.getAll(),
      ]);
      
      setCustomers(customersData);
      setPointsOfSale(posData);
      setProducts(productsData);
      setLastSyncTime(new Date().toISOString());
      
      if (showAlert) {
        Alert.alert('Successo', 'Dati sincronizzati con successo!');
      }
    } catch (error: any) {
      console.error('Sync error:', error);
      Alert.alert('Sincronizzazione Fallita', 'Impossibile sincronizzare i dati. Riprova.');
    } finally {
      setSyncing(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    handleSync(true);
  };

  const handleCreateOrder = () => {
    if (customers.length === 0) {
      Alert.alert('Nessun Dato', 'Sincronizza i dati prima di procedere');
      return;
    }
    router.push('/order/select-customer');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Ionicons name="receipt" size={48} color="#007AFF" />
        <Text style={styles.title}>Benvenuto, {agent?.name}!</Text>
        <Text style={styles.subtitle}>Crea nuovi ordini per i tuoi clienti</Text>
      </View>

      <TouchableOpacity
        style={[styles.createButton, customers.length === 0 && styles.buttonDisabled]}
        onPress={handleCreateOrder}
        disabled={customers.length === 0}
      >
        <Ionicons name="add-circle" size={32} color="#fff" />
        <View style={styles.createButtonContent}>
          <Text style={styles.createButtonText}>Crea Nuovo Ordine</Text>
          <Text style={styles.createButtonSubtext}>Seleziona cliente e aggiungi prodotti</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="sync" size={24} color="#007AFF" />
          <Text style={styles.cardTitle}>Sincronizzazione Dati</Text>
        </View>
        {lastSyncTime ? (
          <View>
            <Text style={styles.syncText}>Ultima sincronizzazione:</Text>
            <Text style={styles.syncTime}>
              {new Date(lastSyncTime).toLocaleString('it-IT')}
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{customers.length}</Text>
                <Text style={styles.statLabel}>Clienti</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{useStore.getState().pointsOfSale.length}</Text>
                <Text style={styles.statLabel}>Ubicazioni</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{useStore.getState().products.length}</Text>
                <Text style={styles.statLabel}>Prodotti</Text>
              </View>
            </View>
          </View>
        ) : (
          <Text style={styles.noSyncText}>Nessun dato sincronizzato</Text>
        )}
        <TouchableOpacity
          style={[styles.syncButton, syncing && styles.buttonDisabled]}
          onPress={() => handleSync(true)}
          disabled={syncing}
        >
          {syncing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="sync" size={20} color="#fff" />
              <Text style={styles.syncButtonText}>Sincronizza Ora</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={24} color="#007AFF" />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Come creare un ordine:</Text>
          <Text style={styles.infoText}>1. Seleziona un cliente</Text>
          <Text style={styles.infoText}>2. Scegli il punto vendita</Text>
          <Text style={styles.infoText}>3. Scansiona o cerca prodotti</Text>
          <Text style={styles.infoText}>4. Imposta data di consegna e salva</Text>
        </View>
      </View>
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
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  syncText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  syncTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  noSyncText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginVertical: 16,
  },
  syncButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#34C759',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonContent: {
    flex: 1,
    marginLeft: 16,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  createButtonSubtext: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
