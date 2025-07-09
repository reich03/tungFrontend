import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Colors, Gradients } from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";
import { Event, EventStatus, FieldType } from "../../types";

const mockEvents: Event[] = [
  {
    id: "1",
    hostId: "1",
    host: {
      id: "1",
      email: "carlos@canchasexpress.com",
      fullName: "Carlos Canchas",
      phone: "+57 301 555 1111",
      userType: "host",
      isActive: true,
      createdAt: "2025-01-15",
      businessName: "Canchas Express",
      address: "Cra 15 #22-33",
      coordinates: { latitude: 4.1, longitude: -73.6 },
      description: "Canchas de fútbol sintético techadas",
      fields: [],
      rating: 4.5,
      totalReviews: 12,
      businessHours: {},
      contactInfo: {},
      documentoIdentidad: "12345678",
      rolId: "host-role",
      rolNombre: "ANFITRION",
    },
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
    date: "2025-06-28",
    startTime: "18:00",
    endTime: "19:30",
    duration: 90,
    maxPlayers: 14,
    currentPlayers: 8,
    pricePerPlayer: 7000,
    status: "open",
    participants: [],
    createdAt: "2025-06-27",
  },
  {
    id: "2",
    hostId: "2",
    host: {
      id: "2",
      email: "info@deportesvilla.com",
      fullName: "Deportes Villa",
      phone: "+57 310 444 5555",
      userType: "host",
      isActive: true,
      createdAt: "2025-02-28",
      businessName: "Deportes Villa",
      address: "Calle 20 #15-45",
      coordinates: { latitude: 4.2, longitude: -73.5 },
      description: "Complejo deportivo con múltiples canchas",
      fields: [],
      rating: 4.2,
      totalReviews: 8,
      businessHours: {},
      contactInfo: {},
      documentoIdentidad: "33333333",
      rolId: "host-role",
      rolNombre: "ANFITRION",
    },
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
    date: "2025-06-29",
    startTime: "09:00",
    endTime: "10:00",
    duration: 60,
    maxPlayers: 10,
    currentPlayers: 10,
    pricePerPlayer: 8000,
    status: "full",
    participants: [],
    createdAt: "2025-06-26",
  },
  {
    id: "3",
    hostId: "1",
    host: {
      id: "1",
      email: "carlos@canchasexpress.com",
      fullName: "Carlos Canchas",
      phone: "+57 301 555 1111",
      userType: "host",
      isActive: true,
      createdAt: "2025-01-15",
      businessName: "Canchas Express",
      address: "Cra 15 #22-33",
      coordinates: { latitude: 4.1, longitude: -73.6 },
      description: "Canchas de fútbol sintético techadas",
      fields: [],
      rating: 4.5,
      totalReviews: 12,
      businessHours: {},
      contactInfo: {},
      documentoIdentidad: "12345678",
      rolId: "host-role",
      rolNombre: "ANFITRION",
    },
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
    date: "2025-06-25",
    startTime: "16:00",
    endTime: "17:30",
    duration: 90,
    maxPlayers: 14,
    currentPlayers: 14,
    pricePerPlayer: 7000,
    status: "completed",
    participants: [],
    createdAt: "2025-06-24",
  },
  {
    id: "4",
    hostId: "2",
    host: {
      id: "2",
      email: "info@deportesvilla.com",
      fullName: "Deportes Villa",
      phone: "+57 310 444 5555",
      userType: "host",
      isActive: true,
      createdAt: "2025-02-28",
      businessName: "Deportes Villa",
      address: "Calle 20 #15-45",
      coordinates: { latitude: 4.2, longitude: -73.5 },
      description: "Complejo deportivo con múltiples canchas",
      fields: [],
      rating: 4.2,
      totalReviews: 8,
      businessHours: {},
      contactInfo: {},
      documentoIdentidad: "33333333",
      rolId: "host-role",
      rolNombre: "ANFITRION",
    },
    fieldId: "3",
    field: {
      id: "3",
      name: "Cancha Norte",
      type: "futbol11",
      capacity: 22,
      pricePerHour: 80000,
      hasLighting: true,
      isIndoor: false,
      amenities: ["Baños", "Vestidores", "Tribunas"],
      images: [],
      isActive: true,
    },
    title: "Fútbol 11 - Torneo Regional",
    description: "Partido de torneo, equipos registrados",
    date: "2025-06-30",
    startTime: "15:00",
    endTime: "17:00",
    duration: 120,
    maxPlayers: 22,
    currentPlayers: 22,
    pricePerPlayer: 12000,
    status: "in_progress",
    participants: [],
    createdAt: "2025-06-20",
  },
];

const AdminEventsScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<"all" | EventStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, selectedFilter, searchQuery]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        setEvents(mockEvents);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error loading events:", error);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const filterEvents = () => {
    let filtered = events;

    if (selectedFilter !== "all") {
      filtered = filtered.filter(e => e.status === selectedFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(query) ||
        e.host.businessName.toLowerCase().includes(query) ||
        e.field.name.toLowerCase().includes(query) ||
        e.description?.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredEvents(filtered);
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

  const handleEventAction = (eventId: string, action: "view" | "approve" | "cancel" | "edit" | "delete") => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    switch (action) {
      case "view":
        setSelectedEvent(event);
        setShowEventModal(true);
        break;
      case "approve":
        Alert.alert(
          "Aprobar Evento",
          `¿Aprobar el evento "${event.title}"?`,
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Aprobar",
              onPress: () => {
                Alert.alert("Aprobado", "El evento ha sido aprobado");
              },
            },
          ]
        );
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
                setEvents(events.map(e =>
                  e.id === eventId
                    ? { ...e, status: "cancelled" as EventStatus }
                    : e
                ));
                Alert.alert("Cancelado", "El evento ha sido cancelado");
              },
            },
          ]
        );
        break;
      case "edit":
        Alert.alert("Editar Evento", `Editar: ${event.title}`);
        break;
      case "delete":
        Alert.alert(
          "Eliminar Evento",
          `¿Estás seguro de que quieres eliminar permanentemente "${event.title}"?`,
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Eliminar",
              style: "destructive",
              onPress: () => {
                setEvents(events.filter(e => e.id !== eventId));
                Alert.alert("Eliminado", "El evento ha sido eliminado permanentemente");
              },
            },
          ]
        );
        break;
    }
  };

  const renderStatsCards = () => {
    const totalEvents = events.length;
    const activeEvents = events.filter(e => e.status === "open" || e.status === "full").length;
    const completedEvents = events.filter(e => e.status === "completed").length;
    const totalRevenue = events
      .filter(e => e.status === "completed")
      .reduce((sum, e) => sum + (e.pricePerPlayer * e.currentPlayers), 0);

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={24} color={Colors.primary} />
          <Text style={styles.statValue}>{totalEvents}</Text>
          <Text style={styles.statLabel}>Total eventos</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="flash" size={24} color={Colors.success} />
          <Text style={styles.statValue}>{activeEvents}</Text>
          <Text style={styles.statLabel}>Activos</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color={Colors.info} />
          <Text style={styles.statValue}>{completedEvents}</Text>
          <Text style={styles.statLabel}>Completados</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="cash" size={24} color={Colors.warning} />
          <Text style={styles.statValue}>${(totalRevenue / 1000).toFixed(0)}K</Text>
          <Text style={styles.statLabel}>Ingresos</Text>
        </View>
      </View>
    );
  };

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar eventos..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterTabs}
        contentContainerStyle={styles.filterTabsContent}
      >
        {[
          { key: "all", label: "Todos", count: events.length },
          { key: "open", label: "Abiertos", count: events.filter(e => e.status === "open").length },
          { key: "full", label: "Completos", count: events.filter(e => e.status === "full").length },
          { key: "in_progress", label: "En curso", count: events.filter(e => e.status === "in_progress").length },
          { key: "completed", label: "Finalizados", count: events.filter(e => e.status === "completed").length },
          { key: "cancelled", label: "Cancelados", count: events.filter(e => e.status === "cancelled").length },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              selectedFilter === filter.key && styles.filterTabActive
            ]}
            onPress={() => setSelectedFilter(filter.key as any)}
          >
            <Text style={[
              styles.filterTabText,
              selectedFilter === filter.key && styles.filterTabTextActive
            ]}>
              {filter.label}
            </Text>
            <View style={[
              styles.filterTabBadge,
              selectedFilter === filter.key && styles.filterTabBadgeActive
            ]}>
              <Text style={[
                styles.filterTabBadgeText,
                selectedFilter === filter.key && styles.filterTabBadgeTextActive
              ]}>
                {filter.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderEventsList = () => (
    <View style={styles.eventsList}>
      {filteredEvents.map((event) => (
        <TouchableOpacity
          key={event.id}
          style={styles.eventCard}
          onPress={() => handleEventAction(event.id, "view")}
        >
          <View style={styles.eventCardHeader}>
            <View style={styles.eventInfo}>
              <View style={styles.eventTitleRow}>
                <Text style={styles.fieldTypeEmoji}>
                  {getFieldTypeEmoji(event.field.type)}
                </Text>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(event.status) }
                ]}>
                  <Text style={styles.statusText}>
                    {getStatusLabel(event.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.eventDetails}>
                <View style={styles.eventDetailItem}>
                  <Ionicons name="business-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.eventDetailText}>{event.host.businessName}</Text>
                </View>
                <View style={styles.eventDetailItem}>
                  <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.eventDetailText}>{event.field.name}</Text>
                </View>
              </View>

              <View style={styles.eventMeta}>
                <View style={styles.eventMetaItem}>
                  <Ionicons name="calendar-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.eventMetaText}>
                    {new Date(event.date).toLocaleDateString('es-ES', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </Text>
                </View>
                <View style={styles.eventMetaItem}>
                  <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.eventMetaText}>
                    {event.startTime} - {event.endTime}
                  </Text>
                </View>
                <View style={styles.eventMetaItem}>
                  <Ionicons name="people-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.eventMetaText}>
                    {event.currentPlayers}/{event.maxPlayers}
                  </Text>
                </View>
                <View style={styles.eventMetaItem}>
                  <Ionicons name="cash-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.eventMetaText}>
                    ${event.pricePerPlayer.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.moreButton}
              onPress={() => {
                Alert.alert(
                  "Acciones del Evento",
                  `¿Qué acción deseas realizar con "${event.title}"?`,
                  [
                    { text: "Ver detalles", onPress: () => handleEventAction(event.id, "view") },
                    { text: "Editar", onPress: () => handleEventAction(event.id, "edit") },
                    ...(event.status === "open" ? [{
                      text: "Cancelar evento",
                      style: "destructive" as const,
                      onPress: () => handleEventAction(event.id, "cancel")
                    }] : []),
                    {
                      text: "Eliminar",
                      style: "destructive" as const,
                      onPress: () => handleEventAction(event.id, "delete")
                    },
                    { text: "Cerrar", style: "cancel" },
                  ]
                );
              }}
            >
              <Ionicons name="ellipsis-vertical" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}

      {filteredEvents.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyStateTitle}>No se encontraron eventos</Text>
          <Text style={styles.emptyStateText}>
            {searchQuery 
              ? `No hay eventos que coincidan con "${searchQuery}"`
              : "No hay eventos para mostrar"
            }
          </Text>
        </View>
      )}
    </View>
  );

  const renderEventModal = () => (
    <Modal
      visible={showEventModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowEventModal(false)}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Detalles del Evento</Text>
          <TouchableOpacity onPress={() => selectedEvent && handleEventAction(selectedEvent.id, "edit")}>
            <Ionicons name="pencil" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {selectedEvent && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.eventModalHeader}>
              <Text style={styles.eventModalEmoji}>
                {getFieldTypeEmoji(selectedEvent.field.type)}
              </Text>
              <Text style={styles.eventModalTitle}>{selectedEvent.title}</Text>
              <View style={[
                styles.eventModalStatusBadge,
                { backgroundColor: getStatusColor(selectedEvent.status) }
              ]}>
                <Text style={styles.eventModalStatusText}>
                  {getStatusLabel(selectedEvent.status)}
                </Text>
              </View>
            </View>

            {selectedEvent.description && (
              <View style={styles.eventModalSection}>
                <Text style={styles.modalSectionTitle}>📝 Descripción</Text>
                <Text style={styles.eventDescription}>{selectedEvent.description}</Text>
              </View>
            )}

            <View style={styles.eventModalSection}>
              <Text style={styles.modalSectionTitle}>📅 Información del evento</Text>
              
              <View style={styles.modalDetailItem}>
                <Text style={styles.modalDetailLabel}>Fecha</Text>
                <Text style={styles.modalDetailValue}>
                  {new Date(selectedEvent.date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </Text>
              </View>

              <View style={styles.modalDetailItem}>
                <Text style={styles.modalDetailLabel}>Horario</Text>
                <Text style={styles.modalDetailValue}>
                  {selectedEvent.startTime} - {selectedEvent.endTime} ({selectedEvent.duration} min)
                </Text>
              </View>

              <View style={styles.modalDetailItem}>
                <Text style={styles.modalDetailLabel}>Jugadores</Text>
                <Text style={styles.modalDetailValue}>
                  {selectedEvent.currentPlayers} de {selectedEvent.maxPlayers} inscritos
                </Text>
              </View>

              <View style={styles.modalDetailItem}>
                <Text style={styles.modalDetailLabel}>Precio por jugador</Text>
                <Text style={styles.modalDetailValue}>
                  ${selectedEvent.pricePerPlayer.toLocaleString()} COP
                </Text>
              </View>

              <View style={styles.modalDetailItem}>
                <Text style={styles.modalDetailLabel}>Ingresos estimados</Text>
                <Text style={styles.modalDetailValue}>
                  ${(selectedEvent.pricePerPlayer * selectedEvent.currentPlayers).toLocaleString()} COP
                </Text>
              </View>
            </View>

            <View style={styles.eventModalSection}>
              <Text style={styles.modalSectionTitle}>🏢 Anfitrión</Text>
              
              <View style={styles.modalDetailItem}>
                <Text style={styles.modalDetailLabel}>Negocio</Text>
                <Text style={styles.modalDetailValue}>{selectedEvent.host.businessName}</Text>
              </View>

              <View style={styles.modalDetailItem}>
                <Text style={styles.modalDetailLabel}>Contacto</Text>
                <Text style={styles.modalDetailValue}>{selectedEvent.host.fullName}</Text>
              </View>

              <View style={styles.modalDetailItem}>
                <Text style={styles.modalDetailLabel}>Email</Text>
                <Text style={styles.modalDetailValue}>{selectedEvent.host.email}</Text>
              </View>

              <View style={styles.modalDetailItem}>
                <Text style={styles.modalDetailLabel}>Teléfono</Text>
                <Text style={styles.modalDetailValue}>{selectedEvent.host.phone}</Text>
              </View>
            </View>

            <View style={styles.eventModalSection}>
              <Text style={styles.modalSectionTitle}>🏟️ Cancha</Text>
              
              <View style={styles.modalDetailItem}>
                <Text style={styles.modalDetailLabel}>Nombre</Text>
                <Text style={styles.modalDetailValue}>{selectedEvent.field.name}</Text>
              </View>

              <View style={styles.modalDetailItem}>
                <Text style={styles.modalDetailLabel}>Tipo</Text>
                <Text style={styles.modalDetailValue}>
                  {selectedEvent.field.type.replace("futbol", "Fútbol ")}
                </Text>
              </View>

              <View style={styles.modalDetailItem}>
                <Text style={styles.modalDetailLabel}>Capacidad</Text>
                <Text style={styles.modalDetailValue}>{selectedEvent.field.capacity} jugadores</Text>
              </View>

              <View style={styles.modalDetailItem}>
                <Text style={styles.modalDetailLabel}>Características</Text>
                <View style={styles.fieldFeatures}>
                  {selectedEvent.field.hasLighting && (
                    <View style={styles.featureBadge}>
                      <Text style={styles.featureText}>Iluminación</Text>
                    </View>
                  )}
                  {selectedEvent.field.isIndoor && (
                    <View style={styles.featureBadge}>
                      <Text style={styles.featureText}>Techada</Text>
                    </View>
                  )}
                  {selectedEvent.field.amenities.map((amenity, index) => (
                    <View key={index} style={styles.featureBadge}>
                      <Text style={styles.featureText}>{amenity}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              {selectedEvent.status === "open" && (
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.cancelButton]}
                  onPress={() => handleEventAction(selectedEvent.id, "cancel")}
                >
                  <Ionicons name="close-circle" size={16} color="white" />
                  <Text style={styles.modalActionButtonText}>Cancelar Evento</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.modalActionButton, styles.editButton]}
                onPress={() => handleEventAction(selectedEvent.id, "edit")}
              >
                <Ionicons name="pencil" size={16} color="white" />
                <Text style={styles.modalActionButtonText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalActionButton, styles.deleteButton]}
                onPress={() => handleEventAction(selectedEvent.id, "delete")}
              >
                <Ionicons name="trash" size={16} color="white" />
                <Text style={styles.modalActionButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );

  if (!user || user.userType !== "admin") {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Esta pantalla es solo para administradores</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.headerTitle}>Eventos</Text>
            <Text style={styles.headerSubtitle}>
              {filteredEvents.length} de {events.length} eventos
            </Text>
          </View>

          <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
            <Ionicons name="calendar-outline" size={24} color={Colors.textLight} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

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
        {renderStatsCards()}
        {renderFilters()}
        {renderEventsList()}
      </ScrollView>

      {renderEventModal()}
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
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  filterTabs: {
    flexGrow: 0,
  },
  filterTabsContent: {
    gap: 8,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: "white",
  },
  filterTabBadge: {
    backgroundColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  filterTabBadgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  filterTabBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.textMuted,
  },
  filterTabBadgeTextActive: {
    color: "white",
  },
  eventsList: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 20,
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
    alignItems: "flex-start",
  },
  eventInfo: {
    flex: 1,
  },
  eventTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  fieldTypeEmoji: {
    fontSize: 20,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    flex: 1,
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
  eventDetails: {
    marginBottom: 8,
    gap: 4,
  },
  eventDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  eventDetailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  eventMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  eventMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  eventMetaText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  moreButton: {
    padding: 8,
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
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  eventModalHeader: {
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 24,
  },
  eventModalEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  eventModalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 12,
  },
  eventModalStatusBadge: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  eventModalStatusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  eventModalSection: {
    marginBottom: 32,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  eventDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  modalDetailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  modalDetailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  modalDetailValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
  },
  fieldFeatures: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    flex: 1,
    justifyContent: "flex-end",
  },
  featureBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  featureText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: "500",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 24,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  editButton: {
    backgroundColor: Colors.primary,
  },
  cancelButton: {
    backgroundColor: Colors.warning,
  },
  deleteButton: {
    backgroundColor: Colors.error,
  },
  modalActionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
});

export default AdminEventsScreen;