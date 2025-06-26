import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import { Event, Host, EventStatus, FieldType } from "../../types";
import { Colors, Gradients } from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";
import CustomButton from "../../components/common/CustomButton";

const mockHostEvents: Event[] = [
  {
    id: "1",
    hostId: "1",
    host: {} as Host,
    fieldId: "1",
    field: {
      id: "1",
      name: "Cancha Principal",
      type: "futbol7",
      capacity: 14,
      pricePerHour: 50000,
      hasLighting: true,
      isIndoor: false,
      amenities: ["Baños", "Parqueadero", "Cafetería"],
      images: [],
      isActive: true,
    },
    title: "Fútbol 7 - Viernes en la tarde",
    description: "Partido amistoso, todos los niveles bienvenidos",
    date: "2025-06-14",
    startTime: "18:00",
    endTime: "19:30",
    duration: 90,
    maxPlayers: 14,
    currentPlayers: 8,
    pricePerPlayer: 7000,
    status: "open",
    participants: [],
    createdAt: "2025-06-14",
  },
  {
    id: "2",
    hostId: "1",
    host: {} as Host,
    fieldId: "2",
    field: {
      id: "2",
      name: "Cancha Secundaria",
      type: "futbol5",
      capacity: 10,
      pricePerHour: 40000,
      hasLighting: true,
      isIndoor: false,
      amenities: ["Baños", "Parqueadero"],
      images: [],
      isActive: true,
    },
    title: "Fútbol 5 - Sábado mañana",
    description: "Partido competitivo, nivel intermedio",
    date: "2025-06-15",
    startTime: "09:00",
    endTime: "10:00",
    duration: 60,
    maxPlayers: 10,
    currentPlayers: 10,
    pricePerPlayer: 8000,
    status: "full",
    participants: [],
    createdAt: "2025-06-14",
  },
  {
    id: "3",
    hostId: "1",
    host: {} as Host,
    fieldId: "1",
    field: {
      id: "1",
      name: "Cancha Principal",
      type: "futbol7",
      capacity: 14,
      pricePerHour: 50000,
      hasLighting: true,
      isIndoor: false,
      amenities: ["Baños", "Parqueadero", "Cafetería"],
      images: [],
      isActive: true,
    },
    title: "Fútbol 7 - Domingo tarde",
    description: "Partido familiar",
    date: "2025-06-13",
    startTime: "16:00",
    endTime: "17:30",
    duration: 90,
    maxPlayers: 14,
    currentPlayers: 14,
    pricePerPlayer: 7000,
    status: "completed",
    participants: [],
    createdAt: "2025-06-12",
  },
];

// Datos mock para disponibilidad de canchas
const generateFieldAvailability = (fieldId: string) => {
  const today = new Date();
  const availability = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    const daySchedule = {
      date: date.toISOString().split('T')[0],
      slots: [] as { time: string; isAvailable: boolean; price: number }[]
    };
    
    for (let hour = 6; hour <= 23; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      const isBooked = Math.random() > 0.7; 
      
      daySchedule.slots.push({
        time: timeSlot,
        isAvailable: !isBooked,
        price: hour >= 18 ? 60000 : 50000, 
      });
    }
    
    availability.push(daySchedule);
  }
  
  return availability;
};

const HostDashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"overview" | "events" | "fields">("overview");
  
  // Estados para crear evento
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerType, setTimePickerType] = useState<'start' | 'end'>('start');
  const [newEvent, setNewEvent] = useState({
    fieldId: '',
    title: '',
    description: '',
    date: new Date(),
    startTime: '',
    endTime: '',
    pricePerPlayer: 8000,
  });

  // Estados para disponibilidad
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [selectedFieldForAvailability, setSelectedFieldForAvailability] = useState<any>(null);
  const [fieldAvailability, setFieldAvailability] = useState<any[]>([]);

  // Estados para gestionar canchas
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [isEditingField, setIsEditingField] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [localFields, setLocalFields] = useState<any[]>([]);
  const [fieldForm, setFieldForm] = useState({
    name: '',
    type: 'futbol5' as FieldType,
    pricePerHour: 50000,
    hasLighting: false,
    isIndoor: false,
    amenities: [] as string[],
  });

  useEffect(() => {
    loadDashboardData();
    // Inicializar canchas locales con las del usuario
    const host = user as Host;
    if (host?.fields) {
      setLocalFields(host.fields);
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Simular carga de API
      setTimeout(() => {
        setEvents(mockHostEvents);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getStatusColor = (status: EventStatus): string => {
    switch (status) {
      case "open": return Colors.success;
      case "full": return Colors.warning;
      case "in_progress": return Colors.info;
      case "completed": return Colors.textMuted;
      case "cancelled": return Colors.error;
      default: return Colors.textMuted;
    }
  };

  const getStatusLabel = (status: EventStatus): string => {
    switch (status) {
      case "open": return "Abierto";
      case "full": return "Completo";
      case "in_progress": return "En progreso";
      case "completed": return "Finalizado";
      case "cancelled": return "Cancelado";
      default: return status;
    }
  };

  const getFieldTypeEmoji = (type: FieldType): string => {
    switch (type) {
      case "futbol5": return "⚽";
      case "futbol7": return "🥅";
      case "futbol11": return "🏟️";
      default: return "⚽";
    }
  };

  const getFieldTypeColor = (type: FieldType): string => {
    switch (type) {
      case "futbol5": return "#4CAF50";
      case "futbol7": return "#FF9800";
      case "futbol11": return "#2196F3";
      default: return Colors.primary;
    }
  };

  const availableAmenities = [
    "Parqueaderos", "Baños", "Vestier", "Cafetería", "WiFi", 
    "Iluminación extra", "Tribunas", "Duchas", "Tienda", "Bebidas"
  ];

  const getFieldCapacity = (type: FieldType): number => {
    switch (type) {
      case "futbol5": return 10;
      case "futbol7": return 14;
      case "futbol11": return 22;
      default: return 10;
    }
  };

  // Función para crear evento
  const handleCreateEvent = () => {
    if (!localFields || localFields.length === 0) {
      Alert.alert(
        "Sin canchas",
        "Primero debes agregar canchas a tu negocio para crear eventos.",
        [{ text: "OK" }]
      );
      return;
    }
    
    setNewEvent({
      fieldId: localFields[0].id, // Preseleccionar primera cancha
      title: '',
      description: '',
      date: new Date(),
      startTime: '',
      endTime: '',
      pricePerPlayer: 8000,
    });
    setShowCreateEventModal(true);
  };

  const handleSaveEvent = () => {
    if (!newEvent.title.trim() || !newEvent.startTime || !newEvent.endTime) {
      Alert.alert("Error", "Por favor completa todos los campos obligatorios.");
      return;
    }

    const selectedField = localFields?.find(f => f.id === newEvent.fieldId);
    
    if (!selectedField) {
      Alert.alert("Error", "Campo seleccionado no válido.");
      return;
    }

    const host = user as Host;
    const eventId = Date.now().toString();
    const newEventData: Event = {
      id: eventId,
      hostId: host.id || "1",
      host: host,
      fieldId: newEvent.fieldId,
      field: selectedField,
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date.toISOString().split('T')[0],
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      duration: 90, // Calcular duración
      maxPlayers: selectedField.capacity,
      currentPlayers: 0,
      pricePerPlayer: newEvent.pricePerPlayer,
      status: "open",
      participants: [],
      createdAt: new Date().toISOString(),
    };

    setEvents([newEventData, ...events]);
    setShowCreateEventModal(false);
    
    Alert.alert(
      "¡Evento creado! 🎉",
      `${newEvent.title} ha sido creado exitosamente.`,
      [{ text: "OK" }]
    );
  };

  const handleManageField = (fieldId?: string) => {
    if (fieldId) {
      // Editar cancha existente
      const field = localFields.find(f => f.id === fieldId);
      if (field) {
        setFieldForm({
          name: field.name,
          type: field.type,
          pricePerHour: field.pricePerHour,
          hasLighting: field.hasLighting,
          isIndoor: field.isIndoor,
          amenities: field.amenities || [],
        });
        setEditingFieldId(fieldId);
        setIsEditingField(true);
        setShowFieldModal(true);
      }
    } else {
      // Crear nueva cancha
      setFieldForm({
        name: '',
        type: 'futbol5',
        pricePerHour: 50000,
        hasLighting: false,
        isIndoor: false,
        amenities: [],
      });
      setIsEditingField(false);
      setEditingFieldId(null);
      setShowFieldModal(true);
    }
  };

  const handleSaveField = () => {
    if (!fieldForm.name.trim()) {
      Alert.alert("Error", "El nombre de la cancha es requerido.");
      return;
    }

    const fieldData = {
      id: isEditingField ? editingFieldId : Date.now().toString(),
      name: fieldForm.name,
      type: fieldForm.type,
      capacity: getFieldCapacity(fieldForm.type),
      pricePerHour: fieldForm.pricePerHour,
      hasLighting: fieldForm.hasLighting,
      isIndoor: fieldForm.isIndoor,
      amenities: fieldForm.amenities,
      images: [],
      isActive: true,
    };

    if (isEditingField) {
      setLocalFields(localFields.map(f => 
        f.id === editingFieldId ? fieldData : f
      ));
      Alert.alert("¡Actualizado!", "La cancha ha sido actualizada exitosamente.");
    } else {
      setLocalFields([...localFields, fieldData]);
      Alert.alert("¡Creada!", "La cancha ha sido creada exitosamente.");
    }

    setShowFieldModal(false);
  };

  const handleDeleteField = (fieldId: string) => {
    const field = localFields.find(f => f.id === fieldId);
    if (!field) return;

    Alert.alert(
      "Eliminar cancha",
      `¿Estás seguro de que quieres eliminar "${field.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            setLocalFields(localFields.filter(f => f.id !== fieldId));
            Alert.alert("Eliminada", "La cancha ha sido eliminada.");
          },
        },
      ]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setFieldForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleShowAvailability = (field: any) => {
    setSelectedFieldForAvailability(field);
    setFieldAvailability(generateFieldAvailability(field.id));
    setShowAvailabilityModal(true);
  };

  const handleEventAction = (eventId: string, action: "edit" | "cancel" | "view") => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    switch (action) {
      case "edit":
        Alert.alert("Editar Evento", `Editar: ${event.title}`);
        break;
      case "cancel":
        Alert.alert(
          "Cancelar Evento",
          `¿Estás seguro de que quieres cancelar "${event.title}"?`,
          [
            { text: "No", style: "cancel" },
            {
              text: "Sí, cancelar",
              style: "destructive",
              onPress: () => {
                setEvents(
                  events.map((e) =>
                    e.id === eventId
                      ? { ...e, status: "cancelled" as EventStatus }
                      : e
                  )
                );
              },
            },
          ]
        );
        break;
      case "view":
        Alert.alert("Ver Evento", `Ver detalles de: ${event.title}`);
        break;
    }
  };

  const renderOverview = () => {
    const totalEvents = events.length;
    const activeEvents = events.filter(
      (e) => e.status === "open" || e.status === "full"
    ).length;
    const totalRevenue = events
      .filter((e) => e.status === "completed")
      .reduce((sum, e) => sum + e.pricePerPlayer * e.currentPlayers, 0);
    const totalPlayers = events.reduce((sum, e) => sum + e.currentPlayers, 0);

    return (
      <View style={styles.overviewContainer}>
        {/* Stats Cards mejoradas */}
        <View style={styles.statsGrid}>
          <LinearGradient
            colors={["#4CAF50", "#81C784"]}
            style={[styles.statCard, styles.gradientCard]}
          >
            <Ionicons name="calendar" size={28} color="white" />
            <Text style={styles.statValueWhite}>{activeEvents}</Text>
            <Text style={styles.statLabelWhite}>Eventos activos</Text>
          </LinearGradient>

          <LinearGradient
            colors={["#2196F3", "#64B5F6"]}
            style={[styles.statCard, styles.gradientCard]}
          >
            <Ionicons name="people" size={28} color="white" />
            <Text style={styles.statValueWhite}>{totalPlayers}</Text>
            <Text style={styles.statLabelWhite}>Total jugadores</Text>
          </LinearGradient>

          <LinearGradient
            colors={["#FF9800", "#FFB74D"]}
            style={[styles.statCard, styles.gradientCard]}
          >
            <Ionicons name="cash" size={28} color="white" />
            <Text style={styles.statValueWhite}>
              ${(totalRevenue / 1000).toFixed(0)}K
            </Text>
            <Text style={styles.statLabelWhite}>Ingresos este mes</Text>
          </LinearGradient>

          <LinearGradient
            colors={["#9C27B0", "#BA68C8"]}
            style={[styles.statCard, styles.gradientCard]}
          >
            <Ionicons name="star" size={28} color="white" />
            <Text style={styles.statValueWhite}>
              {(user as Host)?.rating?.toFixed(1) || "4.5"}
            </Text>
            <Text style={styles.statLabelWhite}>Calificación</Text>
          </LinearGradient>
        </View>

        {/* Quick Actions mejoradas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Acciones rápidas</Text>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={handleCreateEvent}
            >
              <LinearGradient
                colors={[Colors.primary, "#4CAF50"]}
                style={styles.quickActionGradient}
              >
                <Ionicons name="add-circle" size={32} color="white" />
                <Text style={styles.quickActionTitle}>Crear evento</Text>
                <Text style={styles.quickActionSubtitle}>Nuevo partido</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleManageField()}
            >
              <LinearGradient
                colors={["#2196F3", "#64B5F6"]}
                style={styles.quickActionGradient}
              >
                <Ionicons name="settings" size={32} color="white" />
                <Text style={styles.quickActionTitle}>Gestionar</Text>
                <Text style={styles.quickActionSubtitle}>Tus canchas</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📅 Eventos recientes</Text>
            <TouchableOpacity onPress={() => setSelectedTab("events")}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recentEvents}>
            {events.slice(0, 3).map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.recentEventCard}
                onPress={() => handleEventAction(event.id, "view")}
              >
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventField}>{event.field.name}</Text>
                  <Text style={styles.eventTime}>
                    {event.startTime} - {event.endTime}
                  </Text>
                </View>

                <View style={styles.eventMeta}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(event.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getStatusLabel(event.status)}
                    </Text>
                  </View>
                  <Text style={styles.eventPlayers}>
                    {event.currentPlayers}/{event.maxPlayers}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderEvents = () => (
    <View style={styles.eventsContainer}>
      <View style={styles.eventsHeader}>
        <CustomButton
          title="Crear evento"
          icon="add"
          onPress={handleCreateEvent}
          size="small"
        />
      </View>

      <View style={styles.eventsList}>
        {events.map((event) => (
          <View key={event.id} style={styles.eventCard}>
            <View style={styles.eventCardHeader}>
              <View style={styles.eventCardInfo}>
                <Text style={styles.eventCardTitle}>{event.title}</Text>
                <Text style={styles.eventCardField}>{event.field.name}</Text>
                <Text style={styles.eventCardDate}>
                  {new Date(event.date).toLocaleDateString("es-ES", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  • {event.startTime} - {event.endTime}
                </Text>
              </View>

              <View style={styles.eventCardMeta}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(event.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusLabel(event.status)}
                  </Text>
                </View>
                <Text style={styles.eventCardPlayers}>
                  {event.currentPlayers}/{event.maxPlayers} jugadores
                </Text>
                <Text style={styles.eventCardRevenue}>
                  $
                  {(
                    event.pricePerPlayer * event.currentPlayers
                  ).toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.eventCardActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEventAction(event.id, "view")}
              >
                <Ionicons name="eye-outline" size={16} color={Colors.primary} />
                <Text style={styles.actionButtonText}>Ver</Text>
              </TouchableOpacity>

              {event.status === "open" && (
                <>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEventAction(event.id, "edit")}
                  >
                    <Ionicons
                      name="pencil-outline"
                      size={16}
                      color={Colors.primary}
                    />
                    <Text style={styles.actionButtonText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => handleEventAction(event.id, "cancel")}
                  >
                    <Ionicons
                      name="close-outline"
                      size={16}
                      color={Colors.error}
                    />
                    <Text
                      style={[styles.actionButtonText, { color: Colors.error }]}
                    >
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderFields = () => {
    const fields = localFields || [];

    return (
      <View style={styles.fieldsContainer}>
        <View style={styles.fieldsHeader}>
          <CustomButton
            title="Agregar cancha"
            icon="add"
            onPress={() => handleManageField()}
            size="small"
          />
        </View>

        {fields.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="football-outline" size={64} color={Colors.textMuted} />
            <Text style={styles.emptyStateTitle}>Sin canchas configuradas</Text>
            <Text style={styles.emptyStateText}>
              Agrega tus primeras canchas para empezar a crear eventos
            </Text>
            <CustomButton
              title="Agregar primera cancha"
              onPress={() => handleManageField()}
              icon="add"
            />
          </View>
        ) : (
          <View style={styles.fieldsList}>
            {fields.map((field) => (
              <View key={field.id} style={styles.fieldCardImproved}>
                <LinearGradient
                  colors={[getFieldTypeColor(field.type), getFieldTypeColor(field.type) + '80']}
                  style={styles.fieldCardHeader}
                >
                  <View style={styles.fieldHeaderLeft}>
                    <Text style={styles.fieldTypeEmoji}>
                      {getFieldTypeEmoji(field.type)}
                    </Text>
                    <View>
                      <Text style={styles.fieldCardNameWhite}>{field.name}</Text>
                      <Text style={styles.fieldCardTypeWhite}>
                        {field.type.replace("futbol", "Fútbol ")} • {field.capacity} jugadores
                      </Text>
                    </View>
                  </View>
                  <View style={styles.fieldHeaderRight}>
                    <TouchableOpacity
                      style={styles.fieldStatusButton}
                      onPress={() => handleShowAvailability(field)}
                    >
                      <Ionicons name="calendar-outline" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.fieldStatusButton, { backgroundColor: "rgba(244, 67, 54, 0.3)" }]}
                      onPress={() => handleDeleteField(field.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="white" />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>

                <View style={styles.fieldCardBody}>
                  <View style={styles.fieldCardDetails}>
                    <View style={styles.fieldDetail}>
                      <Ionicons
                        name="cash-outline"
                        size={18}
                        color={Colors.success}
                      />
                      <Text style={styles.fieldDetailText}>
                        ${field.pricePerHour.toLocaleString()}/hora
                      </Text>
                    </View>

                    <View style={styles.fieldDetail}>
                      <Ionicons
                        name="time-outline"
                        size={18}
                        color={Colors.info}
                      />
                      <Text style={styles.fieldDetailText}>
                        Disponible hoy
                      </Text>
                    </View>
                  </View>

                  <View style={styles.fieldFeatures}>
                    {field.hasLighting && (
                      <View style={styles.featureBadge}>
                        <Ionicons
                          name="bulb"
                          size={12}
                          color={Colors.warning}
                        />
                        <Text style={styles.featureText}>Iluminación</Text>
                      </View>
                    )}
                    {field.isIndoor && (
                      <View style={styles.featureBadge}>
                        <Ionicons
                          name="home"
                          size={12}
                          color={Colors.info}
                        />
                        <Text style={styles.featureText}>Techada</Text>
                      </View>
                    )}
                    {field.amenities && field.amenities.length > 0 && (
                      <View style={styles.featureBadge}>
                        <Ionicons
                          name="checkmark-circle"
                          size={12}
                          color={Colors.success}
                        />
                        <Text style={styles.featureText}>
                          +{field.amenities.length} servicios
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.fieldCardActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleShowAvailability(field)}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color={Colors.primary}
                      />
                      <Text style={styles.actionButtonText}>Disponibilidad</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleManageField(field.id)}
                    >
                      <Ionicons
                        name="settings-outline"
                        size={16}
                        color={Colors.primary}
                      />
                      <Text style={styles.actionButtonText}>Configurar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => Alert.alert("Estadísticas", `Ver estadísticas de ${field.name}`)}
                    >
                      <Ionicons
                        name="bar-chart-outline"
                        size={16}
                        color={Colors.primary}
                      />
                      <Text style={styles.actionButtonText}>Stats</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const TabButton: React.FC<{
    title: string;
    icon: string;
    active: boolean;
    onPress: () => void;
  }> = ({ title, icon, active, onPress }) => (
    <TouchableOpacity
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={active ? Colors.primary : Colors.textMuted}
      />
      <Text
        style={[styles.tabButtonText, active && styles.tabButtonTextActive]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (!user || user.userType !== "host") {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={Colors.background}
        />
        <View style={styles.errorContainer}>
          <Text>Esta pantalla es solo para anfitriones</Text>
        </View>
      </SafeAreaView>
    );
  }

  const host = user as Host;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <LinearGradient
        colors={Gradients.primary}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Mi Negocio</Text>
            <Text style={styles.headerSubtitle}>
              {host.businessName}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.notificationButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={Colors.textLight}
            />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TabButton
          title="Resumen"
          icon="apps-outline"
          active={selectedTab === "overview"}
          onPress={() => setSelectedTab("overview")}
        />
        <TabButton
          title="Eventos"
          icon="calendar-outline"
          active={selectedTab === "events"}
          onPress={() => setSelectedTab("events")}
        />
        <TabButton
          title="Canchas"
          icon="football-outline"
          active={selectedTab === "fields"}
          onPress={() => setSelectedTab("fields")}
        />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {selectedTab === "overview" && renderOverview()}
        {selectedTab === "events" && renderEvents()}
        {selectedTab === "fields" && renderFields()}
      </ScrollView>

      {/* Modal Crear Evento */}
      <Modal
        visible={showCreateEventModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateEventModal(false)}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Crear evento</Text>
            <TouchableOpacity onPress={handleSaveEvent}>
              <Text style={styles.saveButton}>Guardar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Cancha *</Text>
              <View style={styles.fieldSelector}>
                {localFields?.map((field) => (
                  <TouchableOpacity
                    key={field.id}
                    style={[
                      styles.fieldOption,
                      newEvent.fieldId === field.id && styles.fieldOptionSelected
                    ]}
                    onPress={() => setNewEvent({...newEvent, fieldId: field.id})}
                  >
                    <Text style={styles.fieldOptionEmoji}>
                      {getFieldTypeEmoji(field.type)}
                    </Text>
                    <Text style={styles.fieldOptionName}>{field.name}</Text>
                    <Text style={styles.fieldOptionType}>
                      {field.type.replace("futbol", "F")} • {field.capacity}p
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Título del evento *</Text>
              <TextInput
                style={styles.textInput}
                value={newEvent.title}
                onChangeText={(text) => setNewEvent({...newEvent, title: text})}
                placeholder="Ej: Fútbol 7 - Viernes en la tarde"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Descripción</Text>
              <TextInput
                style={[styles.textInput, styles.textAreaInput]}
                value={newEvent.description}
                onChangeText={(text) => setNewEvent({...newEvent, description: text})}
                placeholder="Describe el tipo de partido, nivel, etc..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Fecha *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                <Text style={styles.dateButtonText}>
                  {newEvent.date.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timeRow}>
              <View style={styles.timeGroup}>
                <Text style={styles.formLabel}>Hora inicio *</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => {
                    setTimePickerType('start');
                    setShowTimePicker(true);
                  }}
                >
                  <Ionicons name="time-outline" size={18} color={Colors.primary} />
                  <Text style={styles.timeButtonText}>
                    {newEvent.startTime || "Seleccionar"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.timeGroup}>
                <Text style={styles.formLabel}>Hora fin *</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => {
                    setTimePickerType('end');
                    setShowTimePicker(true);
                  }}
                >
                  <Ionicons name="time-outline" size={18} color={Colors.primary} />
                  <Text style={styles.timeButtonText}>
                    {newEvent.endTime || "Seleccionar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Precio por jugador (COP)</Text>
              <TextInput
                style={styles.textInput}
                value={newEvent.pricePerPlayer.toString()}
                onChangeText={(text) => setNewEvent({...newEvent, pricePerPlayer: parseInt(text) || 0})}
                placeholder="8000"
                keyboardType="numeric"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Modal Disponibilidad */}
      <Modal
        visible={showAvailabilityModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAvailabilityModal(false)}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Disponibilidad - {selectedFieldForAvailability?.name}
            </Text>
            <View />
          </View>

          <ScrollView style={styles.modalContent}>
            {fieldAvailability.map((day, dayIndex) => (
              <View key={dayIndex} style={styles.dayAvailability}>
                <Text style={styles.dayTitle}>
                  {new Date(day.date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short'
                  })}
                </Text>
                <View style={styles.slotsGrid}>
                  {day.slots.map((slot: any, slotIndex: number) => (
                    <View
                      key={slotIndex}
                      style={[
                        styles.timeSlot,
                        slot.isAvailable ? styles.timeSlotAvailable : styles.timeSlotBooked
                      ]}
                    >
                      <Text style={[
                        styles.timeSlotText,
                        !slot.isAvailable && styles.timeSlotTextBooked
                      ]}>
                        {slot.time}
                      </Text>
                      {slot.isAvailable && (
                        <Text style={styles.timeSlotPrice}>
                          ${(slot.price / 1000).toFixed(0)}k
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Modal Gestionar Cancha */}
      <Modal
        visible={showFieldModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFieldModal(false)}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {isEditingField ? "Editar cancha" : "Agregar cancha"}
            </Text>
            <TouchableOpacity onPress={handleSaveField}>
              <Text style={styles.saveButton}>Guardar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nombre de la cancha *</Text>
              <TextInput
                style={styles.textInput}
                value={fieldForm.name}
                onChangeText={(text) => setFieldForm({...fieldForm, name: text})}
                placeholder="Ej: Cancha Principal"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tipo de cancha *</Text>
              <View style={styles.fieldTypeSelector}>
                {[
                  { value: "futbol5", label: "Fútbol 5", emoji: "⚽", players: 10 },
                  { value: "futbol7", label: "Fútbol 7", emoji: "🥅", players: 14 },
                  { value: "futbol11", label: "Fútbol 11", emoji: "🏟️", players: 22 },
                ].map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.fieldTypeOption,
                      fieldForm.type === type.value && styles.fieldTypeOptionSelected
                    ]}
                    onPress={() => setFieldForm({...fieldForm, type: type.value as FieldType})}
                  >
                    <Text style={styles.fieldTypeOptionEmoji}>{type.emoji}</Text>
                    <View style={styles.fieldTypeOptionInfo}>
                      <Text style={[
                        styles.fieldTypeOptionName,
                        fieldForm.type === type.value && styles.fieldTypeOptionNameSelected
                      ]}>
                        {type.label}
                      </Text>
                      <Text style={styles.fieldTypeOptionPlayers}>
                        {type.players} jugadores
                      </Text>
                    </View>
                    {fieldForm.type === type.value && (
                      <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Precio por hora (COP)</Text>
              <TextInput
                style={styles.textInput}
                value={fieldForm.pricePerHour.toString()}
                onChangeText={(text) => setFieldForm({...fieldForm, pricePerHour: parseInt(text) || 0})}
                placeholder="50000"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Características</Text>
              <View style={styles.characteristicsContainer}>
                <TouchableOpacity
                  style={[
                    styles.characteristicCard,
                    fieldForm.hasLighting && styles.characteristicCardActive
                  ]}
                  onPress={() => setFieldForm({...fieldForm, hasLighting: !fieldForm.hasLighting})}
                >
                  <View style={[
                    styles.characteristicIcon,
                    fieldForm.hasLighting && styles.characteristicIconActive
                  ]}>
                    <Ionicons 
                      name={fieldForm.hasLighting ? "bulb" : "bulb-outline"} 
                      size={24} 
                      color={fieldForm.hasLighting ? "white" : Colors.textMuted} 
                    />
                  </View>
                  <Text style={[
                    styles.characteristicText,
                    fieldForm.hasLighting && styles.characteristicTextActive
                  ]}>
                    Iluminación
                  </Text>
                  <Text style={[
                    styles.characteristicStatus,
                    fieldForm.hasLighting && styles.characteristicStatusActive
                  ]}>
                    {fieldForm.hasLighting ? "SÍ" : "NO"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.characteristicCard,
                    fieldForm.isIndoor && styles.characteristicCardActive
                  ]}
                  onPress={() => setFieldForm({...fieldForm, isIndoor: !fieldForm.isIndoor})}
                >
                  <View style={[
                    styles.characteristicIcon,
                    fieldForm.isIndoor && styles.characteristicIconActive
                  ]}>
                    <Ionicons 
                      name={fieldForm.isIndoor ? "home" : "home-outline"} 
                      size={24} 
                      color={fieldForm.isIndoor ? "white" : Colors.textMuted} 
                    />
                  </View>
                  <Text style={[
                    styles.characteristicText,
                    fieldForm.isIndoor && styles.characteristicTextActive
                  ]}>
                    Cancha techada
                  </Text>
                  <Text style={[
                    styles.characteristicStatus,
                    fieldForm.isIndoor && styles.characteristicStatusActive
                  ]}>
                    {fieldForm.isIndoor ? "SÍ" : "NO"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Servicios adicionales</Text>
              <Text style={styles.formSubLabel}>
                Selecciona los servicios disponibles en esta cancha
              </Text>
              <View style={styles.amenitiesContainer}>
                {availableAmenities.map((amenity) => (
                  <TouchableOpacity
                    key={amenity}
                    style={[
                      styles.amenityChip,
                      fieldForm.amenities.includes(amenity) && styles.amenityChipSelected
                    ]}
                    onPress={() => toggleAmenity(amenity)}
                  >
                    <Text style={[
                      styles.amenityChipText,
                      fieldForm.amenities.includes(amenity) && styles.amenityChipTextSelected
                    ]}>
                      {amenity}
                    </Text>
                    {fieldForm.amenities.includes(amenity) && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>Vista previa</Text>
                <View style={styles.previewContent}>
                  <Text style={styles.previewEmoji}>
                    {getFieldTypeEmoji(fieldForm.type)}
                  </Text>
                  <View style={styles.previewInfo}>
                    <Text style={styles.previewName}>
                      {fieldForm.name || "Nombre de la cancha"}
                    </Text>
                    <Text style={styles.previewDetails}>
                      {fieldForm.type.replace("futbol", "Fútbol ")} • {getFieldCapacity(fieldForm.type)} jugadores
                    </Text>
                    <Text style={styles.previewPrice}>
                      ${fieldForm.pricePerHour.toLocaleString()}/hora
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Date/Time Pickers */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={(date) => {
          setNewEvent({...newEvent, date});
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
        minimumDate={new Date()}
      />

      <DateTimePickerModal
        isVisible={showTimePicker}
        mode="time"
        onConfirm={(time) => {
          const timeString = time.toTimeString().slice(0, 5);
          if (timePickerType === 'start') {
            setNewEvent({...newEvent, startTime: timeString});
          } else {
            setNewEvent({...newEvent, endTime: timeString});
          }
          setShowTimePicker(false);
        }}
        onCancel={() => setShowTimePicker(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: 35,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.textLight,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    opacity: 0.9,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: Colors.primaryLight,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textMuted,
  },
  tabButtonTextActive: {
    color: Colors.primary,
  },
  content: {
    flex: 1,
  },
  overviewContainer: {
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: "47%",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gradientCard: {
    borderWidth: 0,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  statValueWhite: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  statLabelWhite: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  quickActionGradient: {
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  quickActionButton: {
    flex: 1,
  },
  recentEvents: {
    gap: 12,
  },
  recentEventCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  eventField: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  eventMeta: {
    alignItems: "flex-end",
    gap: 8,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textLight,
  },
  eventPlayers: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  eventsContainer: {
    paddingHorizontal: 20,
  },
  eventsHeader: {
    marginBottom: 20,
    alignItems: "flex-end",
  },
  eventsList: {
    gap: 16,
    paddingBottom: 10,
  },
  eventCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  eventCardInfo: {
    flex: 1,
  },
  eventCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  eventCardField: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 4,
  },
  eventCardDate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  eventCardMeta: {
    alignItems: "flex-end",
    gap: 8,
  },
  eventCardPlayers: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  eventCardRevenue: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.success,
  },
  eventCardActions: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  cancelButton: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.primary,
  },
  fieldsContainer: {
    paddingHorizontal: 20,
  },
  fieldsHeader: {
    marginBottom: 20,
    alignItems: "flex-end",
  },
  fieldsList: {
    gap: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  fieldCardImproved: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fieldCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  fieldHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fieldTypeEmoji: {
    fontSize: 24,
  },
  fieldCardNameWhite: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  fieldCardTypeWhite: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  fieldHeaderRight: {
    flexDirection: "row",
    gap: 8,
  },
  fieldStatusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  fieldCardBody: {
    padding: 16,
  },
  fieldCardDetails: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  fieldDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  fieldDetailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  fieldFeatures: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  featureBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  featureText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  fieldCardActions: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: Colors.surface,
  },
  textAreaInput: {
    height: 80,
    textAlignVertical: "top",
  },
  fieldSelector: {
    gap: 8,
  },
  fieldOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  fieldOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  fieldOptionEmoji: {
    fontSize: 24,
  },
  fieldOptionName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    flex: 1,
  },
  fieldOptionType: {
    fontSize: 12,
    color: Colors.textSecondary,
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
    textTransform: "capitalize",
  },
  timeRow: {
    flexDirection: "row",
    gap: 12,
  },
  timeGroup: {
    flex: 1,
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  timeButtonText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },

  // Availability modal
  dayAvailability: {
    marginBottom: 24,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 12,
    textTransform: "capitalize",
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  timeSlot: {
    width: "23%",
    aspectRatio: 1,
    borderRadius: 8,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  timeSlotAvailable: {
    backgroundColor: Colors.success,
  },
  timeSlotBooked: {
    backgroundColor: Colors.border,
  },
  timeSlotText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
  timeSlotTextBooked: {
    color: Colors.textMuted,
  },
  timeSlotPrice: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.8)",
  },

  // Field modal styles
  fieldTypeSelector: {
    gap: 12,
  },
  fieldTypeOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  fieldTypeOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  fieldTypeOptionEmoji: {
    fontSize: 24,
  },
  fieldTypeOptionInfo: {
    flex: 1,
  },
  fieldTypeOptionName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  fieldTypeOptionNameSelected: {
    color: Colors.primary,
  },
  fieldTypeOptionPlayers: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  characteristicsContainer: {
    gap: 12,
  },
  characteristicCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  characteristicCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  characteristicIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  characteristicIconActive: {
    backgroundColor: Colors.primary,
  },
  characteristicText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  characteristicTextActive: {
    color: Colors.primary,
  },
  characteristicStatus: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.textMuted,
    backgroundColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  characteristicStatusActive: {
    color: "white",
    backgroundColor: Colors.primary,
  },
  formSubLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  amenityChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  amenityChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  amenityChipText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  amenityChipTextSelected: {
    color: "white",
  },
  previewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  previewContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  previewEmoji: {
    fontSize: 32,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  previewDetails: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  previewPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.success,
  },
});

export default HostDashboardScreen;