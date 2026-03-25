import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const LandingScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const { userToken } = useContext(AuthContext);

  const services = [
    { title: t('landing.serviceCrop'), image: require('../../assets/images/services/crop_reg.jpg') },
    { title: t('landing.serviceMachinery'), image: require('../../assets/images/services/machinery.jpg') },
    { title: t('landing.serviceMarket'), image: require('../../assets/images/services/marketplace.png') },
    { title: t('landing.serviceFinance'), image: require('../../assets/images/services/finance.png') },
    { title: t('landing.serviceConsult'), image: require('../../assets/images/services/expert.png') },
  ];

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <ImageBackground 
        source={require('../../assets/images/hero.png')} 
        style={styles.heroSection}
      >
        <LinearGradient
          colors={['rgba(27, 94, 32, 0.85)', 'rgba(46, 125, 50, 0.45)']}
          style={styles.heroGradient}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{t('landing.heroTitle')}</Text>
            <Text style={styles.heroSubtitle}>{t('landing.heroSubtitle')}</Text>
            <View style={styles.heroButtons}>
              {userToken ? (
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={() => navigation.navigate('Home')}
                >
                  <Text style={styles.primaryButtonText}>{t('landing.goToDashboard')}</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity 
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('Register')}
                  >
                    <Text style={styles.primaryButtonText}>{t('landing.getStarted')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate('Login')}
                  >
                    <Text style={styles.secondaryButtonText}>{t('navbar.login')}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>

      {/* Stats Section */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>1,200+</Text>
          <Text style={styles.statLabel}>{t('landing.statFarmers')}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>25+</Text>
          <Text style={styles.statLabel}>{t('landing.statDistricts')}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>500+</Text>
          <Text style={styles.statLabel}>{t('landing.statMachinery')}</Text>
        </View>
      </View>

      {/* Mission Section */}
      <View style={styles.section}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>{t('landing.missionTitle')}</Text>
          <Text style={styles.sectionSubtitle}>{t('landing.missionSubtitle')}</Text>
        </View>
      </View>

      {/* Services Showcase */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { textAlign: 'center', marginBottom: 20 }]}>{t('landing.servicesTitle')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContainer}>
          {services.map((service, index) => (
            <View key={index} style={styles.serviceItem}>
              <View style={styles.serviceImgContainer}>
                <Image source={service.image} style={styles.serviceImg} />
              </View>
              <View style={styles.serviceItemContent}>
                <Text style={styles.serviceItemTitle}>{service.title}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Testimonials */}
      <View style={[styles.section, { backgroundColor: '#f9fafb' }]}>
        <Text style={[styles.sectionTitle, { textAlign: 'center', marginBottom: 30 }]}>{t('landing.testimonialsTitle')}</Text>
        <View style={styles.testimonialCard}>
          <Text style={styles.quoteIcon}>"</Text>
          <Text style={styles.testimonialText}>{t('landing.testimonial1')}</Text>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{t('landing.author1')}</Text>
            <Text style={styles.authorRole}>{t('landing.role1')}</Text>
          </View>
        </View>
        <View style={styles.testimonialCard}>
          <Text style={styles.quoteIcon}>"</Text>
          <Text style={styles.testimonialText}>{t('landing.testimonial2')}</Text>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{t('landing.author2')}</Text>
            <Text style={styles.authorRole}>{t('landing.role2')}</Text>
          </View>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <View style={styles.aboutContent}>
          <Text style={styles.aboutTitle}>{t('landing.aboutTitle')}</Text>
          <Text style={styles.aboutDesc}>{t('landing.aboutDesc')}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerBrand}>AgroLanka</Text>
        <Text style={styles.footerQuote}>{t('landing.footerQuote')}</Text>
        <View style={styles.socialLinks}>
          <Text style={styles.socialIcon}>📱</Text>
          <Text style={styles.socialIcon}>📘</Text>
          <Text style={styles.socialIcon}>📸</Text>
        </View>
        <Text style={styles.footerRights}>{t('landing.rights')}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    height: 450,
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 35,
    opacity: 0.9,
    lineHeight: 22,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  primaryButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 140,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 140,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#1b5e20',
    paddingVertical: 30,
    justifyContent: 'space-around',
    marginHorizontal: 15,
    marginTop: -40,
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 5,
  },
  section: {
    padding: 30,
  },
  sectionTitleContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1b5e20',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  carouselContainer: {
    paddingVertical: 10,
  },
  serviceItem: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  serviceImgContainer: {
    width: '100%',
    height: 120,
  },
  serviceImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  serviceItemContent: {
    padding: 15,
    alignItems: 'center',
  },
  serviceItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1b5e20',
  },
  testimonialCard: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  quoteIcon: {
    fontSize: 40,
    color: '#2e7d32',
    opacity: 0.2,
    marginTop: -10,
    marginBottom: -10,
  },
  testimonialText: {
    fontSize: 15,
    color: '#4b5563',
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 15,
  },
  authorInfo: {
    flexDirection: 'column',
  },
  authorName: {
    fontWeight: 'bold',
    color: '#111827',
  },
  authorRole: {
    fontSize: 12,
    color: '#6b7280',
  },
  aboutContent: {
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1b5e20',
    marginBottom: 15,
  },
  aboutDesc: {
    fontSize: 15,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    backgroundColor: '#111827',
    padding: 50,
    alignItems: 'center',
  },
  footerBrand: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
  },
  footerQuote: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 20,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 30,
  },
  socialIcon: {
    fontSize: 24,
  },
  footerRights: {
    fontSize: 12,
    color: '#4b5563',
  },
});

export default LandingScreen;
