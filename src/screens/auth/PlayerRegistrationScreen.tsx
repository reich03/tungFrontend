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
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

import {
  AuthStackParamList,
  PlayerRegistrationForm,
  PlayerPosition,
} from "../../types";
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";
import CustomButton from "../../components/common/CustomButton";
import CustomInput from "../../components/common/CustomInput";
import { playerService } from "../../services/playerService";
type PlayerRegistrationScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  "PlayerRegistration"
>;

interface Props {
  navigation: PlayerRegistrationScreenNavigationProp;
}

const { width } = Dimensions.get("window");

const documentTypes = [
  { value: "cedula", label: "Cédula de Ciudadanía" },
  { value: "tarjeta", label: "Tarjeta de Identidad" },
  { value: "registro", label: "Registro Civil" },
];

const genders = [
  { value: "male", label: "Masculino", emoji: "👨" },
  { value: "female", label: "Femenino", emoji: "👩" },
  { value: "other", label: "Otro", emoji: "👤" },
];

const colombianDepartments = [
  {
    value: "antioquia",
    label: "Antioquia",
    cities: ["Medellín", "Bello", "Itagüí", "Envigado", "Rionegro", "Turbo"],
  },
  {
    value: "atlantico",
    label: "Atlántico",
    cities: ["Barranquilla", "Soledad", "Malambo", "Galapa", "Puerto Colombia"],
  },
  { value: "bogota", label: "Bogotá D.C.", cities: ["Bogotá"] },
  {
    value: "bolivar",
    label: "Bolívar",
    cities: [
      "Cartagena",
      "Magangué",
      "Turbaco",
      "Arjona",
      "El Carmen de Bolívar",
    ],
  },
  {
    value: "valle",
    label: "Valle del Cauca",
    cities: ["Cali", "Palmira", "Buenaventura", "Tulua", "Yumbo", "Cartago"],
  },
  {
    value: "cundinamarca",
    label: "Cundinamarca",
    cities: ["Soacha", "Zipaquirá", "Facatativá", "Chía", "Fusagasugá"],
  },
  {
    value: "santander",
    label: "Santander",
    cities: [
      "Bucaramanga",
      "Floridablanca",
      "Girón",
      "Piedecuesta",
      "Barrancabermeja",
    ],
  },
  {
    value: "norte_santander",
    label: "Norte de Santander",
    cities: ["Cúcuta", "Ocaña", "Pamplona", "Villa del Rosario"],
  },
  {
    value: "huila",
    label: "Huila",
    cities: ["Neiva", "Pitalito", "Garzón", "La Plata"],
  },
  {
    value: "tolima",
    label: "Tolima",
    cities: ["Ibagué", "Espinal", "Melgar", "Líbano"],
  },
  {
    value: "meta",
    label: "Meta",
    cities: ["Villavicencio", "Acacías", "Granada", "Puerto López"],
  },
  {
    value: "magdalena",
    label: "Magdalena",
    cities: ["Santa Marta", "Ciénaga", "Fundación", "El Banco"],
  },
  {
    value: "cesar",
    label: "Cesar",
    cities: ["Valledupar", "Aguachica", "Codazzi", "La Paz"],
  },
  {
    value: "nariño",
    label: "Nariño",
    cities: ["Pasto", "Tumaco", "Ipiales", "Túquerres"],
  },
  {
    value: "cordoba",
    label: "Córdoba",
    cities: ["Montería", "Lorica", "Sahagún", "Cereté"],
  },
  {
    value: "boyaca",
    label: "Boyacá",
    cities: ["Tunja", "Duitama", "Sogamoso", "Chiquinquirá"],
  },
  {
    value: "caldas",
    label: "Caldas",
    cities: ["Manizales", "La Dorada", "Villamaría", "Chinchiná"],
  },
  {
    value: "risaralda",
    label: "Risaralda",
    cities: ["Pereira", "Dosquebradas", "Santa Rosa de Cabal", "La Virginia"],
  },
  {
    value: "quindio",
    label: "Quindío",
    cities: ["Armenia", "Calarcá", "Montenegro", "La Tebaida"],
  },
  {
    value: "arauca",
    label: "Arauca",
    cities: ["Arauca", "Tame", "Saravena", "Arauquita"],
  },
  {
    value: "casanare",
    label: "Casanare",
    cities: ["Yopal", "Aguazul", "Villanueva", "Tauramena"],
  },
  {
    value: "guajira",
    label: "La Guajira",
    cities: ["Riohacha", "Maicao", "Uribia", "Fonseca"],
  },
  {
    value: "putumayo",
    label: "Putumayo",
    cities: ["Mocoa", "Puerto Asís", "Orito", "Valle del Guamuez"],
  },
];

const positions: { value: PlayerPosition; label: string; emoji: string }[] = [
  { value: "goalkeeper", label: "Arquero", emoji: "🥅" },
  { value: "defender", label: "Defensa", emoji: "🛡️" },
  { value: "midfielder", label: "CENTROCAMPISTA", emoji: "⚡" },
  { value: "forward", label: "Delantero", emoji: "⚽" },
  { value: "shuttlecock", label: "VOLANTE", emoji: "⚽" },
];

const goalkeeperStats = [
  {
    key: "reach",
    label: "Estirada",
    color: "#4CAF50",
    icon: "hand-left-outline",
  },
  { key: "saves", label: "Paradas", color: "#FF9800", icon: "shield-outline" },
  {
    key: "reflexes",
    label: "Reflejos",
    color: "#2196F3",
    icon: "flash-outline",
  },
  {
    key: "speed",
    label: "Velocidad",
    color: "#9C27B0",
    icon: "speedometer-outline",
  },
  {
    key: "throw",
    label: "Saque",
    color: "#F44336",
    icon: "basketball-outline",
  },
  {
    key: "positioning",
    label: "Posicionamiento",
    color: "#607D8B",
    icon: "location-outline",
  },
];

const playerStats = [
  {
    key: "pace",
    label: "Ritmo",
    color: "#4CAF50",
    icon: "speedometer-outline",
  },
  {
    key: "shooting",
    label: "Tiro",
    color: "#FF9800",
    icon: "football-outline",
  },
  {
    key: "passing",
    label: "Pase",
    color: "#2196F3",
    icon: "arrow-forward-outline",
  },
  {
    key: "dribbling",
    label: "Regates",
    color: "#9C27B0",
    icon: "shuffle-outline",
  },
  {
    key: "defending",
    label: "Defensa",
    color: "#F44336",
    icon: "shield-checkmark-outline",
  },
  {
    key: "physical",
    label: "Físico",
    color: "#607D8B",
    icon: "fitness-outline",
  },
];

const schema = yup.object().shape({
  firstName: yup.string().required("El nombre es requerido"),
  lastName: yup.string().required("El apellido es requerido"),
  documentType: yup.string().required("Selecciona el tipo de documento"),
  documentNumber: yup.string().required("El número de documento es requerido"),
  email: yup.string().email("Email inválido").required("El email es requerido"),
  password: yup
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .required("La contraseña es requerida"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Las contraseñas deben coincidir")
    .required("Confirma tu contraseña"),
  phone: yup.string().required("El teléfono es requerido"),
  gender: yup.string().required("Selecciona el género"),
  birthDate: yup.date().required("La fecha de nacimiento es requerida"),
  department: yup.string().required("Selecciona el departamento"),
  city: yup.string().required("Selecciona la ciudad"),
  nickname: yup.string().required("El nickname es requerido"),
  position: yup.string().required("Selecciona tu posición principal"),
  height: yup.number().required("Ingresa tu altura").min(140).max(220),
  weight: yup.number().required("Ingresa tu peso").min(40).max(150),
});

const PlayerRegistrationScreen: React.FC<Props> = ({ navigation }) => {
  const { registerPlayer } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isUnderage, setIsUnderage] = useState(false);
  const [isForSponsored, setIsForSponsored] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [alternativePositions, setAlternativePositions] = useState<
    PlayerPosition[]
  >([]);

  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const [stats, setStats] = useState({
    reach: 30,
    saves: 30,
    reflexes: 30,
    speed: 30,
    throw: 30,
    positioning: 30,
    pace: 30,
    shooting: 30,
    passing: 30,
    dribbling: 30,
    defending: 30,
    physical: 30,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PlayerRegistrationForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      documentType: "cedula",
      documentNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      gender: "male",
      department: "",
      city: "",
      nickname: "",
      position: "midfielder",
      height: 175,
      weight: 70,
    },
  });

  const watchedPosition = watch("position");
  const watchedBirthDate = watch("birthDate");
  const watchedDepartment = watch("department");

  React.useEffect(() => {
    if (watchedBirthDate) {
      const today = new Date();
      const birth = new Date(watchedBirthDate);
      const age = today.getFullYear() - birth.getFullYear();
      setIsUnderage(age < 15);
    }
  }, [watchedBirthDate]);

  const pickImage = async () => {
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

  const toggleAlternativePosition = (position: PlayerPosition) => {
    if (position === watchedPosition) return;

    setAlternativePositions((prev) =>
      prev.includes(position)
        ? prev.filter((p) => p !== position)
        : [...prev, position]
    );
  };

  const updateStat = (statKey: string, value: number) => {
    setStats((prev) => ({
      ...prev,
      [statKey]: Math.max(0, Math.min(60, value)),
    }));
  };

  const handleEmailVerification = async () => {
    if (!verificationCode.trim()) {
      Alert.alert("Error", "Ingresa el código de verificación");
      return;
    }

    try {
      setIsVerifying(true);

      const result = await playerService.verifyPlayerEmail(verificationCode);

      if (result.success) {
        setShowVerificationModal(false);
        Alert.alert(
          "¡Cuenta verificada! 🎉",
          "Tu email ha sido verificado exitosamente. ¡Ya puedes iniciar sesión!",
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

  const StatSlider: React.FC<{
    statKey: string;
    label: string;
    value: number;
    color: string;
    icon: string;
  }> = ({ statKey, label, value, color, icon }) => (
    <View style={styles.statContainer}>
      <View style={styles.statHeader}>
        <View style={styles.statLabelContainer}>
          <Ionicons name={icon as any} size={20} color={color} />
          <Text style={styles.statLabel}>{label}</Text>
        </View>
        <View style={styles.statValueContainer}>
          <Text style={[styles.statValue, { color }]}>{value}</Text>
          <Text style={styles.statMax}>/60</Text>
        </View>
      </View>
      <View style={styles.statSliderContainer}>
        <View style={styles.statTrack}>
          <View
            style={[
              styles.statFill,
              { width: `${(value / 60) * 100}%`, backgroundColor: color },
            ]}
          />
        </View>
        <View style={styles.statButtons}>
          <TouchableOpacity
            style={[styles.statButton, { borderColor: color }]}
            onPress={() => updateStat(statKey, value - 5)}
          >
            <Ionicons name="remove" size={16} color={color} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statButton, { borderColor: color }]}
            onPress={() => updateStat(statKey, value + 5)}
          >
            <Ionicons name="add" size={16} color={color} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const StepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {[1, 2, 3, 4, 5].map((step) => (
        <View key={step} style={styles.stepIndicatorRow}>
          <View
            style={[
              styles.stepCircle,
              currentStep >= step && styles.stepCircleActive,
              currentStep === step && styles.stepCircleCurrent,
            ]}
          >
            {currentStep > step ? (
              <Ionicons name="checkmark" size={14} color="white" />
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
          {step < 5 && (
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

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>👤 Información Personal</Text>
        <Text style={styles.stepSubtitle}>
          Cuéntanos sobre ti para crear tu perfil de jugador
        </Text>
      </View>

      <View style={styles.photoSection}>
        <Text style={styles.sectionTitle}>📸 Foto de perfil</Text>
        <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
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

      <View style={styles.formContainer}>
        <View style={styles.nameRow}>
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Nombre"
                placeholder="Juan"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.firstName?.message}
                containerStyle={styles.nameInput}
                required
              />
            )}
          />
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Apellido"
                placeholder="Pérez"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.lastName?.message}
                containerStyle={styles.nameInput}
                required
              />
            )}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Tipo de documento</Text>
          <View style={styles.documentTypes}>
            {documentTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.documentCard,
                  watch("documentType") === type.value &&
                    styles.documentCardSelected,
                ]}
                onPress={() => setValue("documentType", type.value)}
              >
                <Text
                  style={[
                    styles.documentLabel,
                    watch("documentType") === type.value &&
                      styles.documentLabelSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Controller
          control={control}
          name="documentNumber"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label="Número de documento"
              placeholder="1234567890"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.documentNumber?.message}
              keyboardType="numeric"
              leftIcon="card-outline"
              required
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label="Correo electrónico"
              placeholder="juan@email.com"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              keyboardType="email-address"
              leftIcon="mail-outline"
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
              placeholder="••••••••"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              secureTextEntry
              leftIcon="lock-closed-outline"
              required
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label="Confirmar contraseña"
              placeholder="••••••••"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.confirmPassword?.message}
              secureTextEntry
              leftIcon="lock-closed-outline"
              required
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label="Número de celular"
              placeholder="3001234567"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.phone?.message}
              keyboardType="phone-pad"
              leftIcon="call-outline"
              required
            />
          )}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>🌍 Datos Adicionales</Text>
        <Text style={styles.stepSubtitle}>
          Información sobre tu género, edad y ubicación
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚹🚺 Género</Text>
        <View style={styles.genderContainer}>
          {genders.map((gender) => (
            <TouchableOpacity
              key={gender.value}
              style={[
                styles.genderCard,
                watch("gender") === gender.value && styles.genderCardSelected,
              ]}
              onPress={() => setValue("gender", gender.value)}
            >
              <Text style={styles.genderEmoji}>{gender.emoji}</Text>
              <Text
                style={[
                  styles.genderLabel,
                  watch("gender") === gender.value &&
                    styles.genderLabelSelected,
                ]}
              >
                {gender.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Fecha de nacimiento</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
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
                setValue("birthDate", selectedDate);
              }
            }}
            maximumDate={new Date()}
          />
        )}

        {isUnderage && (
          <View style={styles.warningContainer}>
            <Ionicons name="warning-outline" size={24} color={Colors.warning} />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>⚠️ Cuenta para menores</Text>
              <Text style={styles.warningText}>
                Los menores de 15 años necesitan que un adulto cree la cuenta
                como apadrinador.
              </Text>

              <View style={styles.sponsorQuestion}>
                <Text style={styles.sponsorQuestionText}>
                  ¿Esta cuenta es para ti o para un menor que apadrinas?
                </Text>
                <View style={styles.sponsorOptions}>
                  <TouchableOpacity
                    style={[
                      styles.sponsorOption,
                      !isForSponsored && styles.sponsorOptionSelected,
                    ]}
                    onPress={() => setIsForSponsored(false)}
                  >
                    <Text style={styles.sponsorOptionText}>Para mí</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sponsorOption,
                      isForSponsored && styles.sponsorOptionSelected,
                    ]}
                    onPress={() => setIsForSponsored(true)}
                  >
                    <Text style={styles.sponsorOptionText}>Para un menor</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Ubicación</Text>

        <View style={styles.locationContainer}>
          <Text style={styles.locationLabel}>Departamento</Text>
          <View style={styles.departmentGrid}>
            {colombianDepartments.map((dept) => (
              <TouchableOpacity
                key={dept.value}
                style={[
                  styles.departmentCard,
                  watchedDepartment === dept.value &&
                    styles.departmentCardSelected,
                ]}
                onPress={() => {
                  setValue("department", dept.value);
                  setValue("city", "");
                  setSelectedDepartment(dept.value);
                }}
              >
                <Text
                  style={[
                    styles.departmentLabel,
                    watchedDepartment === dept.value &&
                      styles.departmentLabelSelected,
                  ]}
                >
                  {dept.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {watchedDepartment && (
            <View style={styles.citySection}>
              <Text style={styles.locationLabel}>Ciudad</Text>
              <View style={styles.cityGrid}>
                {colombianDepartments
                  .find((d) => d.value === watchedDepartment)
                  ?.cities.map((city) => (
                    <TouchableOpacity
                      key={city}
                      style={[
                        styles.cityCard,
                        watch("city") === city && styles.cityCardSelected,
                      ]}
                      onPress={() => setValue("city", city)}
                    >
                      <Text
                        style={[
                          styles.cityLabel,
                          watch("city") === city && styles.cityLabelSelected,
                        ]}
                      >
                        {city}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>⚽ Perfil Deportivo</Text>
        <Text style={styles.stepSubtitle}>
          Configura tu perfil de jugador y posiciones
        </Text>
      </View>

      <Controller
        control={control}
        name="nickname"
        render={({ field: { onChange, onBlur, value } }) => (
          <CustomInput
            label="🎮 Nickname / Apodo"
            placeholder="ElCrack10"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.nickname?.message}
            leftIcon="person-circle-outline"
            required
          />
        )}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⭐ Posición principal</Text>
        <View style={styles.positionsGrid}>
          {positions.map((pos) => (
            <TouchableOpacity
              key={pos.value}
              style={[
                styles.positionCard,
                watchedPosition === pos.value && styles.positionCardSelected,
              ]}
              onPress={() => setValue("position", pos.value)}
            >
              <Text style={styles.positionEmoji}>{pos.emoji}</Text>
              <Text
                style={[
                  styles.positionLabel,
                  watchedPosition === pos.value && styles.positionLabelSelected,
                ]}
              >
                {pos.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          🔄 Otras posiciones donde puedes jugar
        </Text>
        <Text style={styles.sectionSubtitle}>
          (Opcional) Selecciona posiciones adicionales
        </Text>
        <View style={styles.alternativePositions}>
          {positions
            .filter((pos) => pos.value !== watchedPosition)
            .map((pos) => (
              <TouchableOpacity
                key={pos.value}
                style={[
                  styles.alternativeCard,
                  alternativePositions.includes(pos.value) &&
                    styles.alternativeCardSelected,
                ]}
                onPress={() => toggleAlternativePosition(pos.value)}
              >
                <Text style={styles.alternativeEmoji}>{pos.emoji}</Text>
                <Text
                  style={[
                    styles.alternativeLabel,
                    alternativePositions.includes(pos.value) &&
                      styles.alternativeLabelSelected,
                  ]}
                >
                  {pos.label}
                </Text>
                {alternativePositions.includes(pos.value) && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>📏 Información Física</Text>
        <Text style={styles.stepSubtitle}>
          Datos sobre tu físico para completar tu perfil
        </Text>
      </View>

      <View style={styles.physicalContainer}>
        <Controller
          control={control}
          name="height"
          render={({ field: { onChange, value } }) => (
            <View style={styles.physicalCard}>
              <Ionicons
                name="resize-outline"
                size={24}
                color={Colors.primary}
              />
              <Text style={styles.physicalLabel}>Altura</Text>
              <CustomInput
                placeholder="175"
                value={value?.toString()}
                onChangeText={(text) => onChange(parseInt(text) || 0)}
                error={errors.height?.message}
                keyboardType="numeric"
                containerStyle={styles.physicalInput}
              />
              <Text style={styles.physicalUnit}>cm</Text>
            </View>
          )}
        />

        <Controller
          control={control}
          name="weight"
          render={({ field: { onChange, value } }) => (
            <View style={styles.physicalCard}>
              <Ionicons
                name="fitness-outline"
                size={24}
                color={Colors.primary}
              />
              <Text style={styles.physicalLabel}>Peso</Text>
              <CustomInput
                placeholder="70"
                value={value?.toString()}
                onChangeText={(text) => onChange(parseInt(text) || 0)}
                error={errors.weight?.message}
                keyboardType="numeric"
                containerStyle={styles.physicalInput}
              />
              <Text style={styles.physicalUnit}>kg</Text>
            </View>
          )}
        />
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      {/* NOTIFICACIÓN IMPORTANTE */}
      <View style={styles.importantNotice}>
        <View style={styles.noticeHeader}>
          <Ionicons name="warning" size={24} color={Colors.warning} />
          <Text style={styles.noticeTitle}>⚠️ IMPORTANTE</Text>
        </View>
        <Text style={styles.noticeText}>
          Esta autoevaluación SOLO se puede realizar UNA VEZ y NO se puede
          editar posteriormente. Evalúa cuidadosamente tus habilidades.
        </Text>
      </View>

      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>
          {watchedPosition === "goalkeeper"
            ? "🥅 Autoevaluación de Arquero"
            : "⚽ Autoevaluación de Jugador"}
        </Text>
        <Text style={styles.stepSubtitle}>
          Evalúa tus habilidades del 0 al 60. Máximo 60 puntos por atributo.
        </Text>
      </View>

      <View style={styles.statsContainer}>
        {watchedPosition === "goalkeeper"
          ? goalkeeperStats.map((stat) => (
              <StatSlider
                key={stat.key}
                statKey={stat.key}
                label={stat.label}
                value={stats[stat.key as keyof typeof stats]}
                color={stat.color}
                icon={stat.icon}
              />
            ))
          : playerStats.map((stat) => (
              <StatSlider
                key={stat.key}
                statKey={stat.key}
                label={stat.label}
                value={stats[stat.key as keyof typeof stats]}
                color={stat.color}
                icon={stat.icon}
              />
            ))}
      </View>

      <View style={styles.statsummary}>
        <Text style={styles.summaryTitle}>📊 Resumen</Text>
        <Text style={styles.summaryText}>
          Total:{" "}
          {Object.values(stats)
            .slice(
              watchedPosition === "goalkeeper" ? 0 : 6,
              watchedPosition === "goalkeeper" ? 6 : 12
            )
            .reduce((a, b) => a + b, 0)}{" "}
          / 360 puntos
        </Text>
      </View>
    </View>
  );

  // const canContinue = () => {
  //   switch (currentStep) {
  //     case 1:
  //       return (
  //         watch("firstName") &&
  //         watch("lastName") &&
  //         watch("email") &&
  //         watch("password") &&
  //         watch("confirmPassword") &&
  //         watch("phone")
  //       );
  //     case 2:
  //       return (
  //         watch("gender") &&
  //         watchedBirthDate &&
  //         watch("department") &&
  //         watch("city")
  //       );
  //     case 3:
  //       return watch("nickname") && watch("position");
  //     case 4:
  //       return watch("height") && watch("weight");
  //     case 5:
  //       return true;
  //     default:
  //       return false;
  //   }
  // };

  // const onSubmit = async (data: PlayerRegistrationForm) => {
  //   try {
  //     setIsLoading(true);

  //     console.log("🚀 Enviando datos del jugador:", data.nickname);

  //     // Usar el servicio con validación completa
  //     const result = await playerService.createPlayerWithValidation(
  //       data,
  //       stats,
  //       profileImage || undefined
  //     );

  //     if (result.success) {
  //       // Guardar email para verificación
  //       setUserEmail(data.email);

  //       // Mostrar modal de verificación
  //       setShowVerificationModal(true);

  //       Alert.alert(
  //         "¡Registro exitoso! 📧",
  //         `Hemos enviado un código de verificación a ${data.email}. Revisa tu bandeja de entrada.`,
  //         [{ text: "OK" }]
  //       );
  //     } else {
  //       Alert.alert("Error al crear cuenta", result.message, [{ text: "OK" }]);
  //     }
  //   } catch (error) {
  //     console.error("❌ Error en registro:", error);
  //     Alert.alert(
  //       "Error",
  //       "Hubo un problema al crear tu perfil. Intenta nuevamente.",
  //       [{ text: "OK" }]
  //     );
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const onSubmit = async (data: PlayerRegistrationForm) => {
    console.log("🔥 onSubmit INICIADO - Datos recibidos:", {
      nickname: data.nickname,
      email: data.email,
      position: data.position,
      hasProfileImage: !!profileImage,
    });

    try {
      setIsLoading(true);
      console.log("⏳ Loading state activado");

      console.log("🚀 Enviando datos del jugador:", data.nickname);
      console.log("📊 Stats actuales:", stats);
      console.log(
        "📸 Profile image:",
        profileImage ? "Presente" : "No hay imagen"
      );

      if (!data.email || !data.password || !data.nickname) {
        console.error("❌ Faltan campos obligatorios:", {
          email: !!data.email,
          password: !!data.password,
          nickname: !!data.nickname,
        });
        Alert.alert(
          "Error",
          "Por favor completa todos los campos obligatorios"
        );
        return;
      }

      console.log("✅ Validación manual pasó, llamando al servicio...");

      const result = await playerService.createPlayerWithValidation(
        data,
        stats,
        profileImage || undefined
      );

      console.log("📨 Respuesta del servicio recibida:", {
        success: result.success,
        message: result.message,
        hasData: !!result.data,
        errors: result.errors,
      });

      if (result.success) {
        console.log("🎉 Registro exitoso, mostrando modal de verificación");

        setUserEmail(data.email);

        setShowVerificationModal(true);

        Alert.alert(
          "¡Registro exitoso! 📧",
          `Hemos enviado un código de verificación a ${data.email}. Revisa tu bandeja de entrada.`,
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
      console.error("💥 ERROR CRÍTICO en onSubmit:", error);

      if (error instanceof Error) {
        console.error("💥 Error stack:", error.stack);
        console.error("💥 Error message:", error.message);
      }

      Alert.alert(
        "Error Crítico",
        `Hubo un problema inesperado al crear tu perfil:\n\n${
          error instanceof Error ? error.message : "Error desconocido"
        }\n\nIntenta nuevamente.`,
        [{ text: "OK" }]
      );
    } finally {
      console.log("🏁 onSubmit FINALIZADO - Desactivando loading");
      setIsLoading(false);
    }
  };

  const canContinue = () => {
    const result = (() => {
      switch (currentStep) {
        case 1:
          const step1Valid = !!(
            watch("firstName") &&
            watch("lastName") &&
            watch("email") &&
            watch("password") &&
            watch("confirmPassword") &&
            watch("phone")
          );
          console.log("🔍 Step 1 validation:", {
            firstName: !!watch("firstName"),
            lastName: !!watch("lastName"),
            email: !!watch("email"),
            password: !!watch("password"),
            confirmPassword: !!watch("confirmPassword"),
            phone: !!watch("phone"),
            result: step1Valid,
          });
          return step1Valid;

        case 2:
          const step2Valid = !!(
            watch("gender") &&
            watchedBirthDate &&
            watch("department") &&
            watch("city")
          );
          console.log("🔍 Step 2 validation:", {
            gender: !!watch("gender"),
            birthDate: !!watchedBirthDate,
            department: !!watch("department"),
            city: !!watch("city"),
            result: step2Valid,
          });
          return step2Valid;

        case 3:
          const step3Valid = !!(watch("nickname") && watch("position"));
          console.log("🔍 Step 3 validation:", {
            nickname: !!watch("nickname"),
            position: !!watch("position"),
            result: step3Valid,
          });
          return step3Valid;

        case 4:
          const step4Valid = !!(watch("height") && watch("weight"));
          console.log("🔍 Step 4 validation:", {
            height: !!watch("height"),
            weight: !!watch("weight"),
            result: step4Valid,
          });
          return step4Valid;

        case 5:
          return true;

        default:
          return false;
      }
    })();

    console.log(`🎯 canContinue() para step ${currentStep}:`, result);
    return result;
  };

  const handleCreateProfile = () => {
    console.log("🎯 BOTÓN PRESIONADO - Crear perfil");
    console.log("📊 TODOS LOS DATOS DEL FORMULARIO:", watch());

    console.log("📋 Estado actual:", {
      currentStep,
      isLoading,
      canContinue: canContinue(),
      formErrors: Object.keys(errors).length > 0 ? errors : "Sin errores",
    });

    if (currentStep !== 5) {
      console.error("❌ No estamos en el step 5, step actual:", currentStep);
      Alert.alert("Error", "Debes completar todos los pasos anteriores");
      return;
    }

    if (Object.keys(errors).length > 0) {
      console.error("❌ Hay errores de validación:", errors);
      Alert.alert("Error", "Por favor corrige los errores en el formulario");
      return;
    }

    console.log("✅ Pre-validaciones pasaron, llamando a handleSubmit");

    handleSubmit(
      (data) => {
        console.log("✅ handleSubmit SUCCESS callback ejecutado");
        onSubmit(data);
      },
      (errors) => {
        console.error("❌ handleSubmit ERROR callback ejecutado:", errors);
        Alert.alert(
          "Error de Validación",
          "Hay errores en el formulario:\n\n" +
            Object.values(errors)
              .map((error) => error.message)
              .join("\n")
        );
      }
    )();
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
            <Text style={styles.title}>Perfil de Jugador</Text>
            <Text style={styles.subtitle}>Paso {currentStep} de 5</Text>
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
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerButtons}>
            {currentStep < 5 ? (
              <CustomButton
                title="Continuar"
                onPress={() => setCurrentStep(currentStep + 1)}
                fullWidth
                disabled={!canContinue()}
              />
            ) : (
              <CustomButton
                title="🎉 Crear perfil"
                onPress={handleCreateProfile}
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
    paddingVertical: 16,
    backgroundColor: Colors.background,
  },
  stepIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.textMuted,
  },
  stepNumberActive: {
    color: "white",
  },
  stepLine: {
    width: 24,
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
  photoSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
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
    gap: 8,
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  nameRow: {
    flexDirection: "row",
    gap: 12,
  },
  nameInput: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  documentTypes: {
    gap: 8,
  },
  documentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  documentCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  documentLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  documentLabelSelected: {
    color: Colors.primary,
    fontWeight: "600",
  },
  genderContainer: {
    flexDirection: "row",
    gap: 12,
  },
  genderCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.border,
  },
  genderCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  genderEmoji: {
    fontSize: 32,
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
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
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
  warningContainer: {
    marginTop: 16,
    backgroundColor: Colors.warning,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.warning,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  sponsorQuestion: {
    gap: 8,
  },
  sponsorQuestionText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  sponsorOptions: {
    flexDirection: "row",
    gap: 8,
  },
  sponsorOption: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sponsorOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  sponsorOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  locationContainer: {
    gap: 16,
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  departmentGrid: {
    gap: 8,
  },
  departmentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  departmentCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  departmentLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  departmentLabelSelected: {
    color: Colors.primary,
    fontWeight: "600",
  },
  citySection: {
    marginTop: 16,
  },
  cityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cityCard: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: "48%",
  },
  cityCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  cityLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  cityLabelSelected: {
    color: Colors.primary,
    fontWeight: "600",
  },
  positionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  positionCard: {
    width: "47%",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.border,
  },
  positionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  positionEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  positionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  positionLabelSelected: {
    color: Colors.primary,
  },
  alternativePositions: {
    gap: 8,
  },
  alternativeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  alternativeCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  alternativeEmoji: {
    fontSize: 24,
  },
  alternativeLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  alternativeLabelSelected: {
    color: Colors.primary,
    fontWeight: "600",
  },
  physicalContainer: {
    flexDirection: "row",
    gap: 16,
  },
  physicalCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 12,
  },
  physicalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  physicalInput: {
    width: "100%",
  },
  physicalUnit: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  importantNotice: {
    backgroundColor: "#9D0000",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.warning,
  },
  noticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.warning,
  },
  noticeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  statsContainer: {
    gap: 20,
  },
  statContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  statValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statMax: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  statSliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  statFill: {
    height: "100%",
    borderRadius: 4,
  },
  statButtons: {
    flexDirection: "row",
    gap: 8,
  },
  statButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  statsummary: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    alignItems: "center",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 14,
    color: Colors.textPrimary,
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

  // Estilos del modal de verificación
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

export default PlayerRegistrationScreen;
