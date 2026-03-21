import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const LandingScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>AgroLanka</Text>
        <Text style={styles.heroSubtitle}>Empowering Farmers. Modernizing Agriculture.</Text>
        <View style={styles.heroButtons}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>1,200+</Text>
          <Text style={styles.statLabel}>Farmers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>25+</Text>
          <Text style={styles.statLabel}>Districts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>500+</Text>
          <Text style={styles.statLabel}>Machinery</Text>
        </View>
      </View>

      {/* Services Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Services</Text>
        <View style={styles.serviceCard}>
          <Text style={styles.serviceIcon}>🌱</Text>
          <Text style={styles.serviceName}>Crop Registration</Text>
        </View>
        <View style={styles.serviceCard}>
          <Text style={styles.serviceIcon}>🚜</Text>
          <Text style={styles.serviceName}>Machinery Booking</Text>
        </View>
        <View style={styles.serviceCard}>
          <Text style={styles.serviceIcon}>💰</Text>
          <Text style={styles.serviceName}>Financial Assistance</Text>
        </View>
        <View style={styles.serviceCard}>
          <Text style={styles.serviceIcon}>🤖</Text>
          <Text style={styles.serviceName}>AI Leaf Detection</Text>
        </View>
      </View>

      {/* Mission Section */}
      <View style={styles.missionSection}>
        <Text style={styles.missionTitle}>Our Mission</Text>
        <Text style={styles.missionDesc}>
          Revolutionizing Sri Lankan agriculture through technology. Connecting farmers with resources, 
          knowledge, and support in a transparent digital ecosystem.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 AgroLanka. All Rights Reserved.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heroSection: {
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: 25,
    backgroundColor: '#2e7d32',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#e8f5e9',
    textAlign: 'center',
    marginBottom: 30,
  },
  heroButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  primaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#2e7d32',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 30,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 25,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  serviceIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  serviceName: {
    fontSize: 18,
    color: '#444',
    fontWeight: '500',
  },
  missionSection: {
    padding: 30,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
  },
  missionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 15,
  },
  missionDesc: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#999',
    fontSize: 12,
  },
});

export default LandingScreen;
