import React, { useState, useEffect, useContext } from 'react';
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
  ImageBackground,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import apiClient from '../api/apiClient';

const RegisterCropScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);
  const { t } = useLanguage();

  // assignedAsc may be a populated object {_id, name, district} or just a string ID
  const ascId = userInfo?.assignedAsc?._id
    ? userInfo.assignedAsc._id.toString()
    : (typeof userInfo?.assignedAsc === 'string' ? userInfo.assignedAsc : '');
  const ascDistrict = userInfo?.assignedAsc?.district || '';

  const [formData, setFormData] = useState({
    cropType: '',
    variety: '',
    landSize: '',
    soilType: '',
    season: '',
    location: ascDistrict,
    assignedAsc: ascId,
  });

  const [selectedDistrict, setSelectedDistrict] = useState(ascDistrict);
  const [ascs, setAscs] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingAscs, setFetchingAscs] = useState(false);
  const [landDoc, setLandDoc] = useState(null);

  // Synchronize formData with userInfo once it's available (handles async load)
  useEffect(() => {
    if (userInfo?.assignedAsc) {
      const uId = userInfo.assignedAsc._id?.toString() || (typeof userInfo.assignedAsc === 'string' ? userInfo.assignedAsc : '');
      const uDist = userInfo.assignedAsc.district || '';
      
      setFormData(prev => ({
        ...prev,
        location: uDist || prev.location,
        assignedAsc: uId || prev.assignedAsc
      }));
      
      if (uDist) {
        setSelectedDistrict(uDist);
      }
    }
  }, [userInfo]);

  useEffect(() => {
    const fetchAscs = async () => {
      setFetchingAscs(true);
      try {
        const response = await apiClient.get('/ascs');
        setAscs(response.data);
        const uniqueDistricts = [...new Set(response.data.map(asc => asc.district))].sort();
        setDistricts(uniqueDistricts);
      } catch (err) {
        console.error('Error fetching ASCs:', err);
      } finally {
        setFetchingAscs(false);
      }
    };
    fetchAscs();
  }, []);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setLandDoc(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    // Basic Required Fields Validation
    const requiredFields = [
      { key: 'cropType', name: 'Crop Type' },
      { key: 'variety', name: 'Variety' },
      { key: 'landSize', name: 'Land Size' },
      { key: 'soilType', name: 'Soil Type' },
      { key: 'assignedAsc', name: 'ASC Center' },
      { key: 'location', name: 'District/Location' }
    ];

    if (formData.cropType === 'rice') {
      requiredFields.push({ key: 'season', name: 'Season' });
    }
    
    for (const field of requiredFields) {
      if (!formData[field.key] || formData[field.key].toString().trim() === '') {
        Alert.alert('Required Field', `Please select or enter the ${field.name}.`);
        return;
      }
    }

    // Number Validation for Land Size
    const size = parseFloat(formData.landSize);
    if (isNaN(size) || size <= 0) {
      Alert.alert('Invalid Input', 'Land size must be a positive number (greater than 0).');
      return;
    }

    setLoading(true);
    try {
      // Use FormData for multipart/form-data upload
      const data = new FormData();
      
      // Append text fields
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      // Append image if selected
      if (landDoc) {
        const uriParts = landDoc.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        data.append('landDocument', {
          uri: landDoc.uri,
          name: `land_doc_${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      const response = await apiClient.post('/crops', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        Alert.alert(
          'Success',
          t('farmer_crop.successReg'),
          [{ text: t('farmer_crop.viewRequests'), onPress: () => navigation.navigate('MyCrops') }]
        );
      }
    } catch (err) {
      console.error('Error registering crop:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to register crop');
    } finally {
      setLoading(false);
    }
  };

  const renderDropdown = (label, value, options, onSelect, placeholder) => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label} *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
        {options.map(opt => {
          const optValue = typeof opt === 'object' ? opt.value : opt;
          const optLabel = typeof opt === 'object' ? opt.label : opt;
          const isActive = value === optValue;
          return (
            <TouchableOpacity 
              key={optValue} 
              style={[styles.chip, isActive && styles.activeChip]}
              onPress={() => onSelect(optValue)}
            >
              <Text style={[styles.chipText, isActive && styles.activeChipText]}>{optLabel}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const cropTypes = [
    { label: t('farmer_crop.rice'), value: 'rice' },
    { label: t('farmer_crop.vegetables'), value: 'vegetables' },
    { label: t('farmer_crop.fruits'), value: 'fruits' },
    { label: t('farmer_crop.spices'), value: 'spices' },
    { label: t('farmer_crop.tea'), value: 'tea' },
    { label: t('farmer_crop.coconut'), value: 'coconut' },
    { label: t('farmer_crop.rubber'), value: 'rubber' },
    { label: t('farmer_crop.coffee'), value: 'coffee' },
  ];

  const riceVarieties = [
    'Samba',
    'Keeri Samba',
    'Nadu',
    'Kakulu (Red)',
    'Kakulu (White)',
    'Suwandel',
    'Pachchaperumal',
    'Kalu Heenati',
    'Madathawalu',
    'Other'
  ];

  const soilTypes = [
    { label: t('farmer_crop.clay'), value: 'clay' },
    { label: t('farmer_crop.sandy'), value: 'sandy' },
    { label: t('farmer_crop.loamy'), value: 'loamy' },
    { label: t('farmer_crop.silt'), value: 'silt' },
    { label: t('farmer_crop.peat'), value: 'peat' },
  ];

  const seasons = [
    { label: t('farmer_crop.yala'), value: 'Yala' },
    { label: t('farmer_crop.maha'), value: 'Maha' },
  ];

  return (
    <ImageBackground 
      source={require('../../assets/images/hero.png')} 
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← {t('common.cancel')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('farmer_crop.title')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MyCrops')} style={styles.viewBtn}>
           <Text style={styles.viewBtnText}>📋</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.introBox}>
          <Text style={styles.icon}>🌱</Text>
          <Text style={styles.subtitle}>{t('farmer_crop.subtitle')}</Text>
        </View>

        <View style={styles.formCard}>
          {/* Crop Type */}
          {renderDropdown(t('farmer_crop.cropType'), formData.cropType, cropTypes, (val) => {
            handleInputChange('cropType', val);
            // Reset variety if crop type changes to something else
            if(val !== 'rice') handleInputChange('variety', '');
          })}

          {/* Variety */}
          {formData.cropType === 'rice' ? (
            <>
              {renderDropdown(
                t('farmer_crop.variety'), 
                riceVarieties.includes(formData.variety) ? formData.variety : 'Other', 
                riceVarieties, 
                (val) => handleInputChange('variety', val)
              )}
              
              {/* Show manual input if 'Other' is selected or a custom variety is already set */}
              {(formData.variety === 'Other' || (formData.variety && !riceVarieties.includes(formData.variety))) && (
                <View style={styles.formGroup}>
                   <TextInput
                    style={styles.input}
                    placeholder="Enter variety name (e.g. Red Samba)"
                    value={riceVarieties.includes(formData.variety) ? '' : formData.variety}
                    autoFocus={formData.variety === 'Other'}
                    onChangeText={(val) => handleInputChange('variety', val)}
                  />
                </View>
              )}
            </>
          ) : (
            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('farmer_crop.variety')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('farmer_crop.varietyPlaceholder')}
                value={formData.variety}
                onChangeText={(val) => handleInputChange('variety', val)}
              />
            </View>
          )}

          {/* Land Size */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('farmer_crop.landSize')} *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2.5"
              keyboardType="numeric"
              value={formData.landSize}
              onChangeText={(val) => handleInputChange('landSize', val)}
            />
          </View>

          {/* Soil Type */}
          {renderDropdown(t('farmer_crop.soilType'), formData.soilType, soilTypes, (val) => handleInputChange('soilType', val))}

          {/* Season (If Rice) */}
          {formData.cropType === 'rice' && 
            renderDropdown(t('farmer_crop.season'), formData.season, seasons, (val) => handleInputChange('season', val))
          }

          {/* District & ASC Selection - Locked if already assigned */}
          {userInfo?.assignedAsc ? (
            <View style={styles.assignedAscBox}>
              <Text style={styles.label}>{t('farmer_crop.selectAsc')}</Text>
              <View style={styles.readOnlyBadge}>
                <Text style={styles.readOnlyText}>
                  📍 {userInfo.assignedAsc.name}, {userInfo.assignedAsc.district}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                  <Text style={styles.changeLink}>{t('farmer.change')}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.supportNote}>{t('farmer_crop.supportNote')}</Text>
            </View>
          ) : (
            <>
              {/* District Selection */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('auth.district')} *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                  {districts.map(d => (
                    <TouchableOpacity 
                      key={d} 
                      style={[styles.chip, selectedDistrict === d && styles.activeChip]}
                      onPress={() => {
                        setSelectedDistrict(d);
                        handleInputChange('location', d);
                        handleInputChange('assignedAsc', '');
                      }}
                    >
                      <Text style={[styles.chipText, selectedDistrict === d && styles.activeChipText]}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* ASC Selection */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('farmer_crop.selectAsc')} *</Text>
                {fetchingAscs ? (
                  <ActivityIndicator size="small" color="#2e7d32" />
                ) : (
                  <View style={styles.ascListContainer}>
                    {selectedDistrict ? (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalChipsContent}>
                        {ascs.filter(a => a.district === selectedDistrict).map(a => (
                          <TouchableOpacity 
                            key={a._id} 
                            style={[styles.chip, formData.assignedAsc === a._id && styles.activeChip]}
                            onPress={() => handleInputChange('assignedAsc', a._id)}
                          >
                            <Text style={[styles.chipText, formData.assignedAsc === a._id && styles.activeChipText]}>
                              {formData.assignedAsc === a._id ? '✅ ' : '📍 '}{a.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                        {ascs.filter(a => a.district === selectedDistrict).length === 0 && (
                          <Text style={styles.infoText}>No centers found</Text>
                        )}
                      </ScrollView>
                    ) : (
                      <View style={styles.emptyAscBox}>
                        <Text style={styles.infoText}>{t('farmer_crop.selectDistrictFirst')}</Text>
                      </View>
                    )}
                  </View>
                )}
                <Text style={styles.supportNote}>{t('farmer_crop.supportNote')}</Text>
              </View>
            </>
          )}

          {/* Land Document Upload */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('farmer_crop.landDocLabel')}</Text>
            <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
              {landDoc ? (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: landDoc.uri }} style={styles.previewImage} />
                  <View style={styles.changeOverlay}>
                    <Text style={styles.changeText}>{t('farmer.change')}</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Text style={styles.uploadIcon}>📄</Text>
                  <Text style={styles.uploadText}>{t('farmer_crop.uploadLandDoc')}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, loading && styles.disabledBtn]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>{t('farmer_crop.submitRequest')}</Text>
            )}
          </TouchableOpacity>
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
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backBtn: { padding: 5 },
  backBtnText: { color: '#666', fontSize: 14, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1b5e20' },
  viewBtn: { padding: 5 },
  viewBtnText: { fontSize: 20 },
  scrollContent: { padding: 20 },
  introBox: { alignItems: 'center', marginBottom: 25 },
  icon: { fontSize: 50, marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
    color: '#333',
  },
  chipContainer: { flexDirection: 'row', marginBottom: 5 },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeChip: { backgroundColor: '#2e7d32', borderColor: '#2e7d32' },
  chipText: { fontSize: 13, color: '#666' },
  activeChipText: { color: '#fff', fontWeight: 'bold' },
  ascListContainer: {
    height: 50,
    marginTop: 5,
    justifyContent: 'center',
  },
  horizontalChipsContent: {
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  assignedAscBox: {
    marginBottom: 20,
    backgroundColor: '#f1f8e9',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  readOnlyBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginTop: 5,
  },
  readOnlyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1b5e20',
  },
  changeLink: {
    fontSize: 12,
    color: '#2196f3',
    fontWeight: 'bold',
  },
  infoText: { fontSize: 13, color: '#999', fontStyle: 'italic' },
  emptyAscBox: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  supportNote: { fontSize: 11, color: '#888', marginTop: 5 },
  uploadArea: {
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    height: 150,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 30,
    marginBottom: 5,
  },
  uploadText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  previewContainer: {
    width: '100%',
    height: '100%',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  changeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5,
    alignItems: 'center',
  },
  changeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  submitBtn: {
    backgroundColor: '#1b5e20',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  disabledBtn: { opacity: 0.6 },
});

export default RegisterCropScreen;
