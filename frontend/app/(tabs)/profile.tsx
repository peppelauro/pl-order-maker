import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/src/store/useStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { agent, logout, orders, customers, products, lastSyncTime } = useStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? All local data will be cleared.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const InfoCard = ({ icon, title, value, color }: any) => (
    <View style={styles.infoCard}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoValue}>{value}</Text>
        <Text style={styles.infoTitle}>{title}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={48} color="#fff" />
        </View>
        <Text style={styles.name}>{agent?.name}</Text>
        {agent?.email && <Text style={styles.email}>{agent.email}</Text>}
        {agent?.phone && <Text style={styles.phone}>{agent.phone}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <InfoCard
            icon="receipt"
            title="Total Orders"
            value={orders.length}
            color="#007AFF"
          />
          <InfoCard
            icon="time"
            title="Pending"
            value={orders.filter(o => o.status === 'pending').length}
            color="#FF9500"
          />
          <InfoCard
            icon="checkmark-circle"
            title="Synced"
            value={orders.filter(o => o.status === 'synced').length}
            color="#34C759"
          />
          <InfoCard
            icon="people"
            title="Customers"
            value={customers.length}
            color="#5856D6"
          />
          <InfoCard
            icon="cube"
            title="Products"
            value={products.length}
            color="#FF2D55"
          />
          <InfoCard
            icon="calculator"
            title="Total Value"
            value={`$${orders.reduce((sum, o) => sum + o.total_amount, 0).toFixed(0)}`}
            color="#34C759"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>
        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Ionicons name="sync" size={20} color="#666" />
            <View style={styles.infoRowContent}>
              <Text style={styles.infoRowTitle}>Last Sync</Text>
              <Text style={styles.infoRowValue}>
                {lastSyncTime
                  ? new Date(lastSyncTime).toLocaleString()
                  : 'Never'}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Ionicons name="person-circle" size={20} color="#666" />
            <View style={styles.infoRowContent}>
              <Text style={styles.infoRowTitle}>Agent ID</Text>
              <Text style={styles.infoRowValue}>{agent?.id || 'N/A'}</Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color="#fff" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  phone: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  infoTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  infoList: {
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
  infoRowContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoRowTitle: {
    fontSize: 14,
    color: '#666',
  },
  infoRowValue: {
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
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 16,
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
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginTop: 24,
  },
});
