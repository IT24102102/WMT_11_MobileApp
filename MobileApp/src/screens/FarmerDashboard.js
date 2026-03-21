import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Modal, TextInput, FlatList } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import apiClient from '../api/apiClient';

const FarmerDashboard = ({ navigation }) => {
  const { userInfo, updateUserInfo, logout } = useContext(AuthContext);
  const { t } = useLanguage();

  const [ascs, setAscs] = React.useState([]);
  const [districts, setDistricts] = React.useState([]);
  const [selectedDistrict, setSelectedDistrict] = React.useState('');
  const [selectedAsc, setSelectedAsc] = React.useState('');
  const [isEditingAsc, setIsEditingAsc] = React.useState(false);
  const [isEditingPhone, setIsEditingPhone] = React.useState(false);
  const [newPhone, setNewPhone] = React.useState(userInfo?.phone || '');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const fetchAscs = async () => {
      try {
        const response = await apiClient.get('/ascs');
        setAscs(response.data);
        const uniqueDistricts = [...new Set(response.data.map(asc => asc.district))].sort();
        setDistricts(uniqueDistricts);
      } catch (err) {
        console.error('Error fetching ASCs:', err);
      }
    };
    fetchAscs();
  }, []);

  const handleUpdateAsc = async () => {
    if (!selectedAsc) return;
    setSaving(true);
    try {
      const response = await apiClient.put('/auth/update-asc', { assignedAsc: selectedAsc });
      if (response.status === 200) {
        updateUserInfo(response.data);
        setIsEditingAsc(false);
      }
    } catch (err) {
      console.error('Error updating ASC:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const response = await apiClient.put('/auth/update-profile', { phone: newPhone });
      if (response.status === 200) {
        updateUserInfo(response.data);
        setIsEditingPhone(false);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

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
          <TouchableOpacity style={styles.statusCard} onPress={() => setIsEditingAsc(true)}>
            <View style={styles.cardHeader}>
              <Text style={styles.statusLabel}>{t('farmer.yourCenter')}</Text>
              <Text style={styles.editLink}>{t('farmer.change')}</Text>
            </View>
            <Text style={styles.statusValue}>📍 {userInfo?.assignedAsc?.name || t('farmer.noCenter')}</Text>
            {userInfo?.assignedAsc && <Text style={styles.statusSubValue}>{userInfo.assignedAsc.district} {t('auth.district')}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.statusCard} onPress={() => setIsEditingPhone(true)}>
            <View style={styles.cardHeader}>
              <Text style={styles.statusLabel}>{t('farmer.phoneNumber')}</Text>
              <Text style={styles.editLink}>{t('farmer.edit')}</Text>
            </View>
            <Text style={styles.statusValue}>📞 {userInfo?.phone || 'Not added'}</Text>
            <Text style={styles.statusSubValue}>{t('farmer.primaryContact')}</Text>
          </TouchableOpacity>
        </View>

        {/* ASC Selection Modal */}
        <Modal visible={isEditingAsc} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t('farmer.selectNewCenter')}</Text>
              
              <Text style={styles.selectLabel}>{t('auth.district')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                {districts.map(d => (
                  <TouchableOpacity 
                    key={d} 
                    style={[styles.chip, selectedDistrict === d && styles.activeChip]}
                    onPress={() => setSelectedDistrict(d)}
                  >
                    <Text style={[styles.chipText, selectedDistrict === d && styles.activeChipText]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.selectLabel}>{t('auth.asc')}</Text>
              <View style={styles.ascList}>
                {ascs.filter(a => a.district === selectedDistrict).map(a => (
                  <TouchableOpacity 
                    key={a._id} 
                    style={[styles.ascItem, selectedAsc === a._id && styles.activeAscItem]}
                    onPress={() => setSelectedAsc(a._id)}
                  >
                    <Text style={[styles.ascItemText, selectedAsc === a._id && styles.activeAscItemText]}>{a.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.saveBtn, (!selectedAsc || saving) && styles.disabledBtn]} 
                  onPress={handleUpdateAsc}
                  disabled={!selectedAsc || saving}
                >
                  <Text style={styles.btnText}>{saving ? '...' : t('common.save')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setIsEditingAsc(false)}>
                  <Text style={styles.btnText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Phone Editing Modal */}
        <Modal visible={isEditingPhone} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t('farmer.updatePhone')}</Text>
              <TextInput
                style={styles.input}
                value={newPhone}
                onChangeText={setNewPhone}
                placeholder={t('farmer.enterPhone')}
                keyboardType="phone-pad"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.saveBtn, saving && styles.disabledBtn]} 
                  onPress={handleUpdateProfile}
                  disabled={saving}
                >
                  <Text style={styles.btnText}>{saving ? '...' : t('common.save')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setIsEditingPhone(false)}>
                  <Text style={styles.btnText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
  chipContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
  ascList: {
    marginBottom: 20,
  },
  ascItem: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  activeAscItem: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50',
  },
  ascItemText: {
    fontSize: 14,
    color: '#333',
  },
  activeAscItemText: {
    color: '#2e7d32',
    fontWeight: 'bold',
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
