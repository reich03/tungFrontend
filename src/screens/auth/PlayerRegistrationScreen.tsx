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
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

import {
  AuthStackParamList,
  PlayerRegistrationForm,
  PlayerPosition,
  Player,
} from "../../types";
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";
import CustomButton from "../../components/common/CustomButton";
import CustomInput from "../../components/common/CustomInput";

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
  { value: "midfielder", label: "Medio", emoji: "⚡" },
  { value: "forward", label: "Delantero", emoji: "⚽" },
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
  const { updateUser } = useAuth();
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
  const [stats, setStats] = useState({
    // Arquero
    reach: 30,
    saves: 30,
    reflexes: 30,
    speed: 30,
    throw: 30,
    positioning: 30,
    // Jugador
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

  // Verificar si es menor de 15 años
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

      const result = await ImagePicker.launchImageLibraryAsync(); 

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

  // Step Indicator
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

  // STEP 1: Información Personal
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>👤 Información Personal</Text>
        <Text style={styles.stepSubtitle}>
          Cuéntanos sobre ti para crear tu perfil de jugador
        </Text>
      </View>

      {/* Foto de perfil */}
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

      {/* Información básica */}
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

        {/* Tipo de documento */}
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

  // STEP 2: Género, Fecha y Ubicación
  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>🌍 Datos Adicionales</Text>
        <Text style={styles.stepSubtitle}>
          Información sobre tu género, edad y ubicación
        </Text>
      </View>

      {/* Género */}
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

      {/* Fecha de nacimiento */}
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

        {/* Advertencia para menores */}
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

      {/* Ubicación */}
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

  // STEP 3: Nickname y Posición
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>⚽ Perfil Deportivo</Text>
        <Text style={styles.stepSubtitle}>
          Configura tu perfil de jugador y posiciones
        </Text>
      </View>

      {/* Nickname */}
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

      {/* Posición principal */}
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

      {/* Posiciones alternativas */}
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

  // STEP 4: Datos físicos
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

  // STEP 5: Autoevaluación
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

      {/* Resumen de stats */}
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

  const canContinue = () => {
    switch (currentStep) {
      case 1:
        return (
          watch("firstName") &&
          watch("lastName") &&
          watch("email") &&
          watch("phone")
        );
      case 2:
        return (
          watch("gender") &&
          watchedBirthDate &&
          watch("department") &&
          watch("city")
        );
      case 3:
        return watch("nickname") && watch("position");
      case 4:
        return watch("height") && watch("weight");
      case 5:
        return true;
      default:
        return false;
    }
  };

  const onSubmit = async (data: PlayerRegistrationForm) => {
    try {
      setIsLoading(true);

      const playerData: Partial<Player> = {
        ...data,
        userType: "player",
        profileImage,
        alternativePositions,
        stats:
          watchedPosition === "goalkeeper"
            ? {
                reach: stats.reach,
                saves: stats.saves,
                reflexes: stats.reflexes,
                speed: stats.speed,
                throw: stats.throw,
                positioning: stats.positioning,
              }
            : {
                pace: stats.pace,
                shooting: stats.shooting,
                passing: stats.passing,
                dribbling: stats.dribbling,
                defending: stats.defending,
                physical: stats.physical,
              },
        isUnderage,
        isForSponsored,
      };

      await updateUser(playerData);

      Alert.alert(
        "¡Bienvenido a TUNG! 🎉",
        "Tu perfil de jugador ha sido creado exitosamente. ¡Ya puedes empezar a buscar partidos!",
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
        "Hubo un problema al crear tu perfil. Intenta nuevamente.",
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
            <Text style={styles.title}>Perfil de Jugador</Text>
            <Text style={styles.subtitle}>Paso {currentStep} de 5</Text>
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
          {currentStep === 5 && renderStep5()}
        </ScrollView>

        {/* Footer */}
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

  // Step Indicator
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

  // Foto de perfil
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

  // Nombres
  nameRow: {
    flexDirection: "row",
    gap: 12,
  },
  nameInput: {
    flex: 1,
  },

  // Secciones
  section: {
    marginBottom: 24,
  },

  // Tipos de documento
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

  // Género
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

  // Fecha
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

  // Advertencia de menores
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

  // Ubicación
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

  // Posiciones
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

  // Posiciones alternativas
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

  // Físicos
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

  // Notificación importante
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

  // Stats mejorados
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

  // Resumen de stats
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
});

export default PlayerRegistrationScreen;
