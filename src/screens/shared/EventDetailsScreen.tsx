import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { HomeStackParamList, Event, EventParticipant, PlayerPosition } from '../../types';
import { Colors, Gradients } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import CustomButton from '../../components/common/CustomButton';

const { width } = Dimensions.get('window');

type EventDetailsScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'EventDetails'>;
type EventDetailsScreenRouteProp = RouteProp<HomeStackParamList, 'EventDetails'>;

interface Props {
  navigation: EventDetailsScreenNavigationProp;
  route: EventDetailsScreenRouteProp;
}

// Mock data expandida para el evento
const mockEventDetails: Event = {
  id: '1',
  hostId: '1',
  host: {
    id: '1',
    email: 'cancha@ejemplo.com',
    fullName: 'Cancha El Estadio',
    phone: '+57 300 123 4567',
    userType: 'host',
    isActive: true,
    createdAt: '2025-01-01',
    businessName: 'Cancha El Estadio',
    address: 'Calle 72 #15-30, Barranquilla',
    coordinates: {
      latitude: 10.9878,
      longitude: -74.7889,
    },
    description: 'La mejor cancha sintética de Barranquilla con todas las comodidades',
    fields: [],
    rating: 4.5,
    totalReviews: 120,
    businessHours: {},
    contactInfo: {
      whatsapp: '+57 300 123 4567',
      instagram: '@cancha_estadio',
    },
  },
  fieldId: '1',
  field: {
    id: '1',
    name: 'Cancha Principal',
    type: 'futbol7',
    capacity: 14,
    pricePerHour: 50000,
    hasLighting: true,
    isIndoor: false,
    amenities: ['Baños', 'Parqueadero', 'Cafetería', 'Vestuarios', 'Duchas'],
    images: [],
    isActive: true,
  },
  title: 'Fútbol 7 - Viernes en la tarde',
  description: 'Partido amistoso nivel intermedio. Buscamos completar el equipo para un buen juego. Todos los niveles bienvenidos, ambiente familiar y competitivo.',
  date: '2025-06-14',
  startTime: '18:00',
  endTime: '19:30',
  duration: 90,
  maxPlayers: 14,
  currentPlayers: 8,
  pricePerPlayer: 7000,
  status: 'open',
  participants: [
    {
      playerId: '1',
      player: {
        id: '1',
        email: 'juan@test.com',
        fullName: 'Juan Pérez',
        phone: '+57 300 111 1111',
        userType: 'player',
        isActive: true,
        createdAt: '2025-01-01',
        position: 'midfielder',
        stats: { pace: 75, shooting: 70, passing: 85, dribbling: 80, defending: 60, physical: 75 },
        preferredFoot: 'right',
        experience: 'intermediate',
        height: 175,
        weight: 70,
      },
      position: 'midfielder',
      joinedAt: '2025-06-14T10:00:00Z',
      status: 'confirmed',
    },
    {
      playerId: '2',
      player: {
        id: '2',
        email: 'carlos@test.com',
        fullName: 'Carlos González',
        phone: '+57 300 222 2222',
        userType: 'player',
        isActive: true,
        createdAt: '2025-01-01',
        position: 'forward',
        stats: { pace: 85, shooting: 90, passing: 70, dribbling: 85, defending: 50, physical: 80 },
        preferredFoot: 'left',
        experience: 'advanced',
        height: 180,
        weight: 75,
      },
      position: 'forward',
      joinedAt: '2025-06-14T11:00:00Z',
      status: 'confirmed',
    },
  ],
  requirements: {
    minExperience: 'beginner',
    maxAge: 40,
    minAge: 16,
  },
  createdAt: '2025-06-14',
};

const EventDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = useAuth();
  const { eventId } = route.params;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      // Simular carga de API
      setTimeout(() => {
        setEvent(mockEventDetails);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading event details:', error);
      setLoading(false);
    }
  };

  const getPositionEmoji = (position: PlayerPosition): string => {
    switch (position) {
      case 'goalkeeper': return '🥅';
      case 'defender': return '🛡️';
      case 'midfielder': return '⚡';
      case 'forward': return '⚽';
      default: return '👤';
    }
  };

  const getPositionName = (position: PlayerPosition): string => {
    switch (position) {
      case 'goalkeeper': return 'Arquero';
      case 'defender': return 'Defensa';
      case 'midfielder': return 'Medio';
      case 'forward': return 'Delantero';
      default: return 'Jugador';
    }
  };

  const getExperienceLevel = (experience: string): string => {
    switch (experience) {
      case 'beginner': return 'Principiante';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      case 'professional': return 'Profesional';
      default: return experience;
    }
  };

  const isUserJoined = event?.participants.some(p => p.playerId === user?.id) || false;
  const canJoin = event?.status === 'open' && event.currentPlayers < event.maxPlayers && !isUserJoined;

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

  const ParticipantCard: React.FC<{ participant: EventParticipant }> = ({ participant }) => (
    <View style={styles.participantCard}>
      <View style={styles.participantAvatar}>
        <Text style={styles.participantInitials}>
          {participant.player.fullName.split(' ').map(n => n[0]).join('')}
        </Text>
      </View>
      <View style={styles.participantInfo}>
        <Text style={styles.participantName}>{participant.player.fullName}</Text>
        <View style={styles.participantDetails}>
          <Text style={styles.participantPosition}>
            {getPositionEmoji(participant.position)} {getPositionName(participant.position)}
          </Text>
          <Text style={styles.participantExperience}>
            {getExperienceLevel(participant.player.experience)}
          </Text>
        </View>
      </View>
      <View style={styles.participantStats}>
        <View style={styles.statBadge}>
          <Text style={styles.statValue}>
            {Math.round((participant.player.stats.pace + participant.player.stats.shooting + 
                        participant.player.stats.passing + participant.player.stats.dribbling + 
                        participant.player.stats.defending + participant.player.stats.physical) / 6)}
          </Text>
          <Text style={styles.statLabel}>OVR</Text>
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
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
              <Ionicons name="share-outline" size={24} color={Colors.textLight} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
              <Ionicons name="heart-outline" size={24} color={Colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventHost}>{event.host.businessName}</Text>
          
          <View style={styles.eventMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={Colors.textLight} />
              <Text style={styles.metaText}>Viernes 14 Jun</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={Colors.textLight} />
              <Text style={styles.metaText}>{event.startTime} - {event.endTime}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={16} color={Colors.textLight} />
              <Text style={styles.metaText}>{event.currentPlayers}/{event.maxPlayers}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Info */}
        <View style={styles.quickInfo}>
          <View style={styles.infoCard}>
            <Ionicons name="cash-outline" size={24} color={Colors.primary} />
            <Text style={styles.infoValue}>${event.pricePerPlayer.toLocaleString()}</Text>
            <Text style={styles.infoLabel}>Por jugador</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Ionicons name="football-outline" size={24} color={Colors.primary} />
            <Text style={styles.infoValue}>{event.field.type.replace('futbol', 'F')}</Text>
            <Text style={styles.infoLabel}>Tipo de cancha</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Ionicons name="star-outline" size={24} color={Colors.primary} />
            <Text style={styles.infoValue}>{event.host.rating}</Text>
            <Text style={styles.infoLabel}>Calificación</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        {/* Field Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de la cancha</Text>
          
          <View style={styles.fieldInfo}>
            <View style={styles.fieldDetail}>
              <Ionicons name="location-outline" size={20} color={Colors.primary} />
              <Text style={styles.fieldDetailText}>{event.host.address}</Text>
            </View>
            
            <View style={styles.amenitiesContainer}>
              {event.field.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityBadge}>
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.fieldFeatures}>
              {event.field.hasLighting && (
                <View style={styles.feature}>
                  <Ionicons name="bulb-outline" size={16} color={Colors.primary} />
                  <Text style={styles.featureText}>Iluminación</Text>
                </View>
              )}
              {event.field.isIndoor && (
                <View style={styles.feature}>
                  <Ionicons name="home-outline" size={16} color={Colors.primary} />
                  <Text style={styles.featureText}>Techada</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Requirements */}
        {event.requirements && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requisitos</Text>
            <View style={styles.requirements}>
              {event.requirements.minExperience && (
                <View style={styles.requirement}>
                  <Ionicons name="trophy-outline" size={16} color={Colors.primary} />
                  <Text style={styles.requirementText}>
                    Nivel mínimo: {getExperienceLevel(event.requirements.minExperience)}
                  </Text>
                </View>
              )}
              {event.requirements.minAge && event.requirements.maxAge && (
                <View style={styles.requirement}>
                  <Ionicons name="person-outline" size={16} color={Colors.primary} />
                  <Text style={styles.requirementText}>
                    Edad: {event.requirements.minAge} - {event.requirements.maxAge} años
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Participants */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Jugadores confirmados</Text>
            <Text style={styles.participantsCount}>
              {event.participants.length} de {event.maxPlayers}
            </Text>
          </View>
          
          <View style={styles.participantsList}>
            {event.participants.map((participant) => (
              <ParticipantCard key={participant.playerId} participant={participant} />
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: event.maxPlayers - event.currentPlayers }).map((_, index) => (
              <View key={`empty-${index}`} style={styles.emptySlot}>
                <View style={styles.emptySlotIcon}>
                  <Ionicons name="add" size={24} color={Colors.textMuted} />
                </View>
                <Text style={styles.emptySlotText}>Lugar disponible</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Host Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contacto</Text>
          
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={20} color={Colors.primary} />
              <Text style={styles.contactText}>{event.host.phone}</Text>
            </View>
            
            {event.host.contactInfo.whatsapp && (
              <TouchableOpacity style={styles.contactButton} activeOpacity={0.7}>
                <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                <Text style={styles.contactButtonText}>WhatsApp</Text>
              </TouchableOpacity>
            )}
            
            {event.host.contactInfo.instagram && (
              <TouchableOpacity style={styles.contactButton} activeOpacity={0.7}>
                <Ionicons name="logo-instagram" size={20} color="#E4405F" />
                <Text style={styles.contactButtonText}>Instagram</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Join Button */}
      {user?.userType === 'player' && (
        <View style={styles.joinContainer}>
          <CustomButton
            title={isUserJoined ? "Ya estás inscrito" : canJoin ? "Unirse al partido" : "Partido completo"}
            onPress={() => canJoin && navigation.navigate('JoinEvent', { eventId: event.id })}
            disabled={!canJoin}
            fullWidth
            icon={isUserJoined ? "checkmark-circle" : canJoin ? "add-circle" : "close-circle"}
            style={styles.joinButton}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    top: 20,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    top: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventHeader: {
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 8,
  },
  eventHost: {
    fontSize: 16,
    color: Colors.textLight,
    opacity: 0.9,
    marginBottom: 16,
  },
  eventMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  fieldInfo: {
    gap: 16,
  },
  fieldDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldDetailText: {
    fontSize: 16,
    color: Colors.textSecondary,
    flex: 1,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  amenityText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  fieldFeatures: {
    flexDirection: 'row',
    gap: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  requirements: {
    gap: 12,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  participantsCount: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  participantsList: {
    gap: 12,
  },
  participantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  participantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  participantInitials: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  participantDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  participantPosition: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  participantExperience: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  participantStats: {
    alignItems: 'center',
  },
  statBadge: {
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  emptySlot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptySlotIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emptySlotText: {
    fontSize: 16,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  contactInfo: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contactButtonText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
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
  },
});

export default EventDetailsScreen;