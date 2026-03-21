import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, ScrollView } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

const LeafDiagnosticScreen = ({ navigation }) => {
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← {t('common.back') || 'Back'}</Text>
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
          <Text style={styles.cardTitle}>How it works:</Text>
          <Text style={styles.step}>1. Take a clear photo of the infected leaf.</Text>
          <Text style={styles.step}>2. Upload the photo to our secure server.</Text>
          <Text style={styles.step}>3. Get an instant diagnosis and treatment plan.</Text>
          
          <TouchableOpacity style={styles.uploadBtn}>
            <Text style={styles.uploadBtnText}>📷 Take Photo / Upload</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>⚠️ Tip for best results:</Text>
          <Text style={styles.infoText}>Ensure the leaf is well-lit and the camera is in focus. Avoid shadows and complex backgrounds.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
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
  uploadBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  infoCard: { marginHorizontal: 20, padding: 20, backgroundColor: '#fff9c4', borderRadius: 15, borderLeftWidth: 5, borderLeftColor: '#fbc02d' },
  infoTitle: { fontWeight: 'bold', color: '#5d4037', marginBottom: 5 },
  infoText: { fontSize: 14, color: '#5d4037', lineHeight: 20 }
});

export default LeafDiagnosticScreen;
