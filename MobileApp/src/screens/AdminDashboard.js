import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import apiClient from '../api/apiClient';

const AdminDashboard = ({ navigation }) => {
  const { userInfo, logout } = useContext(AuthContext);
  const { t, language, switchLanguage } = useLanguage();
  const [stats, setStats] = useState({ ascCount: 0, officerCount: 0 });
  const [selectedDistrict, setSelectedDistrict] = useState('Colombo');

  const districtMaps = {
    'Colombo': 'https://www.arcgis.com/apps/View/index.html?appid=31819d80c90e4900a5b6e78d6ac68645',
    'Gampaha': 'https://www.arcgis.com/apps/View/index.html?appid=90ed750c43b24120b72b8ec23654db0f',
    'Kalutara': 'https://www.arcgis.com/apps/View/index.html?appid=9c4b081e44674e2b98d4870e706e7293',
    // ... adding a few more for demo, same as web
    'Kandy': 'https://www.arcgis.com/apps/View/index.html?appid=73d44159b7134a939fbeeaf87b08e70a',
    'Anuradhapura': 'https://www.arcgis.com/apps/View/index.html?appid=ef424354e2b94454924fb7253471fc76',
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [ascsRes, officersRes] = await Promise.all([
        apiClient.get('/ascs'),
        apiClient.get('/admin/officers')
      ]);
      setStats({
        ascCount: ascsRes.data.length,
        officerCount: officersRes.data.length
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const openMap = () => {
    const url = districtMaps[selectedDistrict] || districtMaps['Colombo'];
    Linking.openURL(url);
  };

  const adminMenu = [
    { id: 'ascs', title: 'Agrarian Centers', desc: 'Manage infrastructure and staff.', icon: '🏢', screen: 'ManageASC' },
    { id: 'staff', title: 'Staff & Allocation', desc: 'Manage and reallocate staff.', icon: '👥', screen: 'ManageOfficers' },
    { id: 'products', title: 'Product Approval', desc: 'Review product listings.', icon: '📦', screen: 'ProductReview' },
    { id: 'reports', title: 'Analytics & Reports', desc: 'View system-wide production reports.', icon: '📊', screen: 'RegionalReports' }, 
    { id: 'taskReports', title: 'Report Requests', desc: 'Request specific reports from ASCs.', icon: '📝', screen: 'AdminReportRequests' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <View>
            <Text style={styles.adminTag}>ADMIN PORTAL</Text>
            <Text style={styles.userName}>{userInfo?.name || 'Admin'} 🛡️</Text>
            <Text style={styles.subtitle}>AgroLanka System Overview</Text>
          </View>
          <View style={styles.headerActions}>
            <View style={styles.langToggle}>
              <TouchableOpacity
                style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
                onPress={() => switchLanguage('en')}
              >
                <Text style={[styles.langBtnText, language === 'en' && styles.langBtnTextActive]}>En</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.langBtn, language === 'si' && styles.langBtnActive]}
                onPress={() => switchLanguage('si')}
              >
                <Text style={[styles.langBtnText, language === 'si' && styles.langBtnTextActive]}>සිං</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
              <Text style={styles.logoutText}>{t('dashboard.logout')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.ascCount}</Text>
            <Text style={styles.statLabel}>ASC Centers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.officerCount}</Text>
            <Text style={styles.statLabel}>Total Staff</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>25</Text>
            <Text style={styles.statLabel}>Districts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, {color: '#4caf50'}]}>Active</Text>
            <Text style={styles.statLabel}>Status</Text>
          </View>
        </View>

        {/* Action Section */}
        <Text style={styles.sectionTitle}>Centralized Management</Text>
        <View style={styles.actionGrid}>
          {adminMenu.map(item => (
            <TouchableOpacity key={item.id} style={styles.actionCard} onPress={() => navigation.navigate(item.screen)}>
              <Text style={styles.actionIcon}>{item.icon}</Text>
              <Text style={styles.actionTitle}>{item.title}</Text>
              <Text style={styles.actionDesc}>{item.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Map Section */}
        <View style={styles.mapCard}>
          <Text style={styles.mapTitle}>🗺️ District AI Range Maps</Text>
          <Text style={styles.mapDesc}>View interactive boundaries for agricultural districts.</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.districtList}>
            {Object.keys(districtMaps).map(d => (
              <TouchableOpacity 
                key={d} 
                style={[styles.districtChip, selectedDistrict === d && styles.activeChip]}
                onPress={() => setSelectedDistrict(d)}
              >
                <Text style={[styles.chipText, selectedDistrict === d && styles.activeChipText]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.mapBtn} onPress={openMap}>
            <Text style={styles.mapBtnText}>Open {selectedDistrict} Map ↗</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  scrollContent: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 },
  adminTag: { fontSize: 10, fontWeight: 'bold', color: '#1976d2', letterSpacing: 1 },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#333', marginVertical: 4 },
  subtitle: { fontSize: 14, color: '#666' },
  headerActions: { alignItems: 'flex-end', gap: 8 },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  langBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  langBtnActive: { backgroundColor: '#1b5e20' },
  langBtnText: { color: '#888', fontWeight: '700', fontSize: 12 },
  langBtnTextActive: { color: '#fff' },
  logoutBtn: { padding: 10, borderRadius: 10, backgroundColor: '#fff', elevation: 2 },
  logoutText: { color: '#d32f2f', fontWeight: 'bold' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { backgroundColor: '#fff', width: '48%', padding: 15, borderRadius: 15, marginBottom: 15, alignItems: 'center', elevation: 2 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#1976d2' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15, marginTop: 10 },
  actionGrid: { marginBottom: 20 },
  actionCard: { backgroundColor: '#fff', padding: 20, borderRadius: 18, marginBottom: 12, elevation: 2 },
  actionIcon: { fontSize: 24, marginBottom: 10 },
  actionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  actionDesc: { fontSize: 13, color: '#777', lineHeight: 18 },
  mapCard: { backgroundColor: '#1e293b', padding: 25, borderRadius: 20, marginTop: 10 },
  mapTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  mapDesc: { color: '#94a3b8', fontSize: 14, marginBottom: 20 },
  districtList: { marginBottom: 20 },
  districtChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#334155', marginRight: 10 },
  activeChip: { backgroundColor: '#3b82f6' },
  chipText: { color: '#94a3b8' },
  activeChipText: { color: '#fff', fontWeight: 'bold' },
  mapBtn: { backgroundColor: '#3b82f6', padding: 15, borderRadius: 12, alignItems: 'center' },
  mapBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default AdminDashboard;
