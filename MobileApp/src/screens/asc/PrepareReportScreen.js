import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { generateReportPDF } from '../../utils/PdfGenerator';

const PrepareReportScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [cropStats, setCropStats] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const reportTypes = [
    { id: 'crop_summary', title: 'Crop Summary Report', icon: '🌾', desc: 'Summary of all registered crops in your center.' },
    { id: 'financial_summary', title: 'Loan & Financial Summary', icon: '💰', desc: 'Overview of loan applications and statuses.' },
    { id: 'machinery_usage', title: 'Machinery Usage Report', icon: '🚜', desc: 'Regional machinery availability and bookings.' },
  ];

  const fetchCropStats = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/crops');
      const crops = response.data;
      
      const stats = crops.reduce((acc, crop) => {
        const type = crop.cropType || 'Other';
        if (!acc[type]) acc[type] = { count: 0, landSize: 0 };
        acc[type].count += 1;
        acc[type].landSize += crop.landSize || 0;
        return acc;
      }, {});

      const rows = Object.keys(stats).map(key => ({
        category: key.charAt(0).toUpperCase() + key.slice(1),
        count: stats[key].count,
        landSize: stats[key].landSize
      }));

      setCropStats(rows);
      setShowPreview(true);
    } catch (error) {
      console.error('Error fetching crop stats:', error);
      Alert.alert('Error', 'Failed to fetch data for report');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (cropStats) {
      await generateReportPDF('ASC Crop Statistics Summary', { type: 'crop_stats', rows: cropStats }, userInfo);
    }
  };

  const renderPreview = () => (
    <View style={styles.previewContainer}>
      <View style={styles.previewHeader}>
        <Text style={styles.previewTitle}>Crop Statistics Preview</Text>
        <TouchableOpacity onPress={() => setShowPreview(false)}>
          <Ionicons name="close-circle" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHead, { flex: 2 }]}>Crop</Text>
          <Text style={[styles.tableHead, { flex: 1 }]}>Count</Text>
          <Text style={[styles.tableHead, { flex: 1 }]}>Acres</Text>
        </View>
        <ScrollView style={{ maxHeight: 300 }}>
          {cropStats.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>{item.category}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{item.count}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{item.landSize.toFixed(1)}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity style={styles.downloadBtn} onPress={handleGeneratePDF}>
        <Ionicons name="download-outline" size={20} color="#fff" />
        <Text style={styles.downloadBtnText}>Generate & Download Report</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1b5e20" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Generate Reports</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {showPreview ? renderPreview() : (
          <>
            <Text style={styles.sectionTitle}>Select Report Type</Text>
            <Text style={styles.sectionDesc}>Choose the type of data you want to include in your PDF report.</Text>

            {reportTypes.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.reportCard}
                onPress={() => item.id === 'crop_summary' ? fetchCropStats() : Alert.alert('Coming Soon', 'This report type is currently under development.')}
                disabled={loading}
              >
                <View style={styles.cardIconBox}>
                  <Text style={styles.cardIcon}>{item.icon}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDesc}>{item.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
              </TouchableOpacity>
            ))}
          </>
        )}

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#1b5e20" />
            <Text style={styles.loadingText}>Gathering Data...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color="#1b5e20" />
        <Text style={styles.infoText}>
          Generated reports will be saved to your device. You can manually upload these in the "Assigned Reports" section.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  backBtn: { padding: 5, marginRight: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  sectionDesc: { fontSize: 14, color: '#64748b', marginBottom: 25 },
  reportCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 16, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  cardIconBox: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardIcon: { fontSize: 24 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: '#64748b' },
  loadingOverlay: { marginTop: 30, alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#1b5e20', fontWeight: 'bold' },
  infoBox: { margin: 20, backgroundColor: '#f0fdf4', padding: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderLeftWidth: 4, borderLeftColor: '#1b5e20' },
  infoText: { flex: 1, fontSize: 12, color: '#166534', lineHeight: 18 },
  
  previewContainer: { backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  previewTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  table: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, overflow: 'hidden', marginBottom: 25 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f8fafc', padding: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  tableHead: { fontSize: 12, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  tableCell: { fontSize: 14, color: '#334155', fontWeight: '500' },
  downloadBtn: { backgroundColor: '#1b5e20', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  downloadBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default PrepareReportScreen;
