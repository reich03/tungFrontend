import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";

import { Colors, Gradients } from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";
import CustomButton from "../../components/common/CustomButton";
import playerEventService from "../../services/playerEventService";
import { EventForFrontend } from "../../types/eventTypes";

interface Props {
  navigation: any;
}

const PlayerEventsScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventForFrontend[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventForFrontend[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    fieldType: "all",
    date: "all",
    location: "",
    maxPrice: 0,
    minSpaces: 1,
  });

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [])
  );

  const loadEvents = async () => {
    try {
      setLoading(true);
      const result = await playerEventService.getAllAvailableEvents();

      if (result.success && result.data) {
        setEvents(result.data);
        applyFilters(result.data);
      } else {
        console.warn("No se pudieron cargar eventos:", result.message);
        setEvents([]);
        setFilteredEvents([]);
      }
    } catch (error) {
      console.error("Error loading events:", error);
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const applyFilters = (eventsToFilter: EventForFrontend[] = events) => {
    let filtered = [...eventsToFilter];

   
    if (searchText.trim()) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchText.toLowerCase()) ||
          event.fieldInfo?.businessName
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          event.fieldInfo?.address
            .toLowerCase()
            .includes(searchText.toLowerCase())
      );
    }

    filtered = playerEventService.filterEvents(filtered, filters);

    setFilteredEvents(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [searchText, filters, events]);

  const clearFilters = () => {
    setFilters({
      fieldType: "all",
      date: "all",
      location: "",
      maxPrice: 0,
      minSpaces: 1,
    });
    setSearchText("");
  };

  const getFieldTypeEmoji = (fieldType: string): string => {
    switch (fieldType) {
      case "futbol5":
        return "⚽";
      case "futbol7":
        return "🥅";
      case "futbol11":
        return "🏟️";
      default:
        return "⚽";
    }
  };

  const getTimeUntilEvent = (eventDateTime: string): string => {
    const now = new Date();
    const eventDate = new Date(eventDateTime);
    const diffMs = eventDate.getTime() - now.getTime();

    if (diffMs < 0) return "En curso";

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `En ${diffDays} día${diffDays > 1 ? "s" : ""}`;
    } else if (diffHours > 0) {
      return `En ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `En ${diffMinutes} min`;
    }
  };

  const renderEventCard = (event: EventForFrontend) => (
    <TouchableOpacity
      key={event.id}
      style={styles.eventCard}
      onPress={() => navigation.navigate("EventDetails", { eventId: event.id })}
      activeOpacity={0.8}
    >
      <View style={styles.eventCardHeader}>
        <View style={styles.eventTypeIndicator}>
          <Text style={styles.fieldTypeEmoji}>
            {getFieldTypeEmoji(event.fieldType)}
          </Text>
          <Text style={styles.fieldTypeText}>
            {event.fieldType.replace("futbol", "F")}
          </Text>
        </View>

        <View style={styles.timeIndicator}>
          <Ionicons name="time-outline" size={14} color={Colors.primary} />
          <Text style={styles.timeText}>
            {getTimeUntilEvent(event.datetime)}
          </Text>
        </View>
      </View>

      <View style={styles.eventCardBody}>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {event.title}
        </Text>

        <View style={styles.eventLocation}>
          <Ionicons
            name="location-outline"
            size={16}
            color={Colors.textSecondary}
          />
          <Text style={styles.locationText} numberOfLines={1}>
            {event.fieldInfo?.businessName || event.fieldName}
          </Text>
        </View>

        <View style={styles.eventMeta}>
          <View style={styles.metaItem}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={Colors.textMuted}
            />
            <Text style={styles.metaText}>
              {new Date(event.date).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
              })}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.metaText}>{event.time}</Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons
              name="people-outline"
              size={14}
              color={Colors.textMuted}
            />
            <Text style={styles.metaText}>
              {event.registeredPlayers}/{event.maxPlayers}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.eventCardFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceValue}>
            ${event.fieldInfo?.pricePerPlayer?.toLocaleString() || "N/A"}
          </Text>
          <Text style={styles.priceLabel}>por jugador</Text>
        </View>

        <View style={styles.spacesIndicator}>
          <View
            style={[
              styles.spacesContainer,
              event.availableSpaces <= 2 && styles.spacesLow,
            ]}
          >
            <Text style={styles.spacesText}>
              {event.availableSpaces} disponibles
            </Text>
          </View>
        </View>
      </View>

      
      <View style={styles.occupancyBar}>
        <View
          style={[
            styles.occupancyFill,
            { width: `${(event.registeredPlayers / event.maxPlayers) * 100}%` },
          ]}
        />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={64} color={Colors.textMuted} />
      <Text style={styles.emptyStateTitle}>
        {events.length === 0
          ? "No hay eventos disponibles"
          : "No hay eventos con estos filtros"}
      </Text>
      <Text style={styles.emptyStateText}>
        {events.length === 0
          ? "Los eventos aparecerán aquí cuando estén disponibles"
          : "Intenta cambiar los filtros para ver más eventos"}
      </Text>
      {events.length > 0 && (
        <CustomButton
          title="Limpiar filtros"
          onPress={clearFilters}
          size="small"
          variant="secondary"
        />
      )}
    </View>
  );

  const eventStats = playerEventService.getEventStatistics(events);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      
      <LinearGradient
        colors={Gradients.primary}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Eventos disponibles</Text>
            <Text style={styles.headerSubtitle}>
              {filteredEvents.length} de {events.length} eventos
            </Text>
          </View>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => {
              
            }}
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

        
        <View style={styles.searchContainer}>
          <View style={styles.searchInput}>
            <Ionicons
              name="search-outline"
              size={20}
              color={Colors.textMuted}
            />
            <TextInput
              style={styles.searchTextInput}
              placeholder="Buscar eventos o lugares..."
              placeholderTextColor={Colors.textMuted}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.filterButton,
              (filters.fieldType !== "all" ||
                filters.date !== "all" ||
                filters.location ||
                filters.maxPrice > 0) &&
                styles.filterButtonActive,
            ]}
            onPress={() => setShowFiltersModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="filter" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.quickStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{eventStats.todayEvents}</Text>
          <Text style={styles.statLabel}>Hoy</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{eventStats.weekEvents}</Text>
          <Text style={styles.statLabel}>Esta semana</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            ${eventStats.averagePrice.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Promedio</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{eventStats.totalSpaces}</Text>
          <Text style={styles.statLabel}>Espacios</Text>
        </View>
      </View>

      
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
        {loading ? (
          <View style={styles.loadingState}>
            <Text style={styles.loadingText}>Cargando eventos...</Text>
          </View>
        ) : filteredEvents.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.eventsList}>
            {filteredEvents.map(renderEventCard)}
          </View>
        )}
      </ScrollView>

      
      <Modal
        visible={showFiltersModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFiltersModal(false)}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filtros</Text>
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.clearButton}>Limpiar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Tipo de cancha</Text>
              <View style={styles.filterOptions}>
                {[
                  { value: "all", label: "Todas", emoji: "⚽" },
                  { value: "futbol5", label: "Fútbol 5", emoji: "⚽" },
                  { value: "futbol7", label: "Fútbol 7", emoji: "🥅" },
                  { value: "futbol11", label: "Fútbol 11", emoji: "🏟️" },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.filterOption,
                      filters.fieldType === option.value &&
                        styles.filterOptionSelected,
                    ]}
                    onPress={() =>
                      setFilters({ ...filters, fieldType: option.value })
                    }
                  >
                    <Text style={styles.filterOptionEmoji}>{option.emoji}</Text>
                    <Text
                      style={[
                        styles.filterOptionText,
                        filters.fieldType === option.value &&
                          styles.filterOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Fecha</Text>
              <View style={styles.filterOptions}>
                {[
                  { value: "all", label: "Todas las fechas" },
                  { value: "today", label: "Hoy" },
                  { value: "tomorrow", label: "Mañana" },
                  { value: "week", label: "Esta semana" },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.filterOption,
                      filters.date === option.value &&
                        styles.filterOptionSelected,
                    ]}
                    onPress={() =>
                      setFilters({ ...filters, date: option.value })
                    }
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        filters.date === option.value &&
                          styles.filterOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

          
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Ubicación</Text>
              <TextInput
                style={styles.locationInput}
                placeholder="Buscar por barrio o dirección..."
                value={filters.location}
                onChangeText={(text) =>
                  setFilters({ ...filters, location: text })
                }
              />
            </View>

            
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>
                Precio máximo por jugador: $
                {filters.maxPrice > 0
                  ? filters.maxPrice.toLocaleString()
                  : "Sin límite"}
              </Text>
              <View style={styles.priceOptions}>
                {[0, 5000, 10000, 15000, 20000].map((price) => (
                  <TouchableOpacity
                    key={price}
                    style={[
                      styles.priceOption,
                      filters.maxPrice === price && styles.priceOptionSelected,
                    ]}
                    onPress={() => setFilters({ ...filters, maxPrice: price })}
                  >
                    <Text
                      style={[
                        styles.priceOptionText,
                        filters.maxPrice === price &&
                          styles.priceOptionTextSelected,
                      ]}
                    >
                      {price === 0
                        ? "Sin límite"
                        : `$${price.toLocaleString()}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

           
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>
                Espacios mínimos disponibles: {filters.minSpaces}
              </Text>
              <View style={styles.spacesOptions}>
                {[1, 2, 3, 5, 10].map((spaces) => (
                  <TouchableOpacity
                    key={spaces}
                    style={[
                      styles.spacesOption,
                      filters.minSpaces === spaces &&
                        styles.spacesOptionSelected,
                    ]}
                    onPress={() =>
                      setFilters({ ...filters, minSpaces: spaces })
                    }
                  >
                    <Text
                      style={[
                        styles.spacesOptionText,
                        filters.minSpaces === spaces &&
                          styles.spacesOptionTextSelected,
                      ]}
                    >
                      {spaces}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Text style={styles.resultsText}>
              {filteredEvents.length} eventos encontrados
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textLight,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    opacity: 0.8,
    marginTop: 4,
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
  searchContainer: {
    flexDirection: "row",
    gap: 12,
  },
  searchInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textLight,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  quickStats: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  content: {
    flex: 1,
    marginTop: 20,
  },
  loadingState: {
    paddingVertical: 60,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  emptyState: {
    paddingVertical: 60,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  eventsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  eventCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  eventCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.background,
  },
  eventTypeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  fieldTypeEmoji: {
    fontSize: 14,
  },
  fieldTypeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
  },
  timeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "500",
  },
  eventCardBody: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  eventLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  eventMeta: {
    flexDirection: "row",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  eventCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  priceContainer: {
    alignItems: "flex-start",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.success,
  },
  priceLabel: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  spacesIndicator: {
    alignItems: "flex-end",
  },
  spacesContainer: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  spacesLow: {
    backgroundColor: "rgba(255, 193, 7, 0.2)",
  },
  spacesText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.primary,
  },
  occupancyBar: {
    height: 3,
    backgroundColor: Colors.divider,
  },
  occupancyFill: {
    height: "100%",
    backgroundColor: Colors.primary,
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
  clearButton: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: "500",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterSection: {
    marginVertical: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  filterOptions: {
    gap: 8,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  filterOptionSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  filterOptionEmoji: {
    fontSize: 16,
  },
  filterOptionText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  filterOptionTextSelected: {
    color: Colors.primary,
    fontWeight: "500",
  },
  locationInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priceOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  priceOption: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priceOptionSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  priceOptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceOptionTextSelected: {
    color: Colors.primary,
    fontWeight: "500",
  },
  spacesOptions: {
    flexDirection: "row",
    gap: 8,
  },
  spacesOption: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 40,
    alignItems: "center",
  },
  spacesOptionSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  spacesOptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  spacesOptionTextSelected: {
    color: Colors.primary,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  resultsText: {
    fontSize: 16,
    color: Colors.primary,
    textAlign: "center",
    fontWeight: "500",
  },
});

export default PlayerEventsScreen;
