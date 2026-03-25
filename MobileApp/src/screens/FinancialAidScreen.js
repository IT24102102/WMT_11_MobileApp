import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  TextInput, 
  ActivityIndicator,
  Alert,
  Switch,
  RefreshControl
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import apiClient from '../api/apiClient';

const FinancialAidScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('LOAN'); // 'LOAN', 'COMPENSATION', 'HISTORY'
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [interestRate, setInterestRate] = useState(8);
  
  // Data states
  const [loans, setLoans] = useState([]);
  const [claims, setClaims] = useState([]);
  const [crops, setCrops] = useState([]);

  // Form states
  const [loanForm, setLoanForm] = useState({
    loanAmount: '',
    repaymentPeriod: '12',
    purpose: '',
    collateral: '',
    termsAccepted: false,
    asc: userInfo?.assignedAsc?._id || userInfo?.assignedAsc || ''
  });

  const [compForm, setCompForm] = useState({
    crop: '',
    damageType: '',
    incidentDate: '',
    affectedArea: '',
    damageDescription: '',
    asc: userInfo?.assignedAsc?._id || userInfo?.assignedAsc || ''
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rateRes, loanRes, claimRes, cropRes] = await Promise.all([
        apiClient.get('/loans/interest-rate'),
        apiClient.get('/loans'),
        apiClient.get('/compensation'),
        apiClient.get('/crops')
      ]);
      setInterestRate(rateRes.data.rate);
      setLoans(loanRes.data);
      setClaims(claimRes.data);
      setCrops(cropRes.data);
    } catch (err) {
      console.error('Error fetching financial data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLoanSubmit = async () => {
    if (!loanForm.loanAmount || !loanForm.purpose || !loanForm.termsAccepted) {
      Alert.alert('Error', 'Please fill required fields and accept terms.');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/loans/apply', { ...loanForm, interestRate });
      Alert.alert('Success', 'Loan application submitted successfully!');
      setLoanForm({ ...loanForm, loanAmount: '', purpose: '', collateral: '', termsAccepted: false });
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const handleCompSubmit = async () => {
    if (!compForm.crop || !compForm.damageType || !compForm.incidentDate || !compForm.affectedArea) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/compensation', compForm);
      Alert.alert('Success', 'Compensation claim submitted successfully!');
      setCompForm({ ...compForm, crop: '', damageType: '', incidentDate: '', affectedArea: '', damageDescription: '' });
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit claim');
    } finally {
      setLoading(false);
    }
  };

  const calculateEMI = () => {
    const P = parseFloat(loanForm.loanAmount) || 0;
    const r = (interestRate / 100) / 12;
    const n = parseInt(loanForm.repaymentPeriod);
    if (P === 0) return 0;
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return emi.toFixed(2);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('farmer.financialAid')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'LOAN' && styles.activeTab]} 
          onPress={() => setActiveTab('LOAN')}
        >
          <Text style={[styles.tabText, activeTab === 'LOAN' && styles.activeTabText]}>Loans</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'COMPENSATION' && styles.activeTab]} 
          onPress={() => setActiveTab('COMPENSATION')}
        >
          <Text style={[styles.tabText, activeTab === 'COMPENSATION' && styles.activeTabText]}>Compensation</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'HISTORY' && styles.activeTab]} 
          onPress={() => setActiveTab('HISTORY')}
        >
          <Text style={[styles.tabText, activeTab === 'HISTORY' && styles.activeTabText]}>History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchData();}} />}
      >
        {activeTab === 'LOAN' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Apply for Cultivation Loan</Text>
            
            {userInfo?.assignedAsc && (
              <View style={styles.assignedCenterBox}>
                <Text style={styles.miniLabel}>Assigned Center (ASC)</Text>
                <Text style={styles.centerName}>🏛️ {userInfo.assignedAsc.name}, {userInfo.assignedAsc.district}</Text>
              </View>
            )}

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>Current Interest Rate: <Text style={styles.boldText}>{interestRate}% p.a.</Text></Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Loan Amount (LKR) *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. 100000" 
                keyboardType="numeric"
                value={loanForm.loanAmount}
                onChangeText={(val) => setLoanForm({ ...loanForm, loanAmount: val })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Repayment Period (Months) *</Text>
              <View style={styles.chipRow}>
                {['6', '12', '18', '24'].map(period => (
                  <TouchableOpacity 
                    key={period} 
                    style={[styles.chip, loanForm.repaymentPeriod === period && styles.activeChip]}
                    onPress={() => setLoanForm({ ...loanForm, repaymentPeriod: period })}
                  >
                    <Text style={[styles.chipText, loanForm.repaymentPeriod === period && styles.activeChipText]}>{period}m</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {loanForm.loanAmount ? (
              <View style={styles.emiBox}>
                <Text style={styles.emiLabel}>Estimated Monthly Installment (EMI)</Text>
                <Text style={styles.emiValue}>LKR {calculateEMI()}</Text>
              </View>
            ) : null}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Purpose of Loan *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. Buying fertilizer, labor costs" 
                value={loanForm.purpose}
                onChangeText={(val) => setLoanForm({ ...loanForm, purpose: val })}
              />
            </View>

            <View style={styles.termsRow}>
              <Switch 
                value={loanForm.termsAccepted} 
                onValueChange={(val) => setLoanForm({ ...loanForm, termsAccepted: val })}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={loanForm.termsAccepted ? "#2e7d32" : "#f4f3f4"}
              />
              <Text style={styles.termsText}>I accept the loan terms and conditions.</Text>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleLoanSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Application</Text>}
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'COMPENSATION' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Submit Compensation Claim</Text>
            <Text style={styles.cardSubtitle}>For crop damage due to weather, pests, or wildlife.</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Affected Crop *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {crops.map(c => (
                  <TouchableOpacity 
                    key={c._id} 
                    style={[styles.chip, compForm.crop === c._id && styles.activeChip]}
                    onPress={() => setCompForm({ ...compForm, crop: c._id })}
                  >
                    <Text style={[styles.chipText, compForm.crop === c._id && styles.activeChipText]}>{c.cropType}</Text>
                  </TouchableOpacity>
                ))}
                {crops.length === 0 && <Text style={styles.infoText}>No crops registered. Please register one first.</Text>}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Damage Type *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. Drought, Flood, Wild Elephants" 
                value={compForm.damageType}
                onChangeText={(val) => setCompForm({ ...compForm, damageType: val })}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Date *</Text>
                <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={compForm.incidentDate} onChangeText={(val) => setCompForm({ ...compForm, incidentDate: val })} />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Area (Ac) *</Text>
                <TextInput style={styles.input} placeholder="e.g. 1.5" keyboardType="numeric" value={compForm.affectedArea} onChangeText={(val) => setCompForm({ ...compForm, affectedArea: val })} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput 
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
                placeholder="Describe the damage..." 
                multiline
                value={compForm.damageDescription}
                onChangeText={(val) => setCompForm({ ...compForm, damageDescription: val })}
              />
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleCompSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Claim</Text>}
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'HISTORY' && (
          <View>
            <Text style={styles.sectionTitle}>Loan History</Text>
            {loans.map(item => (
              <View key={item._id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyTitle}>LKR {item.amount}</Text>
                  <Text style={[styles.statusText, { color: item.status === 'APPROVED' ? '#2e7d32' : '#ef6c00' }]}>{item.status}</Text>
                </View>
                <Text style={styles.historySub}>Purpose: {item.purpose}</Text>
                {item.status === 'APPROVED' && <Text style={styles.historySub}>Next Payment: {item.nextPaymentDate ? new Date(item.nextPaymentDate).toLocaleDateString() : 'Pending'}</Text>}
              </View>
            ))}
            {loans.length === 0 && <Text style={styles.emptyText}>No loan applications found.</Text>}

            <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Compensation Claims</Text>
            {claims.map(item => (
              <View key={item._id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyTitle}>{item.damageType}</Text>
                  <Text style={[styles.statusText, { color: item.status === 'APPROVED' ? '#2e7d32' : '#ef6c00' }]}>{item.status}</Text>
                </View>
                <Text style={styles.historySub}>Crop: {item.crop?.cropType} ({item.crop?.variety})</Text>
                <Text style={styles.historySub}>Affected: {item.affectedArea} Acres</Text>
              </View>
            ))}
            {claims.length === 0 && <Text style={styles.emptyText}>No compensation claims found.</Text>}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff' },
  backBtnText: { color: '#2e7d32', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1b5e20' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#2e7d32' },
  tabText: { fontSize: 14, color: '#666' },
  activeTabText: { color: '#2e7d32', fontWeight: 'bold' },
  content: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  cardSubtitle: { fontSize: 13, color: '#888', marginBottom: 20 },
  infoBox: { backgroundColor: '#e8f5e9', padding: 12, borderRadius: 10, marginBottom: 20 },
  infoText: { fontSize: 13, color: '#2e7d32' },
  boldText: { fontWeight: 'bold' },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#444', marginBottom: 8 },
  input: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 15, fontSize: 15, borderWidth: 1, borderColor: '#eee', color: '#333' },
  formRow: { flexDirection: 'row' },
  chipRow: { flexDirection: 'row', marginBottom: 5 },
  chip: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 10 },
  activeChip: { backgroundColor: '#2e7d32' },
  chipText: { fontSize: 13, color: '#666' },
  activeChipText: { color: '#fff', fontWeight: 'bold' },
  emiBox: { backgroundColor: '#f1f8e9', padding: 15, borderRadius: 12, marginBottom: 20, alignItems: 'center' },
  emiLabel: { fontSize: 12, color: '#558b2f', marginBottom: 5 },
  emiValue: { fontSize: 22, fontWeight: 'bold', color: '#2e7d32' },
  assignedCenterBox: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  miniLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  centerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  termsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  termsText: { flex: 1, fontSize: 13, color: '#666', marginLeft: 10 },
  submitBtn: { backgroundColor: '#1b5e20', borderRadius: 12, padding: 16, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1b5e20', marginBottom: 15 },
  historyCard: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 12, elevation: 2 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  historyTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  historySub: { fontSize: 13, color: '#666', marginTop: 2 },
  emptyText: { color: '#999', fontStyle: 'italic', textAlign: 'center', marginTop: 10 }
});

export default FinancialAidScreen;
