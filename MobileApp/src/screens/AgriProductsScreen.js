import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  ActivityIndicator,
  Image,
  TextInput,
  RefreshControl
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import apiClient from '../api/apiClient';

const CATEGORIES = [
  'All', 'Seeds', 'Fertilizers', 'Pesticides', 'Tools', 'Irrigation', 'Animal Health', 'Other'
];

const AgriProductsScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);
  const { t } = useLanguage();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchProducts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await apiClient.get('/products/available');
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = !search || 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderProductItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => {}}>
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.productImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>📦</Text>
          </View>
        )}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productPrice}>LKR {item.price} <Text style={styles.unitText}>/ {item.unit}</Text></Text>
        <Text style={styles.sellerName}>👤 {item.seller?.name || 'AgroLanka Store'}</Text>
        <TouchableOpacity style={styles.buyBtn} onPress={() => {}}>
          <Text style={styles.buyBtnText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('farmer.agriProducts')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchBar}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search seeds, fertilizer..." 
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <View style={styles.categoryList}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.catBtn, selectedCategory === cat && styles.activeCatBtn]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.catBtnText, selectedCategory === cat && styles.activeCatBtnText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={item => item._id}
        renderItem={renderProductItem}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchProducts(true)} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🛒</Text>
              <Text style={styles.emptyText}>No products found in your region.</Text>
            </View>
          )
        }
        ListFooterComponent={loading && <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 20 }} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff' },
  backBtnText: { color: '#2e7d32', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1b5e20' },
  searchBar: { backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 10 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 12, paddingHorizontal: 15, height: 45 },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  categoryList: { backgroundColor: '#fff', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  categoryScroll: { paddingHorizontal: 15 },
  catBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 10 },
  activeCatBtn: { backgroundColor: '#2e7d32' },
  catBtnText: { fontSize: 12, color: '#666' },
  activeCatBtnText: { color: '#fff', fontWeight: 'bold' },
  listContent: { padding: 10 },
  row: { justifyContent: 'space-between' },
  card: { backgroundColor: '#fff', borderRadius: 15, width: '48%', marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, overflow: 'hidden' },
  imageContainer: { width: '100%', height: 120, position: 'relative' },
  productImage: { width: '100%', height: '100%' },
  placeholderImage: { width: '100%', height: '100%', backgroundColor: '#f0f4f0', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 40 },
  categoryBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  categoryText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  infoContainer: { padding: 12 },
  productName: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#2e7d32', marginBottom: 5 },
  unitText: { fontSize: 12, color: '#888', fontWeight: 'normal' },
  sellerName: { fontSize: 11, color: '#888', marginBottom: 12 },
  buyBtn: { backgroundColor: '#e8f5e9', paddingVertical: 8, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#2e7d32' },
  buyBtnText: { color: '#2e7d32', fontSize: 12, fontWeight: 'bold' },
  emptyBox: { flex: 1, alignItems: 'center', marginTop: 100, padding: 40 },
  emptyIcon: { fontSize: 60, color: '#ccc', marginBottom: 20 },
  emptyText: { color: '#999', textAlign: 'center', fontSize: 14 }
});

export default AgriProductsScreen;
