import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  TextInput, 
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import apiClient from '../api/apiClient';

const SellHarvestScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('LIST_NEW'); // 'LIST_NEW', 'MY_LISTINGS'
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [myListings, setMyListings] = useState([]);

  const [form, setForm] = useState({
    name: '',
    category: 'Other',
    description: '',
    price: '',
    unit: 'kg',
    image: ''
  });

  const categories = ['Rice', 'Vegetables', 'Fruits', 'Spices', 'Other'];
  const units = ['kg', 'g', 'pack', 'bundle', 'unit'];

  const fetchMyListings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/products/my-listings');
      setMyListings(response.data);
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'MY_LISTINGS') {
      fetchMyListings();
    }
  }, [activeTab, fetchMyListings]);

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.unit) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/products', form);
      Alert.alert('Success', 'Harvest listed successfully!');
      setForm({ name: '', category: 'Other', description: '', price: '', unit: 'kg', image: '' });
      setActiveTab('MY_LISTINGS');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to list harvest');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Confirm', 'Remove this listing?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await apiClient.delete(`/products/${id}`);
            fetchMyListings();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete listing');
          }
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('farmer.sellHarvest')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'LIST_NEW' && styles.activeTab]} 
          onPress={() => setActiveTab('LIST_NEW')}
        >
          <Text style={[styles.tabText, activeTab === 'LIST_NEW' && styles.activeTabText]}>List New Harvest</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'MY_LISTINGS' && styles.activeTab]} 
          onPress={() => setActiveTab('MY_LISTINGS')}
        >
          <Text style={[styles.tabText, activeTab === 'MY_LISTINGS' && styles.activeTabText]}>My Listings</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'LIST_NEW' ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.formLabel}>What are you selling? *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. Red Rice, Carrots (50kg)" 
              value={form.name}
              onChangeText={(val) => setForm({ ...form, name: val })}
            />

            <Text style={styles.formLabel}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {categories.map(cat => (
                <TouchableOpacity 
                  key={cat} 
                  style={[styles.chip, form.category === cat && styles.activeChip]}
                  onPress={() => setForm({ ...form, category: cat })}
                >
                  <Text style={[styles.chipText, form.category === cat && styles.activeChipText]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.row}>
              <View style={{ flex: 2, marginRight: 10 }}>
                <Text style={styles.formLabel}>Price (LKR) *</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="e.g. 250" 
                  keyboardType="numeric"
                  value={form.price}
                  onChangeText={(val) => setForm({ ...form, price: val })}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.formLabel}>Unit *</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="kg" 
                  value={form.unit}
                  onChangeText={(val) => setForm({ ...form, unit: val })}
                />
              </View>
            </View>

            <Text style={styles.formLabel}>Description</Text>
            <TextInput 
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
              placeholder="Mention quality, variety, or location..." 
              multiline
              value={form.description}
              onChangeText={(val) => setForm({ ...form, description: val })}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>List Harvest</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={myListings}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.listingCard}>
              <View style={styles.listingInfo}>
                <Text style={styles.listingTitle}>{item.name}</Text>
                <Text style={styles.listingCategory}>{item.category} • {item.status}</Text>
                <Text style={styles.listingPrice}>LKR {item.price} / {item.unit}</Text>
              </View>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
                <Text style={styles.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchMyListings(true)} />}
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>🌾</Text>
                <Text style={styles.emptyText}>You haven't listed any harvests yet.</Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff' },
  backBtnText: { color: '#2e7d32', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1b5e20' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#2e7d32' },
  tabText: { fontSize: 14, color: '#666' },
  activeTabText: { color: '#2e7d32', fontWeight: 'bold' },
  content: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  formLabel: { fontSize: 14, fontWeight: 'bold', color: '#444', marginTop: 15, marginBottom: 8 },
  input: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 15, fontSize: 15, borderWidth: 1, borderColor: '#eee', color: '#333' },
  chipRow: { flexDirection: 'row', marginBottom: 5 },
  chip: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 10 },
  activeChip: { backgroundColor: '#2e7d32' },
  chipText: { fontSize: 12, color: '#666' },
  activeChipText: { color: '#fff', fontWeight: 'bold' },
  row: { flexDirection: 'row' },
  submitBtn: { backgroundColor: '#1b5e20', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 30 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  listContent: { padding: 20 },
  listingCard: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  listingInfo: { flex: 1 },
  listingTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  listingCategory: { fontSize: 12, color: '#888', marginTop: 2 },
  listingPrice: { fontSize: 15, fontWeight: 'bold', color: '#2e7d32', marginTop: 5 },
  deleteBtn: { padding: 10 },
  deleteIcon: { fontSize: 18 },
  emptyBox: { flex: 1, alignItems: 'center', marginTop: 100, padding: 40 },
  emptyIcon: { fontSize: 60, color: '#ccc', marginBottom: 20 },
  emptyText: { color: '#999', textAlign: 'center', fontSize: 14 }
});

export default SellHarvestScreen;
