import React, { useState } from "react";
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
  Image,
  Dimensions,
  Modal,
  TextInput,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as Location from "expo-location";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MapView, { Marker } from "react-native-maps";
import DateTimePicker from "@react-native-community/datetimepicker";

import { AuthStackParamList } from "../../types";
import { ExtendedHostRegistrationForm } from "../../types/hostTypes";
import { Colors } from "../../constants/Colors";
import CustomButton from "../../components/common/CustomButton";
import CustomInput from "../../components/common/CustomInput";
import { hostService } from "../../services/hostService";

type HostRegistrationScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  "HostRegistration"
>;

interface Props {
  navigation: HostRegistrationScreenNavigationProp;
}

const { width } = Dimensions.get("window");

const genders = [
  { value: "male", label: "Masculino", emoji: "👨" },
  { value: "female", label: "Femenino", emoji: "👩" },
  { value: "other", label: "Otro", emoji: "👤" },
];

const schema = yup.object().shape({
  businessName: yup
    .string()
    .required("El nombre del negocio es requerido")
    .min(3, "Mínimo 3 caracteres"),
  address: yup
    .string()
    .required("La dirección es requerida")
    .min(10, "Ingresa una dirección completa"),
  description: yup
    .string()
    .required("La descripción es requerida")
    .min(20, "Mínimo 20 caracteres"),
  adminName: yup.string().required("El nombre del administrador es requerido"),
  adminEmail: yup
    .string()
    .email("Email inválido")
    .required("El email es requerido"),
  adminPassword: yup
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .required("La contraseña es requerida"),
  adminConfirmPassword: yup
    .string()
    .oneOf([yup.ref("adminPassword")], "Las contraseñas deben coincidir")
    .required("Confirma tu contraseña"),
  adminPhone: yup.string().required("El teléfono es requerido"),
  adminDocumentNumber: yup
    .string()
    .required("El documento de identidad es requerido"),
  nit: yup.string().required("El NIT es requerido"),
  razonSocial: yup
    .string()
    .required("La razón social es requerida")
    .min(3, "Mínimo 3 caracteres"),
  openTime: yup.string().required("Hora de apertura requerida"),
  closeTime: yup.string().required("Hora de cierre requerida"),
});

const HostRegistrationScreen: React.FC<Props> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [businessImages, setBusinessImages] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const [documents, setDocuments] = useState({
    rut: null as any,
    camaraComercio: null as any,
    certificacionBancaria: null as any,
    cedulaRepresentanteLegal: null as any,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ExtendedHostRegistrationForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      businessName: "",
      address: "",
      description: "",
      adminName: "",
      adminEmail: "",
      adminPassword: "",
      adminConfirmPassword: "",
      adminPhone: "",
      adminGender: "male",
      adminDocumentNumber: "",
      nit: "",
      businessEmail: "",
      billingEmail: "",
      businessPhone: "",
      razonSocial: "",
      openTime: "06:00",
      closeTime: "23:00",
      contactInfo: {
        whatsapp: "",
        instagram: "",
        facebook: "",
      },
    },
  });

  const watchedBirthDate = watch("adminBirthDate");

  const handleEmailVerification = async () => {
    if (!verificationCode.trim()) {
      Alert.alert("Error", "Ingresa el código de verificación");
      return;
    }

    try {
      setIsVerifying(true);

      const result = await hostService.verifyHostEmail(verificationCode);

      if (result.success) {
        setShowVerificationModal(false);
        Alert.alert(
          "¡Cuenta verificada! 🎉",
          "Tu email ha sido verificado exitosamente. ¡Ya puedes iniciar sesión como anfitrión!",
          [
            {
              text: "Iniciar sesión",
              onPress: () => {
                navigation.navigate("Login");
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      console.error("Error verifying email:", error);
      Alert.alert(
        "Error",
        "No se pudo verificar el código. Intenta nuevamente."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const VerificationModal = () => (
    <Modal
      visible={showVerificationModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowVerificationModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Ionicons name="mail-outline" size={48} color={Colors.primary} />
            <Text style={styles.modalTitle}>Verificar Email</Text>
            <Text style={styles.modalSubtitle}>
              Hemos enviado un código de verificación a:
            </Text>
            <Text style={styles.modalEmail}>{userEmail}</Text>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.verificationLabel}>Código de verificación</Text>
            <TextInput
              style={styles.verificationInput}
              placeholder="Ej: 123456"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="numeric"
              maxLength={6}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalSecondaryButton}
                onPress={() => setShowVerificationModal(false)}
              >
                <Text style={styles.modalSecondaryButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalPrimaryButton,
                  isVerifying && styles.modalButtonDisabled,
                ]}
                onPress={handleEmailVerification}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <Text style={styles.modalPrimaryButtonText}>
                    Verificando...
                  </Text>
                ) : (
                  <Text style={styles.modalPrimaryButtonText}>Verificar</Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHint}>
              ¿No recibiste el código? Revisa tu carpeta de spam o espera unos
              minutos.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permisos de ubicación",
          "Necesitamos tu ubicación para que los jugadores puedan encontrar tu negocio.",
          [{ text: "OK" }]
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      Alert.alert("¡Perfecto!", "Ubicación obtenida exitosamente.");
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert(
        "Error",
        "No pudimos obtener tu ubicación. Intenta nuevamente."
      );
    }
  };

  const pickImages = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permisos de galería",
          "Necesitamos acceso a tu galería para que puedas subir fotos.",
          [{ text: "OK" }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        const newImage = result.assets[0].uri;
        setBusinessImages([...businessImages, newImage].slice(0, 6));
      }
    } catch (error) {
      console.error("Error picking images:", error);
      Alert.alert("Error", "No pudimos acceder a tus fotos.");
    }
  };

  const pickProfileImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permisos de galería",
          "Necesitamos acceso a tu galería para agregar tu foto de perfil.",
          [{ text: "OK" }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0].uri;
        setProfileImage(selectedImage);
      }
    } catch (error) {
      console.error("Error al seleccionar la imagen:", error);
      Alert.alert(
        "Error",
        "No pudimos acceder a tus fotos. Intenta nuevamente."
      );
    }
  };

  const pickDocument = async (type: keyof typeof documents) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setDocuments((prev) => ({
          ...prev,
          [type]: result.assets[0],
        }));
      }
    } catch (error) {
      Alert.alert("Error", "No pudimos acceder al documento.");
    }
  };

  const StepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {[1, 2].map((step) => (
        <View key={step} style={styles.stepIndicatorRow}>
          <View
            style={[
              styles.stepCircle,
              currentStep >= step && styles.stepCircleActive,
              currentStep === step && styles.stepCircleCurrent,
            ]}
          >
            {currentStep > step ? (
              <Ionicons name="checkmark" size={16} color={Colors.background} />
            ) : (
              <Text
                style={[
                  styles.stepNumber,
                  currentStep >= step && styles.stepNumberActive,
                ]}
              >
                {step}
              </Text>
            )}
          </View>
          {step < 2 && (
            <View
              style={[
                styles.stepLine,
                currentStep > step && styles.stepLineActive,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>🏢 Información del Negocio</Text>
        <Text style={styles.stepSubtitle}>
          Datos básicos del establecimiento y administrador
        </Text>
      </View>

      <View style={styles.formContainer}>
        {/* Información del negocio */}
        <View style={styles.businessSection}>
          <Text style={styles.sectionTitle}>🏢 Datos del Establecimiento</Text>

          <Controller
            control={control}
            name="businessName"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Nombre del negocio"
                placeholder="Ej: Canchas El Estadio"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.businessName?.message}
                leftIcon="business-outline"
                required
              />
            )}
          />

          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Dirección completa"
                placeholder="Calle 72 #15-30, Villavicencio"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.address?.message}
                leftIcon="location-outline"
                multiline
                required
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Descripción del negocio"
                placeholder="Describe tu negocio, servicios, instalaciones..."
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.description?.message}
                leftIcon="document-text-outline"
                multiline
                style={{ height: 100 }}
                required
              />
            )}
          />

          <Controller
            control={control}
            name="nit"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="NIT del establecimiento"
                placeholder="900123456-1"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.nit?.message}
                leftIcon="business-outline"
                required
              />
            )}
          />

          <Controller
            control={control}
            name="razonSocial"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Razón social"
                placeholder="Ej: CANCHAS EL ESTADIO S.A.S"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.razonSocial?.message}
                leftIcon="business-outline"
                required
              />
            )}
          />

          <Controller
            control={control}
            name="businessEmail"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Email empresarial (opcional)"
                placeholder="empresa@canchas.com (se usará el del admin si está vacío)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                leftIcon="mail-outline"
                keyboardType="email-address"
              />
            )}
          />

          <Controller
            control={control}
            name="billingEmail"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Email para facturación (opcional)"
                placeholder="facturacion@canchas.com (se usará el del admin si está vacío)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                leftIcon="receipt-outline"
                keyboardType="email-address"
              />
            )}
          />

          <Controller
            control={control}
            name="businessPhone"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Teléfono del establecimiento (opcional)"
                placeholder="3007654321 (se usará el del admin si está vacío)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="phone-pad"
                leftIcon="call-outline"
              />
            )}
          />
          <View style={styles.horariosSection}>
            <Text style={styles.fieldLabel}>🕐 Horarios de Atención</Text>
            <View style={styles.timeRow}>
              <Controller
                control={control}
                name="openTime"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.timeInput}>
                    <Text style={styles.timeLabel}>Apertura</Text>
                    <CustomInput
                      placeholder="06:00"
                      value={value}
                      onChangeText={onChange}
                      containerStyle={styles.timeField}
                    />
                  </View>
                )}
              />
              <Controller
                control={control}
                name="closeTime"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.timeInput}>
                    <Text style={styles.timeLabel}>Cierre</Text>
                    <CustomInput
                      placeholder="23:00"
                      value={value}
                      onChangeText={onChange}
                      containerStyle={styles.timeField}
                    />
                  </View>
                )}
              />
            </View>
          </View>
        </View>

        <View style={styles.adminSection}>
          <Text style={styles.sectionTitle}>👤 Datos del Administrador</Text>

          <View style={styles.photoSection}>
            <Text style={styles.fieldLabel}>📸 Foto de perfil</Text>
            <TouchableOpacity
              style={styles.photoContainer}
              onPress={pickProfileImage}
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons
                    name="camera-outline"
                    size={32}
                    color={Colors.textMuted}
                  />
                  <Text style={styles.photoPlaceholderText}>Agregar foto</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Controller
            control={control}
            name="adminName"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Nombre completo del administrador"
                placeholder="Juan Pérez García"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.adminName?.message}
                leftIcon="person-outline"
                required
              />
            )}
          />

          <Controller
            control={control}
            name="adminDocumentNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Número de documento"
                placeholder="1234567890"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.adminDocumentNumber?.message}
                keyboardType="numeric"
                leftIcon="card-outline"
                required
              />
            )}
          />

          <View style={styles.genderSection}>
            <Text style={styles.fieldLabel}>🚹🚺 Género</Text>
            <View style={styles.genderContainer}>
              {genders.map((gender) => (
                <TouchableOpacity
                  key={gender.value}
                  style={[
                    styles.genderCard,
                    watch("adminGender") === gender.value &&
                      styles.genderCardSelected,
                  ]}
                  onPress={() => setValue("adminGender", gender.value)}
                >
                  <Text style={styles.genderEmoji}>{gender.emoji}</Text>
                  <Text
                    style={[
                      styles.genderLabel,
                      watch("adminGender") === gender.value &&
                        styles.genderLabelSelected,
                    ]}
                  >
                    {gender.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.dateSection}>
            <Text style={styles.fieldLabel}>📅 Fecha de nacimiento</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={Colors.primary}
              />
              <Text style={styles.dateButtonText}>
                {watchedBirthDate
                  ? watchedBirthDate.toLocaleDateString()
                  : "Seleccionar fecha"}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={watchedBirthDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setValue("adminBirthDate", selectedDate);
                  }
                }}
                maximumDate={new Date()}
              />
            )}
          </View>

          <Controller
            control={control}
            name="adminEmail"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Email del administrador"
                placeholder="admin@tucanchas.com"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.adminEmail?.message}
                leftIcon="mail-outline"
                keyboardType="email-address"
                required
              />
            )}
          />

          <Controller
            control={control}
            name="adminPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Contraseña"
                placeholder="••••••••"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.adminPassword?.message}
                secureTextEntry
                leftIcon="lock-closed-outline"
                required
              />
            )}
          />

          <Controller
            control={control}
            name="adminConfirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Confirmar contraseña"
                placeholder="••••••••"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.adminConfirmPassword?.message}
                secureTextEntry
                leftIcon="lock-closed-outline"
                required
              />
            )}
          />

          <Controller
            control={control}
            name="adminPhone"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Teléfono del administrador"
                placeholder="3001234567"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.adminPhone?.message}
                keyboardType="phone-pad"
                leftIcon="call-outline"
                required
              />
            )}
          />
        </View>

        <View style={styles.locationSection}>
          <Text style={styles.sectionTitle}>📍 Ubicación</Text>

          <CustomButton
            title={
              location ? "✓ Ubicación obtenida" : "📍 Obtener mi ubicación"
            }
            variant={location ? "outline" : "primary"}
            icon={location ? "checkmark-circle-outline" : "location-outline"}
            onPress={requestLocationPermission}
            fullWidth
          />

          {location && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                showsUserLocation
                showsMyLocationButton
              >
                <Marker
                  coordinate={location}
                  title="Tu negocio"
                  description="Ubicación de tus canchas"
                  pinColor={Colors.primary}
                />
              </MapView>
              <View style={styles.mapOverlay}>
                <Ionicons name="location" size={20} color={Colors.primary} />
                <Text style={styles.mapText}>
                  Lat: {location.latitude.toFixed(6)}, Lng:{" "}
                  {location.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>📄 Documentos y Fotos</Text>
        <Text style={styles.stepSubtitle}>
          Sube los documentos requeridos y fotos de tu establecimiento
        </Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.documentsSection}>
          <Text style={styles.sectionTitle}>📄 Documentos Requeridos</Text>

          <View style={styles.documentCard}>
            <View style={styles.documentHeader}>
              <Ionicons
                name="document-text-outline"
                size={24}
                color={Colors.primary}
              />
              <Text style={styles.documentLabel}>RUT</Text>
            </View>
            <CustomButton
              title={documents.rut ? "✓ Documento cargado" : "Cargar RUT"}
              variant={documents.rut ? "outline" : "primary"}
              onPress={() => pickDocument("rut")}
              icon={
                documents.rut
                  ? "checkmark-circle-outline"
                  : "cloud-upload-outline"
              }
            />
          </View>

          <View style={styles.documentCard}>
            <View style={styles.documentHeader}>
              <Ionicons
                name="business-outline"
                size={24}
                color={Colors.primary}
              />
              <Text style={styles.documentLabel}>Cámara de Comercio</Text>
            </View>
            <CustomButton
              title={
                documents.camaraComercio
                  ? "✓ Documento cargado"
                  : "Cargar documento"
              }
              variant={documents.camaraComercio ? "outline" : "primary"}
              onPress={() => pickDocument("camaraComercio")}
              icon={
                documents.camaraComercio
                  ? "checkmark-circle-outline"
                  : "cloud-upload-outline"
              }
            />
          </View>

          <View style={styles.documentCard}>
            <View style={styles.documentHeader}>
              <Ionicons name="card-outline" size={24} color={Colors.primary} />
              <Text style={styles.documentLabel}>Certificación Bancaria</Text>
            </View>
            <CustomButton
              title={
                documents.certificacionBancaria
                  ? "✓ Documento cargado"
                  : "Cargar documento"
              }
              variant={documents.certificacionBancaria ? "outline" : "primary"}
              onPress={() => pickDocument("certificacionBancaria")}
              icon={
                documents.certificacionBancaria
                  ? "checkmark-circle-outline"
                  : "cloud-upload-outline"
              }
            />
          </View>

          <View style={styles.documentCard}>
            <View style={styles.documentHeader}>
              <Ionicons
                name="person-outline"
                size={24}
                color={Colors.primary}
              />
              <Text style={styles.documentLabel}>
                Cédula del Representante Legal
              </Text>
            </View>
            <CustomButton
              title={
                documents.cedulaRepresentanteLegal
                  ? "✓ Documento cargado"
                  : "Cargar documento"
              }
              variant={
                documents.cedulaRepresentanteLegal ? "outline" : "primary"
              }
              onPress={() => pickDocument("cedulaRepresentanteLegal")}
              icon={
                documents.cedulaRepresentanteLegal
                  ? "checkmark-circle-outline"
                  : "cloud-upload-outline"
              }
            />
          </View>
        </View>

        <View style={styles.imagesSection}>
          <Text style={styles.sectionTitle}>📸 Fotos del Establecimiento</Text>
          <Text style={styles.imagesSubtitle}>
            Sube fotos atractivas de tus canchas e instalaciones (máximo 6)
          </Text>

          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={pickImages}
            disabled={businessImages.length >= 6}
          >
            <View style={styles.imagePickerContent}>
              <Ionicons
                name="camera-outline"
                size={32}
                color={
                  businessImages.length >= 6 ? Colors.textMuted : Colors.primary
                }
              />
              <Text
                style={[
                  styles.imagePickerText,
                  businessImages.length >= 6 && styles.imagePickerTextDisabled,
                ]}
              >
                {businessImages.length === 0
                  ? "Agregar fotos"
                  : businessImages.length >= 6
                  ? "Máximo alcanzado"
                  : "Agregar más fotos"}
              </Text>
              <Text style={styles.imagePickerSubtext}>
                {businessImages.length}/6 fotos
              </Text>
            </View>
          </TouchableOpacity>

          {businessImages.length > 0 && (
            <View style={styles.imagesGrid}>
              {businessImages.map((uri, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() =>
                      setBusinessImages(
                        businessImages.filter((_, i) => i !== index)
                      )
                    }
                  >
                    <Ionicons
                      name="close"
                      size={14}
                      color={Colors.background}
                    />
                  </TouchableOpacity>
                  <View style={styles.imageNumber}>
                    <Text style={styles.imageNumberText}>{index + 1}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {businessImages.length === 0 && (
            <View style={styles.imagesPlaceholder}>
              <Ionicons
                name="images-outline"
                size={48}
                color={Colors.textMuted}
              />
              <Text style={styles.placeholderText}>
                Las fotos ayudan a los jugadores a conocer tu negocio
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const canContinue = () => {
    switch (currentStep) {
      case 1:
        return location !== null && watch("adminBirthDate") !== undefined;
      case 2:
        return Object.values(documents).every((doc) => doc !== null);
      default:
        return false;
    }
  };

  const onSubmit = async (data: ExtendedHostRegistrationForm) => {
    try {
      setIsLoading(true);

      console.log("🚀 HOST Enviando datos del anfitrión:", data.businessName);
      console.log("🔍 HOST Datos del formulario COMPLETOS:", {
        businessName: data.businessName,
        address: data.address,
        nit: data.nit,
        razonSocial: data.razonSocial,
        adminName: data.adminName,
        adminEmail: data.adminEmail,
        adminPhone: data.adminPhone,
        businessEmail: data.businessEmail,
        billingEmail: data.billingEmail,
        businessPhone: data.businessPhone,
        openTime: data.openTime,
        closeTime: data.closeTime,
      });

      if (!data.razonSocial?.trim()) {
        Alert.alert("Error", "La razón social es requerida");
        return;
      }
      if (!location) {
        Alert.alert("Error", "Debes obtener la ubicación del negocio");
        return;
      }

      const result = await hostService.createHostWithValidation(
        data,
        location,
        {
          profileImage: profileImage || undefined,
          documents: {
            rut: documents.rut?.uri,
            camaraComercio: documents.camaraComercio?.uri,
            certificacionBancaria: documents.certificacionBancaria?.uri,
            cedulaRepresentanteLegal: documents.cedulaRepresentanteLegal?.uri,
          },
          businessImages: businessImages,
        }
      );

      if (result.success) {
        console.log("🎉 Registro exitoso, mostrando modal de verificación");

        setUserEmail(data.adminEmail);

        setShowVerificationModal(true);

        Alert.alert(
          "¡Registro exitoso! 📧",
          `Hemos enviado un código de verificación a ${data.adminEmail}. Revisa tu bandeja de entrada.`,
          [{ text: "OK" }]
        );
      } else {
        console.error(
          "❌ Error en el servicio:",
          result.message,
          result.errors
        );
        Alert.alert(
          "Error al crear cuenta",
          result.message +
            (result.errors ? `\n\nDetalles:\n${result.errors.join("\n")}` : ""),
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("❌ Error en registro de anfitrión:", error);
      Alert.alert(
        "Error",
        "Hubo un problema al registrar tu negocio. Intenta nuevamente.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
              } else {
                navigation.goBack();
              }
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.title}>Registro de Anfitrión</Text>
            <Text style={styles.subtitle}>
              {currentStep === 1 && "Información básica"}
              {currentStep === 2 && "Documentos y fotos"}
            </Text>
          </View>
        </View>

        <StepIndicator />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerButtons}>
            {currentStep < 2 ? (
              <CustomButton
                title="Continuar"
                onPress={() => setCurrentStep(currentStep + 1)}
                fullWidth
                disabled={!canContinue()}
              />
            ) : (
              <CustomButton
                title="🎉 Registrar negocio"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                fullWidth
                disabled={!canContinue()}
              />
            )}
          </View>
        </View>

        <VerificationModal />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },

  stepIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: Colors.background,
  },
  stepIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepCircleCurrent: {
    backgroundColor: Colors.background,
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textMuted,
  },
  stepNumberActive: {
    color: Colors.primary,
  },
  stepLine: {
    width: 50,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: Colors.primary,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  stepContainer: {
    paddingTop: 8,
  },
  stepHeader: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  formContainer: {
    gap: 24,
  },

  // Secciones
  businessSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  adminSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  locationSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  documentsSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  imagesSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },

  photoSection: {
    alignItems: "center",
    marginVertical: 16,
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.background,
    borderWidth: 3,
    borderColor: Colors.border,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    alignItems: "center",
    gap: 4,
  },
  photoPlaceholderText: {
    fontSize: 12,
    color: Colors.textMuted,
  },

  genderSection: {
    marginVertical: 8,
  },
  genderContainer: {
    flexDirection: "row",
    gap: 12,
  },
  genderCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.border,
  },
  genderCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  genderEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  genderLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  genderLabelSelected: {
    color: Colors.primary,
  },

  dateSection: {
    marginVertical: 8,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },

  horariosSection: {
    marginVertical: 8,
  },
  timeRow: {
    flexDirection: "row",
    gap: 12,
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  timeField: {
    flex: 1,
  },

  mapContainer: {
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  map: {
    width: "100%",
    height: 200,
  },
  mapOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  mapText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: "monospace",
  },

  documentCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  documentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  documentLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },

  imagesSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  imagePickerButton: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  imagePickerContent: {
    alignItems: "center",
    gap: 8,
  },
  imagePickerText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  imagePickerTextDisabled: {
    color: Colors.textMuted,
  },
  imagePickerSubtext: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  imageContainer: {
    position: "relative",
    width: (width - 84) / 3,
    height: (width - 84) / 3,
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  removeImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageNumber: {
    position: "absolute",
    bottom: 4,
    left: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  imageNumberText: {
    fontSize: 10,
    fontWeight: "bold",
    color: Colors.background,
  },
  imagesPlaceholder: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerButtons: {
    flexDirection: "row",
    gap: 12,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    margin: 20,
    width: width * 0.9,
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
  modalEmail: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  modalContent: {
    padding: 24,
  },
  verificationLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  verificationInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    textAlign: "center",
    letterSpacing: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  modalSecondaryButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  modalSecondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  modalPrimaryButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  modalButtonDisabled: {
    backgroundColor: Colors.textMuted,
  },
  modalPrimaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  modalHint: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default HostRegistrationScreen;
