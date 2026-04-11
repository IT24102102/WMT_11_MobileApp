import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';

const SRI_LANKA_DISTRICTS = ['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 'Hambantota', 'Galle', 'Matara', 'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Kegalle', 'Ratnapura', 'Badulla', 'Moneragala', 'Jaffna', 'Kilinochchi', 'Vavuniya', 'Mullaitivu', 'Mannar', 'Trincomalee', 'Batticaloa', 'Ampara'];

const RegionalReports = ({ navigation }) => {
  const { userToken } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState('All');

  useEffect(() => {
    fetchAnalytics(selectedDistrict);
  }, [selectedDistrict]);

  const fetchAnalytics = async (district) => {
    try {
      setLoading(true);
      const url = district === 'All' 
        ? '/analytics/analytics' 
        : `/analytics/analytics?district=${district}`;
      
      const response = await apiClient.get(url);
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = (label, value, max, color) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
      <View key={label} style={styles.barRow}>
        <View style={styles.barLabelContainer}>
          <Text style={styles.barLabel}>{label}</Text>
          <Text style={styles.barValue}>{value}</Text>
        </View>
        <View style={styles.barBackground}>
          <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back to Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📊 Regional Analytics</Text>
        <Text style={styles.subtitle}>Platform-wide agricultural insights</Text>
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Filter by District:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.districtScroll}>
          <TouchableOpacity 
            style={[styles.districtTab, selectedDistrict === 'All' && styles.activeDistrictTab]}
            onPress={() => setSelectedDistrict('All')}
          >
            <Text style={[styles.districtTabText, selectedDistrict === 'All' && styles.activeDistrictTabText]}>All Districts</Text>
          </TouchableOpacity>
          {SRI_LANKA_DISTRICTS.map(dist => (
            <TouchableOpacity 
              key={dist}
              style={[styles.districtTab, selectedDistrict === dist && styles.activeDistrictTab]}
              onPress={() => setSelectedDistrict(dist)}
            >
              <Text style={[styles.districtTabText, selectedDistrict === dist && styles.activeDistrictTabText]}>{dist}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading || !analytics ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
          <Text style={styles.loadingText}>Fetching analytics data...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {/* KPI Summary Cards */}
          <View style={styles.kpiContainer}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiIcon}>👥</Text>
              <Text style={styles.kpiValue}>{analytics.summary.totalUsers}</Text>
              <Text style={styles.kpiLabel}>Total Users</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiIcon}>🌾</Text>
              <Text style={styles.kpiValue}>{analytics.summary.totalCrops}</Text>
              <Text style={styles.kpiLabel}>Crops Tracked</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiIcon}>🚜</Text>
              <Text style={styles.kpiValue}>{analytics.summary.totalMachinery}</Text>
              <Text style={styles.kpiLabel}>Machinery</Text>
            </View>
          </View>

          {/* User Distribution */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              {selectedDistrict === 'All' ? 'Users by District' : `Users in ${selectedDistrict} by Role`}
            </Text>
            <View style={styles.barList}>
              {analytics.userDistribution.map((item, idx) => {
                const label = selectedDistrict === 'All' 
                  ? (item.district || 'Unknown') 
                  : (item.role ? String(item.role).replace('_', ' ') : 'Unknown');
                return renderProgressBar(label || `Unknown-${idx}`, item.count, Math.max(...analytics.userDistribution.map(d => d.count)), '#3b82f6');
              })}
            </View>
          </View>

          {/* Crop Cultivation */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Cultivated Acres by Crop Type</Text>
            <View style={styles.barList}>
              {analytics.cropDistribution.map(item => (
                renderProgressBar(item.cropType, item.totalAcres, Math.max(...analytics.cropDistribution.map(d => d.totalAcres)), '#10b981')
              ))}
            </View>
          </View>

          {/* Machinery Distribution */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Machinery Availability</Text>
            <View style={styles.barList}>
              {analytics.machineryDistribution.map(item => (
                renderProgressBar(item.type, item.count, Math.max(...analytics.machineryDistribution.map(d => d.count)), '#f59e0b')
              ))}
            </View>
          </View>
          
          <View style={{height: 30}} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { padding: 20, paddingTop: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  backText: { color: '#1976d2', fontWeight: 'bold', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 13, color: '#64748b' },
  filterSection: { backgroundColor: '#fff', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  filterLabel: { fontSize: 12, fontWeight: 'bold', color: '#64748b', paddingHorizontal: 20, marginBottom: 10, textTransform: 'uppercase' },
  districtScroll: { paddingHorizontal: 15 },
  districtTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', marginRight: 10 },
  activeDistrictTab: { backgroundColor: '#1e293b' },
  districtTabText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  activeDistrictTabText: { color: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#64748b' },
  content: { padding: 15 },
  kpiContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  kpiCard: { backgroundColor: '#fff', width: '31%', padding: 15, borderRadius: 12, alignItems: 'center', elevation: 2 },
  kpiIcon: { fontSize: 28, marginBottom: 8 },
  kpiValue: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  kpiLabel: { fontSize: 11, color: '#64748b', marginTop: 4, textAlign: 'center' },
  sectionCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 20 },
  barList: { gap: 15 },
  barRow: { width: '100%' },
  barLabelContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  barLabel: { fontSize: 13, color: '#475569', fontWeight: '500' },
  barValue: { fontSize: 13, color: '#1e293b', fontWeight: 'bold' },
  barBackground: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 }
});

export default RegionalReports;
