import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  ActivityIndicator,
  Alert,
  FlatList,
  TextInput,
  RefreshControl,
  Image,
  Modal,
  Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import apiClient from '../../api/apiClient';

const { width } = Dimensions.get('window');

const ProductAdminDashboard = ({ navigation }) => {
  const { userInfo, logout, token } = useContext(AuthContext);
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [myProducts, setMyProducts] = useState([]);
  const [marketplaceProducts, setMarketplaceProducts] = useState([]);
  const [myPurchases, setMyPurchases] = useState([]);
  const [allDistricts, setAllDistricts] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState(userInfo?.serviceDistricts || []);

  // Tab state: 'inventory', 'marketplace', 'purchases', 'districts'
  const [activeTab, setActiveTab] = useState('inventory');

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', 
    category: 'Agri Equipment', 
    description: '', 
    price: '', 
    unit: 'kg',
    stock: '',
    image: null,
    publishingDistricts: userInfo?.serviceDistricts || []
  });

  // Buy Modal states
  const [buyTarget, setBuyTarget] = useState(null);
  const [payStep, setPayStep] = useState('confirm'); // 'confirm' | 'payment' | 'receipt'
  const [receipt, setReceipt] = useState(null);
  const [processing, setProcessing] = useState(false);

  const categories = [
    "Crop Protection", "Crop Nutrients", "Seeds & Planting Material",
    "Agri Equipment", "Animal Health & Nutrition", "Post-Harvest & Storage",
    "Irrigation & Water Management", "Home & Garden", "Other"
  ];

  useEffect(() => {
    fetchData();
    fetchAllDistricts();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [myRes, marketRes, purchaseRes] = await Promise.all([
        apiClient.get('/products/my-listings'),
        apiClient.get('/products/available'),
        apiClient.get('/purchases/my-purchases')
      ]);
      setMyProducts(myRes.data);
      setMarketplaceProducts(marketRes.data);
      setMyPurchases(purchaseRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAllDistricts = async () => {
    try {
      const res = await apiClient.get('/ascs');
      const unique = [...new Set(res.data.map(a => a.district))].sort();
      setAllDistricts(unique);
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleUpdateDistricts = async () => {
    try {
      setLoading(true);
      await apiClient.put('/auth/update-districts', { serviceDistricts: selectedDistricts });
      Alert.alert('Success', 'Districts updated successfully!');
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update districts.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setNewProduct({ ...newProduct, image: `data:image/jpeg;base64,${result.assets[0].base64}` });
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.unit) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }
    if (newProduct.publishingDistricts.length === 0) {
      Alert.alert('Error', 'Please select at least one publishing district.');
      return;
    }

    try {
      setLoading(true);
      await apiClient.post('/products', {
        ...newProduct,
        districts: newProduct.publishingDistricts
      });
      Alert.alert('Success', t('productAdmin.publish'));
      setShowAddForm(false);
      setNewProduct({ 
        name: '', 
        category: 'Agri Equipment', 
        description: '', 
        price: '', 
        unit: 'kg',
        stock: '',
        image: null,
        publishingDistricts: userInfo?.serviceDistricts || []
      });
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to list product.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyProduct = async () => {
    setProcessing(true);
    try {
      const res = await apiClient.post('/purchases', {
        productId: buyTarget._id,
        paymentMethod: 'Card' // Simplified for mobile
      });
      setReceipt(res.data);
      setPayStep('receipt');
    } catch (error) {
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteProduct = (id) => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to remove this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/products/${id}`);
              fetchData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product.');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return '#f59e0b';
      case 'ACTIVE': return '#10b981';
      case 'REJECTED': return '#ef4444';
      case 'OUT OF STOCK': return '#64748b';
      default: return '#6b7280';
    }
  };

  const renderProductItem = ({ item, isMarketplace }) => (
    <View style={styles.listItem}>
      <View style={styles.listHeader}>
        {item.image && (
          <Image source={{ uri: item.image }} style={styles.itemImage} />
        )}
        <View style={{ flex: 1, marginLeft: item.image ? 12 : 0 }}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemCategory}>{item.category}</Text>
          <View style={[styles.statusBadge, { alignSelf: 'flex-start', marginTop: 5, backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.itemInfoRow}>
        <Text style={styles.itemPrice}>LKR {item.price.toLocaleString()} / {item.unit}</Text>
        {item.stock > 0 && (
          <Text style={styles.stockText}>📦 Stock: {item.stock} {item.unit}s</Text>
        )}
      </View>

      <Text style={styles.districtsTag}>📍 {item.districts?.join(', ')}</Text>

      {isMarketplace && (
        <View style={styles.sellerInfo}>
          <Text style={styles.sellerName}>👨‍🌾 {item.seller?.name}</Text>
        </View>
      )}

      <View style={styles.actionRow}>
        {isMarketplace ? (
          <TouchableOpacity 
            style={styles.buyBtn} 
            onPress={() => { setBuyTarget(item); setPayStep('confirm'); }}
          >
            <Text style={styles.buyBtnText}>🛒 {t('productAdmin.buyNow')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.deleteBtn} 
            onPress={() => handleDeleteProduct(item._id)}
          >
            <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading && !refreshing && activeTab !== 'districts') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.adminTag}>PRODUCT MANAGER</Text>
          <Text style={styles.title}>{t('productAdmin.title')}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15 }}>
          {[
            { key: 'inventory', label: '📦 ' + t('productAdmin.inventory') },
            { key: 'marketplace', label: '🌾 ' + t('productAdmin.marketplace') },
            { key: 'purchases', label: '🧾 ' + t('productAdmin.purchases') },
            { key: 'districts', label: '📍 ' + t('productAdmin.districts') }
          ].map(tab => (
            <TouchableOpacity 
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]} 
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.content}>
          {activeTab === 'inventory' && (
            <>
              <TouchableOpacity 
                style={styles.addToggleBtn} 
                onPress={() => setShowAddForm(!showAddForm)}
              >
                <Text style={styles.addToggleBtnText}>
                  {showAddForm ? '✕ Close' : '+ ' + t('productAdmin.addProduct')}
                </Text>
              </TouchableOpacity>

              {showAddForm && (
                <View style={styles.formCard}>
                  <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {newProduct.image ? (
                      <View style={{ width: '100%', height: '100%' }}>
                        <Image source={{ uri: newProduct.image }} style={styles.previewImage} />
                        <TouchableOpacity style={styles.removeImgBtn} onPress={() => setNewProduct({ ...newProduct, image: null })}>
                          <Text style={styles.removeImgText}>Remove Image</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.placeholderBox}>
                        <Text style={styles.imagePlaceholderText}>📸 Add Product Image</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <Text style={styles.label}>{t('productAdmin.productName')}</Text>
                  <TextInput style={styles.input} value={newProduct.name} onChangeText={t => setNewProduct({...newProduct, name: t})} />
                  
                  <Text style={styles.label}>{t('productAdmin.category')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                    {categories.map(c => (
                      <TouchableOpacity 
                        key={c} 
                        style={[styles.catChip, newProduct.category === c && styles.activeCatChip]}
                        onPress={() => setNewProduct({...newProduct, category: c})}
                      >
                        <Text style={[styles.catChipText, newProduct.category === c && styles.activeCatChipText]}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <View style={styles.formRow}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={styles.label}>{t('productAdmin.price')}</Text>
                      <TextInput style={styles.input} keyboardType="numeric" value={newProduct.price} onChangeText={t => setNewProduct({...newProduct, price: t})} />
                    </View>
                    <View style={{ width: 100 }}>
                      <Text style={styles.label}>{t('productAdmin.unit')}</Text>
                      <TextInput style={styles.input} value={newProduct.unit} placeholder="e.g. kg/bag" onChangeText={t => setNewProduct({...newProduct, unit: t})} />
                    </View>
                  </View>

                  <View style={{ marginBottom: 15 }}>
                    <Text style={styles.label}>Stock / Quantity Available</Text>
                    <TextInput style={styles.input} keyboardType="numeric" placeholder="e.g. 20" value={newProduct.stock} onChangeText={t => setNewProduct({...newProduct, stock: t})} />
                  </View>

                  <Text style={styles.label}>Publishing Districts</Text>
                  <View style={[styles.districtGrid, { marginBottom: 15 }]}>
                    {allDistricts.map(d => (
                      <TouchableOpacity 
                        key={d} 
                        style={[styles.districtChip, newProduct.publishingDistricts.includes(d) && styles.activeDistrict]}
                        onPress={() => {
                          if (newProduct.publishingDistricts.includes(d)) 
                            setNewProduct({...newProduct, publishingDistricts: newProduct.publishingDistricts.filter(x => x !== d)});
                          else 
                            setNewProduct({...newProduct, publishingDistricts: [...newProduct.publishingDistricts, d]});
                        }}
                      >
                        <Text style={[styles.districtText, newProduct.publishingDistricts.includes(d) && styles.activeDistrictText]}>
                          {newProduct.publishingDistricts.includes(d) ? '✓ ' : ''}{d}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.label}>{t('productAdmin.description')}</Text>
                  <TextInput style={[styles.input, { height: 80 }]} multiline value={newProduct.description} onChangeText={t => setNewProduct({...newProduct, description: t})} />

                  <TouchableOpacity style={styles.submitBtn} onPress={handleAddProduct}>
                    <Text style={styles.submitBtnText}>{t('productAdmin.publish')}</Text>
                  </TouchableOpacity>
                </View>
              )}

              <FlatList
                data={myProducts}
                renderItem={renderProductItem}
                keyExtractor={item => item._id}
                scrollEnabled={false}
                ListEmptyComponent={<Text style={styles.emptyText}>{t('productAdmin.noProducts')}</Text>}
              />
            </>
          )}

          {activeTab === 'marketplace' && (
            <FlatList
              data={marketplaceProducts}
              renderItem={(props) => renderProductItem({...props, isMarketplace: true})}
              keyExtractor={item => item._id}
              scrollEnabled={false}
              ListEmptyComponent={<Text style={styles.emptyText}>{t('productAdmin.noMarketplace')}</Text>}
            />
          )}

          {activeTab === 'purchases' && (
            <FlatList
              data={myPurchases}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <View style={styles.purchaseHeader}>
                    <Text style={styles.receiptNum}>#{item.receiptNumber}</Text>
                    <Text style={styles.purchaseDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.itemTitle}>{item.productName}</Text>
                  <View style={styles.purchaseDetails}>
                    <Text style={styles.detailText}>👨‍🌾 {item.seller?.name}</Text>
                    <Text style={styles.detailPrice}>LKR {item.amount?.toLocaleString()}</Text>
                  </View>
                </View>
              )}
              keyExtractor={item => item._id}
              scrollEnabled={false}
              ListEmptyComponent={<Text style={styles.emptyText}>{t('productAdmin.noPurchases')}</Text>}
            />
          )}

          {activeTab === 'districts' && (
            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>{t('productAdmin.manageDistricts')}</Text>
              <View style={styles.districtGrid}>
                {allDistricts.map(d => (
                  <TouchableOpacity 
                    key={d} 
                    style={[styles.districtChip, selectedDistricts.includes(d) && styles.activeDistrict]}
                    onPress={() => {
                      if (selectedDistricts.includes(d)) setSelectedDistricts(selectedDistricts.filter(x => x !== d));
                      else setSelectedDistricts([...selectedDistricts, d]);
                    }}
                  >
                    <Text style={[styles.districtText, selectedDistricts.includes(d) && styles.activeDistrictText]}>
                      {selectedDistricts.includes(d) ? '✓ ' : ''}{d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.submitBtn} onPress={handleUpdateDistricts}>
                <Text style={styles.submitBtnText}>{t('productAdmin.updateDistricts')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Buy Modal */}
      <Modal visible={!!buyTarget} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {payStep === 'confirm' && (
              <>
                <Text style={styles.modalTitle}>{t('productAdmin.confirmPurchase')}</Text>
                <View style={styles.confirmBox}>
                  <Text style={styles.confirmItem}>{buyTarget?.name}</Text>
                  <Text style={styles.confirmPrice}>LKR {buyTarget?.price?.toLocaleString()}</Text>
                  <Text style={styles.confirmSeller}>Seller: {buyTarget?.seller?.name}</Text>
                </View>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setBuyTarget(null)}>
                    <Text style={styles.cancelModalBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmModalBtn} onPress={handleBuyProduct} disabled={processing}>
                    {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmModalBtnText}>Confirm & Pay</Text>}
                  </TouchableOpacity>
                </View>
              </>
            )}

            {payStep === 'receipt' && receipt && (
              <ScrollView>
                <View style={styles.receiptContainer}>
                  <Text style={styles.successIcon}>✅</Text>
                  <Text style={styles.successTitle}>{t('productAdmin.paymentSuccess')}</Text>
                  
                  <View style={styles.receiptCard}>
                    <Text style={styles.receiptBrand}>🌿 AgroLanka</Text>
                    <View style={styles.receiptDashed} />
                    <Text style={styles.receiptLabel}>Receipt Number</Text>
                    <Text style={styles.receiptValue}>#{receipt.receiptNumber}</Text>
                    
                    <Text style={styles.receiptLabel}>Product</Text>
                    <Text style={styles.receiptValue}>{receipt.productName}</Text>
                    
                    <Text style={styles.receiptLabel}>{t('productAdmin.totalPaid')}</Text>
                    <Text style={styles.receiptTotal}>LKR {receipt.amount?.toLocaleString()}</Text>
                    
                    <Text style={styles.receiptFooter}>Thank you for sourcing through AgroLanka!</Text>
                  </View>

                  <TouchableOpacity style={styles.doneBtn} onPress={() => { setBuyTarget(null); setPayStep('confirm'); }}>
                    <Text style={styles.doneBtnText}>Back to Dashboard</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  adminTag: { fontSize: 10, fontWeight: 'bold', color: '#3b82f6', letterSpacing: 1 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  logoutBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, backgroundColor: '#fee2e2' },
  logoutText: { fontSize: 12, color: '#ef4444', fontWeight: 'bold' },
  
  tabContainer: { paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  tab: { paddingHorizontal: 15, paddingVertical: 8, marginRight: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#3b82f6' },
  tabText: { color: '#64748b', fontWeight: '600' },
  activeTabText: { color: '#1e40af' },
  
  content: { padding: 15 },
  addToggleBtn: { backgroundColor: '#1e293b', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  addToggleBtnText: { color: '#fff', fontWeight: 'bold' },
  
  formCard: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 20, elevation: 3 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#1e293b', marginBottom: 5 },
  input: { borderWeight: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 10, marginBottom: 15, fontSize: 14, backgroundColor: '#f8fafc' },
  formRow: { flexDirection: 'row' },
  categoryScroll: { marginBottom: 15 },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, backgroundColor: '#f1f5f9', marginRight: 8 },
  activeCatChip: { backgroundColor: '#3b82f6' },
  catChipText: { fontSize: 12, color: '#475569' },
  activeCatChipText: { color: '#fff' },
  submitBtn: { backgroundColor: '#2e7d32', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#fff', fontWeight: 'bold' },
  
  listItem: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 12, elevation: 2 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  itemCategory: { fontSize: 12, color: '#64748b' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  itemPrice: { fontSize: 15, fontWeight: '700', color: '#059669', marginBottom: 5 },
  sellerInfo: { marginBottom: 10 },
  sellerName: { fontSize: 13, color: '#475569' },
  districtsTag: { fontSize: 11, color: '#3b82f6', marginTop: 2 },
  actionRow: { marginTop: 5 },
  buyBtn: { backgroundColor: '#059669', padding: 10, borderRadius: 8, alignItems: 'center' },
  buyBtnText: { color: '#fff', fontWeight: 'bold' },
  deleteBtn: { padding: 10 },
  deleteBtnText: { color: '#ef4444', fontSize: 13, textAlign: 'center' },
  
  purchaseHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  receiptNum: { fontSize: 11, color: '#3b82f6', fontWeight: 'bold' },
  purchaseDate: { fontSize: 11, color: '#94a3b8' },
  purchaseDetails: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  detailText: { fontSize: 13, color: '#444' },
  detailPrice: { fontSize: 14, fontWeight: 'bold', color: '#059669' },
  
  districtGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  districtChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', borderWeight: 1, borderColor: '#e2e8f0' },
  activeDistrict: { backgroundColor: '#dcfce7', borderColor: '#10b981' },
  districtText: { fontSize: 13, color: '#475569' },
  activeDistrictText: { color: '#166534', fontWeight: 'bold' },
  
  emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 50 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#1e293b' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#fff', borderRadius: 20, padding: 25, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  confirmBox: { backgroundColor: '#f1f5f9', padding: 20, borderRadius: 15, marginBottom: 20 },
  confirmItem: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  confirmPrice: { fontSize: 22, fontWeight: 'bold', color: '#059669', marginBottom: 10 },
  confirmSeller: { fontSize: 14, color: '#64748b' },
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelModalBtn: { flex: 1, padding: 15, borderRadius: 10, borderWeight: 1, borderColor: '#cbd5e1', alignItems: 'center' },
  cancelModalBtnText: { fontWeight: 'bold', color: '#64748b' },
  confirmModalBtn: { flex: 2, padding: 15, borderRadius: 10, backgroundColor: '#059669', alignItems: 'center' },
  confirmModalBtnText: { color: '#fff', fontWeight: 'bold' },

  receiptContainer: { alignItems: 'center' },
  successIcon: { fontSize: 50, marginBottom: 10 },
  successTitle: { fontSize: 22, fontWeight: 'bold', color: '#059669', marginBottom: 20 },
  receiptCard: { backgroundColor: '#f8fafc', padding: 25, borderRadius: 15, width: '100%', borderWeight: 1, borderColor: '#e2e8f0' },
  receiptBrand: { fontSize: 20, fontWeight: 'bold', color: '#059669', textAlign: 'center', marginBottom: 15 },
  receiptDashed: { borderWeight: 1, borderStyle: 'dashed', borderColor: '#cbd5e1', marginBottom: 15 },
  receiptLabel: { fontSize: 12, color: '#94a3b8', marginTop: 10 },
  receiptValue: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
  receiptTotal: { fontSize: 24, fontWeight: '800', color: '#059669', marginTop: 5 },
  receiptFooter: { fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 25 },
  doneBtn: { marginTop: 25, backgroundColor: '#1e293b', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center' },
  doneBtnText: { color: '#fff', fontWeight: 'bold' },
  
  // New Styles
  itemImage: { width: 50, height: 50, borderRadius: 8 },
  itemInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  stockText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  imagePicker: { width: '100%', height: 150, borderRadius: 15, backgroundColor: '#f1f5f9', borderWeight: 1, borderStyle: 'dashed', borderColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center', marginBottom: 20, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderBox: { alignItems: 'center' },
  imagePlaceholderText: { color: '#94a3b8', fontWeight: 'bold' },
  removeImgBtn: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(239, 68, 68, 0.9)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  removeImgText: { color: '#fff', fontSize: 10, fontWeight: 'bold' }
});

export default ProductAdminDashboard;
