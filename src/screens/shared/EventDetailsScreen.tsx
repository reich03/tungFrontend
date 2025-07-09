import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
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
import { EventForFrontend, getPositionType } from "../../types/eventTypes";

const { width } = Dimensions.get("window");

type EventDetailsScreenNavigationProp = StackNavigationProp<
  HomeStackParamList,
  "EventDetails"
>;
type EventDetailsScreenRouteProp = RouteProp<
  HomeStackParamList,
  "EventDetails"
>;

interface Props {
  navigation: EventDetailsScreenNavigationProp;
  route: EventDetailsScreenRouteProp;
}

const EventDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = useAuth();
  const { eventId } = route.params;
  const [event, setEvent] = useState<EventForFrontend | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      const result = await playerEventService.getEventDetails(eventId);

      if (result.success && result.data) {
        setEvent(result.data);
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

  const getPositionDisplayName = (positionName: string): string => {
    const type = getPositionType(positionName);
    const teamLetter = positionName.includes("A") ? "A" : "B";
    const number = positionName.match(/\d+/)?.[0] || "";

    return `${type} ${teamLetter}${number ? number : ""}`;
  };

  const getPositionEmoji = (positionName: string): string => {
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

  const isUserJoined =
    event?.positions.some((p) => p.jugadorId === user?.id) || false;
  const canJoin =
    event?.status === "available" && event.availableSpaces > 0 && !isUserJoined;

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

  const occupiedPositions = event.positions.filter((p) => p.ocupada);
  const availablePositions = event.positions.filter((p) => !p.ocupada);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

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

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
              <Ionicons
                name="share-outline"
                size={24}
                color={Colors.textLight}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
              <Ionicons
                name="heart-outline"
                size={24}
                color={Colors.textLight}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleRefresh}
              activeOpacity={0.7}
            >
              <Ionicons
                name="refresh-outline"
                size={24}
                color={Colors.textLight}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventHost}>
            {event.fieldInfo?.businessName || event.fieldName}
          </Text>

          <View style={styles.eventMeta}>
            <View style={styles.metaItem}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={Colors.textLight}
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
                color={Colors.textLight}
              />
              <Text style={styles.metaText}>{event.time}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons
                name="people-outline"
                size={16}
                color={Colors.textLight}
              />
              <Text style={styles.metaText}>
                {event.registeredPlayers}/{event.maxPlayers}
              </Text>
            </View>
          </View>
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
        <View style={styles.quickInfo}>
          <View style={styles.infoCard}>
            <Ionicons name="cash-outline" size={24} color={Colors.primary} />
            <Text style={styles.infoValue}>
              ${event.fieldInfo?.pricePerPlayer?.toLocaleString() || "N/A"}
            </Text>
            <Text style={styles.infoLabel}>Por jugador</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons
              name="football-outline"
              size={24}
              color={Colors.primary}
            />
            <Text style={styles.infoValue}>
              {event.fieldType.replace("futbol", "F")}
            </Text>
            <Text style={styles.infoLabel}>Tipo de cancha</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="star-outline" size={24} color={Colors.primary} />
            <Text style={styles.infoValue}>
              {event.fieldInfo?.rating?.toFixed(1) || "N/A"}
            </Text>
            <Text style={styles.infoLabel}>Calificación</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color={Colors.success}
            />
            <Text style={styles.infoValue}>{event.availableSpaces}</Text>
            <Text style={styles.infoLabel}>Disponibles</Text>
          </View>
        </View>

        {event.fieldInfo?.photos && event.fieldInfo.photos.length > 0 && (
          <View style={styles.photosSection}>
            <Text style={styles.sectionTitle}>Fotos del establecimiento</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.photosScroll}
            >
              {event.fieldInfo.photos.map((photo, index) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del lugar</Text>

          <View style={styles.fieldInfo}>
            <View style={styles.fieldDetail}>
              <Ionicons
                name="location-outline"
                size={20}
                color={Colors.primary}
              />
              <Text style={styles.fieldDetailText}>
                {event.fieldInfo?.address || "Dirección no disponible"}
              </Text>
            </View>

            <View style={styles.fieldDetail}>
              <Ionicons name="call-outline" size={20} color={Colors.primary} />
              <Text style={styles.fieldDetailText}>
                {event.fieldInfo?.phone || "Teléfono no disponible"}
              </Text>
            </View>

            <View style={styles.fieldDetail}>
              <Ionicons name="time-outline" size={20} color={Colors.primary} />
              <Text style={styles.fieldDetailText}>
                {event.fieldInfo?.openTime || "06:00"} -{" "}
                {event.fieldInfo?.closeTime || "22:00"}
              </Text>
            </View>

            {event.fieldInfo?.isVerified && (
              <View style={styles.fieldDetail}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={Colors.success}
                />
                <Text
                  style={[styles.fieldDetailText, { color: Colors.success }]}
                >
                  Establecimiento verificado
                </Text>
              </View>
            )}
          </View>
        </View>

        {event.fieldInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Administrador</Text>

            <View style={styles.ownerCard}>
              <View style={styles.ownerAvatar}>
                {event.fieldInfo.ownerAvatar ? (
                  <Image
                    source={{ uri: event.fieldInfo.ownerAvatar }}
                    style={styles.ownerAvatarImage}
                  />
                ) : (
                  <Ionicons name="person" size={24} color={Colors.textLight} />
                )}
              </View>
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerName}>
                  {event.fieldInfo.ownerName}
                </Text>
                <Text style={styles.ownerRole}>Propietario</Text>
              </View>
              <View style={styles.ownerRating}>
                <Ionicons name="star" size={16} color={Colors.warning} />
                <Text style={styles.ownerRatingText}>
                  {event.fieldInfo.rating?.toFixed(1) || "N/A"}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Jugadores confirmados</Text>
            <Text style={styles.participantsCount}>
              {event.registeredPlayers} de {event.maxPlayers}
            </Text>
          </View>

          {occupiedPositions.length > 0 && (
            <View style={styles.playersList}>
              <Text style={styles.playersSubtitle}>Posiciones ocupadas</Text>
              {occupiedPositions.map((position) => (
                <View key={position.id} style={styles.playerCard}>
                  <View style={styles.playerAvatar}>
                    <Text style={styles.playerEmoji}>
                      {getPositionEmoji(position.nombre)}
                    </Text>
                  </View>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>
                      {position.nombreJugador || "Jugador"}
                    </Text>
                    <Text style={styles.playerPosition}>
                      {getPositionDisplayName(position.nombre)}
                    </Text>
                  </View>
                  <View style={styles.playerStatus}>
                    <View style={styles.statusBadge}>
                      <Ionicons name="checkmark" size={12} color="white" />
                      <Text style={styles.statusText}>Confirmado</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {availablePositions.length > 0 && (
            <View style={styles.playersList}>
              <Text style={styles.playersSubtitle}>
                Posiciones disponibles ({availablePositions.length})
              </Text>
              {availablePositions.slice(0, 5).map((position) => (
                <View
                  key={position.id}
                  style={[styles.playerCard, styles.availablePlayerCard]}
                >
                  <View
                    style={[styles.playerAvatar, styles.availablePlayerAvatar]}
                  >
                    <Text style={styles.playerEmoji}>
                      {getPositionEmoji(position.nombre)}
                    </Text>
                  </View>
                  <View style={styles.playerInfo}>
                    <Text style={styles.availablePlayerName}>
                      {getPositionDisplayName(position.nombre)}
                    </Text>
                    <Text style={styles.availablePlayerText}>
                      Posición libre
                    </Text>
                  </View>
                  <Ionicons
                    name="add-circle-outline"
                    size={24}
                    color={Colors.primary}
                  />
                </View>
              ))}

              {availablePositions.length > 5 && (
                <Text style={styles.morePositionsText}>
                  +{availablePositions.length - 5} posiciones más disponibles
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado del partido</Text>

          <View style={styles.statusCard}>
            <View style={styles.statusInfo}>
              <Text style={styles.statusValue}>
                {Math.round((event.registeredPlayers / event.maxPlayers) * 100)}
                %
              </Text>
              <Text style={styles.statusLabel}>Completado</Text>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      (event.registeredPlayers / event.maxPlayers) * 100
                    }%`,
                  },
                ]}
              />
            </View>

            <Text style={styles.statusDescription}>
              {event.availableSpaces === 0
                ? "¡Partido completo! 🎉"
                : `Faltan ${event.availableSpaces} jugadores para completar`}
            </Text>
          </View>
        </View>
      </ScrollView>

      {user?.userType === "player" && (
        <View style={styles.joinContainer}>
          <CustomButton
            title={
              isUserJoined
                ? "Ya estás inscrito ✅"
                : canJoin
                ? "Unirse al partido"
                : event.availableSpaces === 0
                ? "Partido completo"
                : "No disponible"
            }
            onPress={() => {
              if (canJoin) {
                navigation.navigate("JoinEvent", { eventId: event.id });
              }
            }}
            disabled={!canJoin}
            fullWidth
            icon={
              isUserJoined
                ? "checkmark-circle"
                : canJoin
                ? "add-circle"
                : "close-circle"
            }
            style={[
              styles.joinButton,
              isUserJoined && styles.joinedButton,
              !canJoin && !isUserJoined && styles.disabledButton,
            ]}
          />

          {!isUserJoined && (
            <Text style={styles.priceInfo}>
              Costo: $
              {event.fieldInfo?.pricePerPlayer?.toLocaleString() || "N/A"} por
              jugador
            </Text>
          )}
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
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  eventHeader: {
    alignItems: "center",
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textLight,
    textAlign: "center",
    marginBottom: 8,
  },
  eventHost: {
    fontSize: 16,
    color: Colors.textLight,
    opacity: 0.9,
    marginBottom: 16,
  },
  eventMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: Colors.textLight,
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  quickInfo: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 8,
  },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  photosSection: {
    paddingVertical: 16,
  },
  photosScroll: {
    paddingLeft: 20,
  },
  photo: {
    width: 120,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  fieldInfo: {
    gap: 16,
  },
  fieldDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fieldDetailText: {
    fontSize: 16,
    color: Colors.textSecondary,
    flex: 1,
  },
  ownerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  ownerAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  ownerRole: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  ownerRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ownerRatingText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  participantsCount: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  playersList: {
    gap: 12,
    marginBottom: 16,
  },
  playersSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  playerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  availablePlayerCard: {
    borderStyle: "dashed",
    backgroundColor: Colors.background,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  availablePlayerAvatar: {
    backgroundColor: Colors.divider,
  },
  playerEmoji: {
    fontSize: 18,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  availablePlayerName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  playerPosition: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "500",
  },
  availablePlayerText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: "italic",
  },
  playerStatus: {
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.success,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
  morePositionsText: {
    fontSize: 14,
    color: Colors.primary,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
  },
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  statusInfo: {
    alignItems: "center",
    marginBottom: 16,
  },
  statusValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.primary,
  },
  statusLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: Colors.divider,
    borderRadius: 4,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  statusDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  joinContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  joinButton: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 8,
  },
  joinedButton: {
    backgroundColor: Colors.success,
  },
  disabledButton: {
    opacity: 0.6,
  },
  priceInfo: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});

export default EventDetailsScreen;
