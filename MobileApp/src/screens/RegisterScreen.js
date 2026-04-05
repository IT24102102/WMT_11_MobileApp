import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Modal, FlatList } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../api/apiClient';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nic: '',
    phone: '',
    password: '',
    role: 'FARMER',
    assignedAsc: null,
    specialization: '',
    serviceDistricts: [],
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [ascs, setAscs] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [isDistrictModalVisible, setDistrictModalVisible] = useState(false);
  const [isAscModalVisible, setAscModalVisible] = useState(false);
  const [isSpecModalVisible, setSpecModalVisible] = useState(false);
  
  const { register } = useContext(AuthContext);

  React.useEffect(() => {
    const fetchAscData = async () => {
      try {
        console.log('Fetching ASCs...');
        const response = await apiClient.get('/ascs');
        console.log('ASCs fetched:', response.data.length);
        setAscs(response.data);
        const uniqueDistricts = [...new Set(response.data.map(asc => asc.district))].sort();
        console.log('Unique districts found:', uniqueDistricts);
        setDistricts(uniqueDistricts);
      } catch (error) {
        console.error('Error fetching ASCs:', error);
      }
    };
    fetchAscData();
  }, []);

  const roles = [
    { label: 'Farmer', value: 'FARMER' },
    { label: 'ASC Officer', value: 'ASC_OFFICER' },
    { label: 'Financial Officer', value: 'FINANCIAL_OFFICER' },
    { label: 'Crop Officer', value: 'CROP_OFFICER' },
    { label: 'Machinery Officer', value: 'MACHINERY_OFFICER' },
    { label: 'Product Manager', value: 'PRODUCT_MANAGER' },
  ];

  const specializations = [
    'Paddy (වී)', 
    'Vegetables (එළවළු)', 
    'Fruits (පලතුරු)', 
    'Spices (කුළුබඩු)', 
    'Tea (තේ)', 
    'Coconut (පොල්)', 
    'Rubber (රබර්)', 
    'Coffee (කෝපි)', 
    'Export Crops (අපනයන බෝග)', 
    'Other'
  ];

  const needsLocation = (role) => 
    ['FARMER', 'ASC_OFFICER', 'FINANCIAL_OFFICER', 'CROP_OFFICER', 'MACHINERY_OFFICER'].includes(role);

  const handleRegister = async () => {
    const { name, email, nic, password } = formData;
    if (!name || !email || !nic || !password) {
      Alert.alert('Error', 'Please fill in all mandatory fields (Name, Email, NIC, Password)');
      return;
    }

    setLoading(true);
    console.log("Submitting registration with:", { ...formData, district: selectedDistrict });
    const result = await register({ ...formData, district: selectedDistrict });
    setLoading(false);

    if (!result.success) {
      Alert.alert('Registration Failed', result.error);
    } else {
      console.log('Registration success! Redirecting to Dashboard...');
      setTimeout(() => {
        navigation.navigate('Home');
      }, 500);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Join AgroLanka</Text>
        <Text style={styles.subtitle}>Create your account to get started.</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="NIC Number"
          value={formData.nic}
          onChangeText={(text) => setFormData({ ...formData, nic: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          keyboardType="phone-pad"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons 
              name={showPassword ? "eye-off-outline" : "eye-outline"} 
              size={24} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.roleLabel}>Choose your Role:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleScroll}>
          {roles.map((r) => (
            <TouchableOpacity 
              key={r.value}
              style={[styles.roleButton, formData.role === r.value && styles.roleButtonActive]}
              onPress={() => {
                setFormData({ ...formData, role: r.value, assignedAsc: null, specialization: '', serviceDistricts: [] });
                setSelectedDistrict('');
              }}
            >
              <Text style={[styles.roleButtonText, formData.role === r.value && styles.roleButtonTextActive]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {needsLocation(formData.role) && (
          <>
            <TouchableOpacity 
              style={styles.pickerButton} 
              onPress={() => setDistrictModalVisible(true)}
            >
              <Text style={selectedDistrict ? styles.pickerText : styles.pickerPlaceholder}>
                {selectedDistrict || 'Select District'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.pickerButton, !selectedDistrict && { opacity: 0.5 }]} 
              onPress={() => selectedDistrict && setAscModalVisible(true)}
              disabled={!selectedDistrict}
            >
              <Text style={formData.assignedAsc ? styles.pickerText : styles.pickerPlaceholder}>
                {ascs.find(a => a._id === formData.assignedAsc)?.name || (selectedDistrict ? 'Select ASC Center' : 'Select District First')}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </>
        )}

        {formData.role === 'CROP_OFFICER' && (
          <TouchableOpacity 
            style={styles.pickerButton} 
            onPress={() => setSpecModalVisible(true)}
          >
            <Text style={formData.specialization ? styles.pickerText : styles.pickerPlaceholder}>
              {formData.specialization || 'Select Specialization'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        )}

        {formData.role === 'PRODUCT_MANAGER' && (
          <View style={styles.multiSelectContainer}>
            <Text style={styles.fieldLabel}>Service Districts:</Text>
            <View style={styles.chipContainer}>
              {districts.length === 0 ? (
                <Text style={styles.infoText}>Loading districts...</Text>
              ) : (
                districts.map(d => {
                  const isSelected = formData.serviceDistricts.includes(d);
                  return (
                    <TouchableOpacity 
                      key={d}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => {
                        console.log('Toggling district:', d);
                        const current = formData.serviceDistricts;
                        const newDistricts = current.includes(d)
                          ? current.filter(item => item !== d)
                          : [...current, d];
                        setFormData({ ...formData, serviceDistricts: newDistricts });
                      }}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{d}</Text>
                      {isSelected && <Ionicons name="checkmark-circle" size={14} color="#fff" style={{ marginLeft: 4 }} />}
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>

      {/* District Picker Modal */}
      <Modal visible={isDistrictModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select District</Text>
              <TouchableOpacity onPress={() => setDistrictModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={districts}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedDistrict(item);
                    setFormData({ ...formData, assignedAsc: null });
                    setDistrictModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                  {selectedDistrict === item && <Ionicons name="checkmark" size={20} color="#2e7d32" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* ASC Picker Modal */}
      <Modal visible={isAscModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select ASC Center</Text>
              <TouchableOpacity onPress={() => setAscModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={ascs.filter(a => a.district === selectedDistrict)}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={() => {
                    setFormData({ ...formData, assignedAsc: item._id });
                    setAscModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                  {formData.assignedAsc === item._id && <Ionicons name="checkmark" size={20} color="#2e7d32" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Specialization Picker Modal */}
      <Modal visible={isSpecModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Specialization</Text>
              <TouchableOpacity onPress={() => setSpecModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={specializations}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={() => {
                    setFormData({ ...formData, specialization: item });
                    setSpecModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                  {formData.specialization === item && <Ionicons name="checkmark" size={20} color="#2e7d32" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 5,
  },
  roleLabel: {
    fontSize: 16,
    marginRight: 10,
    color: '#444',
  },
  roleButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#2e7d32',
    marginRight: 10,
  },
  roleButtonActive: {
    backgroundColor: '#2e7d32',
  },
  roleButtonText: {
    color: '#2e7d32',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#2e7d32',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    marginTop: 20,
    color: '#2e7d32',
    textAlign: 'center',
    fontSize: 14,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  roleScroll: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#444',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  pickerText: {
    fontSize: 16,
    color: '#000',
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  multiSelectContainer: {
    marginBottom: 15,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2e7d32',
    backgroundColor: '#fff',
  },
  chipActive: {
    backgroundColor: '#2e7d32',
  },
  chipText: {
    color: '#2e7d32',
    fontSize: 12,
  },
  chipTextActive: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default RegisterScreen;
