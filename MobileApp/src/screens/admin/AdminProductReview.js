import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator, 
  Image, 
  FlatList,
  Alert 
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';

const AdminProductReview = ({ navigation }) => {
  const { userToken } = useContext(AuthContext);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const fetchPendingProducts = async () => {
    try {
      const response = await apiClient.get('/products/pending');
      setPendingProducts(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching pending products:', err);
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    try {
      const response = await apiClient.put(`/products/${id}/review`, { status });
      
      if (response.status === 200) {
        Alert.alert('Success', `Product ${status === 'Active' ? 'Approved' : 'Rejected'} successfully!`);
        setPendingProducts(pendingProducts.filter(p => p._id !== id));
      } else {
        Alert.alert('Error', 'Failed to update product status.');
      }
    } catch (err) {
      console.error('Review error:', err);
      Alert.alert('Error', 'An error occurred during review.');
    }
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.productImage} />
        ) : (
          <View style={[styles.productImage, styles.placeholderImage]}>
             <Text style={{fontSize: 20}}>📦</Text>
          </View>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
          <Text style={styles.productPrice}>LKR {item.price}</Text>
        </View>
      </View>
      
      <View style={styles.sellerInfo}>
        <Text style={styles.sectionLabel}>Seller:</Text>
        <Text style={styles.sellerText}>{item.seller?.name || 'Unknown'}</Text>
        <Text style={styles.sellerEmail}>{item.seller?.email || ''}</Text>
      </View>

      <View style={styles.descriptionBox}>
        <Text style={styles.sectionLabel}>Description:</Text>
        <Text style={styles.descriptionText} numberOfLines={3}>
          {item.description}
        </Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={[styles.btn, styles.approveBtn]} 
          onPress={() => handleReview(item._id, 'Active')}
        >
          <Text style={styles.btnText}>Approve</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.btn, styles.rejectBtn]} 
          onPress={() => handleReview(item._id, 'Rejected')}
        >
          <Text style={[styles.btnText, {color: '#ef4444'}]}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📦 Product Approval</Text>
        <Text style={styles.subtitle}>Review and approve regulated products.</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Fetching pending reviews...</Text>
        </View>
      ) : pendingProducts.length > 0 ? (
        <FlatList
          data={pendingProducts}
          renderItem={renderProductItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>✨</Text>
          <Text style={styles.emptyText}>No products pending review.</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  backBtn: { marginBottom: 10 },
  backBtnText: { color: '#3b82f6', fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#64748b' },
  listContent: { padding: 15 },
  productCard: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 15, 
    marginBottom: 15, 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  productHeader: { flexDirection: 'row', marginBottom: 15 },
  productImage: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#f1f5f9' },
  placeholderImage: { justifyContent: 'center', alignItems: 'center' },
  productInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  productName: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  productCategory: { fontSize: 14, color: '#3b82f6', fontWeight: '600' },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#10b981', marginTop: 2 },
  sellerInfo: { marginBottom: 12 },
  sectionLabel: { fontSize: 12, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 },
  sellerText: { fontSize: 15, fontWeight: '600', color: '#334155' },
  sellerEmail: { fontSize: 13, color: '#64748b' },
  descriptionBox: { backgroundColor: '#f8fafc', padding: 10, borderRadius: 10, marginBottom: 15 },
  descriptionText: { fontSize: 14, color: '#475569', lineHeight: 20 },
  actionRow: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  approveBtn: { backgroundColor: '#10b981' },
  rejectBtn: { borderWidth: 1, borderColor: '#ef4444' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 16, color: '#64748b', textAlign: 'center' }
});

export default AdminProductReview;
