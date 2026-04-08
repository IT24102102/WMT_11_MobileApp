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
  Alert,
  FlatList,
  TextInput,
  RefreshControl,
  Image,
  Modal,
  Dimensions
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import apiClient from '../../api/apiClient';

const { width } = Dimensions.get('window');

const FinancialAdminDashboard = ({ navigation }) => {
  const { userInfo, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [interestRate, setInterestRate] = useState(8);
  const [newRate, setNewRate] = useState('');
  const [loans, setLoans] = useState([]);
  const [repayments, setRepayments] = useState([]);
  const [compensations, setCompensations] = useState([]);

  // Tab state: 'loans', 'repayments', 'compensation'
  const [activeTab, setActiveTab] = useState('loans');

  // Modal states
  const [selectedRepayment, setSelectedRepayment] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [claimData, setClaimData] = useState({ status: '', estimatedLoss: '' });
  const [processing, setProcessing] = useState(false);

  const ascId = userInfo?.assignedAsc?._id || userInfo?.assignedAsc;

  useEffect(() => {
    fetchInterestRate();
    if (ascId) {
        fetchTabData();
    }
  }, [activeTab]);

  const fetchInterestRate = async () => {
    try {
      const res = await apiClient.get('/loans/interest-rate');
      setInterestRate(res.data.rate);
      setNewRate(res.data.rate.toString());
    } catch (error) {
      console.error('Error fetching interest rate:', error);
    }
  };

  const fetchTabData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'loans') {
        const res = await apiClient.get(`/loans?ascId=${ascId}`);
        setLoans(res.data);
      } else if (activeTab === 'repayments') {
        const res = await apiClient.get('/loans/repayments');
        setRepayments(res.data);
      } else if (activeTab === 'compensation') {
        const res = await apiClient.get('/compensation');
        setCompensations(res.data);
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchInterestRate();
    fetchTabData();
  };

  const handleRateUpdate = async () => {
    if (!newRate || isNaN(newRate)) return;
    try {
      setProcessing(true);
      const res = await apiClient.patch('/loans/interest-rate', { rate: parseFloat(newRate) });
      setInterestRate(res.data.rate);
      Alert.alert('Success', 'Interest rate updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update interest rate.');
    } finally {
      setProcessing(false);
    }
  };

  const handleLoanStatus = async (id, status) => {
    try {
      setLoading(true);
      await apiClient.patch(`/loans/${id}/status`, { status });
      fetchTabData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update loan status.');
    } finally {
      setLoading(false);
    }
  };

  const handleRepaymentVerify = async (id, status) => {
    try {
      setProcessing(true);
      await apiClient.patch(`/loans/repayments/${id}/verify`, { status });
      setSelectedRepayment(null);
      fetchTabData();
      Alert.alert('Success', `Repayment ${status.toLowerCase()}!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to verify repayment.');
    } finally {
      setProcessing(false);
    }
  };

  const handleClaimUpdate = async () => {
    try {
      setProcessing(true);
      await apiClient.patch(`/compensation/${selectedClaim._id}`, claimData);
      setSelectedClaim(null);
      fetchTabData();
      Alert.alert('Success', 'Claim updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update claim.');
    } finally {
      setProcessing(false);
    }
  };

  const renderLoanItem = ({ item }) => (
    <View style={[styles.listItem, item.isOverdue && styles.overdueItem]}>
      <View style={styles.listHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.itemTitle, item.isOverdue && { color: '#be123c' }]}>
            {item.farmer?.name} {item.isOverdue && `(${t('finance.overdue')})`}
          </Text>
          <Text style={styles.itemSubtitle}>{item.farmer?.nic}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'APPROVED' ? '#dcfce7' : '#fef3c7' }]}>
          <Text style={[styles.statusText, { color: item.status === 'APPROVED' ? '#166534' : '#92400e' }]}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.amountText}>LKR {item.amount?.toLocaleString()}</Text>
      
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>{t('finance.loanProgress')}</Text>
          <Text style={styles.progressPercent}>{Math.round((item.totalPaid / (item.totalPayable || item.amount)) * 100)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(100, (item.totalPaid / (item.totalPayable || item.amount)) * 100)}%` }]} />
        </View>
        <Text style={styles.progressDetail}>LKR {item.totalPaid?.toLocaleString()} / {(item.totalPayable || item.amount)?.toLocaleString()}</Text>
      </View>

      {item.status === 'PENDING' && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.approveBtn} onPress={() => handleLoanStatus(item._id, 'APPROVED')}>
            <Text style={styles.approveBtnText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectBtn} onPress={() => handleLoanStatus(item._id, 'REJECTED')}>
            <Text style={styles.rejectBtnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderRepaymentItem = ({ item }) => (
    <View style={styles.listItem}>
      <View style={styles.listHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>{item.farmer?.name}</Text>
          <Text style={styles.itemSubtitle}>{item.loan?.purpose}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'VERIFIED' ? '#dcfce7' : '#fef3c7' }]}>
          <Text style={[styles.statusText, { color: item.status === 'VERIFIED' ? '#166534' : '#92400e' }]}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailText}>💰 LKR {item.amount?.toLocaleString()}</Text>
        <Text style={styles.detailText}>📅 {new Date(item.paymentDate).toLocaleDateString()}</Text>
      </View>
      <TouchableOpacity 
        style={styles.verifyBtn} 
        onPress={() => setSelectedRepayment(item)}
      >
        <Text style={styles.verifyBtnText}>🔍 {t('finance.verifyProof')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.adminTag}>FINANCIAL OFFICER</Text>
          <Text style={styles.title}>{t('finance.dashboardTitle')}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {userInfo?.assignedAsc && (
        <View style={styles.infoBar}>
          <Text style={styles.infoText}>📍 {userInfo.assignedAsc.name} - {userInfo.assignedAsc.district}</Text>
        </View>
      )}

      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.content}>
          {/* Interest Rate Card */}
          <View style={styles.rateCard}>
            <View style={styles.rateHeader}>
              <Text style={styles.cardTitle}>📈 {t('finance.interestRate')}</Text>
              <Text style={styles.currentRateLabel}>{t('finance.currentRate')}: <Text style={styles.rateValue}>{interestRate}%</Text></Text>
            </View>
            <View style={styles.rateForm}>
              <TextInput 
                style={styles.rateInput} 
                keyboardType="numeric" 
                value={newRate} 
                onChangeText={setNewRate}
                placeholder="%"
              />
              <TouchableOpacity style={styles.updateBtn} onPress={handleRateUpdate} disabled={processing}>
                {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.updateBtnText}>{t('finance.updateRate')}</Text>}
              </TouchableOpacity>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            {[
              { key: 'loans', label: '💳 ' + t('finance.loans') },
              { key: 'repayments', label: '🧾 ' + t('finance.repayments') },
              { key: 'compensation', label: '📋 ' + t('finance.compensation') }
            ].map(tab => (
              <TouchableOpacity 
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.activeTab]} 
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 30 }} />
          ) : (
            <View style={styles.listContainer}>
              {activeTab === 'loans' && (
                <FlatList
                  data={loans}
                  renderItem={renderLoanItem}
                  keyExtractor={item => item._id}
                  scrollEnabled={false}
                  ListEmptyComponent={<Text style={styles.emptyText}>{t('finance.noLoans')}</Text>}
                />
              )}
              {activeTab === 'repayments' && (
                <FlatList
                  data={repayments}
                  renderItem={renderRepaymentItem}
                  keyExtractor={item => item._id}
                  scrollEnabled={false}
                  ListEmptyComponent={<Text style={styles.emptyText}>{t('finance.noRepayments')}</Text>}
                />
              )}
              {activeTab === 'compensation' && (
                <FlatList
                  data={compensations}
                  renderItem={({ item }) => (
                    <View style={styles.listItem}>
                      <View style={styles.listHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.itemTitle}>{item.farmer?.name}</Text>
                          <Text style={styles.itemSubtitle}>{item.crop?.cropType} ({item.crop?.landSize} ac) - {item.crop?.variety}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: item.status === 'APPROVED' ? '#dcfce7' : '#fef3c7' }]}>
                          <Text style={[styles.statusText, { color: item.status === 'APPROVED' ? '#166534' : '#92400e' }]}>{item.status}</Text>
                        </View>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailText}>🌾 {item.damageType}</Text>
                        <Text style={styles.detailText}>📏 {item.affectedArea} ac</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.verifyBtn} 
                        onPress={() => {
                          setSelectedClaim(item);
                          setClaimData({ status: item.status, estimatedLoss: (item.estimatedLoss || '').toString() });
                        }}
                      >
                        <Text style={styles.verifyBtnText}>📝 {t('finance.processClaim')}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  keyExtractor={item => item._id}
                  scrollEnabled={false}
                  ListEmptyComponent={<Text style={styles.emptyText}>{t('finance.noClaims')}</Text>}
                />
              )}
            </View>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Repayment Modal */}
      <Modal visible={!!selectedRepayment} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('finance.verifyProofTitle')}</Text>
              <TouchableOpacity onPress={() => setSelectedRepayment(null)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              <View style={styles.repaymentInfo}>
                <Text style={styles.modalLabel}>Farmer: <Text style={styles.modalValue}>{selectedRepayment?.farmer?.name}</Text></Text>
                <Text style={styles.modalLabel}>Amount: <Text style={styles.modalValue}>LKR {selectedRepayment?.amount?.toLocaleString()}</Text></Text>
                <Text style={styles.modalLabel}>Date: <Text style={styles.modalValue}>{new Date(selectedRepayment?.paymentDate).toLocaleDateString()}</Text></Text>
              </View>

              <Text style={styles.proofTitle}>{t('finance.bankSlip')}</Text>
              {selectedRepayment?.receiptImage ? (
                <Image 
                  source={{ uri: `http://localhost:5000/${selectedRepayment.receiptImage.replace(/\\/g, '/')}` }}
                  style={styles.proofImage}
                  resizeMode="contain"
                />
              ) : <Text style={styles.noProofText}>No image proof available.</Text>}

              {selectedRepayment?.status === 'PENDING' && (
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.confirmModalBtn} onPress={() => handleRepaymentVerify(selectedRepayment._id, 'VERIFIED')} disabled={processing}>
                    <Text style={styles.confirmModalBtnText}>{t('finance.confirmPayment')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectModalBtn} onPress={() => handleRepaymentVerify(selectedRepayment._id, 'REJECTED')} disabled={processing}>
                    <Text style={styles.rejectModalBtnText}>{t('finance.rejectProof')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Claim Modal */}
      <Modal visible={!!selectedClaim} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('finance.processClaim')}</Text>
              <TouchableOpacity onPress={() => setSelectedClaim(null)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              <View style={styles.claimInfo}>
                <Text style={styles.modalLabel}>Farmer: <Text style={styles.modalValue}>{selectedClaim?.farmer?.name}</Text></Text>
                <Text style={styles.modalLabel}>Crop: <Text style={styles.modalValue}>{selectedClaim?.crop?.cropType} ({selectedClaim?.crop?.landSize} ac)</Text></Text>
                <Text style={styles.modalLabel}>Damage: <Text style={styles.modalValue}>{selectedClaim?.damageType}</Text></Text>
                <Text style={styles.modalLabel}>Description: <Text style={styles.modalValue}>{selectedClaim?.damageDescription}</Text></Text>
              </View>

              <View style={styles.assessmentBox}>
                <Text style={styles.sectionTitle}>{t('finance.assessment')}</Text>
                
                <Text style={styles.label}>{t('finance.estimatedLoss')}</Text>
                <TextInput 
                  style={styles.input} 
                  keyboardType="numeric" 
                  value={claimData.estimatedLoss} 
                  onChangeText={t => setClaimData({...claimData, estimatedLoss: t})} 
                />

                <Text style={styles.label}>{t('finance.actionStatus')}</Text>
                <View style={styles.statusSelectors}>
                  {['PENDING', 'APPROVED', 'REJECTED'].map(s => (
                    <TouchableOpacity 
                      key={s} 
                      style={[styles.statusChip, claimData.status === s && styles.activeStatusChip]} 
                      onPress={() => setClaimData({...claimData, status: s})}
                    >
                      <Text style={[styles.statusChipText, claimData.status === s && styles.activeStatusChipText]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={handleClaimUpdate} disabled={processing}>
                  <Text style={styles.submitBtnText}>{t('finance.updateClaim')}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  adminTag: { fontSize: 10, fontWeight: 'bold', color: '#059669', letterSpacing: 1 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  logoutBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, backgroundColor: '#fee2e2' },
  logoutText: { fontSize: 12, color: '#ef4444', fontWeight: 'bold' },
  
  infoBar: { backgroundColor: '#ecfdf5', padding: 10, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#d1fae5' },
  infoText: { color: '#047857', fontWeight: '600', fontSize: 13 },
  
  content: { padding: 15 },
  rateCard: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 20, elevation: 3 },
  rateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  currentRateLabel: { fontSize: 12, color: '#64748b' },
  rateValue: { fontSize: 16, fontWeight: 'bold', color: '#059669' },
  rateForm: { flexDirection: 'row', gap: 10 },
  rateInput: { flex: 1, backgroundColor: '#f8fafc', borderWeight: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  updateBtn: { backgroundColor: '#1e293b', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, justifyContent: 'center' },
  updateBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 5, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#10b981' },
  tabText: { fontSize: 11, fontWeight: 'bold', color: '#64748b' },
  activeTabText: { color: '#fff' },
  
  listContainer: { marginBottom: 20 },
  listItem: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 12, elevation: 2 },
  overdueItem: { borderLeftWidth: 4, borderLeftColor: '#ef4444', backgroundColor: '#fff1f2' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  itemSubtitle: { fontSize: 12, color: '#64748b' },
  amountText: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  
  progressSection: { marginBottom: 15 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  progressLabel: { fontSize: 11, color: '#64748b' },
  progressPercent: { fontSize: 11, fontWeight: 'bold', color: '#10b981' },
  progressBar: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#10b981' },
  progressDetail: { fontSize: 10, color: '#94a3b8', marginTop: 5 },
  
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 5 },
  approveBtn: { flex: 1, backgroundColor: '#10b981', padding: 10, borderRadius: 8, alignItems: 'center' },
  approveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  rejectBtn: { flex: 1, backgroundColor: '#ef4444', padding: 10, borderRadius: 8, alignItems: 'center' },
  rejectBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  
  detailRow: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  detailText: { fontSize: 13, color: '#475569' },
  verifyBtn: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 10, alignItems: 'center' },
  verifyBtnText: { color: '#1e40af', fontWeight: 'bold', fontSize: 13 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, height: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  closeBtn: { fontSize: 24, color: '#94a3b8' },
  modalLabel: { fontSize: 14, color: '#64748b', marginBottom: 5 },
  modalValue: { color: '#1e293b', fontWeight: 'bold' },
  proofTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginTop: 20, marginBottom: 10 },
  proofImage: { width: '100%', height: 400, borderRadius: 15, backgroundColor: '#f1f5f9' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 25 },
  confirmModalBtn: { flex: 2, backgroundColor: '#10b981', padding: 15, borderRadius: 12, alignItems: 'center' },
  confirmModalBtnText: { color: '#fff', fontWeight: 'bold' },
  rejectModalBtn: { flex: 1, backgroundColor: '#ef4444', padding: 15, borderRadius: 12, alignItems: 'center' },
  rejectModalBtnText: { color: '#fff', fontWeight: 'bold' },

  assessmentBox: { marginTop: 25, backgroundColor: '#f8fafc', padding: 20, borderRadius: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#1e293b', marginBottom: 5 },
  input: { backgroundColor: '#fff', borderWeight: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, marginBottom: 20 },
  statusSelectors: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  statusChip: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: '#fff', borderWeight: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  activeStatusChip: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  statusChipText: { fontSize: 11, fontWeight: 'bold', color: '#64748b' },
  activeStatusChipText: { color: '#fff' },
  submitBtn: { backgroundColor: '#1e293b', padding: 15, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 50 },
  noProofText: { textAlign: 'center', padding: 50, color: '#94a3b8', backgroundColor: '#f8fafc', borderRadius: 15 }
});

export default FinancialAdminDashboard;
