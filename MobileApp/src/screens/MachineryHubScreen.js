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

const MachineryHubScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('ASC_REQ'); // 'ASC_REQ', 'SERVICE_REQ', 'RENT_OUT', 'COMMUNITY'
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [availableMachinery, setAvailableMachinery] = useState([]);
  const [communityRentals, setCommunityRentals] = useState([]);
  const [history, setHistory] = useState({ machineryRequests: [], serviceRequests: [], myRentals: [] });

  // Form states
  const [machineryForm, setMachineryForm] = useState({
    machineryId: '',
    requestDate: '',
    duration: '',
    landSize: '',
    location: userInfo?.assignedAsc ? `${userInfo.assignedAsc.name}, ${userInfo.assignedAsc.district}` : '',
    additionalNotes: ''
  });

  const [serviceForm, setServiceForm] = useState({
    serviceType: '',
    requestDate: '',
    location: userInfo?.assignedAsc ? `${userInfo.assignedAsc.name}, ${userInfo.assignedAsc.district}` : '',
    description: ''
  });

  const [rentalForm, setRentalForm] = useState({
    machineryType: '',
    description: '',
    rentPerDay: '',
    contactNumber: userInfo?.phone || ''
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [machRes, commRes, histRes] = await Promise.all([
        apiClient.get('/machinery/available'),
        apiClient.get('/machinery/community-rentals'),
        apiClient.get('/machinery/my-history')
      ]);
      setAvailableMachinery(machRes.data);
      setCommunityRentals(commRes.data);
      setHistory(histRes.data);
    } catch (err) {
      console.error('Error fetching machinery data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMachinerySubmit = async () => {
    if (!machineryForm.machineryId || !machineryForm.requestDate || !machineryForm.duration) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/machinery/requests', machineryForm);
      Alert.alert('Success', 'Machinery request submitted successfully!');
      setMachineryForm({ ...machineryForm, machineryId: '', requestDate: '', duration: '', additionalNotes: '' });
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSubmit = async () => {
    if (!serviceForm.serviceType || !serviceForm.requestDate || !serviceForm.description) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/machinery/services', serviceForm);
      Alert.alert('Success', 'Service request submitted successfully!');
      setServiceForm({ ...serviceForm, serviceType: '', requestDate: '', description: '' });
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const handleRentalSubmit = async () => {
    if (!rentalForm.machineryType || !rentalForm.rentPerDay || !rentalForm.contactNumber) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/machinery/rent-out', rentalForm);
      Alert.alert('Success', 'Machinery listed for rent successfully!');
      setRentalForm({ ...rentalForm, machineryType: '', description: '', rentPerDay: '' });
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to list machinery');
    } finally {
      setLoading(false);
    }
  };

  const renderTabButton = (id, title, icon) => (
    <TouchableOpacity 
      style={[styles.tabBtn, activeTab === id && styles.activeTabBtn]} 
      onPress={() => setActiveTab(id)}
    >
      <Text style={styles.tabIcon}>{icon}</Text>
      <Text style={[styles.tabBtnText, activeTab === id && styles.activeTabBtnText]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('farmer.machineryHub')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {renderTabButton('ASC_REQ', 'ASC Request', '🏗️')}
          {renderTabButton('SERVICE_REQ', 'Services', '📅')}
          {renderTabButton('RENT_OUT', 'Rent Mine', '💰')}
          {renderTabButton('COMMUNITY', 'Marketplace', '🤝')}
        </ScrollView>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchData();}} />}
      >
        {activeTab === 'ASC_REQ' && (
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Request from ASC</Text>
            <Text style={styles.cardSubtitle}>Rent machinery available at your assigned center.</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Select Machinery *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                {availableMachinery.map(m => (
                  <TouchableOpacity 
                    key={m._id} 
                    style={[styles.chip, machineryForm.machineryId === m._id && styles.activeChip]}
                    onPress={() => setMachineryForm({ ...machineryForm, machineryId: m._id })}
                  >
                    <Text style={[styles.chipText, machineryForm.machineryId === m._id && styles.activeChipText]}>{m.name}</Text>
                  </TouchableOpacity>
                ))}
                {availableMachinery.length === 0 && <Text style={styles.infoText}>No machinery available at your center.</Text>}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Request Date *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="YYYY-MM-DD" 
                value={machineryForm.requestDate}
                onChangeText={(val) => setMachineryForm({ ...machineryForm, requestDate: val })}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Duration *</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="e.g. 2 Days" 
                  value={machineryForm.duration}
                  onChangeText={(val) => setMachineryForm({ ...machineryForm, duration: val })}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Land Size (Ac)</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="e.g. 2.5" 
                  keyboardType="numeric"
                  value={machineryForm.landSize}
                  onChangeText={(val) => setMachineryForm({ ...machineryForm, landSize: val })}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleMachinerySubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Request</Text>}
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'SERVICE_REQ' && (
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Agricultural Services</Text>
            <Text style={styles.cardSubtitle}>Request labor, technical assistance or specialized services.</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Service Type *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. Tractor Plowing, Harvesting Labor" 
                value={serviceForm.serviceType}
                onChangeText={(val) => setServiceForm({ ...serviceForm, serviceType: val })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Preferred Date *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="YYYY-MM-DD" 
                value={serviceForm.requestDate}
                onChangeText={(val) => setServiceForm({ ...serviceForm, requestDate: val })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput 
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
                placeholder="Describe your requirements..." 
                multiline
                value={serviceForm.description}
                onChangeText={(val) => setServiceForm({ ...serviceForm, description: val })}
              />
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleServiceSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Request</Text>}
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'RENT_OUT' && (
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Rent Out Your Machinery</Text>
            <Text style={styles.cardSubtitle}>Help other farmers and earn by listing your equipment.</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Machinery Type *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. 2-Wheel Tractor" 
                value={rentalForm.machineryType}
                onChangeText={(val) => setRentalForm({ ...rentalForm, machineryType: val })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Rent Per Day (LKR) *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. 5000" 
                keyboardType="numeric"
                value={rentalForm.rentPerDay}
                onChangeText={(val) => setRentalForm({ ...rentalForm, rentPerDay: val })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Contact Number *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="07x xxxxxxx" 
                keyboardType="phone-pad"
                value={rentalForm.contactNumber}
                onChangeText={(val) => setRentalForm({ ...rentalForm, contactNumber: val })}
              />
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleRentalSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>List for Rent</Text>}
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'COMMUNITY' && (
          <View>
            <Text style={styles.sectionTitle}>Community Marketplace</Text>
            {communityRentals.map(item => (
              <View key={item._id} style={styles.rentalCard}>
                <View style={styles.rentalHeader}>
                  <Text style={styles.rentalType}>{item.machineryType}</Text>
                  <Text style={styles.rentalPrice}>LKR {item.rentPerDay}/day</Text>
                </View>
                <Text style={styles.rentalOwner}>👤 {item.farmer?.name}</Text>
                <Text style={styles.rentalDesc}>{item.description}</Text>
                <TouchableOpacity style={styles.callBtn} onPress={() => Alert.alert('Contact', `Call ${item.contactNumber}`)}>
                  <Text style={styles.callBtnText}>📞 Contact Farmer</Text>
                </TouchableOpacity>
              </View>
            ))}
            {communityRentals.length === 0 && (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>🚜</Text>
                <Text style={styles.emptyText}>No community listings in your area yet.</Text>
              </View>
            )}
          </View>
        )}

        {/* My History Section */}
        {activeTab !== 'COMMUNITY' && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.sectionTitle}>Your Recent Activity</Text>
            {activeTab === 'ASC_REQ' && history.machineryRequests.map(r => (
              <View key={r._id} style={styles.historyItem}>
                <Text style={styles.historyName}>{r.machinery?.name}</Text>
                <Text style={styles.historyStatus}>{r.status}</Text>
              </View>
            ))}
            {activeTab === 'SERVICE_REQ' && history.serviceRequests.map(r => (
              <View key={r._id} style={styles.historyItem}>
                <Text style={styles.historyName}>{r.serviceType}</Text>
                <Text style={styles.historyStatus}>{r.status}</Text>
              </View>
            ))}
            {activeTab === 'RENT_OUT' && history.myRentals.map(r => (
              <View key={r._id} style={styles.historyItem}>
                <Text style={styles.historyName}>{r.machineryType}</Text>
                <Text style={styles.historyStatus}>LKR {r.rentPerDay}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
  },
  backBtnText: { color: '#2e7d32', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1b5e20' },
  tabBar: { backgroundColor: '#fff', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  tabScroll: { paddingHorizontal: 15 },
  tabBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    borderRadius: 20, 
    backgroundColor: '#f5f5f5', 
    marginRight: 10 
  },
  activeTabBtn: { backgroundColor: '#e8f5e9', borderWidth: 1, borderColor: '#2e7d32' },
  tabIcon: { fontSize: 16, marginRight: 8 },
  tabBtnText: { fontSize: 13, color: '#666' },
  activeTabBtnText: { color: '#2e7d32', fontWeight: 'bold' },
  content: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, marginBottom: 20 },
  cardHeader: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  cardSubtitle: { fontSize: 14, color: '#888', marginBottom: 20 },
  formGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#444', marginBottom: 8 },
  input: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 15, fontSize: 15, borderWidth: 1, borderColor: '#eee', color: '#333' },
  formRow: { flexDirection: 'row' },
  chipContainer: { flexDirection: 'row' },
  chip: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 10 },
  activeChip: { backgroundColor: '#2e7d32' },
  chipText: { fontSize: 13, color: '#666' },
  activeChipText: { color: '#fff', fontWeight: 'bold' },
  infoText: { fontSize: 12, color: '#999', fontStyle: 'italic' },
  submitBtn: { backgroundColor: '#1b5e20', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1b5e20', marginBottom: 15 },
  rentalCard: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 2 },
  rentalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  rentalType: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  rentalPrice: { fontSize: 14, fontWeight: 'bold', color: '#2e7d32' },
  rentalOwner: { fontSize: 13, color: '#666', marginBottom: 5 },
  rentalDesc: { fontSize: 13, color: '#888', fontStyle: 'italic', marginBottom: 15 },
  callBtn: { backgroundColor: '#e3f2fd', padding: 10, borderRadius: 10, alignItems: 'center' },
  callBtnText: { color: '#1976d2', fontWeight: 'bold' },
  historyItem: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyName: { fontSize: 14, color: '#333', fontWeight: '500' },
  historyStatus: { fontSize: 12, color: '#2e7d32', fontWeight: 'bold' },
  emptyBox: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 40, color: '#ccc', marginBottom: 10 },
  emptyText: { color: '#999', textAlign: 'center' }
});

export default MachineryHubScreen;
