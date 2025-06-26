import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// Paleta de colores consistente con las otras pantallas
const BrandColors = {
  primaryGreen: "#30CE26",
  limeGreen: "#B3FE02",
  darkGreen: "#1B7A18",
  darkText: "#2C3E50",
  lightText: "#FFFFFF",
  background: "#F8FAFC",
  grey: "#E2E8F0",
  cardShadow: "rgba(48, 206, 38, 0.15)",
  accent: "#FF6B6B",
  purple: "#8B5CF6",
  blue: "#3B82F6",
  orange: "#F59E0B",
};

const { width, height } = Dimensions.get("window");

const WelcomeScreen = ({ navigation }: any) => {
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const heroSlide = useRef(new Animated.Value(100)).current;
  const buttonSlide = useRef(new Animated.Value(100)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de flotación continua para elementos decorativos
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Secuencia principal de entrada
    Animated.sequence([
      // Logo aparece primero
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Luego el contenido hero
      Animated.timing(heroSlide, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      // Texto sube suavemente
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      // Finalmente los botones
      Animated.timing(buttonSlide, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const floatingTransform = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BrandColors.background}
      />

      {/* Elementos decorativos de fondo */}
      <View style={styles.backgroundElements}>
        <Animated.View
          style={[
            styles.floatingElement,
            styles.element1,
            { transform: [{ translateY: floatingTransform }] },
          ]}
        />
        <Animated.View
          style={[
            styles.floatingElement,
            styles.element2,
            { transform: [{ translateY: floatingTransform }] },
          ]}
        />
        <Animated.View
          style={[
            styles.floatingElement,
            styles.element3,
            { 
              transform: [{ 
                translateY: floatAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 15],
                })
              }] 
            },
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section Mejorado */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          {/* Contenedor del logo con fondo decorativo */}
          <View style={styles.logoWrapper}>
            <LinearGradient
              colors={[BrandColors.primaryGreen + '10', BrandColors.limeGreen + '10']}
              style={styles.logoBackground}
            >
              <Image
                source={require("../../../assets/logoTung.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </LinearGradient>
          </View>
          <Text style={styles.tagline}>Tu cancha. Tu juego. Tu momento.</Text>
        </Animated.View>

        {/* Hero Section Rediseñado */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: heroSlide }],
            },
          ]}
        >
          {/* Ilustración de fútbol creativa */}
          <View style={styles.heroIllustration}>
            <LinearGradient
              colors={[BrandColors.blue + '20', BrandColors.primaryGreen + '20']}
              style={styles.heroBackground}
            >
              {/* Campo de fútbol estilizado */}
              <View style={styles.footballField}>
                <View style={styles.fieldLine} />
                <View style={styles.centerCircle} />
                <View style={[styles.goalArea, styles.leftGoal]} />
                <View style={[styles.goalArea, styles.rightGoal]} />
              </View>
              
              {/* Iconos flotantes */}
              <View style={styles.floatingIcons}>
                <Animated.View
                  style={[
                    styles.iconContainer,
                    { transform: [{ translateY: floatingTransform }] },
                  ]}
                >
                  <Ionicons name="football" size={24} color={BrandColors.primaryGreen} />
                </Animated.View>
                <Animated.View
                  style={[
                    styles.iconContainer,
                    styles.icon2,
                    { 
                      transform: [{ 
                        translateY: floatAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 8],
                        })
                      }] 
                    },
                  ]}
                >
                  <Ionicons name="people" size={20} color={BrandColors.blue} />
                </Animated.View>
                <Animated.View
                  style={[
                    styles.iconContainer,
                    styles.icon3,
                    { transform: [{ translateY: floatingTransform }] },
                  ]}
                >
                  <Ionicons name="location" size={18} color={BrandColors.orange} />
                </Animated.View>
              </View>
            </LinearGradient>
          </View>

          {/* Estadísticas visuales 
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>10K+</Text>
              <Text style={styles.statLabel}>Jugadores</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>Canchas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50K+</Text>
              <Text style={styles.statLabel}>Partidos</Text>
            </View>
          </View>*/}
        </Animated.View>

        {/* Textos principales */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <Text style={styles.title}>
            Tu Próximo Partido{"\n"}
            <Text style={styles.titleAccent}>está a un Toque</Text>
          </Text>
          <Text style={styles.subtitle}>
            La plataforma que conecta jugadores apasionados con las mejores canchas 
            para crear experiencias de fútbol inolvidables ⚽
          </Text>

          {/* Features destacadas */}
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <View style={[styles.featureIcon, { backgroundColor: BrandColors.primaryGreen + '20' }]}>
                <Ionicons name="search" size={16} color={BrandColors.primaryGreen} />
              </View>
              <Text style={styles.featureText}>Encuentra partidos cerca</Text>
            </View>
            <View style={styles.feature}>
              <View style={[styles.featureIcon, { backgroundColor: BrandColors.blue + '20' }]}>
                <Ionicons name="calendar" size={16} color={BrandColors.blue} />
              </View>
              <Text style={styles.featureText}>Reserva tu cancha</Text>
            </View>
            <View style={styles.feature}>
              <View style={[styles.featureIcon, { backgroundColor: BrandColors.orange + '20' }]}>
                <Ionicons name="trophy" size={16} color={BrandColors.orange} />
              </View>
              <Text style={styles.featureText}>Compite y diviértete</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Botones CTA mejorados */}
      <Animated.View
        style={[
          styles.ctaContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: buttonSlide }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.registerButtonContainer}
          onPress={() => navigation.navigate("Register")}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[BrandColors.primaryGreen, BrandColors.darkGreen]}
            style={styles.registerButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.registerButtonText}>Crear Cuenta</Text>
            <Ionicons name="arrow-forward" size={20} color={BrandColors.lightText} />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("Login")}
          activeOpacity={0.7}
        >
          <Text style={styles.loginButtonText}>Ya tengo una cuenta</Text>
          <Ionicons name="log-in-outline" size={18} color={BrandColors.primaryGreen} />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BrandColors.background,
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  floatingElement: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.08,
  },
  element1: {
    width: 120,
    height: 120,
    backgroundColor: BrandColors.primaryGreen,
    top: height * 0.1,
    right: -30,
  },
  element2: {
    width: 80,
    height: 80,
    backgroundColor: BrandColors.blue,
    bottom: height * 0.25,
    left: -20,
  },
  element3: {
    width: 60,
    height: 60,
    backgroundColor: BrandColors.limeGreen,
    top: height * 0.45,
    right: width * 0.1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 180,
    paddingHorizontal: 20,
  },

  // Header/Logo Section
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
  },
  logoWrapper: {
    marginBottom: 12,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BrandColors.primaryGreen,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    padding: 20,
  },
  logo: {
    width: 80,
    height: 40,
    tintColor: BrandColors.primaryGreen, // Esto le dará color al logo si es un PNG transparente
  },
  tagline: {
    fontSize: 12,
    color: BrandColors.darkText,
    opacity: 0.6,
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heroIllustration: {
    width: width * 0.85,
    height: width * 0.6,
    marginBottom: 30,
  },
  heroBackground: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  footballField: {
    flex: 1,
    position: 'relative',
  },
  fieldLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: BrandColors.primaryGreen + '40',
  },
  centerCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: BrandColors.primaryGreen + '40',
    marginTop: -30,
    marginLeft: -30,
  },
  goalArea: {
    position: 'absolute',
    width: 40,
    height: 80,
    borderWidth: 2,
    borderColor: BrandColors.blue + '40',
    top: '50%',
    marginTop: -40,
  },
  leftGoal: {
    left: 0,
    borderRightWidth: 2,
    borderLeftWidth: 0,
  },
  rightGoal: {
    right: 0,
    borderLeftWidth: 2,
    borderRightWidth: 0,
  },
  floatingIcons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  iconContainer: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BrandColors.lightText,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  icon2: {
    top: '30%',
    right: '20%',
  },
  icon3: {
    bottom: '25%',
    left: '25%',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: BrandColors.lightText,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: BrandColors.primaryGreen,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: BrandColors.darkText,
    opacity: 0.6,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: BrandColors.grey,
    marginHorizontal: 20,
  },

  // Text Section
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: BrandColors.darkText,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  titleAccent: {
    color: BrandColors.primaryGreen,
  },
  subtitle: {
    fontSize: 16,
    color: BrandColors.darkText,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.7,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  featuresContainer: {
    width: '100%',
    gap: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.lightText,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    fontSize: 15,
    color: BrandColors.darkText,
    fontWeight: '600',
    flex: 1,
  },

  // CTA Buttons
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    backgroundColor: BrandColors.background,
    borderTopWidth: 1,
    borderTopColor: BrandColors.grey,
    gap: 16,
  },
  registerButtonContainer: {
    shadowColor: BrandColors.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.lightText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: BrandColors.lightText,
    borderWidth: 2,
    borderColor: BrandColors.primaryGreen + '20',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BrandColors.primaryGreen,
  },
});

export default WelcomeScreen;