import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';

const FeaturePlaceholderScreen = ({ route, navigation }) => {
  const { title } = route.params || { title: 'Feature' };
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 50 }} />
      </View>
      <View style={styles.content}>
        <Text style={styles.icon}>🚧</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>This feature is currently being migrated from the web version to mobile. Stay tuned!</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  backBtn: { fontSize: 16, color: '#2e7d32', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  icon: { fontSize: 60, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1b5e20', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24, marginBottom: 30 },
  button: { backgroundColor: '#2e7d32', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default FeaturePlaceholderScreen;
