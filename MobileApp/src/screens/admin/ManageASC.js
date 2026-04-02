import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import apiClient from '../../api/apiClient';

const ManageASC = ({ navigation }) => {
  const [ascs, setAscs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');

  useEffect(() => {
    fetchASCs();
  }, []);

  const fetchASCs = async () => {
    try {
      const response = await apiClient.get('/ascs');
      setAscs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ASCs:', error);
      setLoading(false);
    }
  };

  const districts = [...new Set(ascs.map(asc => asc.district))].sort();

  const filteredASCs = ascs.filter(asc => {
    const matchesSearch = asc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          asc.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = filterDistrict ? asc.district === filterDistrict : true;
    return matchesSearch && matchesDistrict;
  });

  const renderASC = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.ascName}>{item.name}</Text>
          <Text style={styles.ascCode}>Code: {item.code}</Text>
        </View>
        <Text style={styles.districtBadge}>{item.district}</Text>
      </View>

      <Text style={styles.sectionLabel}>Assigned Staff:</Text>
      {item.assignedOfficers && item.assignedOfficers.length > 0 ? (
        <View style={styles.staffContainer}>
          {item.assignedOfficers.map(off => (
            <View key={off._id} style={styles.staffBadge}>
              <Text style={styles.staffBadgeText}>{off.name}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noStaffText}>No staff assigned</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Manage ASCs</Text>
        <Text style={styles.subtitle}>View Agrarian Service Centers</Text>
      </View>

      <View style={styles.filters}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or code..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['', ...districts]}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.districtTab, filterDistrict === item && styles.activeDistrictTab]}
              onPress={() => setFilterDistrict(item)}
            >
              <Text style={[styles.districtTabText, filterDistrict === item && styles.activeDistrictTabText]}>
                {item || 'All Districts'}
              </Text>
            </TouchableOpacity>
          )}
          style={styles.districtTabs}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
        </View>
      ) : (
        <FlatList
          data={filteredASCs}
          keyExtractor={item => item._id}
          renderItem={renderASC}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No ASCs found matching criteria.</Text>}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { padding: 20, paddingTop: 50, backgroundColor: '#fff', elevation: 2 },
  backText: { color: '#1976d2', fontWeight: 'bold', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 14, color: '#64748b' },
  filters: { padding: 15, backgroundColor: '#fff', marginBottom: 10 },
  searchInput: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 8, marginBottom: 10 },
  districtTabs: { flexDirection: 'row' },
  districtTab: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', marginRight: 10 },
  activeDistrictTab: { backgroundColor: '#1976d2' },
  districtTabText: { fontSize: 14, color: '#64748b' },
  activeDistrictTabText: { color: '#fff', fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 15 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  ascName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  ascCode: { fontSize: 13, color: '#666', marginTop: 2 },
  districtBadge: { backgroundColor: '#e2e8f0', color: '#475569', fontSize: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontWeight: 'bold' },
  sectionLabel: { fontSize: 12, color: '#94a3b8', fontWeight: 'bold', marginBottom: 8 },
  staffContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  staffBadge: { backgroundColor: '#e0f2fe', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#bae6fd' },
  staffBadgeText: { color: '#0369a1', fontSize: 12, fontWeight: '600' },
  noStaffText: { color: '#94a3b8', fontStyle: 'italic', fontSize: 13 },
  emptyText: { textAlign: 'center', color: '#64748b', marginTop: 20 }
});

export default ManageASC;
