import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { Event, EventStatus, FieldType } from "../../types";
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";
import CustomButton from "../../components/common/CustomButton";

// Mock data para eventos
const mockEvents: Event[] = [
  {
    id: "1",
    hostId: "1",
    host: {
      id: "1",
      email: "cancha@ejemplo.com",
      fullName: "Cancha El Estadio",
      phone: "+57 300 123 4567",
      userType: "host",
      isActive: true,
      createdAt: "2025-01-01",
      businessName: "Cancha El Estadio",
      address: "Calle 72 #15-30, Barranquilla",
      coordinates: { latitude: 10.9878, longitude: -74.7889 },
      description: "La mejor cancha sintética de Barranquilla",
      fields: [],
      rating: 4.5,
      totalReviews: 120,
      businessHours: {},
      contactInfo: {},
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
    hostId: "2",
    host: {
      id: "2",
      email: "futbol@ejemplo.com",
      fullName: "Centro Deportivo Norte",
      phone: "+57 300 987 6543",
      userType: "host",
      isActive: true,
      createdAt: "2025-01-01",
      businessName: "Centro Deportivo Norte",
      address: "Carrera 45 #84-12, Barranquilla",
      coordinates: { latitude: 11.0041, longitude: -74.807 },
      description: "Complejo deportivo con múltiples canchas",
      fields: [],
      rating: 4.2,
      totalReviews: 89,
      businessHours: {},
      contactInfo: {},
    },
    fieldId: "2",
    field: {
      id: "2",
      name: "Cancha Norte",
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
    host: {
      id: "1",
      email: "cancha@ejemplo.com",
      fullName: "Cancha El Estadio",
      phone: "+57 300 123 4567",
      userType: "host",
      isActive: true,
      createdAt: "2025-01-01",
      businessName: "Cancha El Estadio",
      address: "Calle 72 #15-30, Barranquilla",
      coordinates: { latitude: 10.9878, longitude: -74.7889 },
      description: "La mejor cancha sintética de Barranquilla",
      fields: [],
      rating: 4.5,
      totalReviews: 120,
      businessHours: {},
      contactInfo: {},
    },
    fieldId: "1",
    field: {
      id: "1",
      name: "Cancha Principal",
      type: "futbol11",
      capacity: 22,
      pricePerHour: 80000,
      hasLighting: true,
      isIndoor: false,
      amenities: ["Baños", "Parqueadero", "Cafetería"],
      images: [],
      isActive: true,
    },
    title: "Fútbol 11 - Domingo clásico",
    description: "Gran partido de fútbol 11, ven y demuestra tu talento",
    date: "2025-06-16",
    startTime: "16:00",
    endTime: "17:30",
    duration: 90,
    maxPlayers: 22,
    currentPlayers: 6,
    pricePerPlayer: 6000,
    status: "open",
    participants: [],
    createdAt: "2025-06-14",
  },
];

const EventsScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "open" | "joined"
  >("all");
  const [selectedType, setSelectedType] = useState<"all" | FieldType>("all");

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      // Simular carga de API
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

  const getStatusColor = (status: EventStatus): string => {
    switch (status) {
      case "open":
        return Colors.success;
      case "full":
        return Colors.warning;
      case "in_progress":
        return Colors.info;
      case "completed":
        return Colors.textMuted;
      case "cancelled":
        return Colors.error;
      default:
        return Colors.textMuted;
    }
  };

  const getStatusLabel = (status: EventStatus): string => {
    switch (status) {
      case "open":
        return "Abierto";
      case "full":
        return "Completo";
      case "in_progress":
        return "En progreso";
      case "completed":
        return "Finalizado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const getFieldTypeLabel = (type: FieldType): string => {
    switch (type) {
      case "futbol5":
        return "F5";
      case "futbol7":
        return "F7";
      case "futbol11":
        return "F11";
      default:
        return type;
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "open" && event.status === "open") ||
      (selectedFilter === "joined" &&
        event.participants.some((p) => p.playerId === user?.id));

    const matchesType =
      selectedType === "all" || event.field.type === selectedType;

    return matchesFilter && matchesType;
  });

  const FilterChip: React.FC<{
    label: string;
    selected: boolean;
    onPress: () => void;
  }> = ({ label, selected, onPress }) => (
    <TouchableOpacity
      style={[styles.filterChip, selected && styles.filterChipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.filterChipText,
          selected && styles.filterChipTextSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const EventCard: React.FC<{ event: Event; onPress: () => void }> = ({
    event,
    onPress,
  }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.eventHeader}>
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventHost}>{event.host.businessName}</Text>
        </View>

        <View style={styles.eventStatus}>
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
        </View>
      </View>

      <View style={styles.eventDetails}>
        <View style={styles.eventDetail}>
          <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
          <Text style={styles.eventDetailText}>
            {new Date(event.date).toLocaleDateString("es-ES", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </Text>
        </View>

        <View style={styles.eventDetail}>
          <Ionicons name="time-outline" size={16} color={Colors.primary} />
          <Text style={styles.eventDetailText}>
            {event.startTime} - {event.endTime}
          </Text>
        </View>

        <View style={styles.eventDetail}>
          <Ionicons name="location-outline" size={16} color={Colors.primary} />
          <Text style={styles.eventDetailText} numberOfLines={1}>
            {event.host.address}
          </Text>
        </View>
      </View>

      <View style={styles.eventFooter}>
        <View style={styles.eventMeta}>
          <View style={styles.fieldTypeBadge}>
            <Text style={styles.fieldTypeText}>
              {getFieldTypeLabel(event.field.type)}
            </Text>
          </View>

          <View style={styles.playersInfo}>
            <Ionicons name="people" size={16} color={Colors.textSecondary} />
            <Text style={styles.playersText}>
              {event.currentPlayers}/{event.maxPlayers}
            </Text>
          </View>
        </View>

        <View style={styles.priceInfo}>
          <Text style={styles.price}>
            ${event.pricePerPlayer.toLocaleString()}
          </Text>
        </View>
      </View>

      {event.description && (
        <Text style={styles.eventDescription} numberOfLines={2}>
          {event.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Eventos</Text>
        <TouchableOpacity style={styles.searchButton} activeOpacity={0.7}>
          <Ionicons
            name="search-outline"
            size={24}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {/* Status Filters */}
          <FilterChip
            label="Todos"
            selected={selectedFilter === "all"}
            onPress={() => setSelectedFilter("all")}
          />
          <FilterChip
            label="Disponibles"
            selected={selectedFilter === "open"}
            onPress={() => setSelectedFilter("open")}
          />
          {user?.userType === "player" && (
            <FilterChip
              label="Mis eventos"
              selected={selectedFilter === "joined"}
              onPress={() => setSelectedFilter("joined")}
            />
          )}

          {/* Type Filters */}
          <View style={styles.filterDivider} />
          <FilterChip
            label="Todos los tipos"
            selected={selectedType === "all"}
            onPress={() => setSelectedType("all")}
          />
          <FilterChip
            label="Fútbol 5"
            selected={selectedType === "futbol5"}
            onPress={() => setSelectedType("futbol5")}
          />
          <FilterChip
            label="Fútbol 7"
            selected={selectedType === "futbol7"}
            onPress={() => setSelectedType("futbol7")}
          />
          <FilterChip
            label="Fútbol 11"
            selected={selectedType === "futbol11"}
            onPress={() => setSelectedType("futbol11")}
          />
        </ScrollView>
      </View>

      {/* Events List */}
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={() =>
              navigation.navigate(
                "EventDetails" as never,
                { eventId: item.id } as never
              )
            }
          />
        )}
        contentContainerStyle={styles.eventsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="football-outline"
              size={64}
              color={Colors.textMuted}
            />
            <Text style={styles.emptyStateTitle}>
              {selectedFilter === "joined"
                ? "No te has unido a ningún evento"
                : "No hay eventos disponibles"}
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              {selectedFilter === "joined"
                ? "Busca eventos en el mapa y únete a partidos cerca de ti"
                : "Intenta cambiar los filtros o actualiza la lista"}
            </Text>
            <CustomButton
              title={
                selectedFilter === "joined" ? "Buscar eventos" : "Actualizar"
              }
              variant="outline"
              onPress={
                selectedFilter === "joined"
                  ? () => navigation.navigate("Home" as never)
                  : handleRefresh
              }
              style={styles.emptyStateButton}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  filtersContainer: {
    backgroundColor: Colors.background,
    paddingBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  filterChipTextSelected: {
    color: Colors.textLight,
  },
  filterDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
    alignSelf: "center",
  },
  eventsList: {
    paddingHorizontal: 20,
  },
  eventCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  eventHost: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  eventStatus: {
    alignItems: "flex-end",
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textLight,
  },
  eventDetails: {
    gap: 8,
    marginBottom: 12,
  },
  eventDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fieldTypeBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  fieldTypeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
  },
  playersInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  playersText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  priceInfo: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
  },
  eventDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontStyle: "italic",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyStateButton: {
    paddingHorizontal: 32,
  },
});

export default EventsScreen;
