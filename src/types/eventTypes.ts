
import { FieldTypeFrontend, FieldTypeBackend, FIELD_TYPE_MAP } from './fieldTypes';

export type EventStatusBackend = 'DISPONIBLE' | 'EN_CURSO' | 'FINALIZADO' | 'CANCELADO';
export type EventStatusFrontend = 'available' | 'in_progress' | 'finished' | 'cancelled';

export const EVENT_STATUS_MAP: Record<EventStatusFrontend, EventStatusBackend> = {
  'available': 'DISPONIBLE',
  'in_progress': 'EN_CURSO',
  'finished': 'FINALIZADO',
  'cancelled': 'CANCELADO'
};

export const EVENT_STATUS_REVERSE_MAP: Record<EventStatusBackend, EventStatusFrontend> = {
  'DISPONIBLE': 'available',
  'EN_CURSO': 'in_progress',
  'FINALIZADO': 'finished',
  'CANCELADO': 'cancelled'
};

export interface CreateEventRequest {
  canchaId: string;
  tipo: FieldTypeBackend;
  hora: string; 
  capacidadMaxima: number;
  inSubcancha: boolean;
}

export interface CompleteEventRequest {
  jugadoresQueAsistieron: string[];
}

export interface EventPosition {
  id: string;
  nombre: string; 
  ocupada: boolean;
  jugadorId: string | null;
  nombreJugador: string | null;
}

export interface RegisteredPlayer {
  id: string;
  name: string;
  position: string;
}

export interface CreateEventResponse {
  partidoId: string;
  canchaId: string;
  subcanchaId: string | null;
  tipo: FieldTypeBackend;
  hora: string;
  estado: EventStatusBackend;
  inSubcancha: boolean;
  capacidadMaxima: number;
  jugadoresInscritos: number;
  posiciones: EventPosition[];
  espaciosDisponibles: number;
}

export interface EventForFrontend {
  id: string;
  fieldId: string;
  fieldName: string;
  fieldType: FieldTypeFrontend;
  title: string; 
  date: string; 
  time: string;
  datetime: string;
  status: EventStatusFrontend;
  maxPlayers: number;
  registeredPlayers: number;
  availableSpaces: number;
  positions: EventPosition[];
  isSubField: boolean;
  createdAt: string;
}

export interface CreateEventForm {
  fieldId: string;
  date: Date;
  time: string; 
}

export interface EventServiceResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export const getEventTitle = (fieldType: FieldTypeFrontend, date: Date, time: string): string => {
  const fieldName = fieldType.replace('futbol', 'Fútbol ');
  const dateStr = date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  return `${fieldName} - ${dateStr} ${time}`;
};

export const getMaxCapacity = (fieldType: FieldTypeFrontend): number => {
  switch (fieldType) {
    case 'futbol5': return 10;
    case 'futbol7': return 14;
    case 'futbol11': return 22;
    default: return 10;
  }
};

export const getEventStatusLabel = (status: EventStatusFrontend): string => {
  switch (status) {
    case 'available': return 'Disponible';
    case 'in_progress': return 'En Progreso';
    case 'finished': return 'Finalizado';
    case 'cancelled': return 'Cancelado';
    default: return status;
  }
};

export const getEventStatusColor = (status: EventStatusFrontend): string => {
  switch (status) {
    case 'available': return '#4CAF50';
    case 'in_progress': return '#FF9800';
    case 'finished': return '#9E9E9E';
    case 'cancelled': return '#F44336';
    default: return '#9E9E9E';
  }
};

export const createISODateTime = (date: Date, time: string): string => {
  const [hours, minutes] = time.split(':');
  const datetime = new Date(date);
  datetime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return datetime.toISOString();
};

export const parseISODateTime = (isoString: string): { date: string; time: string } => {
  const date = new Date(isoString);
  return {
    date: date.toISOString().split('T')[0],
    time: date.toTimeString().slice(0, 5)
  };
};

export const isValidEventTime = (date: Date, time: string): boolean => {
  const eventDateTime = new Date(date);
  const [hours, minutes] = time.split(':');
  eventDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  const now = new Date();
  return eventDateTime > now;
};

export interface TeamPositions {
  teamA: EventPosition[];
  teamB: EventPosition[];
}

export const groupPositionsByTeam = (positions: EventPosition[]): TeamPositions => {
  return {
    teamA: positions.filter(pos => pos.nombre.endsWith('A') || pos.nombre.includes('A')),
    teamB: positions.filter(pos => pos.nombre.endsWith('B') || pos.nombre.includes('B'))
  };
};

export const getPositionType = (positionName: string): string => {
  if (positionName.includes('Arquero')) return 'Arquero';
  if (positionName.includes('Defensa')) return 'Defensa';
  if (positionName.includes('Mediocampo')) return 'Mediocampo';
  if (positionName.includes('Delantero')) return 'Delantero';
  return 'Desconocido';
};

export const getPositionNumber = (positionName: string): string => {
  const match = positionName.match(/\d+/);
  return match ? match[0] : '';
};

export interface EventStats {
  totalPlayers: number;
  teamAPlayers: number;
  teamBPlayers: number;
  goalkeepers: number;
  defenders: number;
  midfielders: number;
  forwards: number;
  occupancyPercentage: number;
}