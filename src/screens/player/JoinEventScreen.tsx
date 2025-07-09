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
  Dimensions,
  RefreshControl,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { HomeStackParamList } from "../../types";
import { Colors, Gradients } from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";
import CustomButton from "../../components/common/CustomButton";
import playerEventService from "../../services/playerEventService";
import {
  EventForFrontend,
  EventPosition,
  getPositionType,
} from "../../types/eventTypes";

const { width } = Dimensions.get("window");

type JoinEventScreenNavigationProp = StackNavigationProp<
  HomeStackParamList,
  "JoinEvent"
>;
type JoinEventScreenRouteProp = RouteProp<HomeStackParamList, "JoinEvent">;

interface Props {
  navigation: JoinEventScreenNavigationProp;
  route: JoinEventScreenRouteProp;
}

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

const JoinEventScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = useAuth();
  const { eventId } = route.params;
  const [event, setEvent] = useState<EventForFrontend | null>(null);
  const [selectedPosition, setSelectedPosition] =
    useState<EventPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFieldView, setShowFieldView] = useState(true);

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      const result = await playerEventService.getEventDetails(eventId);

      if (result.success && result.data) {
        setEvent(result.data);

        const userPosition = result.data.positions.find(
          (p) => p.jugadorId === user?.id
        );
        if (userPosition) {
          Alert.alert(
            "Ya estás inscrito",
            `Ya tienes la posición: ${getPositionDisplayName(
              userPosition.nombre
            )}`,
            [
              {
                text: "Ver evento",
                onPress: () => navigation.navigate("EventDetails", { eventId }),
              },
              { text: "OK" },
            ]
          );
        }
      } else {
        Alert.alert("Error", result.message);
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error loading event details:", error);
      Alert.alert("Error", "No se pudieron cargar los detalles del evento");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEventDetails();
    setRefreshing(false);
  };

  const handlePositionSelect = (position: EventPosition) => {
    if (!position.ocupada) {
      setSelectedPosition(position);
      console.log("🎯 Posición seleccionada:", position.nombre, position.id);
    }
  };

  const handleJoinEvent = async () => {
    if (!selectedPosition || !event || !user?.id) {
      Alert.alert("Error", "Por favor selecciona una posición en la cancha.");
      return;
    }

    Alert.alert(
      "Confirmar inscripción",
      `¿Confirmas tu inscripción en la posición ${getPositionDisplayName(
        selectedPosition.nombre
      )}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              setJoining(true);

              const result = await playerEventService.joinEvent(
                event.id,
                selectedPosition.id,
                user.id
              );

              if (result.success) {
                Alert.alert(
                  "¡Te has unido al partido! ⚽",
                  `Has sido registrado en la posición: ${getPositionDisplayName(
                    selectedPosition.nombre
                  )}\n\nTe enviaremos recordatorios antes del partido.`,
                  [
                    {
                      text: "Ver evento",
                      onPress: () =>
                        navigation.navigate("EventDetails", {
                          eventId: event.id,
                        }),
                    },
                    {
                      text: "Ir al inicio",
                      onPress: () => navigation.navigate("MapView"),
                    },
                  ]
                );
              } else {
                Alert.alert("Error", result.message);
                await loadEventDetails();
              }
            } catch (error) {
              console.error("❌ Error joining event:", error);
              Alert.alert(
                "Error",
                "No pudimos unirte al partido. Intenta nuevamente.",
                [{ text: "OK" }]
              );
            } finally {
              setJoining(false);
            }
          },
        },
      ]
    );
  };

  const getPositionDisplayName = (positionName: string): string => {
    const type = getPositionType(positionName);
    const teamLetter = positionName.includes("A") ? "A" : "B";
    const number = positionName.match(/\d+/)?.[0] || "";

    return `${type} ${teamLetter}${number ? number : ""}`;
  };

  const getPositionColor = (positionName: string): string => {
    const type = getPositionType(positionName);
    switch (type) {
      case "Arquero":
        return "#FF9800";
      case "Defensa":
        return "#2196F3";
      case "Mediocampo":
        return "#4CAF50";
      case "Delantero":
        return "#F44336";
      default:
        return Colors.primary;
    }
  };

  const getPositionIcon = (positionName: string): string => {
    const type = getPositionType(positionName);
    switch (type) {
      case "Arquero":
        return "🥅";
      case "Defensa":
        return "🛡️";
      case "Mediocampo":
        return "⚡";
      case "Delantero":
        return "⚽";
      default:
        return "👤";
    }
  };

  if (loading || !event) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando evento...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const availablePositions = event.positions.filter((p) => !p.ocupada);
  const occupiedPositions = event.positions.filter((p) => p.ocupada);
  const userPosition = event.positions.find((p) => p.jugadorId === user?.id);
  const isUserJoined = !!userPosition;

  const renderSoccerField = () => {
    const config =
      fieldConfig[event.fieldType as keyof typeof fieldConfig] ||
      fieldConfig.futbol7;

    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldTitle}>
          {getPositionIcon(event.fieldType)} Cancha{" "}
          {event.fieldType.replace("futbol", "Fútbol ")}
        </Text>

        <View style={[styles.field, { width: width - 60 }]}>
          <View style={styles.fieldLines}>
            <View style={[styles.goalArea, styles.goalAreaTop]} />
            <View style={[styles.goalArea, styles.goalAreaBottom]} />
            <View style={styles.centerCircle} />
            <View style={styles.centerLine} />
            <View style={[styles.goal, styles.goalTop]} />
            <View style={[styles.goal, styles.goalBottom]} />
          </View>

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
                  row.map((positionPattern) => {
                    const position = event.positions.find((p) =>
                      p.nombre.includes(positionPattern)
                    );
                    if (!position) return null;

                    const positionType = getPositionType(position.nombre);
                    const isGoalkeeper = positionType === "Arquero";
                    const isSelected = selectedPosition?.id === position.id;

                    return (
                      <TouchableOpacity
                        key={position.id}
                        style={[
                          styles.soccerPositionImproved,
                          position.ocupada && styles.soccerPositionOccupied,
                          isGoalkeeper && styles.goalkeeperPosition,
                          isSelected && styles.selectedPosition,
                        ]}
                        onPress={() => handlePositionSelect(position)}
                        disabled={position.ocupada || isUserJoined}
                        activeOpacity={0.8}
                      >
                        <View style={styles.positionIcon}>
                          <Ionicons
                            name={
                              position.ocupada
                                ? "person"
                                : isSelected
                                ? "checkmark"
                                : "add"
                            }
                            size={12} // Tamaño de ícono ajustado
                            color={
                              position.ocupada || isGoalkeeper || isSelected
                                ? "white"
                                : "#666"
                            }
                          />
                        </View>
                        <Text
                          style={[
                            styles.soccerPositionName,
                            (isGoalkeeper || position.ocupada || isSelected) &&
                              styles.soccerPositionNameWhite,
                          ]}
                        >
                          {positionType.slice(0, 4).toUpperCase()}
                        </Text>
                        <Text
                          style={[
                            styles.soccerPositionPlayer,
                            (isGoalkeeper || position.ocupada || isSelected) &&
                              styles.soccerPositionPlayerWhite,
                          ]}
                        >
                          {position.nombreJugador?.slice(0, 5) || "Libre"}
                        </Text>
                      </TouchableOpacity>
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
            {selectedPosition && (
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendColor,
                    { backgroundColor: Colors.primary },
                  ]}
                />
                <Text style={styles.legendText}>Seleccionado</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

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
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textLight} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {isUserJoined ? "Tu posición" : "Unirse al partido"}
          </Text>

          <TouchableOpacity
            style={styles.viewToggle}
            onPress={() => setShowFieldView(!showFieldView)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showFieldView ? "list" : "football"}
              size={20}
              color={Colors.textLight}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

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
        <View style={styles.eventSummary}>
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventHost}>
              {event.fieldInfo?.businessName || event.fieldName}
            </Text>

            <View style={styles.eventMeta}>
              <View style={styles.metaItem}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={Colors.primary}
                />
                <Text style={styles.metaText}>
                  {new Date(event.date).toLocaleDateString("es-ES", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={Colors.primary}
                />
                <Text style={styles.metaText}>{event.time}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons
                  name="cash-outline"
                  size={16}
                  color={Colors.primary}
                />
                <Text style={styles.metaText}>
                  ${event.fieldInfo?.pricePerPlayer?.toLocaleString() || "N/A"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.playersIndicator}>
            <Text style={styles.playersCount}>
              {occupiedPositions.length}/{event.maxPlayers}
            </Text>
            <Text style={styles.playersLabel}>Jugadores</Text>
          </View>
        </View>

        {isUserJoined && userPosition && (
          <View style={styles.userStatusCard}>
            <View style={styles.userStatusHeader}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={Colors.success}
              />
              <Text style={styles.userStatusTitle}>Ya estás inscrito</Text>
            </View>
            <Text style={styles.userStatusPosition}>
              Tu posición: {getPositionDisplayName(userPosition.nombre)}
            </Text>
            <Text style={styles.userStatusEmoji}>
              {getPositionIcon(userPosition.nombre)}
            </Text>
          </View>
        )}

        {showFieldView ? (
          <View style={styles.fieldSection}>
            <Text style={styles.sectionTitle}>
              {isUserJoined
                ? "Tu posición en el campo"
                : "Selecciona tu posición"}
            </Text>
            {!isUserJoined && (
              <Text style={styles.sectionSubtitle}>
                Toca una posición libre para unirte al partido
              </Text>
            )}

            {renderSoccerField()}

            {selectedPosition && !isUserJoined && (
              <View style={styles.selectedPositionInfo}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={Colors.success}
                />
                <Text style={styles.selectedPositionText}>
                  Posición seleccionada:{" "}
                  {getPositionDisplayName(selectedPosition.nombre)}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.playersSection}>
            <Text style={styles.sectionTitle}>Jugadores confirmados</Text>

            <View style={styles.playersList}>
              {occupiedPositions.map((position) => (
                <View key={position.id} style={styles.playerItem}>
                  <View
                    style={[
                      styles.playerAvatar,
                      { backgroundColor: getPositionColor(position.nombre) },
                    ]}
                  >
                    <Text style={styles.playerInitial}>
                      {position.nombreJugador?.charAt(0).toUpperCase() || "?"}
                    </Text>
                  </View>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>
                      {position.nombreJugador || "Jugador"}
                    </Text>
                    <Text style={styles.playerRole}>
                      {getPositionDisplayName(position.nombre)}
                    </Text>
                  </View>
                  <Text style={styles.positionEmoji}>
                    {getPositionIcon(position.nombre)}
                  </Text>
                  {position.jugadorId === user?.id && (
                    <View style={styles.youBadge}>
                      <Text style={styles.youText}>Tú</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>

            <View style={styles.availablePositions}>
              <Text style={styles.availableTitle}>
                {availablePositions.length} posiciones disponibles
              </Text>
              <Text style={styles.availableText}>
                {isUserJoined
                  ? "Ya tienes una posición asignada"
                  : "Cambia a vista de cancha para seleccionar tu posición"}
              </Text>
            </View>
          </View>
        )}

        {!isUserJoined && (
          <View style={styles.paymentInfo}>
            <Text style={styles.sectionTitle}>Información de pago</Text>

            <View style={styles.paymentCard}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Costo por jugador:</Text>
                <Text style={styles.paymentValue}>
                  ${event.fieldInfo?.pricePerPlayer?.toLocaleString() || "N/A"}
                </Text>
              </View>

              <View style={styles.paymentNote}>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={Colors.info}
                />
                <Text style={styles.paymentNoteText}>
                  El pago se realiza en efectivo directamente en la cancha
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {!isUserJoined && (
        <View style={styles.joinContainer}>
          <CustomButton
            title={
              joining
                ? "Uniéndote..."
                : selectedPosition
                ? "Confirmar posición y unirse"
                : "Selecciona una posición"
            }
            onPress={handleJoinEvent}
            loading={joining}
            disabled={
              !selectedPosition || joining || availablePositions.length === 0
            }
            fullWidth
            icon="checkmark-circle"
            style={[
              styles.joinButton,
              !selectedPosition && styles.joinButtonDisabled,
            ]}
          />

          <Text style={styles.disclaimer}>
            Al unirte aceptas los términos de uso y las políticas de cancelación
          </Text>
        </View>
      )}

      {isUserJoined && (
        <View style={styles.joinContainer}>
          <CustomButton
            title="Ver detalles del evento"
            onPress={() =>
              navigation.navigate("EventDetails", { eventId: event.id })
            }
            fullWidth
            icon="eye-outline"
            style={styles.viewEventButton}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.textLight,
  },
  viewToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  eventSummary: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    margin: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
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
    marginBottom: 12,
  },
  eventMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  playersIndicator: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  playersCount: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
  },
  playersLabel: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 2,
  },
  userStatusCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.success,
    alignItems: "center",
  },
  userStatusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  userStatusTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.success,
  },
  userStatusPosition: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  userStatusEmoji: {
    fontSize: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 24,
  },
  fieldSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  fieldContainer: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fieldTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  field: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    position: "relative",
    borderWidth: 3,
    borderColor: "white",
  },
  fieldLines: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  goalArea: {
    position: "absolute",
    width: "40%",
    height: "12%",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.7)",
    left: "30%",
  },
  goalAreaTop: {
    top: 0,
    borderTopWidth: 0,
  },
  goalAreaBottom: {
    bottom: 0,
    borderBottomWidth: 0,
  },
  centerCircle: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.7)",
    top: "50%",
    left: "50%",
    marginTop: -35,
    marginLeft: -35,
  },
  centerLine: {
    position: "absolute",
    width: "100%",
    height: 2,
    backgroundColor: "rgba(255,255,255,0.7)",
    top: "50%",
    marginTop: -1,
  },
  goal: {
    position: "absolute",
    width: "25%",
    height: 6,
    backgroundColor: "white",
    left: "37.5%",
    borderRadius: 3,
  },
  goalTop: {
    top: -3,
  },
  goalBottom: {
    bottom: -3,
  },

  fieldPositionsImproved: {
    flex: 1,
    justifyContent: "space-around",
    paddingVertical: 20,
    paddingHorizontal: 5,
    zIndex: 2,
  },

  fieldRowImproved: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 6,
  },

  emptyRowImproved: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 6,
  },

  centerLineLabel: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },

  centerLineText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#2E7D32",
  },

  soccerPositionImproved: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    padding: 6,
    minWidth: 68,
    minHeight: 68,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    marginHorizontal: 2,
  },
  soccerPositionOccupied: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  goalkeeperPosition: {
    backgroundColor: Colors.warning,
    borderColor: "#FFB300",
  },
  selectedPosition: {
    backgroundColor: Colors.primary,
    borderColor: "white",
    transform: [{ scale: 1.05 }],
    elevation: 6,
  },
  positionIcon: {
    marginBottom: 4,
  },
  soccerPositionName: {
    fontSize: 11,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 2,
    textAlign: "center",
  },
  soccerPositionPlayer: {
    fontSize: 9,
    color: Colors.textSecondary,
    textAlign: "center",
    fontWeight: "500",
  },
  soccerPositionNameWhite: {
    color: "white",
  },
  soccerPositionPlayerWhite: {
    color: "rgba(255, 255, 255, 0.9)",
  },

  fieldLegendImproved: {
    backgroundColor: "rgba(0,0,0,0.1)",
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
    width: "100%",
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  legendItems: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
  },
  legendText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "500",
  },

  selectedPositionInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  selectedPositionText: {
    fontSize: 16,
    color: Colors.success,
    fontWeight: "500",
  },
  playersSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  playersList: {
    gap: 12,
    marginBottom: 20,
  },
  playerItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  playerInitial: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  playerRole: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  positionEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  youBadge: {
    backgroundColor: Colors.success,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  youText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "white",
  },
  availablePositions: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  availableTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 4,
  },
  availableText: {
    fontSize: 14,
    color: Colors.primary,
    textAlign: "center",
  },
  paymentInfo: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  paymentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  paymentNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    gap: 8,
  },
  paymentNoteText: {
    fontSize: 14,
    color: Colors.info,
    flex: 1,
  },
  joinContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  joinButton: {
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  joinButtonDisabled: {
    opacity: 0.6,
  },
  viewEventButton: {
    backgroundColor: Colors.secondary,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 16,
  },
});

export default JoinEventScreen;
