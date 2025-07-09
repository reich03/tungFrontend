export interface CreatePlayerRequest {
  usuario: {
    nombreCompleto: string;
    correo: string;
    documentoIdentidad: string;
    contraseña: string;
    edad: number;
    genero: 'MASCULINO' | 'FEMENINO' | 'OTRO';
    verificacionEdad: boolean;
    fechaNacimiento: string;
    profilePicture?: string;
    estado: boolean;
    rolId: string;
  };
  jugador: {
    posicion: 'PORTERO' | 'DEFENSA' | 'CENTROCAMPISTA' | 'DELANTERO' |'VOLANTE';
    ranking: number;
    membresia: boolean;
    nickName: string;
    estirada?: number;
    paradas?: number;
    reflejos?: number;
    velocidad?: number;
    saque?: number;
    posicionamiento?: number;
    ritmo?: number;
    tiro?: number;
    pase?: number;
    regates?: number;
    defensa?: number;
    fisico?: number;
  };
}

export interface CreatePlayerResponse {
  id: string;
  usuario: {
    id: string;
    nombreCompleto: string;
    correo: string;
    documentoIdentidad: string;
    edad: number;
    genero: string;
    verificacionEdad: boolean;
    fechaNacimiento: string;
    profilePicture?: string;
    estado: boolean;
    rolId: string;
    createdAt: string;
    updatedAt: string;
  };
  jugador: {
    id: string;
    posicion: string;
    ranking: number;
    membresia: boolean;
    nickName: string;
    estirada?: number;
    paradas?: number;
    reflejos?: number;
    velocidad?: number;
    saque?: number;
    posicionamiento?: number;
    ritmo?: number;
    tiro?: number;
    pase?: number;
    regates?: number;
    defensa?: number;
    fisico?: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface GetRolesResponse {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: string[];
}

export interface ImageUploadResponse {
  success: boolean;
  urls: string[];
  message: string;
}

export interface EmailVerificationRequest {
  verificationCode: string;
}

export interface EmailVerificationResponse {
  message: string;
  verified: boolean;
}

export const PLAYER_ROLE_ID = "4b2e4930-f487-45ad-9af7-0c329bc366b9";

export const GENDER_MAP = {
  'male': 'MASCULINO',
  'female': 'FEMENINO',
  'other': 'OTRO'
} as const;

export const POSITION_MAP = {
  'goalkeeper': 'PORTERO',
  'defender': 'DEFENSA',
  'midfielder': 'CENTROCAMPISTA',
  'forward': 'DELANTERO',
  'shuttlecock':'VOLANTE'
} as const;

export type FrontendGender = keyof typeof GENDER_MAP;
export type FrontendPosition = keyof typeof POSITION_MAP;
export type BackendGender = typeof GENDER_MAP[FrontendGender];
export type BackendPosition = typeof POSITION_MAP[FrontendPosition];

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PlayerServiceResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}