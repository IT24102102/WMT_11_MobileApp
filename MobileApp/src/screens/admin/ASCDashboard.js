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
  Dimensions
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import apiClient from '../../api/apiClient';

const { width } = Dimensions.get('window');

const ASCDashboard = ({ navigation }) => {
  const { userInfo, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresing, setRefreshing] = useState(false);

  const ascId = userInfo?.assignedAsc?._id || userInfo?.assignedAsc;

  const sections = [
    { id: 'farmers', title: t('asc.centerManagement'), icon: '🏘️', desc: t('asc.centerManagementDesc'), endpoint: `/ascs/${ascId}/farmers` },
    { id: 'staff', title: t('asc.staffCoordination'), icon: '👥', desc: t('asc.staffCoordinationDesc'), endpoint: `/ascs/${ascId}/staff` },
    { id: 'crops', title: t('asc.cropRegs'), icon: '🌾', desc: t('asc.cropRegsDesc'), endpoint: '/crops' },
    { id: 'loans', title: t('asc.loanApps'), icon: '💳', desc: t('asc.loanAppsDesc'), endpoint: `/loans?ascId=${ascId}` },
    { id: 'compensations', title: t('asc.compClaims'), icon: '📋', desc: t('asc.compClaimsDesc'), endpoint: '/compensation' },
    { id: 'machinery', title: t('asc.machineryServices'), icon: '🚜', desc: t('asc.machineryServicesDesc'), endpoint: '/machinery/regional-data' },
  ];

  useEffect(() => {
    if (activeTab !== 'overview' && activeTab !== 'machinery') {
      fetchSectionData(activeTab);
    }
  }, [activeTab]);

  const fetchSectionData = async (tab) => {
    const section = sections.find(s => s.id === tab);
    if (!section?.endpoint) return;

    setLoading(true);
    try {
      const response = await apiClient.get(section.endpoint);
      if (tab === 'machinery') {
        // Show official ASC inventory and farmer-registered machinery
        const combined = [
          ...response.data.inventory.map(i => ({ ...i, category: 'ASC Asset' })),
          ...response.data.farmerRentals.map(r => ({ ...r, category: 'Farmer Listing', name: r.name || r.machineName })),
          ...response.data.machineryRequests.map(r => ({ ...r, category: 'Booking Request', name: r.machinery?.name }))
        ];
        setData(combined);
      } else {
        setData(response.data);
      }
    } catch (error) {
      console.error(`Error fetching ${tab}:`, error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    if (activeTab !== 'overview') {
        setRefreshing(true);
        fetchSectionData(activeTab);
    }
  };

  const renderSectionItem = ({ item }) => (
    <View style={styles.listItem}>
      {activeTab === 'farmers' && (
        <>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemSubtitle}>{item.email}</Text>
          <Text style={styles.itemDetail}>NIC: {item.nic}</Text>
        </>
      )}
      {activeTab === 'staff' && (
        <>
          <View style={styles.listHeader}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <View style={styles.roleBadge}><Text style={styles.roleBadgeText}>{item.role}</Text></View>
          </View>
          <Text style={styles.itemSubtitle}>{item.email}</Text>
          <Text style={styles.itemDetail}>NIC: {item.nic}</Text>
        </>
      )}
      {activeTab === 'crops' && (
        <>
          <View style={styles.listHeader}>
            <Text style={styles.itemTitle}>{item.cropType}</Text>
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'Approved' ? '#dcfce7' : '#fef3c7' }]}>
              <Text style={[styles.statusText, { color: item.status === 'Approved' ? '#166534' : '#92400e' }]}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.itemSubtitle}>{item.variety}</Text>
          <Text style={styles.itemDetail}>👨‍🌾 {item.farmer?.name}</Text>
          <Text style={styles.itemDetail}>📏 {item.landSize} ac</Text>
        </>
      )}
      {activeTab === 'loans' && (
        <>
          <View style={styles.listHeader}>
            <Text style={styles.itemTitle}>LKR {item.amount?.toLocaleString()}</Text>
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'Approved' ? '#dcfce7' : '#fef3c7' }]}>
              <Text style={[styles.statusText, { color: item.status === 'Approved' ? '#166534' : '#92400e' }]}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.itemSubtitle}>{item.purpose}</Text>
          <Text style={styles.itemDetail}>👨‍🌾 {item.farmer?.name}</Text>
        </>
      )}
      {activeTab === 'compensations' && (
        <>
          <View style={styles.listHeader}>
            <Text style={styles.itemTitle}>{item.crop?.cropType} ({item.crop?.landSize} ac)</Text>
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'Approved' ? '#dcfce7' : '#fef3c7' }]}>
              <Text style={[styles.statusText, { color: item.status === 'Approved' ? '#166534' : '#92400e' }]}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.itemSubtitle}>{item.damageType}</Text>
          <Text style={styles.itemDetail}>👨‍🌾 {item.farmer?.name}</Text>
        </>
      )}
      {activeTab === 'machinery' && (
        <>
          <View style={styles.listHeader}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <View style={styles.categoryBadge}><Text style={styles.categoryBadgeText}>{item.category}</Text></View>
          </View>
          <Text style={styles.itemSubtitle}>{item.type || item.category}</Text>
          <View style={[styles.statusBadge, { backgroundColor: '#f1f5f9', marginTop: 5 }]}>
            <Text style={[styles.statusText, { color: '#64748b' }]}>{item.status || 'Active'}</Text>
          </View>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>{t('asc.dashboardTitle')}</Text>
            <View style={styles.roleTag}><Text style={styles.roleTagText}>ASC OFFICER</Text></View>
          </View>
          <Text style={styles.subtitle}>{t('asc.manageCenter')}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {userInfo?.assignedAsc && (
        <View style={styles.infoBar}>
          <Text style={styles.infoText}>📍 {userInfo.assignedAsc.name} - {userInfo.assignedAsc.district}</Text>
        </View>
      )}

      {activeTab === 'overview' ? (
        <ScrollView contentContainerStyle={styles.grid}>
          {sections.map((section) => (
            <TouchableOpacity 
              key={section.id} 
              style={styles.card}
              onPress={() => setActiveTab(section.id)}
            >
              <Text style={styles.cardIcon}>{section.icon}</Text>
              <Text style={styles.cardTitle}>{section.title}</Text>
              <Text style={styles.cardDesc}>{section.desc}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity onPress={() => setActiveTab('overview')} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>{sections.find(s => s.id === activeTab)?.title}</Text>
          </View>

          {loading && !refresing ? (
            <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 50 }} />
          ) : (
            <FlatList
              data={data}
              renderItem={renderSectionItem}
              keyExtractor={item => item._id}
              contentContainerStyle={{ padding: 15 }}
              refreshControl={<RefreshControl refreshing={refresing} onRefresh={onRefresh} />}
              ListEmptyComponent={<Text style={styles.emptyText}>No records found.</Text>}
            />
          )}
        </View>
      )}
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
  
  grid: { padding: 15, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardIcon: { fontSize: 30, marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#1e293b', marginBottom: 5 },
  cardDesc: { fontSize: 11, color: '#64748b', lineHeight: 15 },
  
  sectionContainer: { flex: 1 },
  sectionHeader: { padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', gap: 15 },
  backBtn: { padding: 5 },
  backBtnText: { color: '#3b82f6', fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  
  listItem: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  itemSubtitle: { fontSize: 14, color: '#444', marginBottom: 4 },
  itemDetail: { fontSize: 12, color: '#64748b' },
  roleBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  roleBadgeText: { fontSize: 10, color: '#475569', fontWeight: 'bold' },
  categoryBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  categoryBadgeText: { fontSize: 10, color: '#1e40af', fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#94a3b8' }
});

export default ASCDashboard;
