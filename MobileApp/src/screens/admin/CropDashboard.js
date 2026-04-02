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
  FlatList,
  RefreshControl,
  Alert
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import apiClient from '../../api/apiClient';

const CropDashboard = ({ navigation }) => {
  const { userInfo, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/crops');
      setCrops(response.data);
    } catch (error) {
      console.error('Error fetching crops:', error);
      Alert.alert('Error', 'Failed to fetch crops data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusUpdate = async (cropId, newStatus) => {
    try {
      await apiClient.patch(`/crops/${cropId}/status`, { status: newStatus });
      fetchCrops(); // Refresh list on success
      Alert.alert('Success', `Crop registration ${newStatus.toLowerCase()}.`);
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status.');
    }
  };

  const confirmAction = (cropId, action) => {
    Alert.alert(
      `Confirm ${action}`,
      `Are you sure you want to ${action.toLowerCase()} this registration?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => handleStatusUpdate(cropId, action === 'Approve' ? 'APPROVED' : 'REJECTED') }
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCrops();
  };

  const renderCropItem = ({ item }) => {
    const isPending = item.status === 'PENDING';
    
    return (
      <View style={styles.listItem}>
        <View style={styles.listHeader}>
          <Text style={styles.itemTitle}>{item.cropType.toUpperCase()} - {item.variety}</Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: item.status === 'APPROVED' ? '#dcfce7' : item.status === 'PENDING' ? '#fef3c7' : '#fee2e2' }
          ]}>
            <Text style={[
              styles.statusText, 
              { color: item.status === 'APPROVED' ? '#166534' : item.status === 'PENDING' ? '#92400e' : '#991b1b' }
            ]}>
              {item.status}
            </Text>
          </View>
        </View>
        
        <View style={styles.farmerInfo}>
          <Text style={styles.itemSubtitle}>👨‍🌾 {item.farmer?.name}</Text>
          <Text style={styles.itemDetail}>NIC: {item.farmer?.nic}</Text>
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.itemDetail}>📏 {item.landSize} Acres</Text>
          <Text style={styles.itemDetail}>🌱 {item.season === 'N/A' ? 'Any Season' : item.season}</Text>
          <Text style={styles.itemDetail}>🌍 {item.soilType}</Text>
        </View>

        {isPending && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.btn, styles.approveBtn]} 
              onPress={() => confirmAction(item._id, 'Approve')}
            >
              <Text style={styles.btnText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.btn, styles.rejectBtn]} 
              onPress={() => confirmAction(item._id, 'Reject')}
            >
              <Text style={styles.btnText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Crop Officer Dashboard</Text>
            <View style={styles.roleTag}><Text style={styles.roleTagText}>CROP OFFICER</Text></View>
          </View>
          <Text style={styles.subtitle}>Welcome, {userInfo?.name}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {userInfo?.assignedAsc ? (
        <View style={styles.infoBar}>
          <Text style={styles.infoText}>📍 {userInfo.assignedAsc.name} - {userInfo.assignedAsc.district}</Text>
        </View>
      ) : (
        <View style={[styles.infoBar, { backgroundColor: '#fff7ed', borderBottomColor: '#f97316' }]}>
          <Text style={[styles.infoText, { color: '#9a3412' }]}>⚠️ No ASC Center allocated yet.</Text>
        </View>
      )}

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.cardIcon}>📋</Text>
          <Text style={styles.statValue}>{crops.length}</Text>
          <Text style={styles.cardLabel}>Total Requests</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.cardIcon}>🏗️</Text>
          <Text style={[styles.statValue, { fontSize: 16, marginTop: 5, color: '#059669' }]} numberOfLines={1}>
            {userInfo?.specialization || 'Not Specified'}
          </Text>
          <Text style={styles.cardLabel}>Specialization</Text>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Recent Crop Registrations</Text>
        
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={crops}
            renderItem={renderCropItem}
            keyExtractor={item => item._id}
            contentContainerStyle={{ padding: 15, paddingBottom: 40 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={<Text style={styles.emptyText}>No crop registrations found.</Text>}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center' },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  roleTag: { backgroundColor: '#e2fbef', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  roleTagText: { fontSize: 10, color: '#10b981', fontWeight: 'bold' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  logoutBtn: { backgroundColor: '#fee2e2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  logoutText: { fontSize: 12, color: '#ef4444', fontWeight: 'bold' },
  
  infoBar: { backgroundColor: '#ecfdf5', padding: 10, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#d1fae5' },
  infoText: { color: '#047857', fontWeight: '600', fontSize: 13 },
  
  statsGrid: { padding: 15, flexDirection: 'row', justifyContent: 'space-between' },
  statCard: { width: '48%', backgroundColor: '#fff', padding: 15, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, alignItems: 'center' },
  cardIcon: { fontSize: 24, marginBottom: 5 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  cardLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  
  sectionContainer: { flex: 1, backgroundColor: '#f8fafc' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginHorizontal: 15, marginTop: 5, marginBottom: 5 },
  
  listItem: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0', elevation: 1 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  
  farmerInfo: { marginBottom: 10, backgroundColor: '#f1f5f9', padding: 8, borderRadius: 8 },
  itemSubtitle: { fontSize: 14, fontWeight: '600', color: '#334155' },
  
  detailsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 10 },
  itemDetail: { fontSize: 13, color: '#64748b' },
  
  actionButtons: { flexDirection: 'row', gap: 10, marginTop: 5 },
  btn: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
  approveBtn: { backgroundColor: '#10b981' },
  rejectBtn: { backgroundColor: '#ef4444' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  
  emptyText: { textAlign: 'center', marginTop: 40, color: '#94a3b8', fontSize: 14 }
});

export default CropDashboard;
