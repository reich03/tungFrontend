import React, { useState, useEffect, useRef, useMemo } from "react";
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
  RefreshControl,
} from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";

import { HomeStackParamList } from "../../types";
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";
import { EventForFrontend } from "../../types/eventTypes";
import playerEventService from "../../services/playerEventService";

const { width, height } = Dimensions.get("window");

interface ServiceResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, "MapView">;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const BOTTOM_SHEET_MIN_HEIGHT = 140;
const BOTTOM_SHEET_MAX_HEIGHT = height * 0.7;

const INITIAL_REGION = {
  latitude: 4.142,
  longitude: -73.626,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

interface FieldWithEvents {
  id: string;
  name: string;
  businessName: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  phone?: string;
  events: EventForFrontend[];
  totalAvailableSpots: number;
  nextEventTime?: string;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [events, setEvents] = useState<EventForFrontend[]>([]);
  const [fieldsWithEvents, setFieldsWithEvents] = useState<FieldWithEvents[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedField, setSelectedField] = useState<FieldWithEvents | null>(null);
  const [mapRegion, setMapRegion] = useState(INITIAL_REGION);

  const mapRef = useRef<MapView>(null);
  const bottomSheetHeight = useRef(new Animated.Value(BOTTOM_SHEET_MIN_HEIGHT)).current;
  const lastGestureY = useRef(new Animated.Value(0)).current;
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    requestLocationPermission();
    loadEvents();
  }, []);

  useEffect(() => {
    if (userLocation) {
      loadEvents();
    }
  }, [userLocation]);

  const loadEvents = async () => {
    try {
      setLoading(true);

      let result;
      if (userLocation) {
        result = await playerEventService.getAvailableEventsByLocation(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          20 // Radio de 20km
        );
      } else {
        result = await playerEventService.getAvailableEvents();
      }

      if (result.success && result.data) {
        setEvents(result.data);
        groupEventsByField(result.data);
        console.log(`✅ ${result.data.length} eventos cargados exitosamente`);
      } else {
        console.error("Error loading events:", result.message);
        Alert.alert("Error", result.message || "No se pudieron cargar los eventos disponibles");
      }
    } catch (error) {
      console.error("Error loading events:", error);
      Alert.alert("Error", "No se pudieron cargar los eventos");
    } finally {
      setLoading(false);
    }
  };

  const groupEventsByField = (eventsList: EventForFrontend[]) => {
    const fieldsMap = new Map<string, FieldWithEvents>();

    eventsList.forEach(event => {
      const fieldKey = `${event.fieldInfo?.businessName || event.fieldName}-${event.fieldId}`;

      if (!fieldsMap.has(fieldKey)) {
        const fieldData: FieldWithEvents = {
          id: event.fieldId || fieldKey,
          name: event.fieldName,
          businessName: event.fieldInfo?.businessName || event.fieldName,
          address: event.fieldInfo?.address || "Dirección no disponible",
          coordinates: {
            latitude: event.fieldInfo?.coordinates?.latitude || INITIAL_REGION.latitude,
            longitude: event.fieldInfo?.coordinates?.longitude || INITIAL_REGION.longitude,
          },
          rating: event.fieldInfo?.rating || 0,
          phone: event.fieldInfo?.phone,
          events: [],
          totalAvailableSpots: 0,
          nextEventTime: undefined,
        };
        fieldsMap.set(fieldKey, fieldData);
      }

      const field = fieldsMap.get(fieldKey)!;
      field.events.push(event);
      field.totalAvailableSpots += event.availableSpaces;

      if (!field.nextEventTime || event.time < field.nextEventTime) {
        field.nextEventTime = event.time;
      }
    });

    fieldsMap.forEach(field => {
      field.events.sort((a, b) => a.time.localeCompare(b.time));
    });

    const validFields = Array.from(fieldsMap.values()).filter(field =>
      field.coordinates.latitude !== INITIAL_REGION.latitude ||
      field.coordinates.longitude !== INITIAL_REGION.longitude
    );

    setFieldsWithEvents(validFields);

    console.log(`🏟️ ${validFields.length} canchas agrupadas con coordenadas válidas`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

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
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const centerOnUserLocation = () => {
    if (userLocation && mapRef.current) {
      const userRegion = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

      mapRef.current.animateToRegion(userRegion, 1000);
      setMapRegion(userRegion);
    } else {
      Alert.alert(
        "Ubicación no disponible",
        "No pudimos obtener tu ubicación. Verifica los permisos.",
        [{ text: "OK" }]
      );
    }
  };

  const handleJoinEvent = (event: EventForFrontend) => {
    if (event.status === "full" || event.availableSpaces <= 0) {
      Alert.alert(
        "Partido completo",
        "Este partido ya está completo. ¿Quieres ver los detalles?",
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

    navigation.navigate("JoinEvent", { eventId: event.id });
  };

  const toggleBottomSheet = () => {
    const toValue = isExpanded ? BOTTOM_SHEET_MIN_HEIGHT : BOTTOM_SHEET_MAX_HEIGHT;
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
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY, velocityY } = event.nativeEvent;
      let shouldExpand = isExpanded;

      if (Math.abs(velocityY) > 500) {
        shouldExpand = velocityY < 0;
      } else {
        const threshold = (BOTTOM_SHEET_MAX_HEIGHT - BOTTOM_SHEET_MIN_HEIGHT) / 2;
        shouldExpand = translationY < -threshold;
      }

      const toValue = shouldExpand ? BOTTOM_SHEET_MAX_HEIGHT : BOTTOM_SHEET_MIN_HEIGHT;
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

  const FieldCallout: React.FC<{ field: FieldWithEvents }> = ({ field }) => {
    const nextEvent = field.events[0]; 
    const totalEvents = field.events.length;

    return (
      <View style={styles.calloutContainer}>
        <View style={styles.calloutHeader}>
          <Text style={styles.calloutTitle}>{field.businessName}</Text>
          <View style={styles.calloutRating}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.calloutRatingText}>
              {field.rating > 0 ? field.rating.toFixed(1) : "N/A"}
            </Text>
          </View>
        </View>

        <Text style={styles.calloutSubtitle}>{field.name}</Text>

        <View style={styles.calloutStats}>
          <View style={styles.calloutStat}>
            <Ionicons name="football-outline" size={14} color={Colors.primary} />
            <Text style={styles.calloutStatText}>
              {totalEvents} evento{totalEvents !== 1 ? "s" : ""}
            </Text>
          </View>
          <View style={styles.calloutStat}>
            <Ionicons name="people-outline" size={14} color={Colors.success} />
            <Text style={styles.calloutStatText}>
              {field.totalAvailableSpots} cupo{field.totalAvailableSpots !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {nextEvent && (
          <View style={styles.calloutNextEvent}>
            <Text style={styles.calloutNextEventTitle}>Próximo partido:</Text>
            <Text style={styles.calloutNextEventTime}>
              {nextEvent.time} - {nextEvent.title}
            </Text>
            <Text style={styles.calloutNextEventPrice}>
              ${nextEvent.fieldInfo?.pricePerPlayer?.toLocaleString() || "N/A"}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.calloutButton}
          onPress={() => {
            if (nextEvent) {
              handleJoinEvent(nextEvent);
            }
          }}
        >
          <Text style={styles.calloutButtonText}>
            {field.totalAvailableSpots > 0 ? "Ver eventos" : "Ver detalles"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const EventListItem: React.FC<{ event: EventForFrontend }> = ({ event }) => {
    const isAvailable = event.status === "available" && event.availableSpaces > 0;
    const isFull = event.availableSpaces <= 0;

    return (
      <TouchableOpacity
        style={styles.eventListItem}
        onPress={() => handleJoinEvent(event)}
        activeOpacity={0.9}
      >
        <View style={styles.eventItemLeft}>
          <View style={[
            styles.eventItemIcon,
            {
              backgroundColor: isAvailable
                ? Colors.primaryLight
                : isFull
                  ? "rgba(255, 152, 0, 0.1)"
                  : "rgba(244, 67, 54, 0.1)"
            }
          ]}>
            <Ionicons
              name="football"
              size={20}
              color={isAvailable ? Colors.primary : isFull ? Colors.warning : Colors.error}
            />
          </View>

          <View style={styles.eventItemInfo}>
            <Text style={styles.eventItemTitle}>{event.title}</Text>
            <Text style={styles.eventItemHost}>
              {event.fieldInfo?.businessName || event.fieldName}
            </Text>
            <View style={styles.eventItemDetails}>
              <Text style={styles.eventItemDetail}>
                {event.time} • {event.fieldType}
              </Text>
              <Text style={styles.eventItemPrice}>
                ${event.fieldInfo?.pricePerPlayer?.toLocaleString() || "N/A"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.eventItemRight}>
          <View style={[
            styles.eventItemStatus,
            {
              backgroundColor: isAvailable
                ? Colors.primaryLight
                : isFull
                  ? "rgba(255, 152, 0, 0.1)"
                  : "rgba(244, 67, 54, 0.1)",
            },
          ]}>
            <Text style={[
              styles.eventItemStatusText,
              {
                color: isAvailable ? Colors.primary : isFull ? Colors.warning : Colors.error,
              },
            ]}>
              {event.registeredPlayers}/{event.maxPlayers}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
        </View>
      </TouchableOpacity>
    );
  };

  const availableEvents = events.filter(e => e.status === "available" && e.availableSpaces > 0);
  const totalAvailableSpots = events.reduce((sum, event) => sum + event.availableSpaces, 0);

  const nearestDistance = useMemo(() => {
    if (!userLocation || events.length === 0) return "N/A";

    const distances = events
      .filter(e => e.fieldInfo?.coordinates)
      .map(event => {
        const distance = calculateDistance(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          event.fieldInfo!.coordinates.latitude,
          event.fieldInfo!.coordinates.longitude
        );
        return distance;
      })
      .sort((a, b) => a - b);

    return distances.length > 0 ? `${distances[0].toFixed(1)}km` : "N/A";
  }, [userLocation, events]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando eventos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

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
              <Ionicons name="notifications-outline" size={20} color={Colors.textPrimary} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileButton} activeOpacity={0.8}>
              <Text style={styles.profileInitial}>
                {user?.fullName?.charAt(0).toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{availableEvents.length}</Text>
            <Text style={styles.statLabel}>Partidos disponibles</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalAvailableSpots}</Text>
            <Text style={styles.statLabel}>Cupos libres</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{nearestDistance}</Text>
            <Text style={styles.statLabel}>Más cercano</Text>
          </View>
        </View>
      </View>

      <Animated.View
        style={[
          styles.mapContainer,
          {
            marginBottom: Animated.add(
              bottomSheetHeight,
              lastGestureY.interpolate({
                inputRange: [-BOTTOM_SHEET_MAX_HEIGHT, 0, BOTTOM_SHEET_MAX_HEIGHT],
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
          initialRegion={INITIAL_REGION}
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
          mapType="standard"
        >
          {fieldsWithEvents.map((field) => (
            <Marker
              key={field.id}
              coordinate={field.coordinates}
              onPress={() => setSelectedField(field)}
            >
              <View style={styles.markerContainer}>
                <View style={[
                  styles.marker,
                  field.totalAvailableSpots <= 0 && styles.markerFull,
                ]}>
                  <Ionicons name="business" size={16} color={Colors.textLight} />
                </View>
                <View style={[
                  styles.markerBadge,
                  field.totalAvailableSpots <= 0 && styles.markerBadgeFull,
                ]}>
                  <Text style={styles.markerText}>
                    {field.events.length}
                  </Text>
                </View>
              </View>

              <Callout tooltip>
                <FieldCallout field={field} />
              </Callout>
            </Marker>
          ))}
        </MapView>

        <View style={styles.mapControls}>
          <TouchableOpacity
            style={[
              styles.mapControlButton,
              !userLocation && styles.mapControlButtonDisabled
            ]}
            onPress={centerOnUserLocation}
            activeOpacity={0.8}
            disabled={!userLocation}
          >
            <Ionicons
              name="locate"
              size={20}
              color={userLocation ? Colors.primary : Colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.mapControlButton,
              refreshing && styles.mapControlButtonLoading
            ]}
            onPress={handleRefresh}
            activeOpacity={0.8}
            disabled={refreshing}
          >
            <Ionicons
              name="refresh-outline"
              size={20}
              color={refreshing ? Colors.textSecondary : Colors.primary}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.bottomSheet,
          {
            height: Animated.add(
              bottomSheetHeight,
              lastGestureY.interpolate({
                inputRange: [-BOTTOM_SHEET_MAX_HEIGHT, 0, BOTTOM_SHEET_MAX_HEIGHT],
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
              {availableEvents.length} evento{availableEvents.length !== 1 ? "s" : ""} disponible{availableEvents.length !== 1 ? "s" : ""}
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        >
          {events.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="football-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyStateTitle}>No hay eventos disponibles</Text>
              <Text style={styles.emptyStateSubtitle}>
                Toca el botón de actualizar para buscar nuevos partidos
              </Text>
            </View>
          ) : (
            <>
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
            </>
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTop: {
    top: 10,
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
  mapControlButtonDisabled: {
    backgroundColor: Colors.surface,
    opacity: 0.6,
  },
  mapControlButtonLoading: {
    backgroundColor: Colors.surface,
    opacity: 0.8,
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
  markerText: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.textLight,
  },
  calloutContainer: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    minWidth: 240,
    maxWidth: 280,
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
    fontSize: 16,
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
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  calloutStats: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  calloutStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  calloutStatText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  calloutNextEvent: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  calloutNextEventTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 2,
  },
  calloutNextEventTime: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  calloutNextEventPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
  },
  calloutButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  calloutButtonText: {
    fontSize: 14,
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
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
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