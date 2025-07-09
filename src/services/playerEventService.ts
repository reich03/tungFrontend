import {
  CreateEventResponse,
  EventForFrontend,
  EventServiceResponse,
  EVENT_STATUS_REVERSE_MAP,
  parseISODateTime,
  getEventTitle,
  EventPosition,
} from '../types/eventTypes';
import { FIELD_TYPE_REVERSE_MAP } from '../types/fieldTypes';

const API_BASE_URL = "https://back.tungdeportes.com/api";

interface ServiceResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

interface FieldAPIResponse {
  id: string;
  tipo: string;
  valorHora: number;
  calificacion: number;
  duenio: {
    id: string;
    usuario: {
      nombreCompleto: string;
      correo: string;
      profilePicture: string;
    };
    razonSocial: string;
    telefonoContacto: string;
    direccion: string;
    coordenadaX: number;
    coordenadaY: number;
    horaApertura: string;
    horaCierre: string;
    fotosEstablecimiento: string[];
    duenioVerificado: boolean;
  };
}

interface JoinEventRequest {
  jugadorId: string;
  partidoId: string;
  posicionId: string;
}

interface JoinEventResponse {
  success: boolean;
  message: string;
  data?: any;
}

const fieldInfoCache = new Map<string, FieldAPIResponse>();

class PlayerEventService {

  async getAllAvailableEvents(): Promise<EventServiceResponse<EventForFrontend[]>> {
    try {
      console.log("🔍 Obteniendo eventos disponibles para jugadores...");

      const response = await fetch(`${API_BASE_URL}/partidos`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const allEventsData: CreateEventResponse[] = await response.json();
      console.log(`📅 ${allEventsData.length} eventos encontrados en total`);

      const availableEvents = allEventsData.filter(event =>
        event.estado === 'DISPONIBLE' && event.espaciosDisponibles > 0
      );

      console.log(`✅ ${availableEvents.length} eventos disponibles para unirse`);

      const frontendEvents: EventForFrontend[] = [];

      for (const event of availableEvents) {
        try {
          const fieldInfo = await this.getFieldInfo(event.canchaId);
          const frontendEvent = await this.mapBackendToFrontendWithFieldInfo(event, fieldInfo);
          frontendEvents.push(frontendEvent);
        } catch (error) {
          console.error(`❌ Error obteniendo info de cancha ${event.canchaId}:`, error);
          const basicEvent = this.mapBackendToBasicFrontend(event);
          frontendEvents.push(basicEvent);
        }
      }

      frontendEvents.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

      return {
        success: true,
        message: `${frontendEvents.length} eventos disponibles`,
        data: frontendEvents,
      };

    } catch (error) {
      console.error("❌ Error obteniendo eventos:", error);
      return {
        success: false,
        message: "Error al cargar los eventos disponibles",
        data: [],
      };
    }
  }

  
  async getAvailableEvents(): Promise<ServiceResponse<EventForFrontend[]>> {
    try {
      console.log("🔍 Obteniendo eventos disponibles para el mapa...");

      const result = await this.getAllAvailableEvents();

      const serviceResponse: ServiceResponse<EventForFrontend[]> = {
        success: result.success,
        message: result.message,
        data: result.data || [],
      };

      if (serviceResponse.data && serviceResponse.data.length > 50) {
        console.log("⚡ Limitando resultados para optimización del mapa");
        serviceResponse.data = serviceResponse.data.slice(0, 50);
        serviceResponse.message = `${serviceResponse.data.length} eventos disponibles (limitado para optimización)`;
      }

      return serviceResponse;

    } catch (error) {
      console.error("❌ Error obteniendo eventos disponibles:", error);
      return {
        success: false,
        message: "Error al cargar los eventos disponibles",
        data: [],
      };
    }
  }

  async getAvailableEventsByLocation(
    userLatitude?: number,
    userLongitude?: number,
    radiusKm: number = 10
  ): Promise<ServiceResponse<EventForFrontend[]>> {
    try {
      console.log("🔍 Obteniendo eventos disponibles por ubicación...");

      const allEventsResult = await this.getAllAvailableEvents();

      if (!allEventsResult.success || !allEventsResult.data) {
        return {
          success: false,
          message: allEventsResult.message,
          data: [],
        };
      }

      let filteredEvents = allEventsResult.data;

      if (userLatitude && userLongitude) {
        filteredEvents = filteredEvents.filter(event => {
          if (!event.fieldInfo?.coordinates) return true; 

          const distance = this.calculateDistance(
            userLatitude,
            userLongitude,
            event.fieldInfo.coordinates.latitude,
            event.fieldInfo.coordinates.longitude
          );

          return distance <= radiusKm;
        });

        console.log(`📍 ${filteredEvents.length} eventos encontrados dentro de ${radiusKm}km`);
      }

      if (userLatitude && userLongitude) {
        filteredEvents.sort((a, b) => {
          const distanceA = a.fieldInfo?.coordinates
            ? this.calculateDistance(userLatitude, userLongitude, a.fieldInfo.coordinates.latitude, a.fieldInfo.coordinates.longitude)
            : 999;
          const distanceB = b.fieldInfo?.coordinates
            ? this.calculateDistance(userLatitude, userLongitude, b.fieldInfo.coordinates.latitude, b.fieldInfo.coordinates.longitude)
            : 999;

          return distanceA - distanceB;
        });
      }

      return {
        success: true,
        message: `${filteredEvents.length} eventos disponibles${userLatitude ? ` en un radio de ${radiusKm}km` : ''}`,
        data: filteredEvents,
      };

    } catch (error) {
      console.error("❌ Error obteniendo eventos por ubicación:", error);
      return {
        success: false,
        message: "Error al cargar los eventos por ubicación",
        data: [],
      };
    }
  }

  async getEventsMapStatistics(): Promise<ServiceResponse<{
    totalEvents: number;
    availableEvents: number;
    totalSpaces: number;
    fieldsByType: Record<string, number>;
    fieldsByLocation: Array<{
      businessName: string;
      coordinates: { latitude: number; longitude: number };
      eventCount: number;
      totalSpaces: number;
    }>;
  }>> {
    try {
      console.log("📊 Obteniendo estadísticas para el mapa...");

      const eventsResult = await this.getAllAvailableEvents();

      if (!eventsResult.success || !eventsResult.data) {
        return {
          success: false,
          message: "Error al obtener estadísticas",
          data: {
            totalEvents: 0,
            availableEvents: 0,
            totalSpaces: 0,
            fieldsByType: {},
            fieldsByLocation: [],
          },
        };
      }

      const events = eventsResult.data;
      const availableEvents = events.filter(e => e.availableSpaces > 0);

      const fieldsByLocation = new Map<string, {
        businessName: string;
        coordinates: { latitude: number; longitude: number };
        eventCount: number;
        totalSpaces: number;
      }>();

      events.forEach(event => {
        if (event.fieldInfo?.coordinates) {
          const key = `${event.fieldInfo.businessName}-${event.fieldId}`;

          if (!fieldsByLocation.has(key)) {
            fieldsByLocation.set(key, {
              businessName: event.fieldInfo.businessName,
              coordinates: event.fieldInfo.coordinates,
              eventCount: 0,
              totalSpaces: 0,
            });
          }

          const field = fieldsByLocation.get(key)!;
          field.eventCount++;
          field.totalSpaces += event.availableSpaces;
        }
      });

      const fieldsByType = events.reduce((acc, event) => {
        acc[event.fieldType] = (acc[event.fieldType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        success: true,
        message: "Estadísticas obtenidas exitosamente",
        data: {
          totalEvents: events.length,
          availableEvents: availableEvents.length,
          totalSpaces: events.reduce((sum, e) => sum + e.availableSpaces, 0),
          fieldsByType,
          fieldsByLocation: Array.from(fieldsByLocation.values()),
        },
      };

    } catch (error) {
      console.error("❌ Error obteniendo estadísticas del mapa:", error);
      return {
        success: false,
        message: "Error al obtener estadísticas",
        data: {
          totalEvents: 0,
          availableEvents: 0,
          totalSpaces: 0,
          fieldsByType: {},
          fieldsByLocation: [],
        },
      };
    }
  }

  async getEventDetails(eventId: string): Promise<EventServiceResponse<EventForFrontend>> {
    try {
      console.log("🔍 Obteniendo detalles del evento:", eventId);

      const response = await fetch(`${API_BASE_URL}/partidos/${eventId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const eventData: CreateEventResponse = await response.json();

      const fieldInfo = await this.getFieldInfo(eventData.canchaId);
      const frontendEvent = await this.mapBackendToFrontendWithFieldInfo(eventData, fieldInfo);

      return {
        success: true,
        message: "Detalles del evento obtenidos exitosamente",
        data: frontendEvent,
      };

    } catch (error) {
      console.error("❌ Error obteniendo detalles del evento:", error);
      return {
        success: false,
        message: "Error al cargar los detalles del evento",
      };
    }
  }

  async getFieldInfo(fieldId: string): Promise<FieldAPIResponse> {
    try {
      if (fieldInfoCache.has(fieldId)) {
        console.log("💾 Usando información de cancha desde cache:", fieldId);
        return fieldInfoCache.get(fieldId)!;
      }

      console.log("🔍 Obteniendo información de cancha:", fieldId);

      const response = await fetch(`${API_BASE_URL}/canchas/${fieldId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const fieldData: FieldAPIResponse = await response.json();

      
      fieldInfoCache.set(fieldId, fieldData);

      console.log("✅ Información de cancha obtenida:", fieldData.duenio.razonSocial);
      return fieldData;

    } catch (error) {
      console.error("❌ Error obteniendo información de cancha:", error);
      throw error;
    }
  }

  async joinEvent(eventId: string, positionId: string, playerId: string): Promise<EventServiceResponse<any>> {
    try {
      console.log("🔗 Uniéndose al evento:", { eventId, positionId, playerId });

      const joinRequest: JoinEventRequest = {
        jugadorId: playerId,
        partidoId: eventId,
        posicionId: positionId,
      };

      const response = await fetch(`${API_BASE_URL}/partidos/inscripciones/inscribirse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(joinRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error del backend:", errorText);

        if (response.status === 409) {
          return {
            success: false,
            message: "Esta posición ya está ocupada. Selecciona otra posición."
          };
        } else if (response.status === 400) {
          return {
            success: false,
            message: "Los datos enviados no son válidos."
          };
        } else if (response.status === 404) {
          return {
            success: false,
            message: "El evento o la posición no existe."
          };
        }

        throw new Error(`Error HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      console.log("✅ Unión al evento exitosa:", result);

      return {
        success: true,
        message: "Te has unido al evento exitosamente",
        data: result,
      };

    } catch (error) {
      console.error("❌ Error uniéndose al evento:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al unirse al evento";

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  async searchEvents(query: string): Promise<ServiceResponse<EventForFrontend[]>> {
    try {
      console.log("🔍 Buscando eventos con query:", query);

      const allEventsResult = await this.getAllAvailableEvents();

      if (!allEventsResult.success || !allEventsResult.data) {
        return {
          success: false,
          message: allEventsResult.message,
          data: [],
        };
      }

      const searchQuery = query.toLowerCase().trim();
      const filteredEvents = allEventsResult.data.filter(event => {
        return (
          event.title.toLowerCase().includes(searchQuery) ||
          event.fieldName.toLowerCase().includes(searchQuery) ||
          event.fieldInfo?.businessName.toLowerCase().includes(searchQuery) ||
          event.fieldInfo?.address.toLowerCase().includes(searchQuery) ||
          event.fieldType.toLowerCase().includes(searchQuery)
        );
      });

      return {
        success: true,
        message: `${filteredEvents.length} eventos encontrados`,
        data: filteredEvents,
      };

    } catch (error) {
      console.error("❌ Error buscando eventos:", error);
      return {
        success: false,
        message: "Error al buscar eventos",
        data: [],
      };
    }
  }

  private async mapBackendToFrontendWithFieldInfo(
    backendEvent: CreateEventResponse,
    fieldInfo: FieldAPIResponse
  ): Promise<EventForFrontend> {
    const { date, time } = parseISODateTime(backendEvent.hora);
    const frontendStatus = EVENT_STATUS_REVERSE_MAP[backendEvent.estado];
    const frontendType = FIELD_TYPE_REVERSE_MAP[backendEvent.tipo as keyof typeof FIELD_TYPE_REVERSE_MAP];
    const eventDate = new Date(backendEvent.hora);
    const title = getEventTitle(frontendType, eventDate, time);

    const pricePerPlayer = Math.round(fieldInfo.valorHora / backendEvent.capacidadMaxima);

    return {
      id: backendEvent.partidoId,
      fieldId: backendEvent.canchaId,
      fieldName: fieldInfo.duenio.razonSocial,
      fieldType: frontendType,
      title,
      date,
      time,
      datetime: backendEvent.hora,
      status: frontendStatus,
      maxPlayers: backendEvent.capacidadMaxima,
      registeredPlayers: backendEvent.jugadoresInscritos,
      availableSpaces: backendEvent.espaciosDisponibles,
      positions: backendEvent.posiciones,
      isSubField: backendEvent.inSubcancha,
      createdAt: new Date().toISOString(),
      fieldInfo: {
        businessName: fieldInfo.duenio.razonSocial,
        address: fieldInfo.duenio.direccion,
        phone: fieldInfo.duenio.telefonoContacto,
        openTime: fieldInfo.duenio.horaApertura,
        closeTime: fieldInfo.duenio.horaCierre,
        rating: fieldInfo.calificacion,
        ownerName: fieldInfo.duenio.usuario.nombreCompleto,
        ownerAvatar: fieldInfo.duenio.usuario.profilePicture,
        photos: fieldInfo.duenio.fotosEstablecimiento,
        coordinates: {
          latitude: fieldInfo.duenio.coordenadaX,
          longitude: fieldInfo.duenio.coordenadaY,
        },
        pricePerHour: fieldInfo.valorHora,
        pricePerPlayer,
        isVerified: fieldInfo.duenio.duenioVerificado,
      },
    };
  }

  private mapBackendToBasicFrontend(backendEvent: CreateEventResponse): EventForFrontend {
    const { date, time } = parseISODateTime(backendEvent.hora);
    const frontendStatus = EVENT_STATUS_REVERSE_MAP[backendEvent.estado];
    const frontendType = FIELD_TYPE_REVERSE_MAP[backendEvent.tipo as keyof typeof FIELD_TYPE_REVERSE_MAP];
    const eventDate = new Date(backendEvent.hora);
    const title = getEventTitle(frontendType, eventDate, time);

    return {
      id: backendEvent.partidoId,
      fieldId: backendEvent.canchaId,
      fieldName: `Cancha ${frontendType.replace('futbol', 'Fútbol ')}`,
      fieldType: frontendType,
      title,
      date,
      time,
      datetime: backendEvent.hora,
      status: frontendStatus,
      maxPlayers: backendEvent.capacidadMaxima,
      registeredPlayers: backendEvent.jugadoresInscritos,
      availableSpaces: backendEvent.espaciosDisponibles,
      positions: backendEvent.posiciones,
      isSubField: backendEvent.inSubcancha,
      createdAt: new Date().toISOString(),
    };
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; 
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  filterEvents(
    events: EventForFrontend[],
    filters: {
      fieldType?: string;
      date?: string;
      location?: string;
      maxPrice?: number;
      minSpaces?: number;
    }
  ): EventForFrontend[] {
    let filtered = [...events];

    if (filters.fieldType && filters.fieldType !== 'all') {
      filtered = filtered.filter(event => event.fieldType === filters.fieldType);
    }

    if (filters.date && filters.date !== 'all') {
      const today = new Date().toISOString().split('T')[0];
      
      switch (filters.date) {
        case 'today':
          filtered = filtered.filter(event => event.date === today);
          break;
        case 'tomorrow':
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split('T')[0];
          filtered = filtered.filter(event => event.date === tomorrowStr);
          break;
        case 'week':
          const weekFromNow = new Date();
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= new Date(today) && eventDate <= weekFromNow;
          });
          break;
      }
    }

    if (filters.location) {
      filtered = filtered.filter(event => 
        event.fieldInfo?.address.toLowerCase().includes(filters.location!.toLowerCase()) ||
        event.fieldInfo?.businessName.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(event => 
        (event.fieldInfo?.pricePerPlayer || 0) <= filters.maxPrice!
      );
    }

    if (filters.minSpaces) {
      filtered = filtered.filter(event => event.availableSpaces >= filters.minSpaces!);
    }

    return filtered;
  }

  getEventStatistics(events: EventForFrontend[]) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    return {
      total: events.length,
      todayEvents: events.filter(e => e.date === today).length,
      weekEvents: events.filter(e => {
        const eventDate = new Date(e.date);
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return eventDate >= now && eventDate <= weekFromNow;
      }).length,
      averagePrice: events.length > 0 
        ? Math.round(events.reduce((sum, e) => sum + (e.fieldInfo?.pricePerPlayer || 0), 0) / events.length)
        : 0,
      totalSpaces: events.reduce((sum, e) => sum + e.availableSpaces, 0),
      fieldTypes: {
        futbol5: events.filter(e => e.fieldType === 'futbol5').length,
        futbol7: events.filter(e => e.fieldType === 'futbol7').length,
        futbol11: events.filter(e => e.fieldType === 'futbol11').length,
      },
    };
  }

  clearCache() {
    fieldInfoCache.clear();
    console.log("🧹 Cache de información de canchas limpiado");
  }
}

export const playerEventService = new PlayerEventService();
export default playerEventService;

declare module '../types/eventTypes' {
  interface EventForFrontend {
    fieldInfo?: {
      businessName: string;
      address: string;
      phone: string;
      openTime: string;
      closeTime: string;
      rating: number;
      ownerName: string;
      ownerAvatar: string;
      photos: string[];
      coordinates: {
        latitude: number;
        longitude: number;
      };
      pricePerHour: number;
      pricePerPlayer: number;
      isVerified: boolean;
    };
  }
}