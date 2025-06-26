import { Player, Host, Event, EventParticipant, PlayerPosition, FieldType } from '../types';

// Mock Users Data
export const mockPlayers: Player[] = [
  {
    id: '1',
    email: 'juan@test.com',
    fullName: 'Juan Pérez',
    phone: '+57 300 111 1111',
    userType: 'player',
    isActive: true,
    createdAt: '2025-01-01',
    position: 'midfielder',
    stats: {
      pace: 75,
      shooting: 70,
      passing: 85,
      dribbling: 80,
      defending: 60,
      physical: 75
    },
    preferredFoot: 'right',
    experience: 'intermediate',
    height: 175,
    weight: 70,
  },
  {
    id: '2',
    email: 'carlos@test.com',
    fullName: 'Carlos González',
    phone: '+57 300 222 2222',
    userType: 'player',
    isActive: true,
    createdAt: '2025-01-01',
    position: 'forward',
    stats: {
      pace: 85,
      shooting: 90,
      passing: 70,
      dribbling: 85,
      defending: 50,
      physical: 80
    },
    preferredFoot: 'left',
    experience: 'advanced',
    height: 180,
    weight: 75,
  },
  {
    id: '3',
    email: 'miguel@test.com',
    fullName: 'Miguel Rodríguez',
    phone: '+57 300 333 3333',
    userType: 'player',
    isActive: true,
    createdAt: '2025-01-01',
    position: 'goalkeeper',
    stats: {
      pace: 60,
      shooting: 40,
      passing: 75,
      dribbling: 55,
      defending: 90,
      physical: 85
    },
    preferredFoot: 'right',
    experience: 'professional',
    height: 185,
    weight: 80,
  },
  {
    id: '4',
    email: 'andres@test.com',
    fullName: 'Andrés Martínez',
    phone: '+57 300 444 4444',
    userType: 'player',
    isActive: true,
    createdAt: '2025-01-01',
    position: 'defender',
    stats: {
      pace: 65,
      shooting: 55,
      passing: 80,
      dribbling: 60,
      defending: 85,
      physical: 90
    },
    preferredFoot: 'right',
    experience: 'intermediate',
    height: 178,
    weight: 78,
  },
];

export const mockHosts: Host[] = [
  {
    id: 'host1',
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
    description: 'La mejor cancha sintética de Barranquilla con todas las comodidades para una experiencia de fútbol excepcional.',
    fields: [
      {
        id: 'field1',
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
      {
        id: 'field2',
        name: 'Cancha Secundaria',
        type: 'futbol5',
        capacity: 10,
        pricePerHour: 40000,
        hasLighting: true,
        isIndoor: false,
        amenities: ['Baños', 'Parqueadero', 'Vestuarios'],
        images: [],
        isActive: true,
      },
    ],
    rating: 4.5,
    totalReviews: 120,
    businessHours: {
      monday: { open: '06:00', close: '23:00', isOpen: true },
      tuesday: { open: '06:00', close: '23:00', isOpen: true },
      wednesday: { open: '06:00', close: '23:00', isOpen: true },
      thursday: { open: '06:00', close: '23:00', isOpen: true },
      friday: { open: '06:00', close: '23:00', isOpen: true },
      saturday: { open: '06:00', close: '23:00', isOpen: true },
      sunday: { open: '08:00', close: '22:00', isOpen: true },
    },
    contactInfo: {
      whatsapp: '+57 300 123 4567',
      instagram: '@cancha_estadio',
    },
  },
  {
    id: 'host2',
    email: 'futbol@ejemplo.com',
    fullName: 'Centro Deportivo Norte',
    phone: '+57 300 987 6543',
    userType: 'host',
    isActive: true,
    createdAt: '2025-01-01',
    businessName: 'Centro Deportivo Norte',
    address: 'Carrera 45 #84-12, Barranquilla',
    coordinates: {
      latitude: 11.0041,
      longitude: -74.8070,
    },
    description: 'Complejo deportivo moderno con múltiples canchas y excelente ubicación en el norte de la ciudad.',
    fields: [
      {
        id: 'field3',
        name: 'Cancha Norte A',
        type: 'futbol5',
        capacity: 10,
        pricePerHour: 45000,
        hasLighting: true,
        isIndoor: false,
        amenities: ['Baños', 'Parqueadero', 'Cafetería'],
        images: [],
        isActive: true,
      },
      {
        id: 'field4',
        name: 'Cancha Norte B',
        type: 'futbol7',
        capacity: 14,
        pricePerHour: 55000,
        hasLighting: true,
        isIndoor: true,
        amenities: ['Baños', 'Parqueadero', 'Cafetería', 'Aire acondicionado'],
        images: [],
        isActive: true,
      },
      {
        id: 'field5',
        name: 'Cancha Principal Norte',
        type: 'futbol11',
        capacity: 22,
        pricePerHour: 80000,
        hasLighting: true,
        isIndoor: false,
        amenities: ['Baños', 'Parqueadero', 'Cafetería', 'Vestuarios', 'Duchas', 'Tribuna'],
        images: [],
        isActive: true,
      },
    ],
    rating: 4.2,
    totalReviews: 89,
    businessHours: {
      monday: { open: '05:00', close: '24:00', isOpen: true },
      tuesday: { open: '05:00', close: '24:00', isOpen: true },
      wednesday: { open: '05:00', close: '24:00', isOpen: true },
      thursday: { open: '05:00', close: '24:00', isOpen: true },
      friday: { open: '05:00', close: '24:00', isOpen: true },
      saturday: { open: '05:00', close: '24:00', isOpen: true },
      sunday: { open: '06:00', close: '23:00', isOpen: true },
    },
    contactInfo: {
      whatsapp: '+57 300 987 6543',
      instagram: '@centronorte_deportivo',
      facebook: 'Centro Deportivo Norte',
    },
  },
];

// Generate mock participants for events
const generateMockParticipants = (count: number): EventParticipant[] => {
  const participants: EventParticipant[] = [];
  const availablePlayers = [...mockPlayers];
  
  for (let i = 0; i < Math.min(count, availablePlayers.length); i++) {
    const randomIndex = Math.floor(Math.random() * availablePlayers.length);
    const player = availablePlayers.splice(randomIndex, 1)[0];
    
    participants.push({
      playerId: player.id,
      player: player,
      position: player.position,
      joinedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'confirmed',
    });
  }
  
  return participants;
};

export const mockEvents: Event[] = [
  {
    id: 'event1',
    hostId: 'host1',
    host: mockHosts[0],
    fieldId: 'field1',
    field: mockHosts[0].fields[0],
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
    participants: generateMockParticipants(8),
    requirements: {
      minExperience: 'beginner',
      maxAge: 40,
      minAge: 16,
    },
    createdAt: '2025-06-14',
  },
  {
    id: 'event2',
    hostId: 'host2',
    host: mockHosts[1],
    fieldId: 'field3',
    field: mockHosts[1].fields[0],
    title: 'Fútbol 5 - Sábado mañana',
    description: 'Partido competitivo, nivel intermedio-avanzado. Buen ambiente y juego técnico garantizado.',
    date: '2025-06-15',
    startTime: '09:00',
    endTime: '10:00',
    duration: 60,
    maxPlayers: 10,
    currentPlayers: 10,
    pricePerPlayer: 8000,
    status: 'full',
    participants: generateMockParticipants(10),
    requirements: {
      minExperience: 'intermediate',
      maxAge: 35,
      minAge: 18,
    },
    createdAt: '2025-06-14',
  },
  {
    id: 'event3',
    hostId: 'host1',
    host: mockHosts[0],
    fieldId: 'field1',
    field: mockHosts[0].fields[0],
    title: 'Fútbol 7 - Domingo tarde',
    description: 'Partido familiar, perfecto para relajarse y disfrutar del fútbol en domingo.',
    date: '2025-06-16',
    startTime: '16:00',
    endTime: '17:30',
    duration: 90,
    maxPlayers: 14,
    currentPlayers: 6,
    pricePerPlayer: 6000,
    status: 'open',
    participants: generateMockParticipants(6),
    requirements: {
      minExperience: 'beginner',
      maxAge: 50,
      minAge: 14,
    },
    createdAt: '2025-06-14',
  },
  {
    id: 'event4',
    hostId: 'host2',
    host: mockHosts[1],
    fieldId: 'field5',
    field: mockHosts[1].fields[2],
    title: 'Fútbol 11 - Gran clásico dominical',
    description: 'El gran evento de la semana. Fútbol 11 de alto nivel con equipos completos. ¡Ven y demuestra tu talento!',
    date: '2025-06-16',
    startTime: '10:00',
    endTime: '11:30',
    duration: 90,
    maxPlayers: 22,
    currentPlayers: 12,
    pricePerPlayer: 5500,
    status: 'open',
    participants: generateMockParticipants(12),
    requirements: {
      minExperience: 'intermediate',
      maxAge: 45,
      minAge: 16,
    },
    createdAt: '2025-06-13',
  },
  {
    id: 'event5',
    hostId: 'host1',
    host: mockHosts[0],
    fieldId: 'field2',
    field: mockHosts[0].fields[1],
    title: 'Fútbol 5 - Lunes técnico',
    description: 'Comenzamos la semana con buen fútbol. Partido técnico y divertido.',
    date: '2025-06-17',
    startTime: '19:00',
    endTime: '20:00',
    duration: 60,
    maxPlayers: 10,
    currentPlayers: 4,
    pricePerPlayer: 7500,
    status: 'open',
    participants: generateMockParticipants(4),
    requirements: {
      minExperience: 'beginner',
      maxAge: 40,
      minAge: 15,
    },
    createdAt: '2025-06-14',
  },
  {
    id: 'event6',
    hostId: 'host2',
    host: mockHosts[1],
    fieldId: 'field4',
    field: mockHosts[1].fields[1],
    title: 'Fútbol 7 - Martes indoor',
    description: 'Partido en cancha techada con aire acondicionado. Perfecta para el calor de Barranquilla.',
    date: '2025-06-18',
    startTime: '20:00',
    endTime: '21:30',
    duration: 90,
    maxPlayers: 14,
    currentPlayers: 9,
    pricePerPlayer: 8500,
    status: 'open',
    participants: generateMockParticipants(9),
    requirements: {
      minExperience: 'intermediate',
      maxAge: 38,
      minAge: 17,
    },
    createdAt: '2025-06-14',
  },
];

// Mock Data Service
export class MockDataService {
  // Simular delay de red
  private static delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Auth Methods
  static async login(email: string, password: string): Promise<Player | Host | null> {
    await this.delay();
    
    // Simular autenticación
    const allUsers = [...mockPlayers, ...mockHosts];
    const user = allUsers.find(u => u.email === email);
    
    if (user && password.length >= 6) {
      return user;
    }
    
    return null;
  }

  static async register(userData: any): Promise<boolean> {
    await this.delay();
    // Simular registro exitoso
    return true;
  }

  // Events Methods
  static async getEvents(): Promise<Event[]> {
    await this.delay();
    return [...mockEvents];
  }

  static async getEventById(eventId: string): Promise<Event | null> {
    await this.delay();
    return mockEvents.find(e => e.id === eventId) || null;
  }

  static async getEventsByHost(hostId: string): Promise<Event[]> {
    await this.delay();
    return mockEvents.filter(e => e.hostId === hostId);
  }

  static async joinEvent(eventId: string, playerId: string, position: PlayerPosition): Promise<boolean> {
    await this.delay();
    
    const event = mockEvents.find(e => e.id === eventId);
    const player = mockPlayers.find(p => p.id === playerId);
    
    if (event && player && event.currentPlayers < event.maxPlayers) {
      const participant: EventParticipant = {
        playerId: player.id,
        player: player,
        position: position,
        joinedAt: new Date().toISOString(),
        status: 'confirmed',
      };
      
      event.participants.push(participant);
      event.currentPlayers++;
      
      if (event.currentPlayers >= event.maxPlayers) {
        event.status = 'full';
      }
      
      return true;
    }
    
    return false;
  }

  static async leaveEvent(eventId: string, playerId: string): Promise<boolean> {
    await this.delay();
    
    const event = mockEvents.find(e => e.id === eventId);
    
    if (event) {
      const participantIndex = event.participants.findIndex(p => p.playerId === playerId);
      
      if (participantIndex !== -1) {
        event.participants.splice(participantIndex, 1);
        event.currentPlayers--;
        
        if (event.status === 'full') {
          event.status = 'open';
        }
        
        return true;
      }
    }
    
    return false;
  }

  static async createEvent(eventData: Partial<Event>): Promise<Event | null> {
    await this.delay();
    
    const newEvent: Event = {
      id: `event${Date.now()}`,
      hostId: eventData.hostId!,
      host: mockHosts.find(h => h.id === eventData.hostId)!,
      fieldId: eventData.fieldId!,
      field: mockHosts
        .flatMap(h => h.fields)
        .find(f => f.id === eventData.fieldId)!,
      title: eventData.title!,
      description: eventData.description || '',
      date: eventData.date!,
      startTime: eventData.startTime!,
      endTime: eventData.endTime!,
      duration: eventData.duration!,
      maxPlayers: eventData.maxPlayers!,
      currentPlayers: 0,
      pricePerPlayer: eventData.pricePerPlayer!,
      status: 'open',
      participants: [],
      requirements: eventData.requirements,
      createdAt: new Date().toISOString(),
    };
    
    mockEvents.push(newEvent);
    return newEvent;
  }

  // Hosts Methods
  static async getHosts(): Promise<Host[]> {
    await this.delay();
    return [...mockHosts];
  }

  static async getHostById(hostId: string): Promise<Host | null> {
    await this.delay();
    return mockHosts.find(h => h.id === hostId) || null;
  }

  // Players Methods
  static async getPlayers(): Promise<Player[]> {
    await this.delay();
    return [...mockPlayers];
  }

  static async getPlayerById(playerId: string): Promise<Player | null> {
    await this.delay();
    return mockPlayers.find(p => p.id === playerId) || null;
  }

  // Search Methods
  static async searchEvents(query: {
    location?: { latitude: number; longitude: number; radius: number };
    date?: string;
    fieldType?: FieldType;
    priceRange?: { min: number; max: number };
  }): Promise<Event[]> {
    await this.delay();
    
    let filteredEvents = [...mockEvents];
    
    if (query.date) {
      filteredEvents = filteredEvents.filter(e => e.date === query.date);
    }
    
    if (query.fieldType) {
      filteredEvents = filteredEvents.filter(e => e.field.type === query.fieldType);
    }
    
    if (query.priceRange) {
      filteredEvents = filteredEvents.filter(e => 
        e.pricePerPlayer >= query.priceRange!.min && 
        e.pricePerPlayer <= query.priceRange!.max
      );
    }
    
    // TODO: Implementar filtro por ubicación
    if (query.location) {
      // Por ahora, simplemente devolvemos todos los eventos filtrados
      // En una implementación real, calcularíamos la distancia
    }
    
    return filteredEvents;
  }

  // Statistics Methods
  static async getHostStatistics(hostId: string): Promise<{
    totalEvents: number;
    totalRevenue: number;
    totalPlayers: number;
    averageRating: number;
    monthlyData: Array<{ month: string; events: number; revenue: number }>;
  }> {
    await this.delay();
    
    const hostEvents = mockEvents.filter(e => e.hostId === hostId);
    const completedEvents = hostEvents.filter(e => e.status === 'completed');
    
    return {
      totalEvents: hostEvents.length,
      totalRevenue: completedEvents.reduce((sum, e) => sum + (e.pricePerPlayer * e.currentPlayers), 0),
      totalPlayers: hostEvents.reduce((sum, e) => sum + e.currentPlayers, 0),
      averageRating: mockHosts.find(h => h.id === hostId)?.rating || 0,
      monthlyData: [
        { month: 'Ene', events: 12, revenue: 840000 },
        { month: 'Feb', events: 15, revenue: 1050000 },
        { month: 'Mar', events: 18, revenue: 1260000 },
        { month: 'Abr', events: 20, revenue: 1400000 },
        { month: 'May', events: 22, revenue: 1540000 },
        { month: 'Jun', events: 8, revenue: 560000 }, // Mes actual (parcial)
      ],
    };
  }
}

export default MockDataService;