export type UserType = "player" | "host" | "admin";

export interface BackendUser {
  id: string;
  correo: string;
  nombreCompleto: string;
  documentoIdentidad: string;
  rolId: string;
  rolNombre: string;
}
export interface BaseUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  documentoIdentidad: string;
  avatar?: string;
  userType: UserType;
  isActive: boolean;
  createdAt: string;
  rolId: string;
  rolNombre: string;
}

export type PlayerPosition = "goalkeeper" | "defender" | "midfielder" | "forward" | "shuttlecock";

export interface PlayerStats {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export interface Player extends BaseUser {
  userType: "player";
  position: PlayerPosition;
  stats: PlayerStats;
  preferredFoot: "left" | "right" | "both";
  experience: "beginner" | "intermediate" | "advanced" | "professional";
  height: number;
  weight: number;
}

export type FieldType = "futbol5" | "futbol7" | "futbol11";

export interface Field {
  id: string;
  name: string;
  type: FieldType;
  capacity: number;
  pricePerHour: number;
  hasLighting: boolean;
  isIndoor: boolean;
  amenities: string[];
  images: string[];
  isActive: boolean;
}

export interface Host extends BaseUser {
  userType: "host";
  businessName: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  description: string;
  fields: Field[];
  rating: number;
  totalReviews: number;
  businessHours: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  contactInfo: {
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
  };
}
export interface Admin extends BaseUser {
  userType: "admin";
  permissions: string[];
  adminLevel: "super" | "standard";
}

export type User = Player | Host | Admin;

export type EventStatus =
  | "open"
  | "full"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Event {
  id: string;
  hostId: string;
  host: Host;
  fieldId: string;
  field: Field;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  maxPlayers: number;
  currentPlayers: number;
  pricePerPlayer: number;
  status: EventStatus;
  participants: EventParticipant[];
  requirements?: {
    minExperience?: Player["experience"];
    maxAge?: number;
    minAge?: number;
  };
  createdAt: string;
}

export interface EventParticipant {
  playerId: string;
  player: Player;
  position: PlayerPosition;
  joinedAt: string;
  status: "confirmed" | "pending" | "cancelled";
}

export interface FieldFormation {
  fieldType: FieldType;
  positions: {
    [key in PlayerPosition]: {
      max: number;
      occupied: number;
      players: EventParticipant[];
    };
  };
}

export type RootStackParamList = {
  AuthStack: undefined;
  MainStack: undefined;
  AdminStack: undefined;
};
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  PlayerRegistration: undefined;
  HostRegistration: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Events: undefined;
  Profile: undefined;
  HostDashboard: undefined;
  Challenges: undefined;
};
export type AdminTabParamList = {
  Dashboard: undefined;
  Users: undefined;
  Events: undefined;
  Reports: undefined;
  Settings: undefined;
};

export type HomeStackParamList = {
  MapView: undefined;
  EventDetails: { eventId: string };
  JoinEvent: { eventId: string };
};

export interface LoginForm {
  documentoIdentidad: string;
  password: string;
}
export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
  documentoIdentidad: string;
  userType: UserType;
}
export interface PlayerRegistrationForm {
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  gender: string;
  birthDate: Date;
  department: string;
  city: string;
  nickname: string;
  position: PlayerPosition;
  height: number;
  weight: number;
}
export interface HostRegistrationForm {
  businessName: string;
  address: string;
  description: string;
  contactInfo: {
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
  };
}

export interface CreateEventForm {
  fieldId: string;
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  duration: number;
  pricePerPlayer: number;
  requirements?: {
    minExperience?: Player["experience"];
    maxAge?: number;
    minAge?: number;
  };
}
export interface PlayerFormData {
  personalInfo: {
    firstName: string;
    lastName: string;
    documentType: string;
    documentNumber: string;
    email: string;
    password: string;
    phone: string;
  };
  additionalInfo: {
    gender: string;
    birthDate: Date;
    department: string;
    city: string;
  };
  sportInfo: {
    nickname: string;
    position: PlayerPosition;
    alternativePositions: PlayerPosition[];
  };
  physicalInfo: {
    height: number;
    weight: number;
  };
  stats: {
    // Arquero
    reach?: number;
    saves?: number;
    reflexes?: number;
    speed?: number;
    throw?: number;
    positioning?: number;
    // Jugador
    pace?: number;
    shooting?: number;
    passing?: number;
    dribbling?: number;
    defending?: number;
    physical?: number;
  };
  profileImage?: string;
  isUnderage?: boolean;
  isForSponsored?: boolean;
}