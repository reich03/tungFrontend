import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { AuthStackParamList } from "../../types";

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

type RegisterScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  "Register"
>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

const { width, height } = Dimensions.get("window");

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim1 = useRef(new Animated.Value(0.8)).current;
  const scaleAnim2 = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim1, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(scaleAnim2, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePlayerPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim1, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim1, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate("PlayerRegistration");
    });
  };

  const handleHostPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim2, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim2, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate("HostRegistration");
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BrandColors.background}
      />

      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={BrandColors.darkText} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.heroIcon}>
            <LinearGradient
              colors={[BrandColors.primaryGreen, BrandColors.limeGreen]}
              style={styles.heroIconGradient}
            >
              <Ionicons name="apps" size={40} color={BrandColors.lightText} />
            </LinearGradient>
          </View>

          <Text style={styles.heroTitle}>¡Únete a TUNG!</Text>
          <Text style={styles.heroSubtitle}>
            Elige cómo quieres formar parte de la comunidad futbolística más
            grande
          </Text>

          <View style={styles.decorativeElements}>
            <View
              style={[
                styles.floatingCircle,
                { backgroundColor: BrandColors.primaryGreen + "20" },
              ]}
            />
            <View
              style={[
                styles.floatingCircle,
                styles.floatingCircle2,
                { backgroundColor: BrandColors.limeGreen + "20" },
              ]}
            />
            <View
              style={[
                styles.floatingCircle,
                styles.floatingCircle3,
                { backgroundColor: BrandColors.blue + "20" },
              ]}
            />
          </View>
        </Animated.View>

        <View style={styles.optionsContainer}>
          <Animated.View
            style={[
              styles.optionWrapper,
              {
                transform: [{ scale: scaleAnim1 }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handlePlayerPress}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[BrandColors.primaryGreen, BrandColors.darkGreen]}
                style={styles.optionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.optionHeader}>
                  <View style={styles.optionIconContainer}>
                    <View style={styles.optionIconBg}>
                      <Ionicons
                        name="football"
                        size={32}
                        color={BrandColors.primaryGreen}
                      />
                    </View>
                  </View>
                  <View style={styles.optionBadge}>
                    <Text style={styles.optionBadgeText}>POPULAR</Text>
                  </View>
                </View>

                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>🏃‍♂️ Soy Jugador</Text>
                  <Text style={styles.optionDescription}>
                    Encuentra partidos increíbles, únete a eventos épicos y
                    conecta con futbolistas apasionados
                  </Text>

                  <View style={styles.featuresList}>
                    <View style={styles.feature}>
                      <View style={styles.featureIcon}>
                        <Ionicons
                          name="location"
                          size={14}
                          color={BrandColors.lightText}
                        />
                      </View>
                      <Text style={styles.featureText}>
                        Partidos cerca de ti
                      </Text>
                    </View>
                    <View style={styles.feature}>
                      <View style={styles.featureIcon}>
                        <Ionicons
                          name="calendar"
                          size={14}
                          color={BrandColors.lightText}
                        />
                      </View>
                      <Text style={styles.featureText}>
                        Eventos emocionantes
                      </Text>
                    </View>
                    <View style={styles.feature}>
                      <View style={styles.featureIcon}>
                        <Ionicons
                          name="people"
                          size={14}
                          color={BrandColors.lightText}
                        />
                      </View>
                      <Text style={styles.featureText}>Comunidad activa</Text>
                    </View>
                  </View>

                  <View style={styles.optionCTA}>
                    <Text style={styles.ctaText}>Comenzar ahora</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color={BrandColors.lightText}
                    />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Opción Anfitrión mejorada */}
          <Animated.View
            style={[
              styles.optionWrapper,
              {
                transform: [{ scale: scaleAnim2 }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleHostPress}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[BrandColors.blue, BrandColors.purple]}
                style={styles.optionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.optionHeader}>
                  <View style={styles.optionIconContainer}>
                    <View style={styles.optionIconBg}>
                      <Ionicons
                        name="business"
                        size={32}
                        color={BrandColors.blue}
                      />
                    </View>
                  </View>
                  <View
                    style={[
                      styles.optionBadge,
                      { backgroundColor: BrandColors.orange },
                    ]}
                  >
                    <Text style={styles.optionBadgeText}>NUEVO</Text>
                  </View>
                </View>

                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>🏢 Tengo un Negocio</Text>
                  <Text style={styles.optionDescription}>
                    Monetiza tus canchas, crea eventos únicos y maximiza tus
                    ingresos con nuestra plataforma
                  </Text>

                  <View style={styles.featuresList}>
                    <View style={styles.feature}>
                      <View style={styles.featureIcon}>
                        <Ionicons
                          name="create"
                          size={14}
                          color={BrandColors.lightText}
                        />
                      </View>
                      <Text style={styles.featureText}>
                        Gestión inteligente
                      </Text>
                    </View>
                    <View style={styles.feature}>
                      <View style={styles.featureIcon}>
                        <Ionicons
                          name="cash"
                          size={14}
                          color={BrandColors.lightText}
                        />
                      </View>
                      <Text style={styles.featureText}>
                        Ingresos garantizados
                      </Text>
                    </View>
                    <View style={styles.feature}>
                      <View style={styles.featureIcon}>
                        <Ionicons
                          name="analytics"
                          size={14}
                          color={BrandColors.lightText}
                        />
                      </View>
                      <Text style={styles.featureText}>
                        Analytics avanzados
                      </Text>
                    </View>
                  </View>

                  <View style={styles.optionCTA}>
                    <Text style={styles.ctaText}>Empezar a ganar</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color={BrandColors.lightText}
                    />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Animated.View
          style={[
            styles.loginContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={styles.loginCard}
            activeOpacity={0.9}
          >
            <View style={styles.loginContent}>
              <View style={styles.loginIconContainer}>
                <Ionicons
                  name="person-circle-outline"
                  size={24}
                  color={BrandColors.primaryGreen}
                />
              </View>
              <View style={styles.loginTextContainer}>
                <Text style={styles.loginMainText}>
                  ¿Ya eres parte de TUNG?
                </Text>
                <Text style={styles.loginSubText}>
                  Toca aquí para iniciar sesión
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={BrandColors.primaryGreen}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer decorativo 
        <View style={styles.footer}>
          <View style={styles.footerStats}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>10K+</Text>
              <Text style={styles.statLabel}>Jugadores</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>Canchas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNumber}>50K+</Text>
              <Text style={styles.statLabel}>Partidos</Text>
            </View>
          </View>
        </View>
*/}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BrandColors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BrandColors.lightText,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    top: 25,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    paddingBottom: 2,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  heroSection: {
    alignItems: "center",
    marginBottom: 40,
    position: "relative",
    paddingVertical: 20,
  },
  heroIcon: {
    marginBottom: 20,
  },
  heroIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: BrandColors.primaryGreen,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: BrandColors.darkText,
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: BrandColors.darkText,
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.7,
    paddingHorizontal: 20,
  },
  decorativeElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  floatingCircle: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    top: -20,
    left: -40,
  },
  floatingCircle2: {
    width: 80,
    height: 80,
    borderRadius: 40,
    top: 20,
    right: -20,
    left: undefined,
  },
  floatingCircle3: {
    width: 60,
    height: 60,
    borderRadius: 30,
    bottom: -10,
    left: width * 0.3,
    top: undefined,
  },
  optionsContainer: {
    gap: 24,
    marginBottom: 40,
  },
  optionWrapper: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  optionCard: {
    borderRadius: 24,
    overflow: "hidden",
  },
  optionGradient: {
    padding: 24,
    minHeight: 220,
  },
  optionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  optionIconContainer: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  optionIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: BrandColors.lightText,
    justifyContent: "center",
    alignItems: "center",
  },
  optionBadge: {
    backgroundColor: BrandColors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  optionBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: BrandColors.lightText,
    letterSpacing: 0.5,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: BrandColors.lightText,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  optionDescription: {
    fontSize: 15,
    color: BrandColors.lightText,
    opacity: 0.9,
    lineHeight: 22,
    marginBottom: 20,
  },
  featuresList: {
    gap: 12,
    marginBottom: 24,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    fontSize: 14,
    color: BrandColors.lightText,
    opacity: 0.9,
    fontWeight: "500",
  },
  optionCTA: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: "auto",
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "700",
    color: BrandColors.lightText,
  },

  //login

  loginContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  loginCard: {
    backgroundColor: BrandColors.lightText,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: BrandColors.primaryGreen + '20',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  loginContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 16,
  },
  loginIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BrandColors.primaryGreen + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginTextContainer: {
    flex: 1,
  },
  loginMainText: {
    fontSize: 16,
    fontWeight: '600',
    color: BrandColors.darkText,
    marginBottom: 2,
  },
  loginSubText: {
    fontSize: 13,
    color: BrandColors.darkText,
    opacity: 0.6,
  },
  // Footer
  footer: {
    alignItems: "center",
  },
  footerStats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.lightText,
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  stat: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: BrandColors.primaryGreen,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: BrandColors.darkText,
    opacity: 0.6,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: BrandColors.grey,
    marginHorizontal: 20,
  },
});

export default RegisterScreen;
