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

import {
  AuthStackParamList,
  HostRegistrationForm,
  Host,
  FieldType,
} from "../../types";
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";
import CustomButton from "../../components/common/CustomButton";
import CustomInput from "../../components/common/CustomInput";

type HostRegistrationScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  "HostRegistration"
>;

interface Props {
  navigation: HostRegistrationScreenNavigationProp;
}

const { width, height } = Dimensions.get("window");

const fieldTypes: {
  value: FieldType;
  label: string;
  capacity: number;
  emoji: string;
  color: string;
  gradient: string[];
}[] = [
  {
    value: "futbol5",
    label: "Fútbol 5",
    capacity: 10,
    emoji: "⚽",
    color: "#4CAF50",
    gradient: ["#4CAF50", "#81C784"],
  },
  {
    value: "futbol7",
    label: "Fútbol 7",
    capacity: 14,
    emoji: "🥅",
    color: "#FF9800",
    gradient: ["#FF9800", "#FFB74D"],
  },
  {
    value: "futbol11",
    label: "Fútbol 11",
    capacity: 22,
    emoji: "🏟️",
    color: "#2196F3",
    gradient: ["#2196F3", "#64B5F6"],
  },
];

const facilityServices = [
  { key: "parking", label: "Parqueaderos", icon: "car-outline" },
  { key: "bathrooms", label: "Baños", icon: "business-outline" },
  { key: "security_cameras", label: "Cámaras de seguridad", icon: "videocam-outline" },
  { key: "private_security", label: "Vigilancia privada", icon: "shield-outline" },
  { key: "lockers", label: "Vestier", icon: "lock-closed-outline" },
  { key: "cafeteria", label: "Cafetería", icon: "cafe-outline" },
  { key: "pos_terminal", label: "Datáfono", icon: "card-outline" },
  { key: "wifi", label: "WiFi", icon: "wifi-outline" },
  { key: "camera_360", label: "Cámara 360", icon: "camera-outline" },
  { key: "trackman", label: "Trackman", icon: "analytics-outline" },
  { key: "tvs", label: "Televisores", icon: "tv-outline" },
  { key: "stands", label: "Tribunas", icon: "people-outline" },
  { key: "covered_fields", label: "Canchas techadas", icon: "umbrella-outline" },
  { key: "synthetic_grass", label: "Pasto sintético", icon: "leaf-outline" },
  { key: "natural_grass", label: "Pasto natural", icon: "flower-outline" },
  { key: "rubber_floor", label: "Piso de goma", icon: "fitness-outline" },
  { key: "restaurant", label: "Restaurante", icon: "restaurant-outline" },
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
  adminName: yup
    .string()
    .required("El nombre del administrador es requerido"),
  adminEmail: yup
    .string()
    .email("Email inválido")
    .required("El email es requerido"),
  nit: yup
    .string()
    .required("El NIT es requerido"),
  contactInfo: yup.object().shape({
    whatsapp: yup.string(),
    instagram: yup.string(),
    facebook: yup.string(),
  }),
});

const HostRegistrationScreen: React.FC<Props> = ({ navigation }) => {
  const { updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [businessImages, setBusinessImages] = useState<string[]>([]);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [documents, setDocuments] = useState({
    bankCertification: null,
    representativeId: null,
  });
  const [services, setServices] = useState<{[key: string]: boolean}>({});

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<HostRegistrationForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      businessName: "",
      address: "",
      description: "",
      adminName: "",
      adminEmail: "",
      nit: "",
      contactInfo: {
        whatsapp: "",
        instagram: "",
        facebook: "",
      },
    },
  });

  // Funciones existentes (requestLocationPermission, pickImages, etc.)
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

      const result = await ImagePicker.launchImageLibraryAsync();

      if (!result.canceled) {
        const newImage = result.assets[0].uri;
        setBusinessImages([...businessImages, newImage].slice(0, 6));
      }
    } catch (error) {
      console.error("Error picking images:", error);
      Alert.alert("Error", "No pudimos acceder a tus fotos.");
    }
  };

  const pickDocument = async (type: 'bankCertification' | 'representativeId') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setDocuments(prev => ({
          ...prev,
          [type]: result.assets[0]
        }));
      }
    } catch (error) {
      Alert.alert("Error", "No pudimos acceder al documento.");
    }
  };

  const addField = () => {
    setFields([
      ...fields,
      {
        id: Date.now().toString(),
        name: "",
        type: "futbol5" as FieldType,
        pricePerHour: 50000,
        hasLighting: false,
        isIndoor: false,
        amenities: [],
      },
    ]);
  };

  const updateField = (index: number, updates: any) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    setFields(updatedFields);
  };

  const removeField = (index: number) => {
    Alert.alert("Eliminar cancha", "¿Estás seguro de eliminar esta cancha?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          setFields(fields.filter((_, i) => i !== index));
        },
      },
    ]);
  };

  const toggleService = (serviceKey: string) => {
    setServices(prev => ({
      ...prev,
      [serviceKey]: !prev[serviceKey]
    }));
  };

  // Step Indicator mejorado para 4 pasos
  const StepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {[1, 2, 3, 4].map((step) => (
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
          {step < 4 && (
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
        <Text style={styles.stepTitle}>📍 Información del negocio</Text>
        <Text style={styles.stepSubtitle}>
          Cuéntanos sobre tu negocio para que los jugadores te encuentren
        </Text>
      </View>

      <View style={styles.formContainer}>
        <Controller
          control={control}
          name="businessName"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label="Nombre del negocio"
              placeholder="Ej: Cancha El Estadio"
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
              placeholder="Calle 72 #15-30, Barranquilla"
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
              label="Descripción"
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

        {/* Ubicación con mapa */}
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
        <Text style={styles.stepTitle}>📸 Fotos del negocio</Text>
        <Text style={styles.stepSubtitle}>
          Sube fotos atractivas de tus canchas e instalaciones
        </Text>
      </View>

      <View style={styles.imagesSection}>
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
                  <Ionicons name="close" size={14} color={Colors.background} />
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
  );

  // Step 3 mejorado - Canchas con diseño más wow
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>⚽ Configurar Canchas</Text>
        <Text style={styles.stepSubtitle}>
          Agrega y personaliza tus canchas disponibles
        </Text>
      </View>

      <View style={styles.fieldsSection}>
        {fields.map((field, index) => (
          <View key={field.id} style={styles.fieldCardImproved}>
            {/* Header con gradiente */}
            <View style={[
              styles.fieldHeaderImproved,
              { backgroundColor: fieldTypes.find(ft => ft.value === field.type)?.color || Colors.primary }
            ]}>
              <View style={styles.fieldTitleRow}>
                <View style={styles.fieldIconContainer}>
                  <Text style={styles.fieldEmojiLarge}>
                    {fieldTypes.find((ft) => ft.value === field.type)?.emoji || "⚽"}
                  </Text>
                </View>
                <View style={styles.fieldTitleContent}>
                  <Text style={styles.fieldTitleWhite}>
                    {field.name || `Cancha ${index + 1}`}
                  </Text>
                  <Text style={styles.fieldSubtitleWhite}>
                    {fieldTypes.find((ft) => ft.value === field.type)?.label} • {fieldTypes.find((ft) => ft.value === field.type)?.capacity} jugadores
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.removeFieldButtonImproved}
                onPress={() => removeField(index)}
              >
                <Ionicons name="trash-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.fieldBodyImproved}>
              <CustomInput
                label="Nombre de la cancha"
                placeholder="Ej: Cancha Principal"
                value={field.name}
                onChangeText={(text) => updateField(index, { name: text })}
                containerStyle={styles.fieldInputImproved}
              />

              {/* Tipo de cancha con cards mejoradas */}
              <View style={styles.fieldTypeSection}>
                <Text style={styles.fieldLabelImproved}>🏟️ Tipo de cancha</Text>
                <View style={styles.fieldTypesImproved}>
                  {fieldTypes.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.fieldTypeCardImproved,
                        field.type === type.value && [
                          styles.fieldTypeCardSelectedImproved,
                          { borderColor: type.color, backgroundColor: type.color + '15' },
                        ],
                      ]}
                      onPress={() => updateField(index, { type: type.value })}
                    >
                      <View style={[styles.fieldTypeHeader, { backgroundColor: type.color }]}>
                        <Text style={styles.fieldTypeEmojiImproved}>{type.emoji}</Text>
                      </View>
                      <View style={styles.fieldTypeContent}>
                        <Text style={[
                          styles.fieldTypeLabelImproved,
                          field.type === type.value && { color: type.color, fontWeight: 'bold' },
                        ]}>
                          {type.label}
                        </Text>
                        <Text style={styles.fieldTypeCapacityImproved}>
                          {type.capacity} jugadores
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <CustomInput
                label="💰 Precio por hora (COP)"
                placeholder="50000"
                value={field.pricePerHour?.toString()}
                onChangeText={(text) =>
                  updateField(index, { pricePerHour: parseInt(text) || 0 })
                }
                keyboardType="numeric"
                leftIcon="cash-outline"
                containerStyle={styles.fieldInputImproved}
              />

              {/* Características mejoradas */}
              <View style={styles.fieldFeaturesImproved}>
                <Text style={styles.fieldLabelImproved}>✨ Características especiales</Text>
                <View style={styles.featuresGrid}>
                  <TouchableOpacity
                    style={[
                      styles.featureCardImproved,
                      field.hasLighting && styles.featureCardActiveImproved,
                    ]}
                    onPress={() =>
                      updateField(index, { hasLighting: !field.hasLighting })
                    }
                  >
                    <View style={[styles.featureIconContainer, field.hasLighting && { backgroundColor: Colors.primary }]}>
                      <Ionicons
                        name={field.hasLighting ? "bulb" : "bulb-outline"}
                        size={24}
                        color={field.hasLighting ? "white" : Colors.textMuted}
                      />
                    </View>
                    <Text style={[
                      styles.featureTextImproved,
                      field.hasLighting && styles.featureTextActiveImproved,
                    ]}>
                      Iluminación
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.featureCardImproved,
                      field.isIndoor && styles.featureCardActiveImproved,
                    ]}
                    onPress={() =>
                      updateField(index, { isIndoor: !field.isIndoor })
                    }
                  >
                    <View style={[styles.featureIconContainer, field.isIndoor && { backgroundColor: Colors.primary }]}>
                      <Ionicons
                        name={field.isIndoor ? "home" : "home-outline"}
                        size={24}
                        color={field.isIndoor ? "white" : Colors.textMuted}
                      />
                    </View>
                    <Text style={[
                      styles.featureTextImproved,
                      field.isIndoor && styles.featureTextActiveImproved,
                    ]}>
                      Techada
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}

        {/* Botón mejorado para agregar cancha */}
        <TouchableOpacity style={styles.addFieldButtonImproved} onPress={addField}>
          <View style={styles.addFieldContent}>
            <View style={styles.addFieldIconContainer}>
              <Ionicons name="add" size={24} color="white" />
            </View>
            <Text style={styles.addFieldTextImproved}>Agregar nueva cancha</Text>
            <Text style={styles.addFieldSubtext}>Configura todas tus instalaciones</Text>
          </View>
        </TouchableOpacity>

        {fields.length === 0 && (
          <View style={styles.fieldsPlaceholderImproved}>
            <View style={styles.placeholderIconContainer}>
              <Ionicons name="football-outline" size={64} color={Colors.primary} />
            </View>
            <Text style={styles.placeholderTitleImproved}>¡Agrega tus canchas!</Text>
            <Text style={styles.placeholderTextImproved}>
              Configura todas las canchas disponibles en tu establecimiento
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  // Nuevo Step 4 - Información del administrador
  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>👤 Información del Administrador</Text>
        <Text style={styles.stepSubtitle}>
          Datos del responsable y servicios del establecimiento
        </Text>
      </View>

      <View style={styles.formContainer}>
        {/* Información del admin */}
        <View style={styles.adminSection}>
          <Text style={styles.sectionTitle}>📋 Datos del Responsable</Text>
          
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
        </View>

        {/* Documentos */}
        <View style={styles.documentsSection}>
          <Text style={styles.sectionTitle}>📄 Documentos Requeridos</Text>
          
          <View style={styles.documentCard}>
            <View style={styles.documentHeader}>
              <Ionicons name="document-text-outline" size={24} color={Colors.primary} />
              <Text style={styles.documentLabel}>Certificación Bancaria</Text>
            </View>
            <CustomButton
              title={documents.bankCertification ? "✓ Documento cargado" : "Cargar documento"}
              variant={documents.bankCertification ? "outline" : "primary"}
              onPress={() => pickDocument('bankCertification')}
              icon={documents.bankCertification ? "checkmark-circle-outline" : "cloud-upload-outline"}
            />
          </View>

          <View style={styles.documentCard}>
            <View style={styles.documentHeader}>
              <Ionicons name="card-outline" size={24} color={Colors.primary} />
              <Text style={styles.documentLabel}>Cédula del Representante</Text>
            </View>
            <CustomButton
              title={documents.representativeId ? "✓ Documento cargado" : "Cargar documento"}
              variant={documents.representativeId ? "outline" : "primary"}
              onPress={() => pickDocument('representativeId')}
              icon={documents.representativeId ? "checkmark-circle-outline" : "cloud-upload-outline"}
            />
          </View>
        </View>

        {/* Servicios del establecimiento */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>🏢 Servicios del Establecimiento</Text>
          <Text style={styles.servicesSubtitle}>
            Selecciona los servicios disponibles en tu establecimiento
          </Text>

          <View style={styles.servicesGrid}>
            {facilityServices.map((service) => (
              <TouchableOpacity
                key={service.key}
                style={[
                  styles.serviceCard,
                  services[service.key] && styles.serviceCardActive,
                ]}
                onPress={() => toggleService(service.key)}
              >
                <View style={[
                  styles.serviceIconContainer,
                  services[service.key] && styles.serviceIconActive
                ]}>
                  <Ionicons
                    name={service.icon as any}
                    size={20}
                    color={services[service.key] ? "white" : Colors.textMuted}
                  />
                </View>
                <Text style={[
                  styles.serviceText,
                  services[service.key] && styles.serviceTextActive,
                ]}>
                  {service.label}
                </Text>
                <View style={[
                  styles.serviceToggle,
                  services[service.key] && styles.serviceToggleActive,
                ]}>
                  <Text style={[
                    styles.serviceToggleText,
                    services[service.key] && styles.serviceToggleTextActive,
                  ]}>
                    {services[service.key] ? "SÍ" : "NO"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  const canContinue = () => {
    switch (currentStep) {
      case 1:
        return location !== null;
      case 2:
        return true; // Las fotos son opcionales
      case 3:
        return fields.length > 0 && fields.every((field) => field.name.trim());
      case 4:
        return documents.bankCertification && documents.representativeId;
      default:
        return false;
    }
  };

  const onSubmit = async (data: HostRegistrationForm) => {
    try {
      setIsLoading(true);

      const hostData: Partial<Host> = {
        ...data,
        userType: "host",
        coordinates: location,
        documents,
        services,
        fields: fields.map((field) => ({
          ...field,
          capacity:
            fieldTypes.find((ft) => ft.value === field.type)?.capacity || 10,
          images: businessImages,
          isActive: true,
        })),
        rating: 0,
        totalReviews: 0,
        businessHours: {
          monday: { open: "06:00", close: "23:00", isOpen: true },
          tuesday: { open: "06:00", close: "23:00", isOpen: true },
          wednesday: { open: "06:00", close: "23:00", isOpen: true },
          thursday: { open: "06:00", close: "23:00", isOpen: true },
          friday: { open: "06:00", close: "23:00", isOpen: true },
          saturday: { open: "06:00", close: "23:00", isOpen: true },
          sunday: { open: "08:00", close: "22:00", isOpen: true },
        },
      };

      await updateUser(hostData);

      Alert.alert(
        "¡Bienvenido a TUNG! 🎉",
        "Tu negocio ha sido registrado exitosamente. ¡Ya puedes empezar a crear eventos!",
        [
          {
            text: "Comenzar",
            onPress: () => {
              // La navegación se manejará automáticamente por el AuthContext
            },
          },
        ]
      );
    } catch (error) {
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
        {/* Header */}
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
            <Text style={styles.title}>Registro de Negocio</Text>
            <Text style={styles.subtitle}>
              {currentStep === 1 && "Información básica"}
              {currentStep === 2 && "Fotos del negocio"}
              {currentStep === 3 && "Configurar canchas"}
              {currentStep === 4 && "Datos del administrador"}
            </Text>
          </View>
        </View>

        {/* Step Indicator */}
        <StepIndicator />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerButtons}>
            {currentStep < 4 ? (
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

  // Step Indicator actualizado para 4 pasos
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
    width: 30,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 6,
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
    gap: 16,
  },

  // Ubicación con mapa (mantener estilo original)
  locationSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 12,
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

  // Imágenes (mantener estilo original)
  imagesSection: {
    gap: 16,
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
    width: (width - 64) / 3,
    height: (width - 64) / 3,
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

  // Estilos mejorados para CANCHAS
  fieldsSection: {
    gap: 20,
  },
  fieldCardImproved: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  fieldHeaderImproved: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  fieldIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  fieldEmojiLarge: {
    fontSize: 24,
  },
  fieldTitleContent: {
    flex: 1,
  },
  fieldTitleWhite: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  fieldSubtitleWhite: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  removeFieldButtonImproved: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  fieldBodyImproved: {
    padding: 20,
    backgroundColor: Colors.background,
  },
  fieldInputImproved: {
    marginBottom: 16,
  },
  fieldLabelImproved: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  fieldTypesImproved: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  fieldTypeCardImproved: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.border,
  },
  fieldTypeCardSelectedImproved: {
    borderWidth: 2,
  },
  fieldTypeHeader: {
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldTypeEmojiImproved: {
    fontSize: 20,
    color: "white",
  },
  fieldTypeContent: {
    padding: 12,
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  fieldTypeLabelImproved: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  fieldTypeCapacityImproved: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  fieldFeaturesImproved: {
    marginTop: 8,
  },
  featuresGrid: {
    flexDirection: "row",
    gap: 12,
  },
  featureCardImproved: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureCardActiveImproved: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  featureTextImproved: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: "center",
    fontWeight: "500",
  },
  featureTextActiveImproved: {
    color: Colors.primary,
    fontWeight: "600",
  },
  addFieldButtonImproved: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginTop: 8,
  },
  addFieldContent: {
    alignItems: "center",
  },
  addFieldIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  addFieldTextImproved: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  addFieldSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  fieldsPlaceholderImproved: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  placeholderIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  placeholderTitleImproved: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  placeholderTextImproved: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 20,
  },

  // Estilos para Step 4 - Administrador
  adminSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    gap: 16,
  },
  documentsSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    gap: 16,
  },
  documentCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    gap: 12,
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
  servicesSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  servicesSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  servicesGrid: {
    gap: 12,
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serviceCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  serviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  serviceIconActive: {
    backgroundColor: Colors.primary,
  },
  serviceText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  serviceTextActive: {
    color: Colors.primary,
    fontWeight: "600",
  },
  serviceToggle: {
    backgroundColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  serviceToggleActive: {
    backgroundColor: Colors.primary,
  },
  serviceToggleText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.textMuted,
  },
  serviceToggleTextActive: {
    color: "white",
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
});

export default HostRegistrationScreen;