import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, FlatList, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const FarmerDashboard = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);
  const { t } = useLanguage();

  const menuItems = [
    { id: 'crop', title: t('farmer_crop.title'), desc: t('farmer.registerCropDesc'), icon: '🌱', color: '#4caf50', screen: 'RegisterCrop' },
    { id: 'mycrops', title: t('farmer_crop.headerList'), desc: t('farmer.yourCropsDesc'), icon: '🌾', color: '#81c784', screen: 'MyCropsTab' },
    { id: 'finance', title: t('farmer.financialAid'), desc: t('farmer.financialAidDesc'), icon: '💰', color: '#ff9800', screen: 'FinancialAid' },
    { id: 'machinery', title: t('farmer.machineryHub'), desc: t('farmer.machineryHubDesc'), icon: '🚜', color: '#2196f3', screen: 'MachineryHub' },
    { id: 'products', title: t('farmer.agriProducts'), desc: t('farmer.agriProductsDesc'), icon: '🛒', color: '#9c27b0', screen: 'BuyTab' },
    { id: 'harvest', title: t('farmer.sellHarvest'), desc: t('farmer.sellHarvestDesc'), icon: '📈', color: '#f44336', screen: 'SellTab' },
    { id: 'ai', title: t('farmer.leafDiagnostic'), desc: t('farmer.leafDiagnosticDesc'), icon: '🔍', color: '#00bcd4', screen: 'LeafDiagnostic' },
  ];

  return (
    <ImageBackground 
      source={require('../../assets/images/hero.png')} 
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.welcomeText}>{t('dashboard.welcome')},</Text>
            <Text style={styles.userName} numberOfLines={1}>{userInfo?.name || 'Farmer'}! 🌾</Text>
            <Text style={styles.subtitle} numberOfLines={2}>{t('farmer.manageActivities')}</Text>
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
              <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.cardDesc} numberOfLines={3}>{item.desc}</Text>
            </TouchableOpacity>
          )) }
        </View>

      </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
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
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1b5e20',
    marginVertical: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    lineHeight: 17,
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  langBtnActive: {
    backgroundColor: '#1b5e20',
  },
  langBtnText: {
    color: '#888',
    fontWeight: '700',
    fontSize: 12,
  },
  langBtnTextActive: {
    color: '#fff',
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
    minHeight: 170,
    padding: 18,
    borderRadius: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 19,
  },
  cardDesc: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  editLink: {
    fontSize: 10,
    color: '#2196f3',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 20,
    padding: 25,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  selectLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
    marginTop: 10,
  },
  horizontalScrollWrapper: {
    marginBottom: 25,
    height: 50,
  },
  horizontalChipsContent: {
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
    height: 40,
    justifyContent: 'center',
  },
  activeChip: {
    backgroundColor: '#1b5e20',
    borderColor: '#1b5e20',
  },
  chipText: {
    fontSize: 13,
    color: '#666',
  },
  activeChipText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptySelection: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySelectionText: {
    color: '#999',
    fontSize: 13,
    fontStyle: 'italic',
  },
  emptyText: {
    color: '#999',
    fontSize: 13,
    marginLeft: 10,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: '#4caf50',
  },
  cancelBtn: {
    backgroundColor: '#9e9e9e',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default FarmerDashboard;
