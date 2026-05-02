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
  
  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    targetAsc: ''
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

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
    } catch (error) {
      console.error('Fetch Error:', error);
      Alert.alert('Error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!form.title || !form.description || !form.targetAsc) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      await apiClient.post('/reports/requests', form);
      Alert.alert('Success', 'Report request sent to ASC Center');
      setModalVisible(false);
      setForm({ title: '', description: '', deadline: new Date(), targetAsc: '' });
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
      <Text style={styles.cardTarget}>📍 {item.targetAsc?.name}</Text>
      <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardDeadline}>📅 Deadline: {new Date(item.deadline).toLocaleDateString()}</Text>
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
              <Text style={styles.label}>Report Title</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. Monthly Harvest Summary" 
                value={form.title}
                onChangeText={(t) => setForm({...form, title: t})}
              />

              <Text style={styles.label}>Target ASC Center</Text>
              <View style={styles.ascPicker}>
                {ascs.map(asc => (
                  <TouchableOpacity 
                    key={asc._id} 
                    style={[styles.ascChip, form.targetAsc === asc._id && styles.activeAscChip]}
                    onPress={() => setForm({...form, targetAsc: asc._id})}
                  >
                    <Text style={[styles.ascChipText, form.targetAsc === asc._id && styles.activeAscChipText]}>{asc.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Detailed Instructions</Text>
              <TextInput 
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
                placeholder="What data should they include?" 
                multiline
                value={form.description}
                onChangeText={(t) => setForm({...form, description: t})}
              />

              <Text style={styles.label}>Submission Deadline</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar" size={20} color="#1b5e20" />
                <Text style={styles.dateText}>{form.deadline.toLocaleDateString()}</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={form.deadline}
                  mode="date"
                  onChange={(e, d) => { setShowDatePicker(false); if(d) setForm({...form, deadline: d}); }}
                />
              )}

              <TouchableOpacity 
                style={styles.submitBtn} 
                onPress={handleCreateRequest}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Blast Request 🚀</Text>}
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
  ascChipText: { fontSize: 12, color: '#64748b' },
  activeAscChipText: { color: '#fff', fontWeight: 'bold' },
  dateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', padding: 15, borderRadius: 12, gap: 10 },
  dateText: { fontSize: 15, color: '#1e293b' },
  submitBtn: { backgroundColor: '#1b5e20', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 30, marginBottom: 20 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#94a3b8' }
});

export default AdminReportRequests;
