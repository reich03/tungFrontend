import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Alert,
  ScrollView,
  Animated,
} from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";

import { HomeStackParamList, Event } from "../../types";
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";
import CustomButton from "../../components/common/CustomButton";

const { width, height } = Dimensions.get("window");

type HomeScreenNavigationProp = StackNavigationProp<
  HomeStackParamList,
  "MapView"
>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

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
      coordinates: {
        latitude: 4.1468,
        longitude: -73.6334,
      },
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
      coordinates: {
        latitude: 4.1375,
        longitude: -73.622,
      },
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
    currentPlayers: 6,
    pricePerPlayer: 8000,
    status: "open",
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
      businessName: "Deportivo Central",
      address: "Carrera 50 #45-12, Barranquilla",
      coordinates: {
        latitude: 4.137,
        longitude: -73.6215,
      },
      description: "Centro deportivo familiar",
      fields: [],
      rating: 4.8,
      totalReviews: 89,
      businessHours: {},
      contactInfo: {},
    },
    fieldId: "1",
    field: {
      id: "1",
      name: "Cancha VIP",
      type: "futbol11",
      capacity: 22,
      pricePerHour: 80000,
      hasLighting: true,
      isIndoor: false,
      amenities: ["Baños", "Parqueadero", "Cafetería", "Vestidores"],
      images: [],
      isActive: true,
    },
    title: "Fútbol 11 - Domingo",
    description: "Partido profesional, equipos completos",
    date: "2025-06-16",
    startTime: "16:00",
    endTime: "17:30",
    duration: 90,
    maxPlayers: 22,
    currentPlayers: 18,
    pricePerPlayer: 12000,
    status: "open",
    participants: [],
    createdAt: "2025-06-14",
  },
  {
    id: "4",
    hostId: "2",
    host: {
      id: "2",
      email: "futbol@ejemplo.com",
      fullName: "Centro Deportivo Norte",
      phone: "+57 300 987 6543",
      userType: "host",
      isActive: true,
      createdAt: "2025-01-01",
      businessName: "Cancha Los Andes",
      address: "Calle 80 #25-15, Barranquilla",
      coordinates: {
        latitude: 4.145,
        longitude: -73.629,
      },
      description: "Cancha techada con aire acondicionado",
      fields: [],
      rating: 4.7,
      totalReviews: 156,
      businessHours: {},
      contactInfo: {},
    },
    fieldId: "2",
    field: {
      id: "2",
      name: "Cancha Techada",
      type: "futbol5",
      capacity: 10,
      pricePerHour: 60000,
      hasLighting: true,
      isIndoor: true,
      amenities: ["Baños", "Parqueadero", "A/C", "Vestidores"],
      images: [],
      isActive: true,
    },
    title: "Fútbol 5 Techado - Lunes",
    description: "Partido bajo techo, ideal para cualquier clima",
    date: "2025-06-17",
    startTime: "20:00",
    endTime: "21:00",
    duration: 60,
    maxPlayers: 10,
    currentPlayers: 4,
    pricePerPlayer: 9500,
    status: "open",
    participants: [],
    createdAt: "2025-06-14",
  },
];

const BOTTOM_SHEET_MIN_HEIGHT = 140;
const BOTTOM_SHEET_MAX_HEIGHT = height * 0.7;

// 🔥 REGIÓN INICIAL FIJA - Barranquilla centro
const INITIAL_REGION = {
  latitude: 4.1252066,
  longitude: -73.6377385,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // 🔥 EL MAPA SIEMPRE INICIA EN LA REGIÓN FIJA
  const [mapRegion, setMapRegion] = useState(INITIAL_REGION);
  
  const mapRef = useRef<MapView>(null);
  const bottomSheetHeight = useRef(new Animated.Value(BOTTOM_SHEET_MIN_HEIGHT)).current;
  const lastGestureY = useRef(new Animated.Value(0)).current;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  // 🔥 FUNCIÓN MODIFICADA - NO ACTUALIZA EL MAPA AUTOMÁTICAMENTE
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permisos de ubicación",
          "Necesitamos acceder a tu ubicación para mostrarte eventos cercanos.",
          [{ text: "OK" }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);

      // 🔥 YA NO ACTUALIZAMOS mapRegion AQUÍ
      // Solo guardamos la ubicación del usuario para usarla cuando él quiera
      
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  // 🔥 FUNCIÓN PARA CENTRAR EN LA UBICACIÓN DEL USUARIO MANUALMENTE
  const centerOnUserLocation = () => {
    if (userLocation && mapRef.current) {
      const userRegion = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      
      mapRef.current.animateToRegion(userRegion, 1000);
      setMapRegion(userRegion); // Actualizamos el estado para que se mantenga
    } else {
      Alert.alert(
        "Ubicación no disponible",
        "No pudimos obtener tu ubicación. Verifica los permisos.",
        [{ text: "OK" }]
      );
    }
  };

  // 🔥 FUNCIÓN PARA MANEJAR NAVEGACIÓN A UNIRSE AL EVENTO
  const handleJoinEvent = (event: Event) => {
    if (event.status === "full") {
      Alert.alert(
        "Partido completo",
        "Este partido ya está completo. ¿Quieres ver los detalles o unirte a la lista de espera?",
        [
          { text: "Cancelar", style: "cancel" },
          { 
            text: "Ver detalles", 
            onPress: () => navigation.navigate("EventDetails", { eventId: event.id })
          },
        ]
      );
      return;
    }

    if (event.status === "cancelled") {
      Alert.alert(
        "Partido cancelado",
        "Este partido ha sido cancelado por el organizador.",
        [{ text: "OK" }]
      );
      return;
    }

    // Para eventos abiertos, ir directamente a JoinEvent
    navigation.navigate("JoinEvent", { eventId: event.id });
  };

  const toggleBottomSheet = () => {
    const toValue = isExpanded
      ? BOTTOM_SHEET_MIN_HEIGHT
      : BOTTOM_SHEET_MAX_HEIGHT;

    Animated.spring(bottomSheetHeight, {
      toValue,
      useNativeDriver: false,
      tension: 150,
      friction: 10,
    }).start();

    setIsExpanded(!isExpanded);
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: lastGestureY } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.BEGAN) {
      setIsDragging(true);
    }

    if (event.nativeEvent.oldState === State.ACTIVE) {
      setIsDragging(false);
      const { translationY, velocityY } = event.nativeEvent;

      let shouldExpand = isExpanded;

      if (Math.abs(velocityY) > 500) {
        shouldExpand = velocityY < 0;
      } else {
        const currentHeight = isExpanded
          ? BOTTOM_SHEET_MAX_HEIGHT
          : BOTTOM_SHEET_MIN_HEIGHT;
        const threshold =
          (BOTTOM_SHEET_MAX_HEIGHT - BOTTOM_SHEET_MIN_HEIGHT) / 2;
        shouldExpand = translationY < -threshold;
      }

      const toValue = shouldExpand
        ? BOTTOM_SHEET_MAX_HEIGHT
        : BOTTOM_SHEET_MIN_HEIGHT;

      Animated.spring(bottomSheetHeight, {
        toValue,
        useNativeDriver: false,
        tension: 120,
        friction: 12,
        velocity: velocityY / 1000,
      }).start();

      setIsExpanded(shouldExpand);
      lastGestureY.setValue(0);
    }
  };

  // 🔥 FUNCIÓN PARA OBTENER EL TEXTO Y COLOR DEL BOTÓN SEGÚN EL STATUS
  const getEventButtonConfig = (event: Event) => {
    switch (event.status) {
      case "open":
        return {
          text: "Unirse al partido",
          color: Colors.primary,
          backgroundColor: Colors.primary,
        };
      case "full":
        return {
          text: "Partido completo",
          color: Colors.warning,
          backgroundColor: Colors.warning,
        };
      case "cancelled":
        return {
          text: "Cancelado",
          color: Colors.error,
          backgroundColor: Colors.error,
        };
      default:
        return {
          text: "Ver detalles",
          color: Colors.primary,
          backgroundColor: Colors.primary,
        };
    }
  };

  const CustomCallout: React.FC<{ event: Event }> = ({ event }) => {
    const buttonConfig = getEventButtonConfig(event);
    
    return (
      <View style={styles.calloutContainer}>
        <View style={styles.calloutHeader}>
          <Text style={styles.calloutTitle}>{event.host.businessName}</Text>
          <View style={styles.calloutRating}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.calloutRatingText}>{event.host.rating}</Text>
          </View>
        </View>

        <Text style={styles.calloutSubtitle}>{event.title}</Text>

        <View style={styles.calloutDetails}>
          <View style={styles.calloutDetail}>
            <Ionicons name="time-outline" size={12} color={Colors.primary} />
            <Text style={styles.calloutDetailText}>{event.startTime}</Text>
          </View>

          <View style={styles.calloutDetail}>
            <Ionicons name="people-outline" size={12} color={Colors.primary} />
            <Text style={styles.calloutDetailText}>
              {event.currentPlayers}/{event.maxPlayers}
            </Text>
          </View>

          <View style={styles.calloutDetail}>
            <Ionicons name="cash-outline" size={12} color={Colors.primary} />
            <Text style={styles.calloutDetailText}>
              ${event.pricePerPlayer.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* 🔥 BOTÓN ACTUALIZADO PARA IR A JOINEVENT */}
        <TouchableOpacity
          style={[styles.calloutButton, { backgroundColor: buttonConfig.backgroundColor }]}
          onPress={() => handleJoinEvent(event)}
        >
          <Text style={styles.calloutButtonText}>{buttonConfig.text}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const EventListItem: React.FC<{ event: Event }> = ({ event }) => (
    <TouchableOpacity
      style={styles.eventListItem}
      // 🔥 CAMBIO: AHORA VA A JOINEVENT EN LUGAR DE EVENTDETAILS
      onPress={() => handleJoinEvent(event)}
      activeOpacity={0.9}
    >
      <View style={styles.eventItemLeft}>
        <View style={[
          styles.eventItemIcon,
          { 
            backgroundColor: event.status === "open" 
              ? Colors.primaryLight 
              : event.status === "full" 
                ? "rgba(255, 152, 0, 0.1)" 
                : "rgba(244, 67, 54, 0.1)" 
          }
        ]}>
          <Ionicons 
            name="football" 
            size={20} 
            color={
              event.status === "open" 
                ? Colors.primary 
                : event.status === "full" 
                  ? Colors.warning 
                  : Colors.error
            } 
          />
        </View>

        <View style={styles.eventItemInfo}>
          <Text style={styles.eventItemTitle}>{event.title}</Text>
          <Text style={styles.eventItemHost}>{event.host.businessName}</Text>
          <View style={styles.eventItemDetails}>
            <Text style={styles.eventItemDetail}>
              {event.startTime} • {event.field.type}
            </Text>
            <Text style={styles.eventItemPrice}>
              ${event.pricePerPlayer.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.eventItemRight}>
        <View
          style={[
            styles.eventItemStatus,
            {
              backgroundColor:
                event.status === "open" 
                  ? Colors.primaryLight 
                  : event.status === "full"
                    ? "rgba(255, 152, 0, 0.1)"
                    : "rgba(244, 67, 54, 0.1)",
            },
          ]}
        >
          <Text
            style={[
              styles.eventItemStatusText,
              {
                color: 
                  event.status === "open" 
                    ? Colors.primary 
                    : event.status === "full"
                      ? Colors.warning
                      : Colors.error,
              },
            ]}
          >
            {event.currentPlayers}/{event.maxPlayers}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={16}
          color={Colors.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>
              Hola, {user?.fullName?.split(" ")[0]} 👋
            </Text>
            <Text style={styles.subtitle}>Partidos cerca de ti</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.notificationButton}
              activeOpacity={0.8}
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color={Colors.textPrimary}
              />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileButton} activeOpacity={0.8}>
              <Text style={styles.profileInitial}>
                {user?.fullName?.charAt(0).toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{events.length}</Text>
            <Text style={styles.statLabel}>Partidos hoy</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {events.reduce(
                (sum, e) => sum + (e.maxPlayers - e.currentPlayers),
                0
              )}
            </Text>
            <Text style={styles.statLabel}>Cupos libres</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>2.3km</Text>
            <Text style={styles.statLabel}>Más cercano</Text>
          </View>
        </View>
      </View>

      {/* Map */}
      <Animated.View
        style={[
          styles.mapContainer,
          {
            marginBottom: Animated.add(
              bottomSheetHeight,
              lastGestureY.interpolate({
                inputRange: [
                  -BOTTOM_SHEET_MAX_HEIGHT,
                  0,
                  BOTTOM_SHEET_MAX_HEIGHT,
                ],
                outputRange: [
                  BOTTOM_SHEET_MAX_HEIGHT - BOTTOM_SHEET_MIN_HEIGHT,
                  0,
                  -(BOTTOM_SHEET_MAX_HEIGHT - BOTTOM_SHEET_MIN_HEIGHT),
                ],
                extrapolate: "clamp",
              })
            ),
          },
        ]}
      >
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={INITIAL_REGION} // 🔥 REGIÓN INICIAL FIJA
          region={mapRegion} // 🔥 REGIÓN CONTROLADA
          onRegionChangeComplete={setMapRegion} // 🔥 PERMITIR NAVEGACIÓN MANUAL
          showsUserLocation={true} // 🔥 MOSTRAR UBICACIÓN DEL USUARIO (PUNTO AZUL)
          showsMyLocationButton={false} // 🔥 BOTÓN PERSONALIZADO
          mapType="standard"
        >
          {events.map((event) => (
            <Marker
              key={event.id}
              coordinate={event.host.coordinates}
              onPress={() => setSelectedEvent(event)}
            >
              <View style={styles.markerContainer}>
                <View
                  style={[
                    styles.marker,
                    event.currentPlayers >= event.maxPlayers && styles.markerFull,
                    event.status === "cancelled" && styles.markerCancelled,
                  ]}
                >
                  <Ionicons
                    name="football"
                    size={16}
                    color={Colors.textLight}
                  />
                </View>
                <View
                  style={[
                    styles.markerBadge,
                    event.currentPlayers >= event.maxPlayers && styles.markerBadgeFull,
                    event.status === "cancelled" && styles.markerBadgeCancelled,
                  ]}
                >
                  <Text style={styles.markerText}>
                    {event.status === "cancelled" 
                      ? "❌" 
                      : `${event.currentPlayers}/${event.maxPlayers}`
                    }
                  </Text>
                </View>
              </View>

              <Callout tooltip>
                <CustomCallout event={event} />
              </Callout>
            </Marker>
          ))}
        </MapView>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={[
              styles.mapControlButton,
              !userLocation && styles.mapControlButtonDisabled // 🔥 VISUAL CUANDO NO HAY UBICACIÓN
            ]}
            onPress={centerOnUserLocation}
            activeOpacity={0.8}
            disabled={!userLocation} // 🔥 DESHABILITAR SI NO HAY UBICACIÓN
          >
            <Ionicons 
              name="locate" 
              size={20} 
              color={userLocation ? Colors.primary : Colors.textSecondary} // 🔥 COLOR DINÁMICO
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.mapControlButton} activeOpacity={0.8}>
            <Ionicons name="options-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* BOTTOM SHEET */}
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            height: Animated.add(
              bottomSheetHeight,
              lastGestureY.interpolate({
                inputRange: [
                  -BOTTOM_SHEET_MAX_HEIGHT,
                  0,
                  BOTTOM_SHEET_MAX_HEIGHT,
                ],
                outputRange: [
                  BOTTOM_SHEET_MAX_HEIGHT - BOTTOM_SHEET_MIN_HEIGHT,
                  0,
                  -(BOTTOM_SHEET_MAX_HEIGHT - BOTTOM_SHEET_MIN_HEIGHT),
                ],
                extrapolate: "clamp",
              })
            ),
          },
        ]}
      >
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View style={styles.bottomSheetHandle}>
            <TouchableOpacity
              style={styles.handleTouchArea}
              onPress={toggleBottomSheet}
              activeOpacity={0.8}
            >
              <View style={styles.handle} />
            </TouchableOpacity>
          </Animated.View>
        </PanGestureHandler>

        <View style={styles.bottomSheetHeader}>
          <View>
            <Text style={styles.bottomSheetTitle}>Próximos partidos</Text>
            <Text style={styles.bottomSheetSubtitle}>
              {events.filter(e => e.status === "open").length} eventos disponibles
            </Text>
          </View>

          <TouchableOpacity
            style={styles.expandButton}
            onPress={toggleBottomSheet}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isExpanded ? "chevron-down" : "chevron-up"}
              size={20}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.bottomSheetContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.bottomSheetScrollContent}
        >
          {events.map((event) => (
            <EventListItem key={event.id} event={event} />
          ))}

          <TouchableOpacity
            style={styles.viewMoreButton}
            onPress={() => navigation.navigate("EventsList")}
            activeOpacity={0.8}
          >
            <Text style={styles.viewMoreText}>Ver todos los partidos</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    top: 20,
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    top: 20,
  },
  notificationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitial: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textLight,
  },
  quickStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  mapControls: {
    position: "absolute",
    right: 16,
    top: 16,
    gap: 8,
  },
  mapControlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  // 🔥 NUEVO ESTILO PARA BOTÓN DESHABILITADO
  mapControlButtonDisabled: {
    backgroundColor: Colors.surface,
    opacity: 0.6,
  },
  markerContainer: {
    alignItems: "center",
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.background,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  markerFull: {
    backgroundColor: Colors.warning,
  },
  // 🔥 NUEVO ESTILO PARA EVENTOS CANCELADOS
  markerCancelled: {
    backgroundColor: Colors.error,
  },
  markerBadge: {
    backgroundColor: Colors.success,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  markerBadgeFull: {
    backgroundColor: Colors.warning,
  },
  // 🔥 NUEVO ESTILO PARA BADGES CANCELADOS
  markerBadgeCancelled: {
    backgroundColor: Colors.error,
  },
  markerText: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.textLight,
  },
  calloutContainer: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  calloutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
    flex: 1,
  },
  calloutRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  calloutRatingText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  calloutSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  calloutDetails: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  calloutDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  calloutDetailText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  calloutButton: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: "center",
  },
  calloutButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textLight,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomSheetHandle: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handleTouchArea: {
    paddingHorizontal: 40,
    paddingVertical: 8,
    alignItems: "center",
  },
  handle: {
    width: 50,
    height: 5,
    backgroundColor: Colors.textSecondary,
    borderRadius: 3,
    opacity: 0.6,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  bottomSheetSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  expandButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomSheetContent: {
    flex: 1,
  },
  bottomSheetScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  eventListItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  eventItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  eventItemInfo: {
    flex: 1,
  },
  eventItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  eventItemHost: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  eventItemDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  eventItemDetail: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  eventItemPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
  },
  eventItemRight: {
    alignItems: "center",
    gap: 8,
  },
  eventItemStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  eventItemStatusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 16,
    gap: 8,
  },
  viewMoreText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
});

export default HomeScreen;