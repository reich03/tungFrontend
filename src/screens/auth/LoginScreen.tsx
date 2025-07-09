import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { LinearGradient } from "expo-linear-gradient";
import * as yup from "yup";

import { AuthStackParamList, LoginForm } from "../../types";
import { useAuth } from "../../context/AuthContext";
import CustomButton from "../../components/common/CustomButton";
import CustomInput from "../../components/common/CustomInput";

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
  surface: "#FFFFFF",
  border: "#E5E7EB",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
};

type LoginScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  "Login"
>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const schema = yup.object().shape({
  documentoIdentidad: yup
    .string()
    .required("El documento de identidad es requerido")
    .min(6, "El documento debe tener al menos 6 caracteres")
    .matches(/^[0-9]+$/, "El documento solo debe contener números"),
  password: yup
    .string()
    .required("La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

const { width } = Dimensions.get("window");

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const formSlide = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(formSlide, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      documentoIdentidad: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      const success = await login(data);

      if (!success) {
        Alert.alert(
          "Error de autenticación",
          "Documento de identidad o contraseña incorrectos. Por favor verifica tus datos.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Hubo un problema al iniciar sesión. Verifica tu conexión a internet e intenta nuevamente.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BrandColors.background}
      />

      <View style={styles.backgroundElements}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
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
            <Ionicons
              name="arrow-back"
              size={24}
              color={BrandColors.darkText}
            />
          </TouchableOpacity>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: logoScale }],
              },
            ]}
          >
            <Text style={styles.title}>¡Bienvenido de vuelta! 👋</Text>
            <Text style={styles.subtitle}>
              Nos alegra verte de nuevo en la cancha
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: formSlide }],
              },
            ]}
          >
            <View style={styles.formCard}>
              <Controller
                control={control}
                name="documentoIdentidad"
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                    label="Documento de Identidad"
                    placeholder="12345678"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.documentoIdentidad?.message}
                    leftIcon="card-outline"
                    keyboardType="numeric"
                    autoCapitalize="none"
                    autoCorrect={false}
                    required
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                    label="Contraseña"
                    placeholder="Tu contraseña segura"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                    leftIcon="lock-closed-outline"
                    secureTextEntry
                    required
                  />
                )}
              />

              <TouchableOpacity
                style={styles.forgotPassword}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>
                  ¿Olvidaste tu contraseña?
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={14}
                  color={BrandColors.primaryGreen}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginButtonContainer}
                onPress={handleSubmit(onSubmit)}
                activeOpacity={0.9}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={[BrandColors.primaryGreen, BrandColors.darkGreen]}
                  style={styles.loginButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <Animated.View style={styles.loadingDot} />
                      <Animated.View
                        style={[styles.loadingDot, { marginLeft: 8 }]}
                      />
                      <Animated.View
                        style={[styles.loadingDot, { marginLeft: 8 }]}
                      />
                    </View>
                  ) : (
                    <>
                      <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={20}
                        color={BrandColors.lightText}
                      />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <View style={styles.dividerTextContainer}>
                  <Text style={styles.dividerText}>o continúa con</Text>
                </View>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialContainer}>
                <TouchableOpacity
                  style={styles.socialButton}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#DB4437", "#E53E3E"]}
                    style={styles.socialGradient}
                  >
                    <Ionicons
                      name="logo-google"
                      size={24}
                      color={BrandColors.lightText}
                    />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialButton}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#4267B2", "#365899"]}
                    style={styles.socialGradient}
                  >
                    <Ionicons
                      name="logo-facebook"
                      size={24}
                      color={BrandColors.lightText}
                    />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialButton}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#000000", "#333333"]}
                    style={styles.socialGradient}
                  >
                    <Ionicons
                      name="logo-apple"
                      size={24}
                      color={BrandColors.lightText}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        <Animated.View
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.footerCard}>
            <Text style={styles.footerText}>¿Nuevo en TUNG? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              style={styles.footerButton}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLink}>Únete ahora</Text>
              <Ionicons
                name="arrow-forward"
                size={14}
                color={BrandColors.primaryGreen}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.background,
  },
  backgroundElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  circle: {
    position: "absolute",
    borderRadius: 100,
    opacity: 0.06,
  },
  circle1: {
    width: 200,
    height: 200,
    backgroundColor: BrandColors.primaryGreen,
    top: -50,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: BrandColors.blue,
    bottom: 100,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    backgroundColor: BrandColors.limeGreen,
    top: "40%",
    right: -30,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    top: 50,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BrandColors.lightText,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: BrandColors.darkText,
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
    top:10
  },
  subtitle: {
    fontSize: 16,
    color: BrandColors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  formContainer: {
    marginBottom: 32,
  },
  formCard: {
    backgroundColor: BrandColors.lightText,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
    paddingVertical: 8,
    paddingHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: BrandColors.primaryGreen,
    fontWeight: "600",
  },
  loginButtonContainer: {
    marginBottom: 24,
    shadowColor: BrandColors.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: BrandColors.lightText,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BrandColors.lightText,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: BrandColors.border,
  },
  dividerTextContainer: {
    paddingHorizontal: 16,
    backgroundColor: BrandColors.lightText,
  },
  dividerText: {
    fontSize: 14,
    color: BrandColors.textMuted,
    fontWeight: "500",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  socialButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  socialGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: "center",
  },
  footerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.lightText,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  footerText: {
    fontSize: 15,
    color: BrandColors.textSecondary,
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerLink: {
    color: BrandColors.primaryGreen,
    fontWeight: "700",
    fontSize: 15,
  },
});

export default LoginScreen;
