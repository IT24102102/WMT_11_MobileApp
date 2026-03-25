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
  RefreshControl
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import apiClient from '../../api/apiClient';

const MachineryAdminDashboard = ({ navigation }) => {
  const { userInfo, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({
    machineryRequests: [],
    serviceRequests: [],
    farmerRentals: [],
    inventory: []
  });
  
  // Tab states: 'machinery-requests', 'service-requests', 'farmer-rentals', 'inventory'
  const [activeTab, setActiveTab] = useState('machinery-requests'); 
  
  // Inventory form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', type: 'Tractor', totalCount: '1' });
  const [editingId, setEditingId] = useState(null);
  const [editCount, setEditCount] = useState('');

  useEffect(() => {
    fetchRegionalData();
  }, []);

  const fetchRegionalData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/machinery/regional-data');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching regional machinery data:', error);
      Alert.alert('Error', 'Failed to load regional data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRegionalData();
  };

  const handleStatusUpdate = async (type, id, newStatus) => {
    try {
      const endpoint = type === 'machinery' ? `/machinery/requests/${id}` : `/machinery/services/${id}`;
      await apiClient.patch(endpoint, { status: newStatus });
      Alert.alert('Success', t('machineryAdmin.successUpdate'));
      fetchRegionalData();
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', t('machineryAdmin.failedUpdate'));
    }
  };

  const handleAddInventory = async () => {
    if (!newItem.name || !newItem.totalCount) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    try {
      await apiClient.post('/machinery/inventory', {
        ...newItem,
        totalCount: parseInt(newItem.totalCount)
      });
      Alert.alert('Success', t('machineryAdmin.successAdd'));
      setShowAddForm(false);
      setNewItem({ name: '', type: 'Tractor', totalCount: '1' });
      fetchRegionalData();
    } catch (error) {
      console.error('Error adding inventory:', error);
      Alert.alert('Error', 'Failed to add item');
    }
  };

  const handleUpdateAvailable = async (id) => {
    try {
      await apiClient.patch(`/machinery/inventory/${id}`, { availableCount: parseInt(editCount) });
      Alert.alert('Success', t('machineryAdmin.successUpdate'));
      setEditingId(null);
      fetchRegionalData();
    } catch (error) {
      console.error('Error updating inventory:', error);
      Alert.alert('Error', t('machineryAdmin.failedUpdate'));
    }
  };

  const handleDeleteInventory = async (id) => {
    Alert.alert(
      t('machineryAdmin.delete'),
      t('machineryAdmin.confirmDelete'),
      [
        { text: t('machineryAdmin.cancel'), style: 'cancel' },
        { 
          text: t('machineryAdmin.delete'), 
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/machinery/inventory/${id}`);
              fetchRegionalData();
            } catch (error) {
              console.error('Error deleting inventory:', error);
              Alert.alert('Error', 'Failed to delete item');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return '#f59e0b';
      case 'APPROVED': return '#10b981';
      case 'REJECTED': return '#ef4444';
      case 'COMPLETED': return '#3b82f6';
      case 'AVAILABLE': return '#10b981';
      case 'BOOKED': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const renderStatCard = (label, value, icon, color, bg) => (
    <View style={[styles.statCard, { backgroundColor: bg, borderColor: color + '30' }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderRequestItem = ({ item, type }) => (
    <View style={styles.listItem}>
      <View style={styles.listHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>
            {type === 'machinery' ? item.machinery?.name : item.serviceType}
          </Text>
          <Text style={styles.itemSubtitle}>
            {type === 'machinery' ? item.machinery?.type : ''}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.itemDetails}>
        <Text style={styles.itemDetail}>👨‍🌾 {item.farmer?.name}</Text>
        <Text style={styles.itemDetail}>📧 {item.farmer?.email}</Text>
        <Text style={styles.itemDetail}>📅 {new Date(item.requestDate).toLocaleDateString()}</Text>
        {item.location && <Text style={styles.itemDetail}>📍 {item.location}</Text>}
        {item.landSize && <Text style={styles.itemDetail}>📏 {item.landSize} ac</Text>}
      </View>
      
      {item.status.toUpperCase() === 'PENDING' && (
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.approveBtn]} 
            onPress={() => handleStatusUpdate(type, item._id, 'APPROVED')}
          >
            <Text style={styles.actionBtnText}>✓ {t('machineryAdmin.approved')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.rejectBtn]} 
            onPress={() => handleStatusUpdate(type, item._id, 'REJECTED')}
          >
            <Text style={styles.actionBtnText}>✕ {t('machineryAdmin.rejected')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status.toUpperCase() === 'APPROVED' && (
        <TouchableOpacity 
          style={[styles.actionBtn, styles.completeBtn]} 
          onPress={() => handleStatusUpdate(type, item._id, 'COMPLETED')}
        >
          <Text style={styles.actionBtnText}>{t('machineryAdmin.completed')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderInventoryItem = ({ item }) => (
    <View style={[styles.listItem, { borderLeftWidth: 5, borderLeftColor: '#2e7d32' }]}>
      <View style={styles.listHeader}>
        <View>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemType}>{item.type}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDeleteInventory(item._id)}>
          <Text style={{ fontSize: 18 }}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inventoryFooter}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.availableCount > 0 ? 'AVAILABLE' : 'BOOKED') + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.availableCount > 0 ? 'AVAILABLE' : 'BOOKED') }]}>
            {item.availableCount > 0 ? t('machineryAdmin.available') : t('machineryAdmin.booked')}
          </Text>
        </View>
        
        {editingId === item._id ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.editInput}
              keyboardType="numeric"
              value={editCount}
              onChangeText={setEditCount}
            />
            <TouchableOpacity onPress={() => handleUpdateAvailable(item._id)} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>{t('machineryAdmin.save')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditingId(null)} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.countRow}>
            <Text style={styles.countText}>
              <Text style={{ fontWeight: 'bold', color: item.availableCount > 0 ? '#10b981' : '#ef4444' }}>{item.availableCount}</Text>
              /{item.totalCount} {t('machineryAdmin.available').toLowerCase()}
            </Text>
            <TouchableOpacity onPress={() => { setEditingId(item._id); setEditCount(item.availableCount.toString()); }}>
              <Text style={styles.editText}>{t('machineryAdmin.edit')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  const pendingMachinery = data.machineryRequests.filter(r => r.status.toUpperCase() === 'PENDING').length;
  const pendingService = data.serviceRequests.filter(s => s.status.toUpperCase() === 'PENDING').length;
  const availableItems = data.inventory.filter(i => i.availableCount > 0).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.adminTag}>{userInfo?.role?.replace('_', ' ')}</Text>
          <Text style={styles.title}>{t('machineryAdmin.title')}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtnSmall} onPress={logout}>
          <Text style={styles.logoutTextSmall}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.statsGrid}>
          {renderStatCard('Pending Machinery', pendingMachinery, '🚜', '#f59e0b', '#fffbeb')}
          {renderStatCard('Pending Services', pendingService, '🔧', '#3b82f6', '#eff6ff')}
          {renderStatCard('Available Items', availableItems, '✅', '#10b981', '#ecfdf5')}
          {renderStatCard('Community', data.farmerRentals.length, '🤝', '#f97316', '#fff7ed')}
        </View>

        <View style={styles.tabContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15 }}>
            {[
              { key: 'machinery-requests', label: '🚜 Requests', badge: pendingMachinery },
              { key: 'service-requests', label: '🔧 Services', badge: pendingService },
              { key: 'inventory', label: '📦 Inventory', badge: null },
              { key: 'farmer-rentals', label: '🤝 Community', badge: null }
            ].map(tab => (
              <TouchableOpacity 
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.activeTab]} 
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>{tab.label}</Text>
                {tab.badge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{tab.badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.contentSection}>
          {activeTab === 'inventory' && (
            <View style={styles.inventoryActions}>
              <TouchableOpacity 
                style={styles.addToggleBtn} 
                onPress={() => setShowAddForm(!showAddForm)}
              >
                <Text style={styles.addToggleBtnText}>
                  {showAddForm ? '✕ Close Form' : '+ Add New Machinery'}
                </Text>
              </TouchableOpacity>
              
              {showAddForm && (
                <View style={styles.addForm}>
                  <Text style={styles.formLabel}>Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. John Deere 5075E"
                    value={newItem.name}
                    onChangeText={(text) => setNewItem({...newItem, name: text})}
                  />
                  
                  <View style={styles.formRow}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={styles.formLabel}>Type</Text>
                      <View style={styles.pickerSubstitute}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          {['Tractor', 'Harvester', 'Plough', 'Seeder', 'Sprayer'].map(type => (
                            <TouchableOpacity 
                              key={type}
                              style={[styles.typeChip, newItem.type === type && styles.activeTypeChip]}
                              onPress={() => setNewItem({...newItem, type})}
                            >
                              <Text style={[styles.typeChipText, newItem.type === type && styles.activeTypeChipText]}>{type}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </View>
                    
                    <View style={{ width: 100 }}>
                      <Text style={styles.formLabel}>Total Count</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={newItem.totalCount}
                        onChangeText={(text) => setNewItem({...newItem, totalCount: text})}
                      />
                    </View>
                  </View>
                  
                  <TouchableOpacity style={styles.submitBtn} onPress={handleAddInventory}>
                    <Text style={styles.submitBtnText}>Add to Inventory</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {activeTab === 'machinery-requests' && (
            <FlatList
              data={data.machineryRequests}
              renderItem={(props) => renderRequestItem({ ...props, type: 'machinery' })}
              keyExtractor={item => item._id}
              scrollEnabled={false}
              ListEmptyComponent={<Text style={styles.emptyText}>{t('machineryAdmin.noRequests')}</Text>}
            />
          )}

          {activeTab === 'service-requests' && (
            <FlatList
              data={data.serviceRequests}
              renderItem={(props) => renderRequestItem({ ...props, type: 'services' })}
              keyExtractor={item => item._id}
              scrollEnabled={false}
              ListEmptyComponent={<Text style={styles.emptyText}>{t('machineryAdmin.noRequests')}</Text>}
            />
          )}

          {activeTab === 'inventory' && (
            <FlatList
              data={data.inventory}
              renderItem={renderInventoryItem}
              keyExtractor={item => item._id}
              scrollEnabled={false}
            />
          )}

          {activeTab === 'farmer-rentals' && (
            <FlatList
              data={data.farmerRentals}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <View style={styles.listHeader}>
                    <Text style={styles.itemTitle}>{item.machineryType}</Text>
                    <View style={styles.rentBadge}>
                      <Text style={styles.rentBadgeText}>For Rent</Text>
                    </View>
                  </View>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemDetail}>👨‍🌾 {item.farmer?.name}</Text>
                    <Text style={styles.itemDetail}>📧 {item.farmer?.email}</Text>
                    <Text style={styles.itemDetail}>💰 LKR {item.rentPerDay?.toLocaleString()} / day</Text>
                    <Text style={styles.itemDetail}>📞 {item.contactNumber}</Text>
                    {item.description && <Text style={styles.itemDesc}>"{item.description}"</Text>}
                  </View>
                </View>
              )}
              keyExtractor={item => item._id}
              scrollEnabled={false}
              ListEmptyComponent={<Text style={styles.emptyText}>No community listings found.</Text>}
            />
          )}
        </View>
        <View style={{ height: 50 }} />
      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  adminTag: { fontSize: 10, fontWeight: 'bold', color: '#10b981', textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginTop: 2 },
  logoutBtnSmall: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#fee2e2' },
  logoutTextSmall: { fontSize: 12, color: '#ef4444', fontWeight: 'bold' },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, justifyContent: 'space-between' },
  statCard: { width: '48%', padding: 15, borderRadius: 16, borderWeight: 1, marginBottom: 12, alignItems: 'center' },
  statIcon: { fontSize: 24, marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 10, color: '#64748b', textAlign: 'center' },
  
  tabContainer: { paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10, flexDirection: 'row', alignItems: 'center' },
  activeTab: { backgroundColor: '#f1f8f4', borderBottomWidth: 2, borderBottomColor: '#2e7d32', borderRadius: 0 },
  tabText: { color: '#64748b', fontWeight: '600', fontSize: 13 },
  activeTabText: { color: '#166534', fontWeight: '700' },
  badge: { backgroundColor: '#ef4444', borderRadius: 10, marginLeft: 6, minWidth: 18, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  
  contentSection: { padding: 15 },
  listItem: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  itemSubtitle: { fontSize: 12, color: '#64748b' },
  itemType: { fontSize: 12, color: '#64748b', fontStyle: 'italic' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  itemDetails: { gap: 4 },
  itemDetail: { fontSize: 13, color: '#475569' },
  itemDesc: { fontSize: 12, color: '#64748b', fontStyle: 'italic', marginTop: 8 },
  
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 15 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  approveBtn: { backgroundColor: '#10b981' },
  rejectBtn: { backgroundColor: '#ef4444' },
  completeBtn: { backgroundColor: '#3b82f6', width: '100%', marginTop: 10 },
  actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  
  inventoryFooter: { marginTop: 15, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  countText: { fontSize: 14, color: '#475569' },
  editText: { color: '#3b82f6', fontWeight: 'bold', textDecorationLine: 'underline', fontSize: 13 },
  
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  editInput: { borderWeight: 1, borderColor: '#cbd5e1', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, width: 50, textAlign: 'center', backgroundColor: '#fff' },
  saveBtn: { backgroundColor: '#10b981', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  saveBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  cancelBtn: { padding: 6 },
  cancelBtnText: { color: '#64748b', fontWeight: 'bold' },
  
  inventoryActions: { marginBottom: 15 },
  addToggleBtn: { backgroundColor: '#1e293b', padding: 12, borderRadius: 12, alignItems: 'center' },
  addToggleBtnText: { color: '#fff', fontWeight: 'bold' },
  addForm: { backgroundColor: '#f1f8f4', padding: 15, borderRadius: 12, marginTop: 10, borderWeight: 1, borderColor: '#d1fae5' },
  formLabel: { fontSize: 12, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  input: { backgroundColor: '#fff', borderWeight: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 14 },
  formRow: { flexDirection: 'row', marginBottom: 12 },
  pickerSubstitute: { backgroundColor: '#fff', paddingVertical: 8, borderRadius: 8, borderWeight: 1, borderColor: '#d1d5db' },
  typeChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, backgroundColor: '#f1f5f9', marginRight: 8 },
  activeTypeChip: { backgroundColor: '#2e7d32' },
  typeChipText: { fontSize: 12, color: '#475569' },
  activeTypeChipText: { color: '#fff', fontWeight: 'bold' },
  submitBtn: { backgroundColor: '#2e7d32', padding: 14, borderRadius: 10, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: 'bold' },
  
  rentBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  rentBadgeText: { color: '#1e40af', fontSize: 10, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 40, fontSize: 14 }
});

export default MachineryAdminDashboard;
