import {
  CreateEventRequest,
  CreateEventResponse,
  EventForFrontend,
  CreateEventForm,
  EventServiceResponse,
  EVENT_STATUS_REVERSE_MAP,
  createISODateTime,
  parseISODateTime,
  getEventTitle,
  getMaxCapacity,
} from '../types/eventTypes';

import { FIELD_TYPE_MAP, FieldForFrontend } from '../types/fieldTypes';

const API_BASE_URL = "https://back.tungdeportes.com/api";

class EventService {

  private isValidEventTime(eventDateTime: Date): boolean {
    try {
      const now = new Date();
      const minimumFutureTime = new Date(now.getTime() + 10 * 60 * 1000);

      console.log("--- 🐛 Debug de Validación Final ---");
      console.log(`Hora del evento (corregida): ${eventDateTime.toLocaleString('es-CO')}`);
      console.log(`Hora mínima requerida (actual): ${minimumFutureTime.toLocaleString('es-CO')}`);
      console.log(`¿Es futuro?: ${eventDateTime > minimumFutureTime}`);
      console.log("------------------------------------");

      return eventDateTime > minimumFutureTime;

    } catch (error) {
      console.error("❌ Error validando la hora del evento:", error);
      return false;
    }
  }

  async createEvent(
    eventForm: CreateEventForm,
    selectedField: FieldForFrontend
  ): Promise<EventServiceResponse<EventForFrontend>> {
    try {
      console.log("🏗️ Recibiendo para crear evento:", eventForm);

      const eventDateTime = new Date(eventForm.date);
      const [hours, minutes] = eventForm.time.split(':').map(Number);
      eventDateTime.setHours(hours, minutes, 0, 0);

      console.log(`-- ⚠️ Aplicando parche de +5 horas --`);
      console.log(`Fecha/Hora ANTES del parche: ${eventDateTime.toLocaleString()}`);
      eventDateTime.setHours(eventDateTime.getHours() + 5);
      console.log(`Fecha/Hora DESPUÉS del parche: ${eventDateTime.toLocaleString()}`);
      console.log(`------------------------------------`);

      if (!this.isValidEventTime(eventDateTime)) {
        return {
          success: false,
          message: "La hora del evento debe ser de al menos 10 minutos en el futuro."
        };
      }

      const isoDateTime = eventDateTime.toISOString();

      const backendType = FIELD_TYPE_MAP[selectedField.type];
      const maxCapacity = getMaxCapacity(selectedField.type);

      const createRequest: CreateEventRequest = {
        canchaId: eventForm.fieldId,
        tipo: backendType,
        hora: isoDateTime, 
        capacidadMaxima: maxCapacity,
        inSubcancha: false
      };

      console.log("📤 Enviando petición al backend:", createRequest);

      const response = await fetch(`${API_BASE_URL}/partidos/crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error del backend:", errorText);
        if (response.status === 409) {
          return { success: false, message: "La cancha ya está ocupada en ese horario." };
        }
        throw new Error(`Error HTTP ${response.status}: ${errorText}`);
      }

      const eventData: CreateEventResponse = await response.json();
      const frontendEvent = this.mapBackendToFrontend(eventData, selectedField);

      return {
        success: true,
        message: "Evento creado exitosamente",
        data: frontendEvent,
      };

    } catch (error) {
      console.error("❌ Error fatal en createEvent:", error);
      const errorMessage = error instanceof Error ? error.message : "Ocurrió un error desconocido.";
      return { success: false, message: errorMessage };
    }
  }

  async getHostEvents(userFields: FieldForFrontend[]): Promise<EventServiceResponse<EventForFrontend[]>> {
    try {
      if (!userFields || userFields.length === 0) {
        return { success: true, message: "No hay canchas disponibles", data: [] };
      }
      const response = await fetch(`${API_BASE_URL}/partidos`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const allEventsData: CreateEventResponse[] = await response.json();
      const userFieldIds = userFields.map(field => field.id);
      const userEvents = allEventsData.filter(event => userFieldIds.includes(event.canchaId));
      const frontendEvents: EventForFrontend[] = userEvents.map(event => {
        const fieldInfo = userFields.find(field => field.id === event.canchaId);
        return this.mapBackendToFrontend(event, fieldInfo);
      });
      frontendEvents.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
      return { success: true, message: `${frontendEvents.length} eventos encontrados`, data: frontendEvents };
    } catch (error) {
      console.error("❌ Error getting events:", error);
      return { success: false, message: "Error al cargar los eventos", data: [] };
    }
  }

  async getEventDetails(eventId: string): Promise<EventServiceResponse<EventForFrontend>> {
    try {
      const response = await fetch(`${API_BASE_URL}/partidos/${eventId}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const eventData: CreateEventResponse = await response.json();
      const frontendEvent = this.mapBackendToFrontend(eventData);
      return { success: true, message: "Detalles del evento obtenidos exitosamente", data: frontendEvent };
    } catch (error) {
      console.error("❌ Error getting event details:", error);
      return { success: false, message: "Error al cargar los detalles del evento" };
    }
  }

  async cancelEvent(eventId: string): Promise<EventServiceResponse<boolean>> {
    try {
      const response = await fetch(`${API_BASE_URL}/partidos/${eventId}/cancelar`, { method: 'PUT' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return { success: true, message: "Evento cancelado exitosamente", data: true };
    } catch (error) {
      console.error("❌ Error cancelling event:", error);
      return { success: false, message: "Error al cancelar el evento", data: false };
    }
  }

  async completeEvent(eventId: string, attendedPlayerIds: string[]): Promise<EventServiceResponse<EventForFrontend>> {
    try {
      console.log("🏁 Completando evento:", eventId, "con jugadores:", attendedPlayerIds);

      const requestBody = {
        jugadoresQueAsistieron: attendedPlayerIds
      };

      console.log("📤 Enviando petición para completar evento:", requestBody);

      const response = await fetch(`${API_BASE_URL}/partidos/${eventId}/completar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error completando evento:", errorText);

        if (response.status === 404) {
          return { success: false, message: "Evento no encontrado" };
        } else if (response.status === 400) {
          return { success: false, message: "Datos inválidos para completar el evento" };
        } else if (response.status === 409) {
          return { success: false, message: "El evento ya fue completado anteriormente" };
        }

        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const eventData: CreateEventResponse = await response.json();
      console.log("✅ Evento completado exitosamente:", eventData);

      const frontendEvent = this.mapBackendToFrontend(eventData);

      return {
        success: true,
        message: "Evento completado exitosamente",
        data: frontendEvent,
      };

    } catch (error) {
      console.error("❌ Error completing event:", error);

      let errorMessage = "Error al completar el evento";

      if (error instanceof Error) {
        if (error.message.includes("Network")) {
          errorMessage = "Error de conexión. Verifica tu internet";
        } else if (error.message.includes("500")) {
          errorMessage = "Error del servidor. Intenta más tarde";
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  private mapBackendToFrontend(backendEvent: CreateEventResponse, fieldInfo?: FieldForFrontend): EventForFrontend {
    const { date, time } = parseISODateTime(backendEvent.hora);
    const frontendStatus = EVENT_STATUS_REVERSE_MAP[backendEvent.estado];
    const frontendType = backendEvent.tipo.toLowerCase().replace('_', '') as any;
    const eventDate = new Date(backendEvent.hora);
    const title = getEventTitle(frontendType, eventDate, time);
    return {
      id: backendEvent.partidoId,
      fieldId: backendEvent.canchaId,
      fieldName: fieldInfo?.name || `Cancha ${backendEvent.tipo}`,
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

  validateEventForm(form: CreateEventForm): EventServiceResponse<boolean> {
    const errors: string[] = [];
    if (!form.fieldId) errors.push("Debe seleccionar una cancha");
    if (!form.date) errors.push("Debe seleccionar una fecha");
    if (!form.time || !/^\d{2}:\d{2}$/.test(form.time)) errors.push("Debe seleccionar una hora válida (HH:MM)");
    return {
      success: errors.length === 0,
      message: errors.join('\n'),
      errors,
      data: errors.length === 0,
    };
  }

  getEventsStatistics(events: EventForFrontend[]) {
    const now = new Date();
    return {
      total: events.length,
      active: events.filter(e => e.status === 'available' && new Date(e.datetime) > now).length,
      finished: events.filter(e => e.status === 'finished').length,
      cancelled: events.filter(e => e.status === 'cancelled').length,
      upcoming: events.filter(e => e.status === 'available' && new Date(e.datetime) > now).length,
      totalPlayers: events.reduce((sum, e) => sum + e.registeredPlayers, 0),
      averageOccupancy: events.length > 0
        ? Math.round(events.reduce((sum, e) => sum + (e.registeredPlayers / e.maxPlayers), 0) / events.length * 100)
        : 0
    };
  }

  isEventReadyToStart(eventDateTime: string): boolean {
    const eventTime = new Date(eventDateTime);
    const now = new Date();


    const fifteenMinutesBefore = new Date(eventTime.getTime() - 15 * 60 * 1000);

    console.log("🕒 Verificando si se puede empezar el evento:");
    console.log(`Hora del evento: ${eventTime.toLocaleString()}`);
    console.log(`Hora actual: ${now.toLocaleString()}`);
    console.log(`15 min antes: ${fifteenMinutesBefore.toLocaleString()}`);
    console.log(`¿Se puede empezar?: ${now >= fifteenMinutesBefore}`);

    return now >= fifteenMinutesBefore;
  }

  getRegisteredPlayers(positions: any[]): Array<{id: string, name: string, position: string}> {
    return positions
      .filter(pos => pos.ocupada && pos.jugadorId && pos.nombreJugador)
      .map(pos => ({
        id: pos.jugadorId,
        name: pos.nombreJugador,
        position: pos.nombre
      }));
  }
}

export const eventService = new EventService();
export default eventService;