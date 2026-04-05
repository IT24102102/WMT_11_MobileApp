import React, { useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ImageBackground,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const SERVICES = [
  { titleKey: 'landing.serviceCrop',      image: require('../../assets/images/services/crop_reg.jpg') },
  { titleKey: 'landing.serviceMachinery', image: require('../../assets/images/services/machinery.jpg') },
  { titleKey: 'landing.serviceMarket',    image: require('../../assets/images/services/marketplace.png') },
  { titleKey: 'landing.serviceFinance',   image: require('../../assets/images/services/finance.png') },
  { titleKey: 'landing.serviceConsult',   image: require('../../assets/images/services/expert.png') },
];

const STATS = [
  { number: '1,200+', labelKey: 'landing.statFarmers' },
  { number: '25+',    labelKey: 'landing.statDistricts' },
  { number: '500+',   labelKey: 'landing.statMachinery' },
  { number: '10k+',   labelKey: 'landing.statHarvests' },
];

const LandingScreen = ({ navigation }) => {
  const { t, language, switchLanguage } = useLanguage();
  const { userToken } = useContext(AuthContext);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={Platform.OS !== 'web'}
      >

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <ImageBackground
          source={require('../../assets/images/hero.png')}
          style={styles.hero}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(27,94,32,0.90)', 'rgba(46,125,50,0.55)', 'rgba(0,0,0,0.15)']}
            style={styles.heroGradient}
          >
            {/* ── Language Toggle ── */}
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

            <Animated.View
              style={[
                styles.heroContent,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              <Text style={styles.heroTitle}>{t('landing.heroTitle')}</Text>
              <Text style={styles.heroSubtitle}>{t('landing.heroSubtitle')}</Text>

              <View style={styles.heroBtns}>
                {userToken ? (
                  <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.btnPrimaryText}>{t('landing.goToDashboard')}</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Register')}>
                      <Text style={styles.btnPrimaryText}>{t('landing.getStarted')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnOutline} onPress={() => navigation.navigate('Login')}>
                      <Text style={styles.btnOutlineText}>{t('navbar.login')}</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </Animated.View>
          </LinearGradient>
        </ImageBackground>

        {/* ── STATS BAR ──────────────────────────────────────────────────── */}
        <View style={styles.statsBar}>
          {STATS.map((s) => (
            <View key={s.labelKey} style={styles.statItem}>
              <Text style={styles.statNumber}>{s.number}</Text>
              <Text style={styles.statLabel}>{t(s.labelKey)}</Text>
            </View>
          ))}
        </View>

        {/* ── MISSION ────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.center]}>{t('landing.missionTitle')}</Text>
          <Text style={[styles.sectionSub, styles.center]}>{t('landing.missionSubtitle')}</Text>
        </View>

        {/* ── SERVICES ─────────────────────────────────────────────────────
             Web:    flex-wrap grid (no nested scroll — avoids capturing wheel events)
             Native: horizontal swipe carousel
        ─────────────────────────────────────────────────────────────────── */}
        <View style={styles.carouselSection}>
          <Text style={[styles.sectionTitle, styles.center, { marginBottom: 18, paddingHorizontal: 16 }]}>
            {t('landing.servicesTitle')}
          </Text>

          {Platform.OS === 'web' ? (
            /* ── Web grid (no nested ScrollView) ── */
            <View style={styles.servicesGrid}>
              {SERVICES.map((svc, i) => (
                <View key={i} style={styles.serviceCardWeb}>
                  <Image source={svc.image} style={styles.serviceImg} />
                  <View style={styles.serviceCardBottom}>
                    <Text style={styles.serviceCardTitle}>{t(svc.titleKey)}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            /* ── Native swipe carousel ── */
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContent}
            >
              {SERVICES.map((svc, i) => (
                <View
                  key={i}
                  style={[styles.serviceCard, i < SERVICES.length - 1 && { marginRight: 16 }]}
                >
                  <Image source={svc.image} style={styles.serviceImg} />
                  <View style={styles.serviceCardBottom}>
                    <Text style={styles.serviceCardTitle}>{t(svc.titleKey)}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* ── TESTIMONIALS ───────────────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: '#f9fafb' }]}>
          <Text style={[styles.sectionTitle, styles.center, { marginBottom: 20 }]}>
            {t('landing.testimonialsTitle')}
          </Text>
          {[
            { text: 'landing.testimonial1', name: 'landing.author1', role: 'landing.role1' },
            { text: 'landing.testimonial2', name: 'landing.author2', role: 'landing.role2' },
          ].map((item, i) => (
            <View key={i} style={styles.testimonialCard}>
              <Text style={styles.quoteIcon}>"</Text>
              <Text style={styles.testimonialText}>{t(item.text)}</Text>
              <Text style={styles.authorName}>{t(item.name)}</Text>
              <Text style={styles.authorRole}>{t(item.role)}</Text>
            </View>
          ))}
        </View>

        {/* ── ABOUT ─────────────────────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: '#fff', alignItems: 'center' }]}>
          <Text style={[styles.sectionTitle, styles.center]}>{t('landing.aboutTitle')}</Text>
          <Text style={[styles.sectionSub, styles.center, { marginTop: 8 }]}>
            {t('landing.aboutDesc')}
          </Text>
        </View>

        {/* ── FOOTER ─────────────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>AgroLanka</Text>
          <Text style={styles.footerTagline}>{t('landing.footerQuote')}</Text>

          <View style={styles.socialRow}>
            {['📱', '📘', '📸'].map((icon, i) => (
              <View key={i} style={[styles.socialBtn, i < 2 && { marginRight: 12 }]}>
                <Text style={{ fontSize: 18 }}>{icon}</Text>
              </View>
            ))}
          </View>

          <View style={styles.footerCols}>
            <View style={styles.footerCol}>
              <Text style={styles.footerColTitle}>{t('landing.quickLinks')}</Text>
              {[
                { label: t('navbar.login'),  screen: 'Login' },
                { label: t('navbar.signup'), screen: 'Register' },
              ].map((l) => (
                <TouchableOpacity key={l.screen} onPress={() => navigation.navigate(l.screen)}>
                  <Text style={styles.footerLink}>{l.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.footerCol}>
              <Text style={styles.footerColTitle}>{t('navbar.contact')}</Text>
              <Text style={styles.footerContactText}>📞 +94 11 234 5678</Text>
              <Text style={styles.footerContactText}>📍 Colombo, Sri Lanka</Text>
            </View>
          </View>

          <View style={styles.footerDivider} />
          <Text style={styles.footerRights}>{t('landing.rights')}</Text>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fdfdfd',
    // On web, the NavigationContainer already provides 100vh bounds.
    // Adding an explicit height here would fight with it.
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1, // ensures content area can grow and be fully scrollable
  },

  hero: {
    width: '100%',
    height: Platform.OS === 'web' ? '92vh' : height * 0.72,
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 50,
  },
  langToggle: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 18 : 52,
    right: 18,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
  },
  langBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  langBtnActive: {
    backgroundColor: '#fff',
  },
  langBtnText: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
    fontSize: 13,
  },
  langBtnTextActive: {
    color: '#1b5e20',
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: 500,
  },
  heroTitle: {
    fontSize: Platform.OS === 'web' ? 48 : 32,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    lineHeight: Platform.OS === 'web' ? 58 : 40,
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 12,
  },
  heroSubtitle: {
    fontSize: Platform.OS === 'web' ? 18 : 15,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.92,
    lineHeight: 24,
    marginBottom: 34,
    maxWidth: 380,
  },
  heroBtns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    marginRight: 12,
    marginBottom: 8,
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  btnOutline: {
    borderWidth: 2,
    borderColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 30,
    marginBottom: 8,
  },
  btnOutlineText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#1b5e20',
    paddingVertical: 28,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    minWidth: 70,
    paddingVertical: 4,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
  },
  statLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.72)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 3,
    textAlign: 'center',
  },

  section: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: '#fdfdfd',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1b5e20',
    marginBottom: 10,
  },
  sectionSub: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 24,
  },
  center: {
    textAlign: 'center',
  },

  carouselSection: {
    paddingVertical: 36,
    backgroundColor: '#f9fafb',
  },
  carouselContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  // Native card (used in horizontal scroll)
  serviceCard: {
    width: 185,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(46,125,50,0.12)',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  // Web grid
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  serviceCardWeb: {
    width: 185,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(46,125,50,0.12)',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    margin: 10,
  },
  serviceImg: {
    width: '100%',
    height: 130,
    resizeMode: 'cover',
  },
  serviceCardBottom: {
    padding: 14,
    alignItems: 'center',
  },
  serviceCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1b5e20',
    textAlign: 'center',
  },

  testimonialCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  quoteIcon: {
    fontSize: 44,
    color: '#2e7d32',
    opacity: 0.22,
    lineHeight: 38,
    marginBottom: -4,
  },
  testimonialText: {
    fontSize: 14,
    color: '#4b5563',
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 12,
  },
  authorName: {
    fontWeight: '700',
    color: '#111827',
    fontSize: 14,
  },
  authorRole: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },

  footer: {
    backgroundColor: '#111827',
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  footerBrand: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
  },
  footerTagline: {
    fontSize: 13,
    color: '#9ca3af',
    lineHeight: 20,
    marginBottom: 20,
  },
  socialRow: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  socialBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerCols: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  footerCol: {
    flex: 1,
    marginRight: 16,
  },
  footerColTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 14,
  },
  footerLink: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 10,
  },
  footerContactText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  footerDivider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    marginBottom: 18,
  },
  footerRights: {
    fontSize: 11,
    color: '#4b5563',
    textAlign: 'center',
  },
});

export default LandingScreen;
