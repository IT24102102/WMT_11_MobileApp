import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ImageBackground, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const AI_API_URL = 'https://it24102102-agrolanka-ai-api-mobile.hf.space/predict';

const LeafDiagnosticScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null); // Clear previous result
    }
  };

  const analyzeImage = async () => {
    if (!image) {
      Alert.alert("Error", "Please select an image first");
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: image,
        name: 'leaf.jpg',
        type: 'image/jpeg',
      });

      const response = await axios.post(AI_API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert("Prediction Failed", "Could not connect to the AI server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/hero.png')} 
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backBtn}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('farmer.leafDiagnostic')}</Text>
            <View style={{ width: 50 }} />
          </View>

          <View style={styles.hero}>
            <Text style={styles.heroIcon}>🔍</Text>
            <Text style={styles.heroTitle}>Rice Leaf Diagnostic AI</Text>
            <Text style={styles.heroSub}>Identify pests and diseases instantly using our AI model.</Text>
          </View>

          <View style={styles.actionCard}>
            {image ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: image }} style={styles.previewImage} />
                <TouchableOpacity style={styles.changeBtn} onPress={pickImage}>
                  <Text style={styles.changeBtnText}>Change Image</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.cardTitle}>How it works:</Text>
                <Text style={styles.step}>1. Take a clear photo of the infected leaf.</Text>
                <Text style={styles.step}>2. Upload the photo to our secure server.</Text>
                <Text style={styles.step}>3. Get an instant diagnosis and treatment plan.</Text>
              </>
            )}
            
            {result && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultLabel}>Diagnosis Result:</Text>
                <Text style={styles.resultText}>{result.prediction}</Text>
                <Text style={styles.confidenceText}>Confidence: {result.confidence}</Text>
              </View>
            )}

            {!image ? (
              <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
                <Text style={styles.uploadBtnText}>📷 Take Photo / Upload</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.analyzeBtn, loading && styles.disabledBtn]} 
                onPress={analyzeImage}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.uploadBtnText}>✨ Analyze Leaf</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {!result && (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>⚠️ Tip for best results:</Text>
              <Text style={styles.infoText}>Ensure the leaf is well-lit and the camera is in focus. Avoid shadows and complex backgrounds.</Text>
            </View>
          )}

          {result && (
             <View style={styles.treatmentCard}>
                <Text style={styles.treatmentTitle}>💡 Recommended Action:</Text>
                <Text style={styles.treatmentText}>
                  Please consult your local Agrarian Service Center for professional advice and treatment options for {result.prediction}.
                </Text>
             </View>
          )}
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
  scrollContent: { paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  backBtn: { fontSize: 16, color: '#2e7d32', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  hero: { padding: 40, alignItems: 'center', backgroundColor: '#e8f5e9' },
  heroIcon: { fontSize: 60, marginBottom: 15 },
  heroTitle: { fontSize: 24, fontWeight: 'bold', color: '#1b5e20', marginBottom: 10 },
  heroSub: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22 },
  actionCard: { margin: 20, padding: 25, backgroundColor: '#fff', borderRadius: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  step: { fontSize: 15, color: '#444', marginBottom: 12, lineHeight: 20 },
  uploadBtn: { backgroundColor: '#2e7d32', marginTop: 15, padding: 18, borderRadius: 15, alignItems: 'center' },
  analyzeBtn: { backgroundColor: '#1565c0', marginTop: 15, padding: 18, borderRadius: 15, alignItems: 'center' },
  disabledBtn: { backgroundColor: '#90caf9' },
  uploadBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  imageContainer: { alignItems: 'center', marginBottom: 20 },
  previewImage: { width: '100%', height: 200, borderRadius: 15, marginBottom: 10 },
  changeBtn: { padding: 10 },
  changeBtnText: { color: '#2e7d32', fontWeight: '600' },
  resultContainer: { backgroundColor: '#f1f8e9', padding: 20, borderRadius: 15, marginBottom: 20, borderWidth: 1, borderStyle: 'dashed', borderColor: '#2e7d32' },
  resultLabel: { fontSize: 14, color: '#666', marginBottom: 5 },
  resultText: { fontSize: 22, fontWeight: 'bold', color: '#2e7d32', marginBottom: 5 },
  confidenceText: { fontSize: 14, color: '#4caf50', fontWeight: '600' },
  infoCard: { marginHorizontal: 20, padding: 20, backgroundColor: '#fff9c4', borderRadius: 15, borderLeftWidth: 5, borderLeftColor: '#fbc02d' },
  infoTitle: { fontWeight: 'bold', color: '#5d4037', marginBottom: 5 },
  infoText: { fontSize: 14, color: '#5d4037', lineHeight: 20 },
  treatmentCard: { marginHorizontal: 20, marginTop: 20, padding: 20, backgroundColor: '#e3f2fd', borderRadius: 15, borderLeftWidth: 5, borderLeftColor: '#1976d2' },
  treatmentTitle: { fontWeight: 'bold', color: '#0d47a1', marginBottom: 5 },
  treatmentText: { fontSize: 14, color: '#0d47a1', lineHeight: 20 }
});

export default LeafDiagnosticScreen;

