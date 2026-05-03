import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  TextInput,
  Alert,
  FlatList,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const AdminReportRequests = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [ascs, setAscs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  
  // Form State
  const [form, setForm] = useState({
    description: '',
    requiredMonth: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
    requestedMetrics: [],
    targetAsc: ''
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const metricOptions = [
    'Farmer Count',
    'Crop Count',
    'Harvest Volume',
    'Machinery Usage',
    'Fertilizer Distribution',
    'Pest Reports'
  ];

  const monthOptions = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, ascRes] = await Promise.all([
        apiClient.get('/reports/requests'),
        apiClient.get('/ascs')
      ]);
      setRequests(reqRes.data);
      setAscs(ascRes.data);
      
      // Extract unique districts
      const uniqueDistricts = [...new Set(ascRes.data.map(asc => asc.district))].sort();
      setDistricts(uniqueDistricts);
      if (uniqueDistricts.length > 0) setSelectedDistrict(uniqueDistricts[0]);
    } catch (error) {
      console.error('Fetch Error:', error);
      Alert.alert('Error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    // Generate title automatically from metrics
    let generatedTitle = 'Report Request';
    if (form.requestedMetrics.length > 0) {
      generatedTitle = `Report: ${form.requestedMetrics.join(', ')}`;
      if (generatedTitle.length > 50) generatedTitle = generatedTitle.substring(0, 47) + '...';
    } else {
      generatedTitle = `Data Request - ${form.requiredMonth}`;
    }

    if (!form.description || !form.targetAsc || !form.requiredMonth) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      await apiClient.post('/reports/requests', {
        ...form,
        title: generatedTitle
      });
      Alert.alert('Success', 'Report request sent to ASC Center');
      setModalVisible(false);
      setForm({ 
        description: '', 
        requiredMonth: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }), 
        requestedMetrics: [],
        targetAsc: '' 
      });
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Confirm', 'Delete this request?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await apiClient.delete(`/reports/requests/${id}`);
          fetchData();
        } catch (e) { Alert.alert('Error', 'Failed to delete'); }
      }}
    ]);
  };

  const renderRequestItem = ({ item }) => (
    <View style={styles.requestCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Submitted' ? '#dcfce7' : '#fee2e2' }]}>
          <Text style={[styles.statusText, { color: item.status === 'Submitted' ? '#166534' : '#ef4444' }]}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.cardTarget}>📍 {item.targetAsc?.name} ({item.targetAsc?.district})</Text>
      <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
      
      {item.requestedMetrics && item.requestedMetrics.length > 0 && (
        <View style={styles.metricsContainer}>
          {item.requestedMetrics.map((m, i) => (
            <View key={i} style={styles.miniMetricBadge}>
              <Text style={styles.miniMetricText}>{m}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.cardDeadline}>📅 For: {item.requiredMonth}</Text>
        <TouchableOpacity onPress={() => handleDelete(item._id)}>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
      {item.status === 'Submitted' && (
        <TouchableOpacity 
          style={styles.viewReportBtn}
          onPress={() => Alert.alert('Report Content', item.submissionData)}
        >
          <Text style={styles.viewReportText}>View Submission</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Management</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={30} color="#1b5e20" />
        </TouchableOpacity>
      </View>

      {loading && requests.length === 0 ? (
        <ActivityIndicator size="large" color="#1b5e20" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No requests created yet.</Text>}
        />
      )}

      {/* Create Request Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request New Report</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.label}>Required Details (Tick multiple)</Text>
              <View style={styles.ascPicker}>
                {metricOptions.map(metric => (
                  <TouchableOpacity 
                    key={metric} 
                    style={[
                      styles.ascChip, 
                      form.requestedMetrics.includes(metric) && styles.activeMetricChip
                    ]}
                    onPress={() => {
                      const current = [...form.requestedMetrics];
                      if (current.includes(metric)) {
                        setForm({...form, requestedMetrics: current.filter(m => m !== metric)});
                      } else {
                        setForm({...form, requestedMetrics: [...current, metric]});
                      }
                    }}
                  >
                    <View style={styles.chipContent}>
                      {form.requestedMetrics.includes(metric) && (
                        <Ionicons name="checkmark-circle" size={14} color="#fff" style={{ marginRight: 4 }} />
                      )}
                      <Text style={[
                        styles.ascChipText, 
                        form.requestedMetrics.includes(metric) && styles.activeAscChipText
                      ]}>{metric}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Select District</Text>
              <View style={styles.ascPicker}>
                {districts.map(district => (
                  <TouchableOpacity 
                    key={district} 
                    style={[styles.ascChip, selectedDistrict === district && styles.activeAscChip]}
                    onPress={() => setSelectedDistrict(district)}
                  >
                    <Text style={[styles.ascChipText, selectedDistrict === district && styles.activeAscChipText]}>{district}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Select ASC Center</Text>
              <View style={styles.ascPicker}>
                {ascs.filter(asc => asc.district === selectedDistrict).map(asc => (
                  <TouchableOpacity 
                    key={asc._id} 
                    style={[styles.ascChip, form.targetAsc === asc._id && styles.activeAscChip]}
                    onPress={() => setForm({...form, targetAsc: asc._id})}
                  >
                    <Text style={[styles.ascChipText, form.targetAsc === asc._id && styles.activeAscChipText]}>{asc.name}</Text>
                  </TouchableOpacity>
                ))}
                {ascs.filter(asc => asc.district === selectedDistrict).length === 0 && (
                  <Text style={styles.emptySubText}>No ASCs found in this district.</Text>
                )}
              </View>



              <Text style={styles.label}>Detailed Instructions</Text>
              <TextInput 
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
                placeholder="What data should they include?" 
                multiline
                value={form.description}
                onChangeText={(t) => setForm({...form, description: t})}
              />

              <Text style={styles.label}>Required Month of Report</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setShowMonthPicker(true)}>
                <Ionicons name="calendar" size={20} color="#1b5e20" />
                <Text style={styles.dateText}>{form.requiredMonth}</Text>
              </TouchableOpacity>

              {showMonthPicker && (
                <Modal transparent animationType="fade">
                  <View style={styles.miniModalOverlay}>
                    <View style={styles.monthPickerContent}>
                      <Text style={styles.miniModalTitle}>Select Month</Text>
                      <ScrollView style={{ maxHeight: 300 }}>
                        {monthOptions.map((month, index) => {
                          const currentMonthIndex = new Date().getMonth();
                          const isFuture = index > currentMonthIndex;
                          
                          return (
                            <TouchableOpacity 
                              key={month} 
                              style={[styles.monthOption, isFuture && { opacity: 0.3 }]}
                              onPress={() => {
                                if (isFuture) {
                                  Alert.alert('Invalid Selection', 'You cannot request a report for a future month.');
                                  return;
                                }
                                setForm({...form, requiredMonth: `${month} ${new Date().getFullYear()}`});
                                setShowMonthPicker(false);
                              }}
                            >
                              <Text style={[styles.monthOptionText, isFuture && { color: '#94a3b8' }]}>
                                {month} {isFuture ? '(Future)' : ''}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                      <TouchableOpacity 
                        style={styles.closeMiniModal}
                        onPress={() => setShowMonthPicker(false)}
                      >
                        <Text style={styles.closeMiniModalText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
              )}

              <TouchableOpacity 
                style={styles.submitBtn} 
                onPress={handleCreateRequest}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Send Report Request</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  listContent: { padding: 15 },
  requestCard: { backgroundColor: '#fff', borderRadius: 15, padding: 18, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  cardTarget: { fontSize: 13, color: '#64748b', marginBottom: 6 },
  cardDesc: { fontSize: 13, color: '#475569', marginBottom: 12, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDeadline: { fontSize: 12, color: '#ef4444', fontWeight: '500' },
  viewReportBtn: { marginTop: 15, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9', alignItems: 'center' },
  viewReportText: { color: '#2563eb', fontWeight: 'bold', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#475569', marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: '#f1f5f9', borderRadius: 12, padding: 15, fontSize: 15 },
  ascPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ascChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#f1f5f9' },
  activeAscChip: { backgroundColor: '#1b5e20' },
  activeMetricChip: { backgroundColor: '#2e7d32', borderColor: '#1b5e20', borderWidth: 1 },
  ascChipText: { fontSize: 12, color: '#64748b' },
  activeAscChipText: { color: '#fff', fontWeight: 'bold' },
  chipContent: { flexDirection: 'row', alignItems: 'center' },
  metricsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 10 },
  miniMetricBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  miniMetricText: { fontSize: 10, color: '#475569', fontWeight: '500' },
  dateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', padding: 15, borderRadius: 12, gap: 10 },
  dateText: { fontSize: 15, color: '#1e293b' },
  submitBtn: { backgroundColor: '#1b5e20', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 30, marginBottom: 20 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#94a3b8' },
  emptySubText: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic', marginTop: 5 },
  miniModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  monthPickerContent: { backgroundColor: '#fff', width: '80%', borderRadius: 20, padding: 20 },
  miniModalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 15, textAlign: 'center' },
  monthOption: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  monthOptionText: { fontSize: 16, color: '#334155', textAlign: 'center' },
  closeMiniModal: { marginTop: 15, padding: 12, alignItems: 'center' },
  closeMiniModalText: { color: '#ef4444', fontWeight: 'bold' }
});

export default AdminReportRequests;
