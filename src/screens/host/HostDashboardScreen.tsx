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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import { Host } from "../../types";
import { Colors, Gradients } from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";
import CustomButton from "../../components/common/CustomButton";

import fieldService from "../../services/fieldService";
import eventService from "../../services/eventService";
import {
  FieldForFrontend,
  CreateFieldForm,
  FieldTypeFrontend,
  getFieldCapacity,
  getFieldDisplayName,
  getFieldEmoji,
  getFieldColor,
} from "../../types/fieldTypes";

import {
  EventForFrontend,
  CreateEventForm,
  RegisteredPlayer,
  getEventStatusLabel,
  getEventStatusColor,
  groupPositionsByTeam,
  getPositionType,
  getMaxCapacity,
} from "../../types/eventTypes";

const HostDashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    "overview" | "events" | "fields"
  >("overview");

  const [realFields, setRealFields] = useState<FieldForFrontend[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [fieldsSaving, setFieldsSaving] = useState(false);

  const [realEvents, setRealEvents] = useState<EventForFrontend[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsSaving, setEventsSaving] = useState(false);

  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState<EventForFrontend[]>([]);
  const [eventFilters, setEventFilters] = useState({
    status: "all",
    fieldId: "all",
    dateRange: "all",
    minPlayers: 0,
    maxPlayers: 22,
  });

  const [showFieldModal, setShowFieldModal] = useState(false);
  const [isEditingField, setIsEditingField] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [fieldForm, setFieldForm] = useState<CreateFieldForm>({
    type: "futbol5",
    pricePerHour: 50000,
  });

  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventForFrontend | null>(
    null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [eventForm, setEventForm] = useState<CreateEventForm>({
    fieldId: "",
    date: new Date(),
    time: "",
  });

  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [registeredPlayersForAttendance, setRegisteredPlayersForAttendance] =
    useState<RegisteredPlayer[]>([]);
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [isCompletingEvent, setIsCompletingEvent] = useState(false);

  useEffect(() => {
    loadDashboardDataSequential();
  }, [user]);

  useEffect(() => {
    applyEventFilters();
  }, [realEvents, eventFilters]);

  const isEventToday = (eventDate: string) => {
    const now = new Date();
    const todayInColombia = now.toLocaleDateString("en-CA", {
      timeZone: "America/Bogota",
    });
    return eventDate === todayInColombia;
  };

  const applyEventFilters = () => {
    let filtered = [...realEvents];
    if (eventFilters.status !== "all") {
      filtered = filtered.filter(
        (event) => event.status === eventFilters.status
      );
    }
    if (eventFilters.fieldId !== "all") {
      filtered = filtered.filter(
        (event) => event.fieldId === eventFilters.fieldId
      );
    }
    if (eventFilters.dateRange !== "all") {
      const todayInColombia = new Date().toLocaleDateString("en-CA", {
        timeZone: "America/Bogota",
      });
      const today = new Date(todayInColombia);
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.datetime);
        switch (eventFilters.dateRange) {
          case "today":
            return event.date === todayInColombia;
          case "week":
            const weekFromNow = new Date(
              today.getTime() + 7 * 24 * 60 * 60 * 1000
            );
            return eventDate >= today && eventDate <= weekFromNow;
          case "month":
            const monthFromNow = new Date(
              today.getTime() + 30 * 24 * 60 * 60 * 1000
            );
            return eventDate >= today && eventDate <= monthFromNow;
          default:
            return true;
        }
      });
    }
    filtered = filtered.filter(
      (event) =>
        event.registeredPlayers >= eventFilters.minPlayers &&
        event.registeredPlayers <= eventFilters.maxPlayers
    );
    setFilteredEvents(filtered);
  };

  const loadDashboardDataSequential = async () => {
    setLoading(true);
    try {
      if (user && user.id) {
        const fieldsResult = await fieldService.getOwnerFields(user.id);
        if (fieldsResult.success && fieldsResult.data) {
          setRealFields(fieldsResult.data);
          if (fieldsResult.data.length > 0) {
            const eventsResult = await eventService.getHostEvents(
              fieldsResult.data
            );
            if (eventsResult.success && eventsResult.data) {
              setRealEvents(eventsResult.data);
            } else {
              setRealEvents([]);
            }
          } else {
            setRealEvents([]);
          }
        } else {
          setRealFields([]);
          setRealEvents([]);
        }
      }
    } catch (error) {
      console.error("❌ Error loading dashboard data:", error);
      setRealFields([]);
      setRealEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardDataSequential();
    setRefreshing(false);
  };

  const handleCreateEvent = () => {
    if (!realFields || realFields.length === 0) {
      Alert.alert(
        "Sin canchas",
        "Primero debes agregar canchas para crear eventos."
      );
      return;
    }
    setEventForm({
      fieldId: realFields[0].id,
      date: new Date(),
      time: "",
    });
    setShowCreateEventModal(true);
  };

  const handleSaveEvent = async () => {
    if (!user || !user.id) return;
    const validation = eventService.validateEventForm(eventForm);
    if (!validation.success) {
      Alert.alert(
        "Error",
        validation.errors?.join("\n") || "Formulario inválido"
      );
      return;
    }
    const selectedField = realFields.find((f) => f.id === eventForm.fieldId);
    if (!selectedField) return;
    setEventsSaving(true);
    try {
      const result = await eventService.createEvent(eventForm, selectedField);
      if (result.success) {
        Alert.alert(
          "¡Evento creado! 🎉",
          "El evento ha sido creado exitosamente."
        );
        setShowCreateEventModal(false);
        await loadDashboardDataSequential();
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo crear el evento");
    } finally {
      setEventsSaving(false);
    }
  };

  const handleViewEvent = async (event: EventForFrontend) => {
    try {
      const result = await eventService.getEventDetails(event.id);
      if (result.success && result.data) {
        setSelectedEvent(result.data);
        const players = eventService.getRegisteredPlayers(
          result.data.positions
        );
        setRegisteredPlayersForAttendance(players);
        setSelectedAttendees([]);
        setShowEventDetailsModal(true);
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los detalles del evento");
    }
  };

  const handleCancelEvent = (event: EventForFrontend) => {
    Alert.alert(
      "Cancelar Evento",
      `¿Estás seguro de que quieres cancelar "${event.title}"?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            const result = await eventService.cancelEvent(event.id);
            if (result.success) {
              Alert.alert("Cancelado", "El evento ha sido cancelado.");
              await loadDashboardDataSequential();
            } else {
              Alert.alert("Error", result.message);
            }
          },
        },
      ]
    );
  };

  const handleConfirmAttendance = async () => {
    if (!selectedEvent) return;
    if (selectedAttendees.length === 0) {
      Alert.alert(
        "Atención",
        "Debes seleccionar al menos un jugador que asistió al partido."
      );
      return;
    }
    setIsCompletingEvent(true);
    try {
      const result = await eventService.completeEvent(
        selectedEvent.id,
        selectedAttendees
      );
      if (result.success) {
        Alert.alert(
          "¡Éxito!",
          "El partido ha sido marcado como completado y la asistencia registrada."
        );
        setShowAttendanceModal(false);
        setShowEventDetailsModal(false);
        await handleRefresh();
      } else {
        Alert.alert(
          "Error al completar",
          result.message || "No se pudo procesar la solicitud."
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Ocurrió un error inesperado al completar el partido."
      );
    } finally {
      setIsCompletingEvent(false);
    }
  };

  const toggleAttendeeSelection = (playerId: string) => {
    setSelectedAttendees((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleManageField = (fieldId?: string) => {
    if (fieldId) {
      const field = realFields.find((f) => f.id === fieldId);
      if (field) {
        setFieldForm({ type: field.type, pricePerHour: field.pricePerHour });
        setEditingFieldId(fieldId);
        setIsEditingField(true);
        setShowFieldModal(true);
      }
    } else {
      setFieldForm({ type: "futbol5", pricePerHour: 50000 });
      setIsEditingField(false);
      setEditingFieldId(null);
      setShowFieldModal(true);
    }
  };

  const handleSaveField = async () => {
    if (!user || !user.id) return;
    const validation = fieldService.validateFieldForm(fieldForm);
    if (!validation.success) {
      Alert.alert(
        "Error",
        validation.errors?.join("\n") || "Formulario inválido"
      );
      return;
    }
    setFieldsSaving(true);
    try {
      const result =
        isEditingField && editingFieldId
          ? await fieldService.updateField(editingFieldId, fieldForm, user.id)
          : await fieldService.createField(fieldForm, user.id);
      if (result.success) {
        Alert.alert(
          "¡Éxito!",
          isEditingField ? "Cancha actualizada" : "Cancha creada"
        );
        setShowFieldModal(false);
        await loadDashboardDataSequential();
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la cancha");
    } finally {
      setFieldsSaving(false);
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    const field = realFields.find((f) => f.id === fieldId);
    if (!field) return;
    Alert.alert(
      "Eliminar cancha",
      `¿Seguro que quieres eliminar "${field.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setFieldsLoading(true);
            const result = await fieldService.deleteField(fieldId);
            if (result.success) {
              Alert.alert("Eliminada", "La cancha ha sido eliminada.");
              await loadDashboardDataSequential();
            } else {
              Alert.alert("Error", result.message);
            }
            setFieldsLoading(false);
          },
        },
      ]
    );
  };

  const renderOverview = () => {
    const eventStats = eventService.getEventsStatistics(realEvents);
    const finishedEvents = realEvents.filter((e) => e.status === "finished");
    const totalRevenue = finishedEvents.reduce((sum, event) => {
      const field = realFields.find((f) => f.id === event.fieldId);
      const estimatedPlayerCost = field
        ? Math.round(field.pricePerHour / event.maxPlayers)
        : 8000;
      return sum + event.registeredPlayers * estimatedPlayerCost;
    }, 0);
    const upcomingEvents = realEvents.filter((e) => {
      const eventDate = new Date(e.datetime);
      const colombiaToday = new Date().toLocaleDateString("en-CA", {
        timeZone: "America/Bogota",
      });
      const today = new Date(colombiaToday);
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return (
        e.status === "available" && eventDate > today && eventDate <= nextWeek
      );
    });

    return (
      <View style={styles.overviewContainer}>
        <View style={styles.statsSection}>
          <Text style={styles.statsSectionTitle}>📊 Resumen del negocio</Text>
          <View style={styles.statsRowMain}>
            <LinearGradient
              colors={["#4CAF50", "#81C784"]}
              style={[styles.statCardMain, styles.gradientCard]}
            >
              <View style={styles.statCardContent}>
                <Ionicons name="calendar" size={32} color="white" />
                <View style={styles.statCardText}>
                  <Text style={styles.statValueMain}>{eventStats.active}</Text>
                  <Text style={styles.statLabelMain}>Eventos activos</Text>
                </View>
              </View>
            </LinearGradient>
            <LinearGradient
              colors={["#2196F3", "#64B5F6"]}
              style={[styles.statCardMain, styles.gradientCard]}
            >
              <View style={styles.statCardContent}>
                <Ionicons name="people" size={32} color="white" />
                <View style={styles.statCardText}>
                  <Text style={styles.statValueMain}>
                    {eventStats.totalPlayers}
                  </Text>
                  <Text style={styles.statLabelMain}>Total jugadores</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
          <View style={styles.statsRowSecondary}>
            <LinearGradient
              colors={["#FF9800", "#FFB74D"]}
              style={[styles.statCardSecondary, styles.gradientCard]}
            >
              <View style={styles.statCardContent}>
                <Ionicons name="cash" size={28} color="white" />
                <View style={styles.statCardText}>
                  <Text style={styles.statValueSecondary}>
                    $
                    {totalRevenue > 1000
                      ? `${(totalRevenue / 1000).toFixed(0)}K`
                      : totalRevenue.toLocaleString()}
                  </Text>
                  <Text style={styles.statLabelSecondary}>
                    Ingresos estimados
                  </Text>
                </View>
              </View>
            </LinearGradient>
            <LinearGradient
              colors={["#9C27B0", "#BA68C8"]}
              style={[styles.statCardSecondary, styles.gradientCard]}
            >
              <View style={styles.statCardContent}>
                <Ionicons name="football" size={28} color="white" />
                <View style={styles.statCardText}>
                  <Text style={styles.statValueSecondary}>
                    {realFields.length}
                  </Text>
                  <Text style={styles.statLabelSecondary}>Canchas activas</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{eventStats.upcoming}</Text>
              <Text style={styles.metricLabel}>Próximos</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{eventStats.finished}</Text>
              <Text style={styles.metricLabel}>Finalizados</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {eventStats.averageOccupancy}%
              </Text>
              <Text style={styles.metricLabel}>Ocupación</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{eventStats.cancelled}</Text>
              <Text style={styles.metricLabel}>Cancelados</Text>
            </View>
          </View>
        </View>

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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📅 Eventos recientes</Text>
            <TouchableOpacity onPress={() => setSelectedTab("events")}>
              <Text style={styles.seeAllText}>
                Ver todos ({realEvents.length})
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recentEvents}>
            {realEvents.slice(0, 4).map((event) => (
              <TouchableOpacity
                key={event.id}
                style={[
                  styles.recentEventCard,
                  event.status === "available" &&
                    isEventToday(event.date) &&
                    styles.urgentEventCard,
                ]}
                onPress={() => handleViewEvent(event)}
              >
                <View style={styles.eventInfo}>
                  <View style={styles.eventTitleRow}>
                    <Text style={styles.eventTitle} numberOfLines={1}>
                      {event.title}
                    </Text>
                    {event.status === "available" &&
                      isEventToday(event.date) && (
                        <View style={styles.urgentBadge}>
                          <Text style={styles.urgentText}>¡Hoy!</Text>
                        </View>
                      )}
                  </View>
                  <Text style={styles.eventField}>{event.fieldName}</Text>
                  <Text style={styles.eventTime}>
                    {new Date(event.datetime).toLocaleDateString("es-ES", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    • {event.time}
                  </Text>
                </View>
                <View style={styles.eventMeta}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getEventStatusColor(event.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getEventStatusLabel(event.status)}
                    </Text>
                  </View>
                  <View style={styles.playersButton}>
                    <Ionicons name="people" size={12} color={Colors.primary} />
                    <Text style={styles.eventPlayers}>
                      {event.registeredPlayers}/{event.maxPlayers}
                    </Text>
                  </View>
                  <View style={styles.occupancyIndicator}>
                    <View
                      style={[
                        styles.occupancyBar,
                        {
                          width: `${
                            (event.registeredPlayers / event.maxPlayers) * 100
                          }%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            {realEvents.length === 0 && (
              <View style={styles.emptyEventsState}>
                <Ionicons
                  name="calendar-outline"
                  size={48}
                  color={Colors.textMuted}
                />
                <Text style={styles.emptyStateText}>
                  No hay eventos creados
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Comienza creando tu primer evento
                </Text>
                <TouchableOpacity
                  style={styles.createFirstEventButton}
                  onPress={handleCreateEvent}
                >
                  <Text style={styles.createEventLink}>
                    Crear primer evento
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {realEvents.length > 0 && eventStats.averageOccupancy < 70 && (
          <View style={styles.section}>
            <View style={styles.tipsCard}>
              <View style={styles.tipsHeader}>
                <Ionicons name="bulb" size={20} color={Colors.warning} />
                <Text style={styles.tipsTitle}>💡 Consejo para tu negocio</Text>
              </View>
              <Text style={styles.tipsText}>
                Tu ocupación promedio es del {eventStats.averageOccupancy}%.
                Considera promociones o descuentos para llenar más espacios.
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderEvents = () => (
    <View style={styles.eventsContainer}>
      <View style={styles.eventsHeader}>
        <View style={styles.eventsHeaderInfo}>
          <Text style={styles.eventsHeaderTitle}>Mis Eventos</Text>
          <Text style={styles.eventsHeaderSubtitle}>
            {filteredEvents.length} de {realEvents.length} eventos •{" "}
            {eventService.getEventsStatistics(realEvents).active} activos
          </Text>
        </View>
        <View style={styles.eventsHeaderActions}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFiltersModal(true)}
          >
            <Ionicons name="filter" size={16} color={Colors.primary} />
            <Text style={styles.filterButtonText}>Filtros</Text>
            {(eventFilters.status !== "all" ||
              eventFilters.fieldId !== "all" ||
              eventFilters.dateRange !== "all") && (
              <View style={styles.filterActiveBadge} />
            )}
          </TouchableOpacity>
          <CustomButton
            title="Crear evento"
            icon="add"
            onPress={handleCreateEvent}
            size="small"
            disabled={eventsSaving}
          />
        </View>
      </View>
      {eventsLoading ? (
        <View style={styles.loadingState}>
          <Text style={styles.loadingText}>Cargando eventos...</Text>
        </View>
      ) : filteredEvents.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="calendar-outline"
            size={64}
            color={Colors.textMuted}
          />
          <Text style={styles.emptyStateTitle}>
            {realEvents.length === 0
              ? "Sin eventos creados"
              : "No hay eventos con estos filtros"}
          </Text>
          <Text style={styles.emptyStateText}>
            {realEvents.length === 0
              ? "Crea tu primer evento para empezar"
              : "Intenta cambiar los filtros"}
          </Text>
          {realEvents.length === 0 && (
            <CustomButton
              title="Crear primer evento"
              onPress={handleCreateEvent}
              icon="add"
              disabled={eventsSaving}
            />
          )}
        </View>
      ) : (
        <View style={styles.eventsList}>
          {filteredEvents.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventCardHeader}>
                <View style={styles.eventCardInfo}>
                  <Text style={styles.eventCardTitle}>{event.title}</Text>
                  <Text style={styles.eventCardField}>{event.fieldName}</Text>
                  <Text style={styles.eventCardDate}>
                    {new Date(event.date).toLocaleDateString("es-ES", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    • {event.time}
                    {isEventToday(event.date) && " • ¡HOY!"}
                  </Text>
                </View>
                <View style={styles.eventCardMeta}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getEventStatusColor(event.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getEventStatusLabel(event.status)}
                    </Text>
                  </View>
                  <View style={styles.playersInfo}>
                    <Ionicons name="people" size={14} color={Colors.primary} />
                    <Text style={styles.eventCardPlayers}>
                      {event.registeredPlayers}/{event.maxPlayers} jugadores
                    </Text>
                  </View>
                  <Text style={styles.eventCardOccupancy}>
                    {Math.round(
                      (event.registeredPlayers / event.maxPlayers) * 100
                    )}
                    % ocupado
                  </Text>
                </View>
              </View>
              <View style={styles.eventCardActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleViewEvent(event)}
                >
                  <Ionicons
                    name="eye-outline"
                    size={16}
                    color={Colors.primary}
                  />
                  <Text style={styles.actionButtonText}>Ver campo</Text>
                </TouchableOpacity>
                {event.status === "available" && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => handleCancelEvent(event)}
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
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderSoccerField = (positions: any[], fieldType: string) => {
    const fieldConfig = {
      futbol5: {
        rows: [
          ["ArqueroA"],
          ["DefensaA1", "DefensaA2"],
          ["MediocampoA1"],
          ["DelanteroA1"],
          [],
          ["DelanteroB1"],
          ["MediocampoB1"],
          ["DefensaB1", "DefensaB2"],
          ["ArqueroB"],
        ],
      },
      futbol7: {
        rows: [
          ["ArqueroA"],
          ["DefensaA1", "DefensaA2"],
          ["MediocampoA1", "MediocampoA2"],
          ["DelanteroA1"],
          [],
          ["DelanteroB1"],
          ["MediocampoB1", "MediocampoB2"],
          ["DefensaB1", "DefensaB2"],
          ["ArqueroB"],
        ],
      },
      futbol11: {
        rows: [
          ["ArqueroA"],
          ["DefensaA1", "DefensaA2", "DefensaA3", "DefensaA4"],
          ["MediocampoA1", "MediocampoA2", "MediocampoA3"],
          ["DelanteroA1", "DelanteroA2", "DelanteroA3"],
          [],
          ["DelanteroB1", "DelanteroB2", "DelanteroB3"],
          ["MediocampoB1", "MediocampoB2", "MediocampoB3"],
          ["DefensaB1", "DefensaB2", "DefensaB3", "DefensaB4"],
          ["ArqueroB"],
        ],
      },
    };
    const config =
      fieldConfig[fieldType as keyof typeof fieldConfig] || fieldConfig.futbol5;
    return (
      <View style={styles.soccerFieldImproved}>
        <View style={styles.fieldHeader}>
          <Text style={styles.fieldTitle}>⚽ Campo de Juego</Text>
          <View style={styles.fieldTypeIndicator}>
            <Text style={styles.fieldTypeText}>{fieldType.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.fieldBackground}>
          <View style={styles.centerLine} />
          <View style={styles.centerCircle} />
          <View style={styles.goalAreaTop} />
          <View style={styles.goalAreaBottom} />
          <View style={styles.centerDot} />
          <View style={styles.fieldPositionsImproved}>
            {config.rows.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.fieldRowImproved}>
                {row.length === 0 ? (
                  <View style={styles.emptyRowImproved}>
                    <View style={styles.centerLineLabel}>
                      <Text style={styles.centerLineText}>CENTRO</Text>
                    </View>
                  </View>
                ) : (
                  row.map((positionName) => {
                    const position = positions.find((p) =>
                      p.nombre.includes(positionName)
                    );
                    if (!position) return null;
                    const positionType = getPositionType(position.nombre);
                    const isGoalkeeper = positionName.includes("Arquero");
                    const isMidfield = positionName.includes("Mediocampo");
                    return (
                      <View
                        key={position.id}
                        style={[
                          styles.soccerPositionImproved,
                          position.ocupada && styles.soccerPositionOccupied,
                          isGoalkeeper && styles.goalkeeperPosition,
                          isMidfield && styles.midfieldPosition,
                        ]}
                      >
                        <View style={styles.positionIcon}>
                          <Ionicons
                            name={
                              isGoalkeeper
                                ? "shield"
                                : isMidfield
                                ? "ellipse"
                                : "triangle"
                            }
                            size={14}
                            color={position.ocupada ? "white" : "#666"}
                          />
                        </View>
                        <Text
                          style={[
                            styles.soccerPositionName,
                            (isGoalkeeper || isMidfield) &&
                              styles.soccerPositionNameWhite,
                          ]}
                        >
                          {positionType.slice(0, 3).toUpperCase()}
                        </Text>
                        <Text
                          style={[
                            styles.soccerPositionPlayer,
                            (isGoalkeeper || isMidfield) &&
                              styles.soccerPositionPlayerWhite,
                          ]}
                        >
                          {position.nombreJugador?.slice(0, 8) || "Libre"}
                        </Text>
                      </View>
                    );
                  })
                )}
              </View>
            ))}
          </View>
        </View>
        <View style={styles.fieldLegendImproved}>
          <Text style={styles.legendTitle}>Leyenda:</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: Colors.primaryLight },
                ]}
              />
              <Text style={styles.legendText}>Ocupado</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: "rgba(255,255,255,0.3)" },
                ]}
              />
              <Text style={styles.legendText}>Disponible</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: Colors.warning },
                ]}
              />
              <Text style={styles.legendText}>Arquero</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: "#9C27B0" }]}
              />
              <Text style={styles.legendText}>Mediocampo</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderFields = () => {
    return (
      <View style={styles.fieldsContainer}>
        <View style={styles.fieldsHeader}>
          <View style={styles.fieldsHeaderInfo}>
            <Text style={styles.fieldsHeaderTitle}>Mis Canchas</Text>
            <Text style={styles.fieldsHeaderSubtitle}>
              {realFields.length} canchas configuradas
            </Text>
          </View>
          <CustomButton
            title="Agregar cancha"
            icon="add"
            onPress={() => handleManageField()}
            size="small"
            disabled={fieldsSaving}
          />
        </View>
        {fieldsLoading ? (
          <View style={styles.loadingState}>
            <Text style={styles.loadingText}>Cargando canchas...</Text>
          </View>
        ) : realFields.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="football-outline"
              size={64}
              color={Colors.textMuted}
            />
            <Text style={styles.emptyStateTitle}>Sin canchas configuradas</Text>
            <Text style={styles.emptyStateText}>
              Agrega tus canchas para empezar
            </Text>
            <CustomButton
              title="Agregar primera cancha"
              onPress={() => handleManageField()}
              icon="add"
              disabled={fieldsSaving}
            />
          </View>
        ) : (
          <View style={styles.fieldsList}>
            {realFields.map((field) => (
              <View key={field.id} style={styles.fieldCardImproved}>
                <LinearGradient
                  colors={[
                    getFieldColor(field.type),
                    getFieldColor(field.type) + "80",
                  ]}
                  style={styles.fieldCardHeader}
                >
                  <View style={styles.fieldHeaderLeft}>
                    <Text style={styles.fieldTypeEmoji}>
                      {getFieldEmoji(field.type)}
                    </Text>
                    <View>
                      <Text style={styles.fieldCardNameWhite}>
                        {field.name}
                      </Text>
                      <Text style={styles.fieldCardTypeWhite}>
                        {getFieldDisplayName(field.type)} • {field.capacity}{" "}
                        jugadores
                      </Text>
                    </View>
                  </View>
                  <View style={styles.fieldHeaderRight}>
                    <TouchableOpacity
                      style={styles.fieldStatusButton}
                      onPress={() => handleManageField(field.id)}
                    >
                      <Ionicons
                        name="settings-outline"
                        size={18}
                        color="white"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.fieldStatusButton,
                        { backgroundColor: "rgba(244, 67, 54, 0.3)" },
                      ]}
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
                        name="star-outline"
                        size={18}
                        color={Colors.warning}
                      />
                      <Text style={styles.fieldDetailText}>
                        {field.rating?.toFixed(1) || "Sin cal."} ⭐
                      </Text>
                    </View>
                  </View>
                  {field.ownerInfo && (
                    <View style={styles.fieldFeatures}>
                      <View style={styles.featureBadge}>
                        <Ionicons
                          name="time-outline"
                          size={12}
                          color={Colors.info}
                        />
                        <Text style={styles.featureText}>
                          {field.ownerInfo.openTime} -{" "}
                          {field.ownerInfo.closeTime}
                        </Text>
                      </View>
                      <View style={styles.featureBadge}>
                        <Ionicons
                          name="location-outline"
                          size={12}
                          color={Colors.primary}
                        />
                        <Text style={styles.featureText}>
                          {field.ownerInfo.address}
                        </Text>
                      </View>
                    </View>
                  )}
                  {(() => {
                    const fieldEvents = realEvents.filter(
                      (e) => e.fieldId === field.id
                    );
                    const activeFieldEvents = fieldEvents.filter(
                      (e) => e.status === "available"
                    ).length;
                    return (
                      fieldEvents.length > 0 && (
                        <View style={styles.fieldStatsBar}>
                          <Text style={styles.fieldStatsText}>
                            {fieldEvents.length} eventos • {activeFieldEvents}{" "}
                            activos
                          </Text>
                        </View>
                      )
                    );
                  })()}
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
              {host.businessName || "Negocio de canchas"}
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
            <Text style={styles.loadingText}>
              Cargando datos del negocio...
            </Text>
          </View>
        ) : (
          <>
            {selectedTab === "overview" && renderOverview()}
            {selectedTab === "events" && renderEvents()}
            {selectedTab === "fields" && renderFields()}
          </>
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
            <Text style={styles.modalTitle}>Filtrar Eventos</Text>
            <TouchableOpacity
              onPress={() => {
                setEventFilters({
                  status: "all",
                  fieldId: "all",
                  dateRange: "all",
                  minPlayers: 0,
                  maxPlayers: 22,
                });
              }}
            >
              <Text style={[styles.saveButton, { color: Colors.error }]}>
                Limpiar
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Estado del evento</Text>
              <View style={styles.filterOptionsRow}>
                {[
                  { value: "all", label: "Todos" },
                  { value: "available", label: "Disponibles" },
                  { value: "finished", label: "Finalizados" },
                  { value: "cancelled", label: "Cancelados" },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.filterOption,
                      eventFilters.status === option.value &&
                        styles.filterOptionSelected,
                    ]}
                    onPress={() =>
                      setEventFilters({ ...eventFilters, status: option.value })
                    }
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        eventFilters.status === option.value &&
                          styles.filterOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Cancha</Text>
              <View style={styles.filterOptionsColumn}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    eventFilters.fieldId === "all" &&
                      styles.filterOptionSelected,
                  ]}
                  onPress={() =>
                    setEventFilters({ ...eventFilters, fieldId: "all" })
                  }
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      eventFilters.fieldId === "all" &&
                        styles.filterOptionTextSelected,
                    ]}
                  >
                    Todas las canchas
                  </Text>
                </TouchableOpacity>
                {realFields.map((field) => (
                  <TouchableOpacity
                    key={field.id}
                    style={[
                      styles.filterOption,
                      eventFilters.fieldId === field.id &&
                        styles.filterOptionSelected,
                    ]}
                    onPress={() =>
                      setEventFilters({ ...eventFilters, fieldId: field.id })
                    }
                  >
                    <Text style={styles.filterOptionEmoji}>
                      {getFieldEmoji(field.type)}
                    </Text>
                    <Text
                      style={[
                        styles.filterOptionText,
                        eventFilters.fieldId === field.id &&
                          styles.filterOptionTextSelected,
                      ]}
                    >
                      {field.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Período de tiempo</Text>
              <View style={styles.filterOptionsRow}>
                {[
                  { value: "all", label: "Todos" },
                  { value: "today", label: "Hoy" },
                  { value: "week", label: "Esta semana" },
                  { value: "month", label: "Este mes" },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.filterOption,
                      eventFilters.dateRange === option.value &&
                        styles.filterOptionSelected,
                    ]}
                    onPress={() =>
                      setEventFilters({
                        ...eventFilters,
                        dateRange: option.value,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        eventFilters.dateRange === option.value &&
                          styles.filterOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Cantidad de jugadores: {eventFilters.minPlayers} -{" "}
                {eventFilters.maxPlayers}
              </Text>
              <View style={styles.rangeInputs}>
                <View style={styles.rangeInput}>
                  <Text style={styles.rangeLabel}>Mínimo</Text>
                  <TextInput
                    style={styles.textInput}
                    value={eventFilters.minPlayers.toString()}
                    onChangeText={(text) =>
                      setEventFilters({
                        ...eventFilters,
                        minPlayers: parseInt(text) || 0,
                      })
                    }
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.rangeInput}>
                  <Text style={styles.rangeLabel}>Máximo</Text>
                  <TextInput
                    style={styles.textInput}
                    value={eventFilters.maxPlayers.toString()}
                    onChangeText={(text) =>
                      setEventFilters({
                        ...eventFilters,
                        maxPlayers: parseInt(text) || 22,
                      })
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
            <View style={styles.filterSummary}>
              <Text style={styles.filterSummaryTitle}>
                Resultados: {filteredEvents.length} de {realEvents.length}{" "}
                eventos
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

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
            <TouchableOpacity onPress={handleSaveEvent} disabled={eventsSaving}>
              <Text
                style={[styles.saveButton, eventsSaving && { opacity: 0.5 }]}
              >
                {eventsSaving ? "Creando..." : "Crear"}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Cancha *</Text>
              <View style={styles.fieldSelector}>
                {realFields.map((field) => (
                  <TouchableOpacity
                    key={field.id}
                    style={[
                      styles.fieldOption,
                      eventForm.fieldId === field.id &&
                        styles.fieldOptionSelected,
                    ]}
                    onPress={() =>
                      setEventForm({ ...eventForm, fieldId: field.id })
                    }
                  >
                    <Text style={styles.fieldOptionEmoji}>
                      {getFieldEmoji(field.type)}
                    </Text>
                    <View style={styles.fieldOptionInfo}>
                      <Text style={styles.fieldOptionName}>{field.name}</Text>
                      <Text style={styles.fieldOptionType}>
                        {getFieldDisplayName(field.type)} • {field.capacity}{" "}
                        jugadores
                      </Text>
                      <Text style={styles.fieldOptionPrice}>
                        ${field.pricePerHour.toLocaleString()}/hora
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Fecha *</Text>
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
                  {eventForm.date.toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Hora *</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={Colors.primary}
                />
                <Text style={styles.timeButtonText}>
                  {eventForm.time || "Seleccionar hora"}
                </Text>
              </TouchableOpacity>
            </View>
            {eventForm.fieldId && eventForm.date && eventForm.time && (
              <View style={styles.formGroup}>
                <View style={styles.previewCard}>
                  <Text style={styles.previewTitle}>
                    Vista previa del evento
                  </Text>
                  <View style={styles.previewContent}>
                    <Text style={styles.previewEmoji}>
                      {getFieldEmoji(
                        realFields.find((f) => f.id === eventForm.fieldId)
                          ?.type || "futbol5"
                      )}
                    </Text>
                    <View style={styles.previewInfo}>
                      <Text style={styles.previewName}>
                        {
                          realFields.find((f) => f.id === eventForm.fieldId)
                            ?.name
                        }
                      </Text>
                      <Text style={styles.previewDetails}>
                        {eventForm.date.toLocaleDateString("es-ES")} •{" "}
                        {eventForm.time}
                      </Text>
                      <Text style={styles.previewCapacity}>
                        Capacidad:{" "}
                        {getMaxCapacity(
                          realFields.find((f) => f.id === eventForm.fieldId)
                            ?.type || "futbol5"
                        )}{" "}
                        jugadores
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showEventDetailsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEventDetailsModal(false)}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {selectedEvent?.title || "Detalles del evento"}
            </Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            {selectedEvent && (
              <>
                <View style={styles.eventDetailsHeader}>
                  <View style={styles.eventDetailRow}>
                    <Ionicons
                      name="football"
                      size={20}
                      color={Colors.primary}
                    />
                    <Text style={styles.eventDetailText}>
                      {selectedEvent.fieldName}
                    </Text>
                  </View>
                  <View style={styles.eventDetailRow}>
                    <Ionicons
                      name="calendar"
                      size={20}
                      color={Colors.primary}
                    />
                    <Text style={styles.eventDetailText}>
                      {selectedEvent.date} • {selectedEvent.time}
                      {isEventToday(selectedEvent.date) && " • ¡HOY!"}
                    </Text>
                  </View>
                  <View style={styles.eventDetailRow}>
                    <Ionicons name="people" size={20} color={Colors.primary} />
                    <Text style={styles.eventDetailText}>
                      {selectedEvent.registeredPlayers}/
                      {selectedEvent.maxPlayers} jugadores
                    </Text>
                  </View>
                </View>
                <View style={styles.fieldDiagram}>
                  <Text style={styles.diagramTitle}>⚽ Campo de juego</Text>
                  {renderSoccerField(
                    selectedEvent.positions,
                    selectedEvent.fieldType
                  )}
                </View>
                <View style={styles.eventStats}>
                  <Text style={styles.statsTitle}>Estadísticas</Text>
                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {selectedEvent.registeredPlayers}
                      </Text>
                      <Text style={styles.statLabel}>Inscritos</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {selectedEvent.availableSpaces}
                      </Text>
                      <Text style={styles.statLabel}>Disponibles</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {Math.round(
                          (selectedEvent.registeredPlayers /
                            selectedEvent.maxPlayers) *
                            100
                        )}
                        %
                      </Text>
                      <Text style={styles.statLabel}>Ocupación</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.eventActionsSection}>
                  {selectedEvent.status === "available" &&
                    eventService.isEventReadyToStart(
                      selectedEvent.datetime
                    ) && (
                      <CustomButton
                        title="✅ Partido Empezado"
                        onPress={() => setShowAttendanceModal(true)}
                        style={{
                          backgroundColor: Colors.success,
                          marginVertical: 20,
                        }}
                        textStyle={{ color: "white" }}
                        disabled={isCompletingEvent}
                      />
                    )}
                  {selectedEvent.status !== "available" && (
                    <View style={styles.infoCard}>
                      <Ionicons
                        name="checkmark-done-circle"
                        size={20}
                        color={Colors.success}
                      />
                      <Text style={styles.infoText}>
                        Este partido ya está{" "}
                        {getEventStatusLabel(
                          selectedEvent.status
                        ).toLowerCase()}
                        .
                      </Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showAttendanceModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowAttendanceModal(false)}
      >
        <View style={styles.attendanceModalOverlay}>
          <View style={styles.attendanceModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirmar Asistencia</Text>
              <TouchableOpacity onPress={() => setShowAttendanceModal(false)}>
                <Ionicons
                  name="close-circle"
                  size={28}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.attendanceSubtitle}>
              Selecciona los jugadores que están presentes para iniciar el
              partido.
            </Text>
            <ScrollView style={styles.attendancePlayerList}>
              {registeredPlayersForAttendance.length > 0 ? (
                registeredPlayersForAttendance.map((player) => {
                  const isSelected = selectedAttendees.includes(player.id);
                  return (
                    <TouchableOpacity
                      key={player.id}
                      style={[
                        styles.playerAttendanceItem,
                        isSelected && styles.playerAttendanceItemSelected,
                      ]}
                      onPress={() => toggleAttendeeSelection(player.id)}
                      disabled={isCompletingEvent}
                    >
                      <Ionicons
                        name={isSelected ? "checkbox" : "square-outline"}
                        size={24}
                        color={isSelected ? Colors.primary : Colors.textMuted}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.playerAttendanceName}>
                          {player.name}
                        </Text>
                        <Text
                          style={styles.playerAttendancePosition}
                        >{`Posición: ${player.position}`}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No hay jugadores inscritos.
                  </Text>
                </View>
              )}
            </ScrollView>
            <View style={styles.modalFooter}>
              <CustomButton
                title={
                  isCompletingEvent
                    ? "Procesando..."
                    : `Confirmar (${selectedAttendees.length}) y Empezar`
                }
                onPress={handleConfirmAttendance}
                disabled={isCompletingEvent || selectedAttendees.length === 0}
                icon={isCompletingEvent ? undefined : "checkmark-done"}
              />
              {isCompletingEvent && (
                <ActivityIndicator
                  size="small"
                  color={Colors.primary}
                  style={{ marginLeft: 10 }}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>

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
            <TouchableOpacity onPress={handleSaveField} disabled={fieldsSaving}>
              <Text
                style={[styles.saveButton, fieldsSaving && { opacity: 0.5 }]}
              >
                {fieldsSaving ? "Guardando..." : "Guardar"}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <View style={styles.infoCard}>
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={Colors.info}
                />
                <Text style={styles.infoText}>
                  El nombre de la cancha se asignará automáticamente según el
                  tipo.
                </Text>
              </View>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tipo de cancha *</Text>
              <View style={styles.fieldTypeSelector}>
                {[
                  {
                    value: "futbol5" as FieldTypeFrontend,
                    label: "Fútbol 5",
                    emoji: "⚽",
                    players: 10,
                  },
                  {
                    value: "futbol7" as FieldTypeFrontend,
                    label: "Fútbol 7",
                    emoji: "🥅",
                    players: 14,
                  },
                  {
                    value: "futbol11" as FieldTypeFrontend,
                    label: "Fútbol 11",
                    emoji: "🏟️",
                    players: 22,
                  },
                ].map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.fieldTypeOption,
                      fieldForm.type === type.value &&
                        styles.fieldTypeOptionSelected,
                    ]}
                    onPress={() =>
                      setFieldForm({ ...fieldForm, type: type.value })
                    }
                    disabled={fieldsSaving}
                  >
                    <Text style={styles.fieldTypeOptionEmoji}>
                      {type.emoji}
                    </Text>
                    <View style={styles.fieldTypeOptionInfo}>
                      <Text
                        style={[
                          styles.fieldTypeOptionName,
                          fieldForm.type === type.value &&
                            styles.fieldTypeOptionNameSelected,
                        ]}
                      >
                        {type.label}
                      </Text>
                      <Text style={styles.fieldTypeOptionPlayers}>
                        {type.players} jugadores
                      </Text>
                    </View>
                    {fieldForm.type === type.value && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={Colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Precio por hora (COP) *</Text>
              <TextInput
                style={styles.textInput}
                value={fieldForm.pricePerHour.toString()}
                onChangeText={(text) =>
                  setFieldForm({
                    ...fieldForm,
                    pricePerHour: parseInt(text) || 0,
                  })
                }
                placeholder="50000"
                keyboardType="numeric"
                editable={!fieldsSaving}
              />
            </View>
            <View style={styles.formGroup}>
              <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>Vista previa</Text>
                <View style={styles.previewContent}>
                  <Text style={styles.previewEmoji}>
                    {getFieldEmoji(fieldForm.type)}
                  </Text>
                  <View style={styles.previewInfo}>
                    <Text style={styles.previewName}>
                      {getFieldDisplayName(fieldForm.type)} ####
                    </Text>
                    <Text style={styles.previewNameSubtext}>
                      (El nombre se asignará automáticamente)
                    </Text>
                    <Text style={styles.previewDetails}>
                      {getFieldDisplayName(fieldForm.type)} •{" "}
                      {getFieldCapacity(fieldForm.type)} jugadores
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

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={(date) => {
          setEventForm({ ...eventForm, date });
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
        minimumDate={new Date()}
      />
      <DateTimePickerModal
        isVisible={showTimePicker}
        mode="time"
        onConfirm={(selectedTime) => {
          const hours = selectedTime.getUTCHours();
          const minutes = selectedTime.getUTCMinutes();
          const timeString = `${String(hours).padStart(2, "0")}:${String(
            minutes
          ).padStart(2, "0")}`;
          setEventForm({ ...eventForm, time: timeString });
          setShowTimePicker(false);
        }}
        onCancel={() => setShowTimePicker(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { paddingTop: 35, paddingBottom: 20, paddingHorizontal: 20 },
  headerContent: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: { flex: 1 },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.textLight,
    marginBottom: 4,
  },
  headerSubtitle: { fontSize: 16, color: Colors.textLight, opacity: 0.9 },
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
  tabButtonActive: { backgroundColor: Colors.primaryLight },
  tabButtonText: { fontSize: 14, fontWeight: "500", color: Colors.textMuted },
  tabButtonTextActive: { color: Colors.primary },
  content: { flex: 1 },
  overviewContainer: { paddingHorizontal: 20 },
  statsSection: { marginBottom: 32 },
  statsSectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  statsRowMain: { flexDirection: "row", gap: 16, marginBottom: 16 },
  statCardMain: {
    flex: 1,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  statsRowSecondary: { flexDirection: "row", gap: 16, marginBottom: 20 },
  statCardSecondary: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statCardContent: { flexDirection: "row", alignItems: "center", gap: 16 },
  statCardText: { flex: 1 },
  statValueMain: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  statLabelMain: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  statValueSecondary: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  statLabelSecondary: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  metricsRow: { flexDirection: "row", gap: 12 },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  gradientCard: { borderWidth: 0 },
  soccerFieldImproved: {
    backgroundColor: "#2E7D32",
    borderRadius: 16,
    overflow: "hidden",
    marginVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fieldTitle: { fontSize: 18, fontWeight: "bold", color: "white" },
  fieldTypeIndicator: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  fieldTypeText: { fontSize: 12, fontWeight: "bold", color: "white" },
  fieldBackground: {
    minHeight: 500,
    position: "relative",
    backgroundColor: "#4CAF50",
    margin: 8,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "white",
  },
  centerLine: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "white",
    zIndex: 1,
  },
  centerCircle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "white",
    marginLeft: -45,
    marginTop: -45,
    zIndex: 1,
  },
  centerDot: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "white",
    marginLeft: -4,
    marginTop: -4,
    zIndex: 2,
  },
  goalAreaTop: {
    position: "absolute",
    top: 0,
    left: "20%",
    right: "20%",
    height: 60,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: "white",
    backgroundColor: "rgba(255,255,255,0.1)",
    zIndex: 1,
  },
  goalAreaBottom: {
    position: "absolute",
    bottom: 0,
    left: "20%",
    right: "20%",
    height: 60,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: "white",
    backgroundColor: "rgba(255,255,255,0.1)",
    zIndex: 1,
  },
  fieldPositionsImproved: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 32,
    paddingHorizontal: 20,
    zIndex: 2,
  },
  fieldRowImproved: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    minHeight: 55,
    marginVertical: 4,
  },
  emptyRowImproved: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  centerLineLabel: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  centerLineText: { fontSize: 10, fontWeight: "bold", color: "#2E7D32" },
  soccerPositionImproved: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 14,
    padding: 16,
    minWidth: 85,
    minHeight: 90,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.7)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    marginHorizontal: 4,
  },
  soccerPositionOccupied: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  goalkeeperPosition: {
    backgroundColor: Colors.warning,
    borderColor: "#FF8F00",
  },
  midfieldPosition: { backgroundColor: "#9C27B0", borderColor: "#7B1FA2" },
  positionIcon: { marginBottom: 6 },
  soccerPositionName: {
    fontSize: 11,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 3,
    textAlign: "center",
  },
  soccerPositionPlayer: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 12,
  },
  soccerPositionNameWhite: { color: "white", fontWeight: "bold" },
  soccerPositionPlayerWhite: { color: "rgba(255, 255, 255, 0.9)" },
  fieldLegendImproved: {
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  legendItems: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: 10,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendColor: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "white",
  },
  legendText: { fontSize: 12, color: "white", fontWeight: "500" },
  section: { marginBottom: 32 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 20, fontWeight: "600", color: Colors.textPrimary },
  seeAllText: { fontSize: 14, color: Colors.primary, fontWeight: "500" },
  tipsCard: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 193, 7, 0.3)",
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: { fontSize: 16, fontWeight: "600", color: Colors.warning },
  tipsText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  eventTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  urgentEventCard: { borderColor: Colors.warning, borderWidth: 2 },
  urgentBadge: {
    backgroundColor: Colors.warning,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  urgentText: { fontSize: 10, fontWeight: "bold", color: "white" },
  occupancyIndicator: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  occupancyBar: {
    height: "100%",
    backgroundColor: Colors.success,
    borderRadius: 2,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
    marginBottom: 8,
  },
  createFirstEventButton: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  eventsHeaderInfo: { flex: 1 },
  eventsHeaderTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  eventsHeaderSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  eventsHeaderActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
    position: "relative",
  },
  filterButtonText: { fontSize: 14, color: Colors.primary, fontWeight: "500" },
  filterActiveBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  filterOptionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterOptionsColumn: { gap: 8 },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  filterOptionSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  filterOptionTextSelected: { color: Colors.primary },
  filterOptionEmoji: { fontSize: 16 },
  rangeInputs: { flexDirection: "row", gap: 12 },
  rangeInput: { flex: 1 },
  rangeLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  filterSummary: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 8,
  },
  filterSummaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
    textAlign: "center",
  },
  fieldsHeaderInfo: { flex: 1 },
  fieldsHeaderTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  fieldsHeaderSubtitle: { fontSize: 14, color: Colors.textSecondary },
  fieldStatsBar: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  fieldStatsText: { fontSize: 12, color: Colors.info, fontWeight: "500" },
  quickActions: { flexDirection: "row", gap: 12 },
  quickActionCard: { flex: 1, borderRadius: 16, overflow: "hidden" },
  quickActionGradient: { padding: 20, alignItems: "center", gap: 8 },
  quickActionTitle: { fontSize: 16, fontWeight: "bold", color: "white" },
  quickActionSubtitle: { fontSize: 12, color: "rgba(255, 255, 255, 0.8)" },
  recentEvents: { gap: 12 },
  recentEventCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventInfo: { flex: 1 },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    flex: 1,
  },
  eventField: { fontSize: 14, color: Colors.textSecondary, marginBottom: 4 },
  eventTime: { fontSize: 12, color: Colors.textMuted },
  eventMeta: { alignItems: "flex-end", gap: 8 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 10, fontWeight: "600", color: Colors.textLight },
  playersButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  eventPlayers: { fontSize: 12, color: Colors.primary, fontWeight: "500" },
  emptyEventsState: { alignItems: "center", paddingVertical: 40, gap: 12 },
  createEventLink: { fontSize: 16, color: Colors.primary, fontWeight: "600" },
  eventsContainer: { paddingHorizontal: 20 },
  eventsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  eventsList: { gap: 16, paddingBottom: 10 },
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
  eventCardInfo: { flex: 1 },
  eventCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  eventCardField: { fontSize: 14, color: Colors.primary, marginBottom: 4 },
  eventCardDate: { fontSize: 14, color: Colors.textSecondary },
  eventCardMeta: { alignItems: "flex-end", gap: 8 },
  playersInfo: { flexDirection: "row", alignItems: "center", gap: 4 },
  eventCardPlayers: { fontSize: 12, color: Colors.primary, fontWeight: "500" },
  eventCardOccupancy: {
    fontSize: 12,
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
  cancelButton: { backgroundColor: "rgba(244, 67, 54, 0.1)" },
  actionButtonText: { fontSize: 12, fontWeight: "500", color: Colors.primary },
  fieldsContainer: { paddingHorizontal: 20 },
  fieldsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  fieldsList: { gap: 16 },
  loadingState: { alignItems: "center", paddingVertical: 40 },
  loadingText: { fontSize: 16, color: Colors.textSecondary },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 16 },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
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
  fieldHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  fieldTypeEmoji: { fontSize: 24 },
  fieldCardNameWhite: { fontSize: 18, fontWeight: "bold", color: "white" },
  fieldCardTypeWhite: { fontSize: 14, color: "rgba(255, 255, 255, 0.8)" },
  fieldHeaderRight: { flexDirection: "row", gap: 8 },
  fieldStatusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  fieldCardBody: { padding: 16 },
  fieldCardDetails: { flexDirection: "row", gap: 16, marginBottom: 12 },
  fieldDetail: { flexDirection: "row", alignItems: "center", gap: 6 },
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
  featureText: { fontSize: 10, color: Colors.textSecondary, fontWeight: "500" },
  modalContainer: { flex: 1, backgroundColor: Colors.background },
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
    flex: 1,
    textAlign: "center",
  },
  saveButton: { fontSize: 16, fontWeight: "600", color: Colors.primary },
  modalContent: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  formGroup: { marginBottom: 20 },
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
  fieldSelector: { gap: 8 },
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
  fieldOptionEmoji: { fontSize: 24 },
  fieldOptionInfo: { flex: 1 },
  fieldOptionName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  fieldOptionType: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  fieldOptionPrice: { fontSize: 12, color: Colors.success, fontWeight: "500" },
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
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  timeButtonText: { fontSize: 16, color: Colors.textPrimary },
  fieldTypeSelector: { gap: 12 },
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
  fieldTypeOptionEmoji: { fontSize: 24 },
  fieldTypeOptionInfo: { flex: 1 },
  fieldTypeOptionName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  fieldTypeOptionNameSelected: { color: Colors.primary },
  fieldTypeOptionPlayers: { fontSize: 14, color: Colors.textSecondary },
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
  previewContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  previewEmoji: { fontSize: 32 },
  previewInfo: { flex: 1 },
  previewName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  previewNameSubtext: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: "italic",
    marginBottom: 4,
  },
  previewDetails: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  previewPrice: { fontSize: 16, fontWeight: "600", color: Colors.success },
  previewCapacity: { fontSize: 14, color: Colors.info, fontWeight: "500" },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(33, 150, 243, 0.1)",
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  infoText: { flex: 1, fontSize: 14, color: Colors.info, lineHeight: 18 },
  eventDetailsHeader: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  eventDetailRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  eventDetailText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  fieldDiagram: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  diagramTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: "center",
  },
  eventStats: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: "center",
  },
  statsGrid: { flexDirection: "row", justifyContent: "space-around" },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 24, fontWeight: "bold", color: Colors.primary },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  eventActionsSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  attendanceModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  attendanceModalContainer: {
    width: "100%",
    maxHeight: "80%",
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  attendanceSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  attendancePlayerList: { maxHeight: 400 },
  playerAttendanceItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 15,
  },
  playerAttendanceItemSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  playerAttendanceName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  playerAttendancePosition: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});

export default HostDashboardScreen;
