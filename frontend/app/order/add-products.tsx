import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';
import { useStore } from '@/src/store/useStore';
import { productAPI } from '@/src/services/api';

interface Product {
  id: string;
  name: string;
  barcode: string;
  price: number;
  description?: string;
  category?: string;
  stock?: number;
}

interface OrderProduct {
  product_id: string;
  product_name: string;
  barcode: string;
  quantity: number;
  price: number;
  total: number;
}

export default function AddProductsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { products } = useStore();
  
  const [search, setSearch] = useState('');
  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const [scanCount, setScanCount] = useState(0);

  const customerId = params.customerId as string;
  const customerName = params.customerName as string;
  const posId = params.posId as string;
  const posName = params.posName as string;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const filteredProducts = products.filter((product: Product) =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.barcode.includes(search)
  );

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    setShowScanner(false);

    try {
      const product = await productAPI.getByBarcode(data);
      addProductToOrder(product);
    } catch (error) {
      Alert.alert('Product Not Found', `No product found with barcode: ${data}`);
    } finally {
      setTimeout(() => setScanned(false), 2000);
    }
  };

  const addProductToOrder = (product: Product) => {
    const existing = orderProducts.find(p => p.product_id === product.id);
    
    if (existing) {
      setOrderProducts(
        orderProducts.map(p =>
          p.product_id === product.id
            ? { ...p, quantity: p.quantity + 1, total: (p.quantity + 1) * p.price }
            : p
        )
      );
    } else {
      const newProduct: OrderProduct = {
        product_id: product.id,
        product_name: product.name,
        barcode: product.barcode,
        quantity: 1,
        price: product.price,
        total: product.price,
      };
      setOrderProducts([...orderProducts, newProduct]);
    }

    // Non mostrare alert durante la scansione multipla, solo feedback visivo
  };

  const updateQuantity = (productId: string, change: number) => {
    setOrderProducts(
      orderProducts
        .map(p => {
          if (p.product_id === productId) {
            const newQty = p.quantity + change;
            if (newQty <= 0) return null;
            return { ...p, quantity: newQty, total: newQty * p.price };
          }
          return p;
        })
        .filter((p): p is OrderProduct => p !== null)
    );
  };

  const removeProduct = (productId: string) => {
    setOrderProducts(orderProducts.filter(p => p.product_id !== productId));
  };

  const handleContinue = () => {
    if (orderProducts.length === 0) {
      Alert.alert('No Products', 'Please add at least one product to the order');
      return;
    }

    router.push({
      pathname: '/order/review',
      params: {
        customerId,
        customerName,
        posId,
        posName,
        products: JSON.stringify(orderProducts),
      },
    });
  };

  const openScanner = () => {
    if (hasPermission === null) {
      Alert.alert('Permesso In Attesa', 'Richiesta permesso fotocamera...');
      return;
    }
    if (hasPermission === false) {
      Alert.alert('Nessun Permesso', 'Il permesso della fotocamera è necessario per scansionare i barcode');
      return;
    }
    setScanCount(0);
    setShowScanner(true);
  };

  const closeScanner = () => {
    setShowScanner(false);
    if (scanCount > 0) {
      Alert.alert('Scansione Completata', `${scanCount} prodotto(i) aggiunto(i) all'ordine`);
    }
    setScanCount(0);
  };

  const totalAmount = orderProducts.reduce((sum, p) => sum + p.total, 0);

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => addProductToOrder(item)}
    >
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productBarcode}>
          <Ionicons name="barcode" size={12} color="#666" /> {item.barcode}
        </Text>
        {item.category && (
          <Text style={styles.productCategory}>{item.category}</Text>
        )}
      </View>
      <View style={styles.productRight}>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
        <Ionicons name="add-circle" size={24} color="#34C759" />
      </View>
    </TouchableOpacity>
  );

  const renderOrderProduct = ({ item }: { item: OrderProduct }) => (
    <View style={styles.orderProductCard}>
      <View style={styles.orderProductInfo}>
        <Text style={styles.orderProductName}>{item.product_name}</Text>
        <Text style={styles.orderProductPrice}>${item.price.toFixed(2)} each</Text>
      </View>
      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.product_id, -1)}
        >
          <Ionicons name="remove" size={20} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.product_id, 1)}
        >
          <Ionicons name="add" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.orderProductRight}>
        <Text style={styles.orderProductTotal}>${item.total.toFixed(2)}</Text>
        <TouchableOpacity onPress={() => removeProduct(item.product_id)}>
          <Ionicons name="trash" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerInfo}>
        <View style={styles.headerInfoRow}>
          <Ionicons name="business" size={16} color="#007AFF" />
          <Text style={styles.headerInfoText}>{customerName}</Text>
        </View>
        <View style={styles.headerInfoRow}>
          <Ionicons name="location" size={16} color="#007AFF" />
          <Text style={styles.headerInfoText}>{posName}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.scanButton} onPress={openScanner}>
          <Ionicons name="scan" size={24} color="#fff" />
          <Text style={styles.scanButtonText}>Scan Barcode</Text>
        </TouchableOpacity>
      </View>

      {orderProducts.length > 0 && (
        <View style={styles.orderSection}>
          <Text style={styles.sectionTitle}>Order Items ({orderProducts.length})</Text>
          <FlatList
            data={orderProducts}
            renderItem={renderOrderProduct}
            keyExtractor={(item) => item.product_id}
            scrollEnabled={false}
          />
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>${totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      )}

      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Search Products</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or barcode..."
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
        
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.productsList}
          style={styles.productsListContainer}
        />
      </View>

      {orderProducts.length > 0 && (
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue to Review</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      )}

      <Modal visible={showScanner} animationType="slide" onRequestClose={closeScanner}>
        <View style={styles.scannerContainer}>
          <CameraView
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
            barcodeScannerSettings={{
              barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e'],
            }}
          />
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerHeader}>
              <Text style={styles.scannerTitle}>Scansiona Barcode</Text>
              <Text style={styles.scannerSubtitle}>Scansiona più prodotti consecutivamente</Text>
              {scanCount > 0 && (
                <View style={styles.scanCountBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                  <Text style={styles.scanCountText}>{scanCount} prodotto(i) aggiunto(i)</Text>
                </View>
              )}
            </View>
            
            <View style={styles.scannerFrame} />
            
            <View style={styles.scannerFooter}>
              <Text style={styles.scannerHint}>Inquadra il barcode nel riquadro</Text>
              <TouchableOpacity
                style={styles.closeScannerButton}
                onPress={closeScanner}
              >
                <Ionicons name="close-circle" size={24} color="#fff" />
                <Text style={styles.closeScannerText}>Chiudi Scanner</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Lista prodotti scansionati nella sessione corrente */}
          {orderProducts.length > 0 && (
            <View style={styles.scannedProductsList}>
              <Text style={styles.scannedProductsTitle}>Prodotti nell'ordine:</Text>
              {orderProducts.slice(-3).reverse().map((product, index) => (
                <View key={index} style={styles.scannedProductItem}>
                  <Text style={styles.scannedProductName} numberOfLines={1}>
                    {product.product_name}
                  </Text>
                  <Text style={styles.scannedProductQty}>x{product.quantity}</Text>
                </View>
              ))}
              {orderProducts.length > 3 && (
                <Text style={styles.moreProductsText}>
                  +{orderProducts.length - 3} altri...
                </Text>
              )}
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerInfo: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  headerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  headerInfoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
  },
  actionButtons: {
    padding: 16,
  },
  scanButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
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
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  orderSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  orderProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderProductInfo: {
    flex: 1,
  },
  orderProductName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  orderProductPrice: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 12,
    minWidth: 30,
    textAlign: 'center',
  },
  orderProductRight: {
    alignItems: 'flex-end',
  },
  orderProductTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#007AFF',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  searchSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
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
  productsListContainer: {
    flex: 1,
  },
  productsList: {
    paddingBottom: 16,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  productBarcode: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  productCategory: {
    fontSize: 11,
    color: '#007AFF',
    marginTop: 2,
  },
  productRight: {
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#34C759',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 16,
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
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  scannerHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  scannerSubtitle: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  scanCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  scanCountText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  scannerFrame: {
    width: 280,
    height: 280,
    borderWidth: 3,
    borderColor: '#34C759',
    borderRadius: 12,
    alignSelf: 'center',
  },
  scannerFooter: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  scannerHint: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  closeScannerButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    gap: 8,
  },
  closeScannerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  scannedProductsList: {
    position: 'absolute',
    bottom: 140,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 12,
    padding: 12,
  },
  scannedProductsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  scannedProductItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  scannedProductName: {
    fontSize: 14,
    color: '#fff',
    flex: 1,
  },
  scannedProductQty: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
    marginLeft: 8,
  },
  moreProductsText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
});
