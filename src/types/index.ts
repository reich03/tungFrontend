export type UserType = "player" | "host";

export interface BaseUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatar?: string;
  userType: UserType;
  isActive: boolean;
  createdAt: string;
}

export type PlayerPosition =
  | "goalkeeper"
  | "defender"
  | "midfielder"
  | "forward";

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

export type HomeStackParamList = {
  MapView: undefined;
  EventDetails: { eventId: string };
  JoinEvent: { eventId: string };
};

// Formularios
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
  userType: UserType;
}

export interface PlayerRegistrationForm {
  position: PlayerPosition;
  stats: PlayerStats;
  preferredFoot: "left" | "right" | "both";
  experience: Player["experience"];
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
