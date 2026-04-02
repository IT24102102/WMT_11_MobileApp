import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  Alert,
  Modal
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';

const ManageOfficers = ({ navigation }) => {
  const { userToken } = useContext(AuthContext);
  const [officers, setOfficers] = useState([]);
  const [ascs, setAscs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  
  // Selection Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [officersRes, ascsRes] = await Promise.all([
        apiClient.get('/admin/officers'),
        apiClient.get('/ascs')
      ]);
      setOfficers(officersRes.data);
      setAscs(ascsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load staff data');
      setLoading(false);
    }
  };

  const handleAssign = async (userId, ascId) => {
    try {
      const response = await apiClient.put('/admin/assign-officer', { userId, ascId });
      if (response.status === 200) {
        setOfficers(officers.map(off => 
          off._id === userId ? { ...off, assignedAsc: response.data.assignedAsc } : off
        ));
        Alert.alert('Success', 'Staff reallocation successful!');
        setModalVisible(false);
      }
    } catch (error) {
      console.error('Error assigning officer:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to assign officer');
    }
  };

  const filteredOfficers = officers.filter(officer => {
    const matchesSearch = officer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          officer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || officer.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const openAssignModal = (officer) => {
    setSelectedOfficer(officer);
    setModalVisible(true);
  };

  const renderOfficer = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.nameHeader}>
           <Text style={styles.name}>{item.name}</Text>
           <Text style={styles.roleBadge}>{item.role.replace('_', ' ')}</Text>
        </View>
        <Text style={styles.email}>{item.email}</Text>
      </View>
      
      <View style={styles.allocationSection}>
        <Text style={styles.sectionLabel}>Current Allocation:</Text>
        {item.assignedAsc ? (
          <View>
            <Text style={styles.allocatedText}>📍 {item.assignedAsc.name}</Text>
            <Text style={styles.districtText}>({item.assignedAsc.district} District)</Text>
          </View>
        ) : (
          <Text style={styles.unallocatedText}>Unallocated</Text>
        )}
      </View>

      <TouchableOpacity 
        style={styles.reallocateBtn}
        onPress={() => openAssignModal(item)}
      >
        <Text style={styles.reallocateBtnText}>Reallocate Staff</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Staff & Allocation</Text>
      </View>

      <View style={styles.filters}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <View style={styles.roleTabs}>
          {['ALL', 'ASC_OFFICER', 'FINANCIAL_OFFICER', 'MACHINERY_OFFICER'].map(role => (
            <TouchableOpacity 
              key={role} 
              style={[styles.roleTab, roleFilter === role && styles.activeRoleTab]}
              onPress={() => setRoleFilter(role)}
            >
              <Text style={[styles.roleTabText, roleFilter === role && styles.activeRoleTabText]}>
                {role === 'ALL' ? 'All Roles' : role.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
        </View>
      ) : (
        <FlatList
          data={filteredOfficers}
          keyExtractor={item => item._id}
          renderItem={renderOfficer}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No officers found.</Text>}
        />
      )}

      {/* ASC Selection Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign to ASC</Text>
            <Text style={styles.modalSubtitle}>Reallocating: {selectedOfficer?.name}</Text>
            
            <FlatList
              data={[{ _id: null, name: '-- Unallocate Staff --', district: 'None' }, ...ascs]}
              keyExtractor={item => item._id || 'unallocate'}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.ascItem}
                  onPress={() => handleAssign(selectedOfficer._id, item._id)}
                >
                  <Text style={item._id === null ? styles.unallocateAscText : styles.ascItemText}>
                    {item.name} {item._id !== null && `(${item.district})`}
                  </Text>
                </TouchableOpacity>
              )}
            />
            
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { padding: 20, paddingTop: 50, backgroundColor: '#fff', elevation: 2 },
  backText: { color: '#1976d2', fontWeight: 'bold', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  filters: { padding: 15, backgroundColor: '#fff', marginBottom: 10 },
  searchInput: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 8, marginBottom: 10 },
  roleTabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f1f5f9' },
  activeRoleTab: { backgroundColor: '#1976d2' },
  roleTabText: { fontSize: 12, color: '#64748b' },
  activeRoleTabText: { color: '#fff', fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 15 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 1 },
  cardHeader: { marginBottom: 10 },
  nameHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  email: { fontSize: 14, color: '#666' },
  roleBadge: { backgroundColor: '#e2e8f0', color: '#475569', fontSize: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, fontWeight: 'bold' },
  allocationSection: { backgroundColor: '#f8fafc', padding: 10, borderRadius: 8, marginBottom: 15 },
  sectionLabel: { fontSize: 12, color: '#94a3b8', fontWeight: 'bold', marginBottom: 4 },
  allocatedText: { color: '#059669', fontWeight: 'bold', fontSize: 14 },
  districtText: { color: '#64748b', fontSize: 12, marginLeft: 20 },
  unallocatedText: { color: '#ef4444', fontStyle: 'italic', fontSize: 14 },
  reallocateBtn: { backgroundColor: '#f1f5f9', padding: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1' },
  reallocateBtnText: { color: '#334155', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#64748b', marginTop: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  modalSubtitle: { fontSize: 14, color: '#64748b', marginBottom: 20 },
  ascItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  ascItemText: { fontSize: 16, color: '#334155' },
  unallocateAscText: { fontSize: 16, color: '#ef4444', fontStyle: 'italic' },
  closeBtn: { marginTop: 20, padding: 15, backgroundColor: '#f1f5f9', borderRadius: 10, alignItems: 'center' },
  closeBtnText: { fontWeight: 'bold', color: '#64748b' }
});

export default ManageOfficers;
