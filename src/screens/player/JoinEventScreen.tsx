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
  Animated,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { HomeStackParamList, Event, PlayerPosition, Player, FieldType } from "../../types";
import { Colors, Gradients } from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";
import CustomButton from "../../components/common/CustomButton";

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

// Tipos para posiciones en la cancha
interface FieldPosition {
  id: string;
  x: number; // Posición X en porcentaje (0-100)
  y: number; // Posición Y en porcentaje (0-100)
  role: PlayerPosition;
  isOccupied: boolean;
  player?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

// Configuración de canchas
const getFieldLayout = (fieldType: FieldType): FieldPosition[] => {
  switch (fieldType) {
    case "futbol5":
      return [
        // Arquero
        { id: "gk1", x: 50, y: 10, role: "goalkeeper", isOccupied: false },
        // Defensas
        { id: "def1", x: 25, y: 30, role: "defender", isOccupied: false },
        { id: "def2", x: 75, y: 30, role: "defender", isOccupied: false },
        // Mediocampos
        { id: "mid1", x: 35, y: 55, role: "midfielder", isOccupied: true, player: { id: "1", name: "Juan P." } },
        { id: "mid2", x: 65, y: 55, role: "midfielder", isOccupied: true, player: { id: "2", name: "Carlos M." } },
        // Delanteros
        { id: "fwd1", x: 50, y: 80, role: "forward", isOccupied: true, player: { id: "3", name: "Luis R." } },
        // Posiciones adicionales para suplentes/rotación
        { id: "sub1", x: 20, y: 70, role: "midfielder", isOccupied: false },
        { id: "sub2", x: 80, y: 70, role: "defender", isOccupied: false },
        { id: "sub3", x: 50, y: 45, role: "forward", isOccupied: true, player: { id: "4", name: "Pedro L." } },
        { id: "sub4", x: 15, y: 50, role: "midfielder", isOccupied: false },
      ];
    
    case "futbol7":
      return [
        // Arquero
        { id: "gk1", x: 50, y: 8, role: "goalkeeper", isOccupied: true, player: { id: "1", name: "Miguel A." } },
        // Defensas
        { id: "def1", x: 20, y: 25, role: "defender", isOccupied: false },
        { id: "def2", x: 50, y: 25, role: "defender", isOccupied: true, player: { id: "2", name: "Ana S." } },
        { id: "def3", x: 80, y: 25, role: "defender", isOccupied: false },
        // Mediocampos
        { id: "mid1", x: 25, y: 50, role: "midfielder", isOccupied: true, player: { id: "3", name: "José M." } },
        { id: "mid2", x: 50, y: 50, role: "midfielder", isOccupied: false },
        { id: "mid3", x: 75, y: 50, role: "midfielder", isOccupied: true, player: { id: "4", name: "Laura K." } },
        // Delanteros
        { id: "fwd1", x: 35, y: 75, role: "forward", isOccupied: false },
        { id: "fwd2", x: 65, y: 75, role: "forward", isOccupied: true, player: { id: "5", name: "David R." } },
        // Suplentes
        { id: "sub1", x: 10, y: 40, role: "defender", isOccupied: false },
        { id: "sub2", x: 90, y: 40, role: "midfielder", isOccupied: false },
        { id: "sub3", x: 50, y: 65, role: "forward", isOccupied: true, player: { id: "6", name: "Carmen L." } },
        { id: "sub4", x: 15, y: 65, role: "midfielder", isOccupied: false },
        { id: "sub5", x: 85, y: 65, role: "defender", isOccupied: true, player: { id: "7", name: "Roberto C." } },
      ];
    
    case "futbol11":
      return [
        // Arquero
        { id: "gk1", x: 50, y: 5, role: "goalkeeper", isOccupied: true, player: { id: "1", name: "Alejandro G." } },
        // Defensas
        { id: "def1", x: 15, y: 20, role: "defender", isOccupied: false },
        { id: "def2", x: 35, y: 20, role: "defender", isOccupied: true, player: { id: "2", name: "María F." } },
        { id: "def3", x: 65, y: 20, role: "defender", isOccupied: false },
        { id: "def4", x: 85, y: 20, role: "defender", isOccupied: true, player: { id: "3", name: "Carlos V." } },
        // Mediocampos
        { id: "mid1", x: 20, y: 40, role: "midfielder", isOccupied: true, player: { id: "4", name: "Lucía P." } },
        { id: "mid2", x: 40, y: 40, role: "midfielder", isOccupied: false },
        { id: "mid3", x: 60, y: 40, role: "midfielder", isOccupied: true, player: { id: "5", name: "Fernando M." } },
        { id: "mid4", x: 80, y: 40, role: "midfielder", isOccupied: false },
        // Mediocampos ofensivos
        { id: "amid1", x: 30, y: 60, role: "midfielder", isOccupied: true, player: { id: "6", name: "Isabella R." } },
        { id: "amid2", x: 70, y: 60, role: "midfielder", isOccupied: false },
        // Delanteros
        { id: "fwd1", x: 25, y: 80, role: "forward", isOccupied: false },
        { id: "fwd2", x: 50, y: 80, role: "forward", isOccupied: true, player: { id: "7", name: "Gabriel H." } },
        { id: "fwd3", x: 75, y: 80, role: "forward", isOccupied: true, player: { id: "8", name: "Valentina S." } },
        // Suplentes en el banco
        { id: "sub1", x: 10, y: 55, role: "defender", isOccupied: false },
        { id: "sub2", x: 90, y: 55, role: "midfielder", isOccupied: false },
        { id: "sub3", x: 50, y: 30, role: "midfielder", isOccupied: true, player: { id: "9", name: "Diego A." } },
        { id: "sub4", x: 10, y: 30, role: "defender", isOccupied: false },
        { id: "sub5", x: 90, y: 30, role: "forward", isOccupied: true, player: { id: "10", name: "Camila T." } },
        { id: "sub6", x: 50, y: 95, role: "forward", isOccupied: false },
        { id: "sub7", x: 25, y: 25, role: "midfielder", isOccupied: false },
        { id: "sub8", x: 75, y: 25, role: "defender", isOccupied: true, player: { id: "11", name: "Andrés K." } },
        { id: "sub9", x: 15, y: 70, role: "midfielder", isOccupied: false },
      ];
    
    default:
      return [];
  }
};

// Mock event data con posiciones
const mockEvent: Event = {
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
    type: "futbol7", // Cambiable para probar diferentes tipos
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
};

const JoinEventScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = useAuth();
  const { eventId } = route.params;
  const [event, setEvent] = useState<Event | null>(null);
  const [fieldPositions, setFieldPositions] = useState<FieldPosition[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [showFieldView, setShowFieldView] = useState(true);

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      // Simular carga de API
      setTimeout(() => {
        setEvent(mockEvent);
        setFieldPositions(getFieldLayout(mockEvent.field.type));
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error loading event details:", error);
      setLoading(false);
    }
  };

  const handlePositionSelect = (positionId: string) => {
    const position = fieldPositions.find(p => p.id === positionId);
    if (position && !position.isOccupied) {
      setSelectedPosition(positionId);
    }
  };

  const handleJoinEvent = async () => {
    if (!selectedPosition || !event || !user) {
      Alert.alert("Error", "Por favor selecciona una posición en la cancha.");
      return;
    }

    try {
      setJoining(true);

      // Simular unirse al evento
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Actualizar la posición como ocupada
      setFieldPositions(prev => 
        prev.map(pos => 
          pos.id === selectedPosition 
            ? { ...pos, isOccupied: true, player: { id: user.id || "", name: user.fullName } }
            : pos
        )
      );

      Alert.alert(
        "¡Te has unido al partido! ⚽",
        `Has sido registrado en la posición seleccionada. Te enviaremos recordatorios antes del partido.`,
        [
          {
            text: "Ver evento",
            onPress: () => navigation.navigate("EventDetails", { eventId: event.id }),
          },
          {
            text: "Ir al inicio",
            onPress: () => navigation.navigate("MapView"),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "No pudimos unirte al partido. Intenta nuevamente.",
        [{ text: "OK" }]
      );
    } finally {
      setJoining(false);
    }
  };

  const getPositionColor = (role: PlayerPosition): string => {
    switch (role) {
      case "goalkeeper": return "#FF9800";
      case "defender": return "#2196F3";
      case "midfielder": return "#4CAF50";
      case "forward": return "#F44336";
      default: return Colors.primary;
    }
  };

  const getPositionIcon = (role: PlayerPosition): string => {
    switch (role) {
      case "goalkeeper": return "🥅";
      case "defender": return "🛡️";
      case "midfielder": return "⚡";
      case "forward": return "⚽";
      default: return "👤";
    }
  };

  const getFieldDimensions = (fieldType: FieldType) => {
    switch (fieldType) {
      case "futbol5": return { width: 280, height: 180 };
      case "futbol7": return { width: 320, height: 200 };
      case "futbol11": return { width: 360, height: 240 };
      default: return { width: 320, height: 200 };
    }
  };

  if (loading || !event) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <View style={styles.loadingContainer}>
          <Text>Cargando evento...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const fieldDimensions = getFieldDimensions(event.field.type);
  const availablePositions = fieldPositions.filter(p => !p.isOccupied);
  const occupiedPositions = fieldPositions.filter(p => p.isOccupied);

  const FieldVisualizer = () => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldTitle}>
        {getPositionIcon(event.field.type as any)} Cancha {event.field.type.replace("futbol", "Fútbol ")}
      </Text>
      
      <View style={[styles.field, { width: fieldDimensions.width, height: fieldDimensions.height }]}>
        {/* Líneas de la cancha */}
        <View style={styles.fieldLines}>
          {/* Área grande */}
          <View style={[styles.goalArea, styles.goalAreaTop]} />
          <View style={[styles.goalArea, styles.goalAreaBottom]} />
          
          {/* Círculo central */}
          <View style={styles.centerCircle} />
          
          {/* Línea central */}
          <View style={styles.centerLine} />
          
          {/* Arcos */}
          <View style={[styles.goal, styles.goalTop]} />
          <View style={[styles.goal, styles.goalBottom]} />
        </View>

        {/* Posiciones de jugadores */}
        {fieldPositions.map((position) => (
          <TouchableOpacity
            key={position.id}
            style={[
              styles.playerPosition,
              {
                left: `${position.x}%`,
                top: `${position.y}%`,
                backgroundColor: position.isOccupied 
                  ? getPositionColor(position.role)
                  : selectedPosition === position.id 
                    ? Colors.primary 
                    : 'rgba(255, 255, 255, 0.8)',
                borderColor: getPositionColor(position.role),
                borderWidth: selectedPosition === position.id ? 3 : 1.5,
                opacity: position.isOccupied ? 0.9 : selectedPosition === position.id ? 1 : 0.7,
              }
            ]}
            onPress={() => handlePositionSelect(position.id)}
            disabled={position.isOccupied}
            activeOpacity={0.8}
          >
            {position.isOccupied ? (
              <View style={styles.occupiedPosition}>
                <Text style={styles.playerInitial}>
                  {position.player?.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            ) : (
              <Ionicons 
                name={selectedPosition === position.id ? "checkmark" : "add"} 
                size={selectedPosition === position.id ? 16 : 12} 
                color={selectedPosition === position.id ? "white" : getPositionColor(position.role)} 
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Leyenda */}
      <View style={styles.legend}>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendIcon, { backgroundColor: "#FF9800" }]} />
            <Text style={styles.legendText}>Arquero</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendIcon, { backgroundColor: "#2196F3" }]} />
            <Text style={styles.legendText}>Defensa</Text>
          </View>
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendIcon, { backgroundColor: "#4CAF50" }]} />
            <Text style={styles.legendText}>Mediocampo</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendIcon, { backgroundColor: "#F44336" }]} />
            <Text style={styles.legendText}>Delantero</Text>
          </View>
        </View>
      </View>
    </View>
  );

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

          <Text style={styles.headerTitle}>Unirse al partido</Text>
          
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Event Summary */}
        <View style={styles.eventSummary}>
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventHost}>{event.host.businessName}</Text>

            <View style={styles.eventMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
                <Text style={styles.metaText}>Viernes 14 Jun</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color={Colors.primary} />
                <Text style={styles.metaText}>{event.startTime} - {event.endTime}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="cash-outline" size={16} color={Colors.primary} />
                <Text style={styles.metaText}>${event.pricePerPlayer.toLocaleString()}</Text>
              </View>
            </View>
          </View>

          <View style={styles.playersIndicator}>
            <Text style={styles.playersCount}>{occupiedPositions.length}/{event.maxPlayers}</Text>
            <Text style={styles.playersLabel}>Jugadores</Text>
          </View>
        </View>

        {/* Field Visualizer */}
        {showFieldView ? (
          <View style={styles.fieldSection}>
            <Text style={styles.sectionTitle}>Selecciona tu posición</Text>
            <Text style={styles.sectionSubtitle}>
              Toca una posición libre para unirte al partido
            </Text>
            
            <FieldVisualizer />

            {selectedPosition && (
              <View style={styles.selectedPositionInfo}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <Text style={styles.selectedPositionText}>
                  Posición seleccionada: {
                    fieldPositions.find(p => p.id === selectedPosition)?.role === "goalkeeper" ? "Arquero" :
                    fieldPositions.find(p => p.id === selectedPosition)?.role === "defender" ? "Defensa" :
                    fieldPositions.find(p => p.id === selectedPosition)?.role === "midfielder" ? "Mediocampo" :
                    "Delantero"
                  }
                </Text>
              </View>
            )}
          </View>
        ) : (
          /* Lista de jugadores */
          <View style={styles.playersSection}>
            <Text style={styles.sectionTitle}>Jugadores confirmados</Text>
            
            <View style={styles.playersList}>
              {occupiedPositions.map((position) => (
                <View key={position.id} style={styles.playerItem}>
                  <View style={[styles.playerAvatar, { backgroundColor: getPositionColor(position.role) }]}>
                    <Text style={styles.playerInitial}>
                      {position.player?.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{position.player?.name}</Text>
                    <Text style={styles.playerRole}>
                      {position.role === "goalkeeper" ? "Arquero" :
                       position.role === "defender" ? "Defensa" :
                       position.role === "midfielder" ? "Mediocampo" : "Delantero"}
                    </Text>
                  </View>
                  <Text style={styles.positionEmoji}>{getPositionIcon(position.role)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.availablePositions}>
              <Text style={styles.availableTitle}>
                {availablePositions.length} posiciones disponibles
              </Text>
              <Text style={styles.availableText}>
                Cambia a vista de cancha para seleccionar tu posición
              </Text>
            </View>
          </View>
        )}

        {/* Payment Info */}
        <View style={styles.paymentInfo}>
          <Text style={styles.sectionTitle}>Información de pago</Text>

          <View style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Costo por jugador:</Text>
              <Text style={styles.paymentValue}>${event.pricePerPlayer.toLocaleString()}</Text>
            </View>

            <View style={styles.paymentNote}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.info} />
              <Text style={styles.paymentNoteText}>
                El pago se realiza en efectivo directamente en la cancha
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Join Button */}
      <View style={styles.joinContainer}>
        <CustomButton
          title={joining ? "Uniéndote..." : selectedPosition ? "Confirmar posición y unirse" : "Selecciona una posición"}
          onPress={handleJoinEvent}
          loading={joining}
          disabled={!selectedPosition || joining}
          fullWidth
          icon="checkmark-circle"
          style={[styles.joinButton, !selectedPosition && styles.joinButtonDisabled]}
        />

        <Text style={styles.disclaimer}>
          Al unirte aceptas los términos de uso y las políticas de cancelación
        </Text>
      </View>
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
    padding: 20,
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
    marginBottom: 16,
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
    height: "15%",
    borderWidth: 2,
    borderColor: "white",
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
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "white",
    top: "50%",
    left: "50%",
    marginTop: -30,
    marginLeft: -30,
  },
  centerLine: {
    position: "absolute",
    width: "100%",
    height: 2,
    backgroundColor: "white",
    top: "50%",
    marginTop: -1,
  },
  goal: {
    position: "absolute",
    width: "20%",
    height: 8,
    backgroundColor: "white",
    left: "40%",
    borderRadius: 4,
  },
  goalTop: {
    top: -4,
  },
  goalBottom: {
    bottom: -4,
  },
  playerPosition: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -16,
    marginTop: -16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  occupiedPosition: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  playerInitial: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
  legend: {
    width: "100%",
    gap: 8,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
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
  disclaimer: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 16,
  },
});

export default JoinEventScreen;