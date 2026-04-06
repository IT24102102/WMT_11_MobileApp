import React, { useState, useEffect, useCallback, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ScrollView,
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  ActivityIndicator,
  RefreshControl,
  TextInput
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import apiClient from '../api/apiClient';

const CROP_ICONS = {
  rice: '🌾', vegetables: '🥦', fruits: '🍎', spices: '🌶️',
  tea: '🍵', coconut: '🥥', rubber: '🌿', coffee: '☕', other: '🌱',
};

const STATUS_COLORS = {
  APPROVED: { bg: '#e8f5e9', text: '#2e7d32', dot: '#4caf50' },
  PENDING: { bg: '#fff3e0', text: '#ef6c00', dot: '#ff9800' },
  REJECTED: { bg: '#ffebee', text: '#c62828', dot: '#f44336' },
};

const MyCropsScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);
  const { t } = useLanguage();

  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  const fetchCrops = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const response = await apiClient.get('/crops');
      console.log(`[DEBUG] Received ${response.data.length} crops for user from API.`);
      setCrops(response.data);
      setError(null);
    } catch (err) {
      console.error('[DEBUG] Error fetching crops:', err.response?.data || err.message);
      setError(err.response?.data?.message || err.message || 'Failed to load crops');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCrops();
  }, [fetchCrops]);

  const filteredCrops = crops.filter(c => {
    const matchesFilter = filter === 'ALL' || c.status === filter;
    const matchesSearch = !search || 
      c.cropType.toLowerCase().includes(search.toLowerCase()) || 
      (c.variety && c.variety.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const counts = {
    ALL: crops.length,
    APPROVED: crops.filter(c => c.status === 'APPROVED').length,
    PENDING: crops.filter(c => c.status === 'PENDING').length,
    REJECTED: crops.filter(c => c.status === 'REJECTED').length,
  };

  const renderCropItem = ({ item }) => {
    const status = STATUS_COLORS[item.status] || STATUS_COLORS.PENDING;
    const icon = CROP_ICONS[item.cropType.toLowerCase()] || '🌱';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <Text style={styles.cardIcon}>{icon}</Text>
          </View>
          <View style={styles.titleBox}>
            <Text style={styles.cardTitle}>{item.cropType.charAt(0).toUpperCase() + item.cropType.slice(1)}</Text>
            {item.variety && <Text style={styles.cardVariety}>{item.variety}</Text>}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: status.dot }]} />
            <Text style={[styles.statusText, { color: status.text }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>📐 {t('farmer_crop.landSize')}</Text>
            <Text style={styles.statValue}>{item.landSize} ac</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>🗓️ {t('farmer_crop.season')}</Text>
            <Text style={styles.statValue}>{item.season || 'N/A'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>🏛️ ASC</Text>
            <Text style={styles.statValue} numberOfLines={1}>{item.assignedAsc?.name || 'Assigned'}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← {t('dashboard.welcome')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('farmer_crop.headerList')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('RegisterCrop')} style={styles.addBtn}>
           <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {['ALL', 'APPROVED', 'PENDING', 'REJECTED'].map(f => (
            <TouchableOpacity 
              key={f} 
              style={[styles.filterChip, filter === f && styles.activeFilterChip]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterChipText, filter === f && styles.activeFilterChipText]}>
                {f} ({counts[f]})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search crops..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredCrops}
        keyExtractor={item => item._id}
        renderItem={renderCropItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchCrops(true)} />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>{error ? '⚠️' : '🌾'}</Text>
              <Text style={styles.emptyTitle}>{error || t('farmer_crop.emptyList')}</Text>
              {!error && (
                <TouchableOpacity style={styles.emptyAddBtn} onPress={() => navigation.navigate('RegisterCrop')}>
                  <Text style={styles.emptyAddBtnText}>{t('farmer_crop.createNew')}</Text>
                </TouchableOpacity>
              )}
              {error && (
                <TouchableOpacity style={styles.emptyAddBtn} onPress={() => fetchCrops()}>
                  <Text style={styles.emptyAddBtnText}>Retry</Text>
                </TouchableOpacity>
              )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: { padding: 5 },
  backBtnText: { color: '#2e7d32', fontSize: 14, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1b5e20' },
  addBtn: {
    backgroundColor: '#1b5e20',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  filterBar: { backgroundColor: '#fff', paddingVertical: 10 },
  filterScroll: { paddingHorizontal: 15 },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee'
  },
  activeFilterChip: { backgroundColor: '#e8f5e9', borderColor: '#2e7d32' },
  filterChipText: { fontSize: 12, color: '#666' },
  activeFilterChipText: { color: '#2e7d32', fontWeight: 'bold' },
  searchContainer: { padding: 15, backgroundColor: '#fff' },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 10,
    paddingHorizontal: 15,
    fontSize: 14,
  },
  listContent: { padding: 15 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: '#f0f4f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardIcon: { fontSize: 24 },
  titleBox: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardVariety: { fontSize: 12, color: '#666' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { flex: 1 },
  statLabel: { fontSize: 10, color: '#999', marginBottom: 2 },
  statValue: { fontSize: 13, fontWeight: '600', color: '#444' },
  emptyBox: { alignItems: 'center', marginTop: 100, padding: 40 },
  emptyIcon: { fontSize: 60, color: '#ccc', marginBottom: 20 },
  emptyTitle: { fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 20 },
  emptyAddBtn: {
    backgroundColor: '#2e7d32',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  emptyAddBtnText: { color: '#fff', fontWeight: 'bold' }
});

export default MyCropsScreen;
