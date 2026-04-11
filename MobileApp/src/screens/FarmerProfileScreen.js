import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Modal, TextInput, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import apiClient from '../api/apiClient';

const FarmerProfileScreen = () => {
  const { userInfo, updateUserInfo, logout } = useContext(AuthContext);
  const { t, language, switchLanguage } = useLanguage();

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

  return (
    <ImageBackground 
      source={require('../../assets/images/hero.png')} 
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileCard}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarInitial}>{userInfo?.name?.charAt(0) || 'U'}</Text>
            </View>
            <Text style={styles.name}>{userInfo?.name || 'User'}</Text>
            <Text style={styles.email}>{userInfo?.email || 'No email'}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{userInfo?.role || 'FARMER'}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Details</Text>
            
            <TouchableOpacity style={styles.rowCard} onPress={() => setIsEditingAsc(true)}>
              <View style={styles.rowInfo}>
                <Text style={styles.rowLabel}>{t('farmer.yourCenter')}</Text>
                <Text style={styles.rowValue}>📍 {userInfo?.assignedAsc?.name || t('farmer.noCenter')}</Text>
                {userInfo?.assignedAsc && <Text style={styles.rowSubValue}>{userInfo.assignedAsc.district} {t('auth.district')}</Text>}
              </View>
              <Text style={styles.editLink}>{t('farmer.change')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.rowCard} onPress={() => setIsEditingPhone(true)}>
              <View style={styles.rowInfo}>
                <Text style={styles.rowLabel}>{t('farmer.phoneNumber')}</Text>
                <Text style={styles.rowValue}>📞 {userInfo?.phone || 'Not added'}</Text>
                <Text style={styles.rowSubValue}>{t('farmer.primaryContact')}</Text>
              </View>
              <Text style={styles.editLink}>{t('farmer.edit')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Preferences</Text>
            <View style={styles.rowCard}>
              <View style={styles.rowInfo}>
                <Text style={styles.rowLabel}>Language</Text>
                <Text style={styles.rowValue}>{language === 'en' ? 'English' : 'සිංහල'}</Text>
              </View>
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
            </View>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>{t('dashboard.logout')}</Text>
          </TouchableOpacity>
        </ScrollView>

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

              <Text style={styles.selectLabel}>{selectedDistrict ? `${t('auth.asc')} in ${selectedDistrict}` : t('auth.asc')}</Text>
              <View style={styles.horizontalScrollWrapper}>
                {selectedDistrict ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalChipsContent}>
                    {ascs.filter(a => a.district === selectedDistrict).map(a => (
                      <TouchableOpacity 
                        key={a._id} 
                        style={[styles.chip, selectedAsc === a._id && styles.activeChip]}
                        onPress={() => setSelectedAsc(a._id)}
                      >
                        <Text style={[styles.chipText, selectedAsc === a._id && styles.activeChipText]}>
                          {selectedAsc === a._id ? '✅ ' : '📍 '}{a.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    {ascs.filter(a => a.district === selectedDistrict).length === 0 && (
                      <Text style={styles.emptyText}>No centers found</Text>
                    )}
                  </ScrollView>
                ) : (
                  <View style={styles.emptySelection}>
                    <Text style={styles.emptySelectionText}>Please select a district first</Text>
                  </View>
                )}
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

      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1 },
  header: { padding: 20, backgroundColor: '#fff', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1b5e20' },
  scrollContent: { padding: 20 },
  profileCard: { backgroundColor: '#fff', borderRadius: 20, padding: 25, alignItems: 'center', marginBottom: 25, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  avatarBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarInitial: { fontSize: 32, fontWeight: 'bold', color: '#2e7d32' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  email: { fontSize: 14, color: '#666', marginBottom: 15 },
  roleBadge: { backgroundColor: '#fff9c4', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20 },
  roleText: { color: '#fbc02d', fontWeight: 'bold', fontSize: 12 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  rowCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 10, alignItems: 'center', justifyContent: 'space-between', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 12, color: '#999', marginBottom: 4, fontWeight: 'bold' },
  rowValue: { fontSize: 14, color: '#333', fontWeight: '600' },
  rowSubValue: { fontSize: 11, color: '#757575', marginTop: 2 },
  editLink: { fontSize: 12, color: '#2196f3', fontWeight: 'bold' },
  langToggle: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderRadius: 20, borderWidth: 1, borderColor: '#e0e0e0', overflow: 'hidden' },
  langBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  langBtnActive: { backgroundColor: '#1b5e20' },
  langBtnText: { color: '#888', fontWeight: '700', fontSize: 12 },
  langBtnTextActive: { color: '#fff' },
  logoutBtn: { backgroundColor: '#ffebee', padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  logoutText: { color: '#d32f2f', fontWeight: 'bold', fontSize: 16 },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', width: '100%', borderRadius: 20, padding: 25, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  selectLabel: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 10, marginTop: 10 },
  horizontalScrollWrapper: { marginBottom: 25, height: 50 },
  horizontalChipsContent: { paddingHorizontal: 2, alignItems: 'center' },
  chipContainer: { flexDirection: 'row', marginBottom: 15 },
  chip: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, backgroundColor: '#f5f5f5', marginRight: 10, borderWidth: 1, borderColor: '#eee', height: 40, justifyContent: 'center' },
  activeChip: { backgroundColor: '#1b5e20', borderColor: '#1b5e20' },
  chipText: { fontSize: 13, color: '#666' },
  activeChipText: { color: '#fff', fontWeight: 'bold' },
  emptySelection: { height: 50, justifyContent: 'center', alignItems: 'center' },
  emptySelectionText: { color: '#999', fontSize: 13, fontStyle: 'italic' },
  emptyText: { color: '#999', fontSize: 13, marginLeft: 10 },
  input: { backgroundColor: '#f9f9f9', borderRadius: 10, padding: 15, fontSize: 16, borderWidth: 1, borderColor: '#eee', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  modalBtn: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center' },
  saveBtn: { backgroundColor: '#4caf50' },
  cancelBtn: { backgroundColor: '#9e9e9e' },
  disabledBtn: { opacity: 0.5 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 }
});

export default FarmerProfileScreen;
