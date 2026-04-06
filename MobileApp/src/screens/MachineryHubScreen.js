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
  RefreshControl,
  Modal,
  Pressable,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import apiClient from '../api/apiClient';

// --- Helpers ---
const getTodayDate = (daysShift = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + daysShift);
  return d.toISOString().split('T')[0];
};

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// --- Components ---

const CalendarModal = ({ visible, onClose, onSelect, target }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const renderDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    
    const dayViews = [];
    for (let i = 0; i < startDay; i++) {
        dayViews.push(<View key={`empty-${i}`} style={styles.calendarDayEmpty} />);
    }
    
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isPast = new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      
      dayViews.push(
        <TouchableOpacity 
          key={d} 
          disabled={isPast}
          style={[styles.calendarDay, isToday && styles.calendarToday, isPast && styles.calendarDayDisabled]}
          onPress={() => onSelect(dateStr)}
        >
          <Text style={[styles.calendarDayText, isPast && styles.calendarDayTextDisabled, isToday && styles.calendarTodayText]}>{d}</Text>
        </TouchableOpacity>
      );
    }
    return dayViews;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
              <Text style={styles.navText}>◀</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</Text>
            <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
              <Text style={styles.navText}>▶</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.weekDaysHeader}>
             {weekDays.map(wd => <Text key={wd} style={styles.weekDayText}>{wd}</Text>)}
          </View>
          <View style={styles.calendarGrid}>
            {renderDays()}
          </View>
          <TouchableOpacity style={styles.closeModalBtn} onPress={onClose}>
            <Text style={styles.closeModalBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

const MachineryHubScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('ASC_REQ');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [availableMachinery, setAvailableMachinery] = useState([]);
  const [communityRentals, setCommunityRentals] = useState([]);
  const [history, setHistory] = useState({ machineryRequests: [], serviceRequests: [], myRentals: [] });
  const [registeredCrops, setRegisteredCrops] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState('machinery');

  const getAssignedLocation = useCallback(() => {
    if (userInfo?.assignedAsc) {
      const name = userInfo.assignedAsc.name || '';
      const dist = userInfo.assignedAsc.district || '';
      return name && dist ? `${name}, ${dist}` : (name || dist);
    }
    return '';
  }, [userInfo]);

  // Form states
  const [machineryForm, setMachineryForm] = useState({
    machineryId: '',
    requestDate: getTodayDate(),
    duration: '1 Day',
    landSize: '',
    location: '',
    additionalNotes: ''
  });

  const [serviceForm, setServiceForm] = useState({
    serviceType: '',
    requestDate: getTodayDate(),
    location: '',
    description: ''
  });

  const [rentalForm, setRentalForm] = useState({
    machineryType: '',
    description: '',
    rentPerDay: '',
    contactNumber: '',
    image: null
  });

  // Sync location and phone
  useEffect(() => {
    if (userInfo) {
       const loc = getAssignedLocation();
       setMachineryForm(prev => ({ ...prev, location: loc }));
       setServiceForm(prev => ({ ...prev, location: loc }));
       setRentalForm(prev => ({ ...prev, contactNumber: userInfo.phone || '' }));
    }
  }, [userInfo, getAssignedLocation]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [machRes, commRes, histRes, cropRes] = await Promise.all([
        apiClient.get('/machinery/available'),
        apiClient.get('/machinery/community-rentals'),
        apiClient.get('/machinery/my-history'),
        apiClient.get('/crops')
      ]);
      setAvailableMachinery(machRes.data);
      setCommunityRentals(commRes.data);
      setHistory(histRes.data);
      setRegisteredCrops(cropRes.data);
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
      setMachineryForm({ ...machineryForm, machineryId: '', requestDate: getTodayDate(), duration: '1 Day', additionalNotes: '' });
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
      setServiceForm({ ...serviceForm, serviceType: '', requestDate: getTodayDate(), description: '' });
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const handleRentalSubmit = async () => {
    if (!rentalForm.machineryType || !rentalForm.rentPerDay || !rentalForm.contactNumber || !rentalForm.description) {
      Alert.alert('Error', 'Please fill all required fields (including description)');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/machinery/rent-out', rentalForm);
      Alert.alert('Success', 'Machinery listed for rent successfully!');
      setRentalForm({ ...rentalForm, machineryType: '', description: '', rentPerDay: '', image: null });
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to list machinery');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setRentalForm({ ...rentalForm, image: base64Img });
    }
  };

  const handleDateSelect = (dateStr) => {
    if (calendarTarget === 'machinery') {
      setMachineryForm({ ...machineryForm, requestDate: dateStr });
    } else {
      setServiceForm({ ...serviceForm, requestDate: dateStr });
    }
    setShowCalendar(false);
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
        <CalendarModal 
          visible={showCalendar} 
          onClose={() => setShowCalendar(false)} 
          onSelect={handleDateSelect}
          target={calendarTarget}
        />

        {activeTab === 'ASC_REQ' && (
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Request from ASC</Text>
            
            {userInfo?.assignedAsc && (
              <View style={styles.assignedCenterBox}>
                <Text style={styles.miniLabel}>Requesting from assigned center</Text>
                <Text style={styles.centerName}>🏛️ {userInfo.assignedAsc.name}, {userInfo.assignedAsc.district}</Text>
              </View>
            )}

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
              <TouchableOpacity 
                style={[styles.input, styles.dateInput]} 
                onPress={() => { setCalendarTarget('machinery'); setShowCalendar(true); }}
              >
                <Text style={styles.dateInputText}>📅 {machineryForm.requestDate || 'Select Date'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
               <Text style={styles.label}>Land Size (Acres) *</Text>
               <TextInput 
                  style={styles.input} 
                  placeholder="e.g. 2.5" 
                  keyboardType="numeric"
                  value={machineryForm.landSize}
                  onChangeText={(val) => setMachineryForm({ ...machineryForm, landSize: val })}
                />
               
               {registeredCrops.length > 0 && (
                 <View style={styles.suggestionBox}>
                   <Text style={styles.suggestionTitle}>Auto-fill from your crops:</Text>
                   <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                     {registeredCrops.map(crop => (
                       <TouchableOpacity 
                        key={crop._id} 
                        style={styles.suggestionChip}
                        onPress={() => setMachineryForm({ 
                          ...machineryForm, 
                          landSize: crop.landSize.toString(),
                          location: crop.location || machineryForm.location 
                        })}
                       >
                         <Text style={styles.suggestionText}>🌾 {crop.cropType} ({crop.landSize} Ac)</Text>
                       </TouchableOpacity>
                     ))}
                   </ScrollView>
                 </View>
               )}
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Duration *</Text>
                <View style={[styles.chipContainer, { flexWrap: 'wrap' }]}>
                  {['1 Day', '2 Days', '3 Days', '1 Week'].map(d => (
                    <TouchableOpacity 
                      key={d} 
                      style={[styles.chip, machineryForm.duration === d && styles.activeChip, { marginBottom: 10 }]}
                      onPress={() => setMachineryForm({ ...machineryForm, duration: d })}
                    >
                      <Text style={[styles.chipText, machineryForm.duration === d && styles.activeChipText]}>{d}</Text>
                    </TouchableOpacity>
                  ))}
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
              <View style={[styles.chipContainer, { flexWrap: 'wrap' }]}>
                {['Machinery Rental', 'Machinery with Operator', 'Custom Farming Service', 'Equipment Maintenance'].map(s => (
                  <TouchableOpacity 
                    key={s} 
                    style={[styles.chip, serviceForm.serviceType === s && styles.activeChip, { marginBottom: 10 }]}
                    onPress={() => setServiceForm({ ...serviceForm, serviceType: s })}
                  >
                    <Text style={[styles.chipText, serviceForm.serviceType === s && styles.activeChipText]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Preferred Date *</Text>
              <TouchableOpacity 
                style={[styles.input, styles.dateInput]} 
                onPress={() => { setCalendarTarget('service'); setShowCalendar(true); }}
              >
                <Text style={styles.dateInputText}>📅 {serviceForm.requestDate || 'Select Date'}</Text>
              </TouchableOpacity>
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
              <View style={[styles.chipContainer, { flexWrap: 'wrap' }]}>
                {['Tractor', 'Harvester', 'Plough', 'Seeder', 'Sprayer'].map(m => (
                  <TouchableOpacity 
                    key={m} 
                    style={[styles.chip, rentalForm.machineryType === m && styles.activeChip, { marginBottom: 10 }]}
                    onPress={() => setRentalForm({ ...rentalForm, machineryType: m })}
                  >
                    <Text style={[styles.chipText, rentalForm.machineryType === m && styles.activeChipText]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
              <Text style={styles.label}>Description *</Text>
              <TextInput 
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
                placeholder="Describe your machinery condition, capacity, etc." 
                multiline
                value={rentalForm.description}
                onChangeText={(val) => setRentalForm({ ...rentalForm, description: val })}
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

            <View style={styles.formGroup}>
              <Text style={styles.label}>Machinery Photo</Text>
              <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                {rentalForm.image ? (
                  <Image source={{ uri: rentalForm.image }} style={styles.previewImage} />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Text style={styles.uploadIcon}>📸</Text>
                    <Text style={styles.uploadText}>Select Machinery Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
              {rentalForm.image && (
                <TouchableOpacity onPress={() => setRentalForm({ ...rentalForm, image: null })} style={styles.removePhotoBtn}>
                  <Text style={styles.removePhotoText}>Remove Photo</Text>
                </TouchableOpacity>
              )}
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
                {item.image && <Image source={{ uri: item.image }} style={styles.rentalCardImage} />}
                <View style={styles.rentalContent}>
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
  assignedCenterBox: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  miniLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  centerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  infoText: { fontSize: 12, color: '#999', fontStyle: 'italic' },
  submitBtn: { backgroundColor: '#1b5e20', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1b5e20', marginBottom: 15 },
  row: { flexDirection: 'row', alignItems: 'center' },
  miniBtn: { backgroundColor: '#e8f5e9', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, marginLeft: 8, borderWidth: 1, borderColor: '#c8e6c9' },
  miniBtnText: { fontSize: 12, color: '#2e7d32', fontWeight: 'bold' },
  suggestionBox: { marginTop: 10, backgroundColor: '#f1f8e9', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#dcedc8' },
  suggestionTitle: { fontSize: 11, color: '#558b2f', fontWeight: 'bold', marginBottom: 5 },
  suggestionChip: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#c5e1a5' },
  suggestionText: { fontSize: 12, color: '#33691e' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  calendarContainer: { width: '90%', backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 5 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  monthTitle: { fontSize: 18, fontWeight: 'bold', color: '#1b5e20' },
  navText: { fontSize: 24, paddingHorizontal: 15, color: '#2e7d32' },
  weekDaysHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10, marginBottom: 10 },
  weekDayText: { flex: 1, textAlign: 'center', fontSize: 12, color: '#999', fontWeight: '600' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarDay: { width: '14.28%', height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20 },
  calendarDayEmpty: { width: '14.28%', height: 40 },
  calendarDayText: { fontSize: 14, color: '#333' },
  calendarToday: { backgroundColor: '#e8f5e9', borderWidth: 1, borderColor: '#2e7d32' },
  calendarTodayText: { color: '#2e7d32', fontWeight: 'bold' },
  calendarDayDisabled: { backgroundColor: '#f9f9f9', opacity: 0.3 },
  calendarDayTextDisabled: { color: '#ccc' },
  closeModalBtn: { marginTop: 20, padding: 15, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#eee' },
  closeModalBtnText: { color: '#666', fontWeight: 'bold' },
  dateInput: { borderStyle: 'dashed', borderColor: '#2e7d32', backgroundColor: '#fafffa' },
  dateInputText: { fontSize: 15, color: '#1b5e20', fontWeight: '600' },
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
  emptyText: { color: '#999', textAlign: 'center' },
  // Upload Styles
  uploadBox: { width: '100%', height: 180, borderRadius: 15, borderStyle: 'dashed', borderWidth: 2, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', backgroundColor: '#fafafa' },
  previewImage: { width: '100%', height: '100%' },
  uploadPlaceholder: { alignItems: 'center' },
  uploadIcon: { fontSize: 30, marginBottom: 5 },
  uploadText: { fontSize: 13, color: '#666', fontWeight: '500' },
  removePhotoBtn: { alignSelf: 'center', marginTop: 10 },
  removePhotoText: { color: '#d32f2f', fontWeight: 'bold', fontSize: 12 },
  // Rental Card Styles
  rentalCardImage: { width: '100%', height: 150, borderTopLeftRadius: 15, borderTopRightRadius: 15 },
  rentalContent: { padding: 15 }
});

export default MachineryHubScreen;
