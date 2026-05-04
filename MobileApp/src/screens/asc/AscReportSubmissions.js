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
import * as DocumentPicker from 'expo-document-picker';

const AscReportSubmissions = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [reportText, setReportText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/reports/my-requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportText.trim()) {
      Alert.alert('Error', 'Please enter the report content');
      return;
    }

    try {
      setLoading(true);
      await apiClient.put(`/reports/requests/${selectedReq._id}/submit`, {
        submissionData: reportText
      });
      Alert.alert('Success', 'Report submitted to Admin');
      setModalVisible(false);
      setReportText('');
      fetchRequests();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (requestId) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        
        const formData = new FormData();
        formData.append('reportPdf', {
          uri: file.uri,
          name: file.name,
          type: 'application/pdf',
        });

        setLoading(true);
        await apiClient.post(`/reports/requests/${requestId}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        Alert.alert('Success', 'Report PDF uploaded successfully');
        setModalVisible(false);
        fetchRequests();
      }
    } catch (error) {
      console.error('Upload Error:', error);
      Alert.alert('Error', 'Failed to upload PDF. Ensure it is a valid PDF file.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Submitted' ? '#dcfce7' : '#fef3c7' }]}>
          <Text style={[styles.statusText, { color: item.status === 'Submitted' ? '#166534' : '#92400e' }]}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.cardDesc}>{item.description}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardDeadline}>📅 Due: {new Date(item.deadline).toLocaleDateString()}</Text>
        {item.status === 'Pending' && (
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => { setSelectedReq(item); setModalVisible(true); }}
          >
            <Text style={styles.actionBtnText}>Write Report</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assigned Reports</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading && requests.length === 0 ? (
        <ActivityIndicator size="large" color="#1b5e20" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={requests}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No report requests found for your center.</Text>}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Submit Report</Text>
            <Text style={styles.modalSubtitle}>{selectedReq?.title}</Text>
            
            <Text style={styles.label}>Option 1: Write Report</Text>
            <TextInput 
              style={styles.textArea}
              placeholder="Type your report findings here..."
              multiline
              numberOfLines={6}
              value={reportText}
              onChangeText={setReportText}
            />

            <View style={styles.dividerSection}>
              <View style={styles.line} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.line} />
            </View>

            <Text style={styles.label}>Option 2: Upload PDF Report</Text>
            <TouchableOpacity 
              style={styles.uploadArea}
              onPress={() => handleFileUpload(selectedReq._id)}
            >
              <Ionicons name="cloud-upload-outline" size={30} color="#1b5e20" />
              <Text style={styles.uploadAreaText}>Click to select and upload PDF</Text>
              <Text style={styles.uploadSubText}>Ideal for generated reports</Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitReport} disabled={loading || !reportText.trim()}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Text Report</Text>}
              </TouchableOpacity>
            </View>
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
  card: { backgroundColor: '#fff', borderRadius: 15, padding: 18, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  cardDesc: { fontSize: 13, color: '#475569', marginBottom: 15, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDeadline: { fontSize: 12, color: '#64748b' },
  actionBtn: { backgroundColor: '#1b5e20', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 5 },
  modalSubtitle: { fontSize: 14, color: '#64748b', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 8, marginTop: 15 },
  textArea: { backgroundColor: '#f1f5f9', borderRadius: 12, padding: 15, height: 120, textAlignVertical: 'top', fontSize: 15 },
  
  dividerSection: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  orText: { marginHorizontal: 10, fontSize: 12, color: '#94a3b8', fontWeight: 'bold' },
  
  uploadArea: { backgroundColor: '#f0fdf4', borderStyle: 'dashed', borderWidth: 2, borderColor: '#1b5e20', borderRadius: 16, padding: 20, alignItems: 'center', justifyContent: 'center' },
  uploadAreaText: { fontSize: 14, color: '#1b5e20', fontWeight: 'bold', marginTop: 10 },
  uploadSubText: { fontSize: 11, color: '#166534', marginTop: 4 },

  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 25 },
  cancelBtn: { flex: 1, padding: 15, alignItems: 'center' },
  cancelBtnText: { color: '#64748b', fontWeight: 'bold' },
  submitBtn: { flex: 2, backgroundColor: '#1b5e20', padding: 15, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#94a3b8' }
});

export default AscReportSubmissions;
