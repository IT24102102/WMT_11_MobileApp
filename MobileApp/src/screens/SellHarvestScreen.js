import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Image,
  StatusBar,
  TextInput,
  ImageBackground
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import * as ImagePicker from 'expo-image-picker';
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
    unit: '',
    stock: '', // New field for quantity
    image: '',
    districts: [] // Array of districts
  });

  const categories = ['Rice', 'Vegetables', 'Fruits', 'Spices', 'Other'];
  const units = ['kg', 'g', 'pack', 'bundle', 'unit'];
  const districtsList = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar', 
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee', 
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 
    'Moneragala', 'Ratnapura', 'Kegalle'
  ];

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

  const toggleDistrict = (district) => {
    setForm(prev => ({
      ...prev,
      districts: prev.districts.includes(district) 
        ? prev.districts.filter(d => d !== district)
        : [...prev.districts, district]
    }));
  };

  const handleSubmit = async () => {
    // If no district selected, try to fallback to user's assigned district
    const finalDistricts = form.districts.length > 0 
      ? form.districts 
      : (userInfo?.assignedAsc?.district ? [userInfo.assignedAsc.district] : []);

    if (!form.name || !form.price || !form.unit) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (finalDistricts.length === 0) {
      Alert.alert('Error', 'Please select at least one district for this listing');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/products', {
        ...form,
        districts: finalDistricts,
        stock: Number(form.stock) || 0
      });
      Alert.alert('Success', 'Harvest listed successfully!');
      setForm({ name: '', category: 'Other', description: '', price: '', unit: '', stock: '', image: '', districts: [] });
      setActiveTab('MY_LISTINGS');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to list harvest');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (useCamera = false) => {
    const { status } = await (useCamera 
      ? ImagePicker.requestCameraPermissionsAsync() 
      : ImagePicker.requestMediaLibraryPermissionsAsync());
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera/media library permissions to make this work!');
      return;
    }

    const result = await (useCamera 
      ? ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.7,
          base64: true,
        })
      : ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.7,
          base64: true,
        }));

    if (!result.canceled) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setForm({ ...form, image: base64Image });
    }
  };

  const selectImageSource = () => {
    Alert.alert('Upload Photo', 'Choose an option', [
      { text: 'Camera', onPress: () => pickImage(true) },
      { text: 'Gallery', onPress: () => pickImage(false) },
      { text: 'Cancel', style: 'cancel' }
    ]);
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
    <ImageBackground 
      source={require('../../assets/images/hero.png')} 
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        {navigation.canGoBack() ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 40 }} />}
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
            {/* Image Selector */}
            <TouchableOpacity style={styles.imageSelector} onPress={selectImageSource}>
              {form.image ? (
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: form.image }} style={styles.previewImage} />
                  <View style={styles.changeImageOverlay}>
                    <Text style={styles.changeImageText}>Change Photo</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.cameraIcon}>📸</Text>
                  <Text style={styles.imagePlaceholderText}>Add Harvest Photo</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.formLabel}>What are you selling? *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. Red Rice, Carrots" 
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
              <View style={{ flex: 1, marginRight: 10 }}>
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
                <Text style={styles.formLabel}>Quantity / Stock *</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="e.g. 100" 
                  keyboardType="numeric"
                  value={form.stock}
                  onChangeText={(val) => setForm({ ...form, stock: val })}
                />
              </View>
            </View>

            <Text style={styles.formLabel}>Available Districts *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {districtsList.map(d => (
                <TouchableOpacity 
                  key={d} 
                  style={[styles.chip, form.districts.includes(d) && styles.activeChip]}
                  onPress={() => toggleDistrict(d)}
                >
                  <Text style={[styles.chipText, form.districts.includes(d) && styles.activeChipText]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.miniHint}>Select districts where buyers can see your listing.</Text>

            <Text style={styles.formLabel}>Unit *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {units.map(u => (
                <TouchableOpacity 
                  key={u} 
                  style={[styles.chip, form.unit === u && styles.activeChip]}
                  onPress={() => setForm({ ...form, unit: u })}
                >
                  <Text style={[styles.chipText, form.unit === u && styles.activeChipText]}>{u}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity 
                style={[styles.chip, !units.includes(form.unit) && form.unit !== '' && styles.activeChip]}
                onPress={() => Alert.prompt('Custom Unit', 'Enter your unit', (u) => setForm({ ...form, unit: u }))}
              >
                <Text style={[styles.chipText, !units.includes(form.unit) && form.unit !== '' && styles.activeChipText]}>Other</Text>
              </TouchableOpacity>
            </ScrollView>

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
              <View style={styles.listingImageCol}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.listingThumb} />
                ) : (
                  <View style={styles.listingThumbPlaceholder}><Text>🌾</Text></View>
                )}
              </View>
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
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: { flex: 1 },
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
  miniHint: { fontSize: 10, color: '#888', marginTop: -5, marginBottom: 10 },
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
  emptyText: { color: '#999', textAlign: 'center', fontSize: 14 },
  imageSelector: { height: 180, borderRadius: 15, backgroundColor: '#f0f4f0', borderStyle: 'dashed', borderWidth: 2, borderColor: '#2e7d32', overflow: 'hidden', marginBottom: 10 },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cameraIcon: { fontSize: 40, marginBottom: 8 },
  imagePlaceholderText: { color: '#2e7d32', fontWeight: '500' },
  imageWrapper: { flex: 1 },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  changeImageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.4)', padding: 8, alignItems: 'center' },
  changeImageText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  listingImageCol: { marginRight: 15 },
  listingThumb: { width: 60, height: 60, borderRadius: 10 },
  listingThumbPlaceholder: { width: 60, height: 60, borderRadius: 10, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }
});

export default SellHarvestScreen;
