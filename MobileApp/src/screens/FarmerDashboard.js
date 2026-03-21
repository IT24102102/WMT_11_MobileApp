import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const FarmerDashboard = ({ navigation }) => {
  const { userInfo, logout } = useContext(AuthContext);
  const { t } = useLanguage();

  const menuItems = [
    { id: 'crop', title: t('farmer.registerCrop'), desc: t('farmer.registerCropDesc'), icon: '🌱', color: '#4caf50', screen: 'RegisterCrop' },
    { id: 'finance', title: t('farmer.financialAid'), desc: t('farmer.financialAidDesc'), icon: '💰', color: '#ff9800', screen: 'FinancialAid' },
    { id: 'machinery', title: t('farmer.machineryHub'), desc: t('farmer.machineryHubDesc'), icon: '🚜', color: '#2196f3', screen: 'MachineryHub' },
    { id: 'products', title: t('farmer.agriProducts'), desc: t('farmer.agriProductsDesc'), icon: '🛒', color: '#9c27b0', screen: 'AgriProducts' },
    { id: 'harvest', title: t('farmer.sellHarvest'), desc: t('farmer.sellHarvestDesc'), icon: '📈', color: '#f44336', screen: 'SellHarvest' },
    { id: 'ai', title: t('farmer.leafDiagnostic'), desc: t('farmer.leafDiagnosticDesc'), icon: '🔍', color: '#00bcd4', screen: 'LeafDiagnostic' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>{t('dashboard.welcome')},</Text>
            <Text style={styles.userName}>{userInfo?.name || 'Farmer'}! 🌾</Text>
            <Text style={styles.subtitle}>{t('farmer.manageActivities')}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>{t('dashboard.logout')}</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Status Cards */}
        <View style={styles.statusRow}>
          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>{t('farmer.yourCenter')}</Text>
            <Text style={styles.statusValue}>📍 {userInfo?.assignedAsc?.name || t('farmer.noCenter')}</Text>
            {userInfo?.assignedAsc && <Text style={styles.statusSubValue}>{userInfo.assignedAsc.district} {t('auth.district')}</Text>}
          </View>

          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>{t('farmer.phoneNumber')}</Text>
            <Text style={styles.statusValue}>📞 {userInfo?.phone || 'Not added'}</Text>
            <Text style={styles.statusSubValue}>{t('farmer.primaryContact')}</Text>
          </View>
        </View>

        {/* Dashboard Grid */}
        <View style={styles.grid}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.card}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                <Text style={styles.icon}>{item.icon}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>{item.desc}</Text>
            </TouchableOpacity>
          )) }
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1b5e20',
    marginVertical: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
  },
  logoutBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#ffebee',
  },
  logoutText: {
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statusCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 15,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#9e9e9e',
    marginBottom: 8,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  statusSubValue: {
    fontSize: 11,
    color: '#757575',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    alignItems: 'center',
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    fontSize: 30,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default FarmerDashboard;
