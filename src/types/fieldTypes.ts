
export type FieldTypeBackend = 'FUTBOL_5' | 'FUTBOL_7' | 'FUTBOL_11';
export type FieldTypeFrontend = 'futbol5' | 'futbol7' | 'futbol11';

export const FIELD_TYPE_MAP: Record<FieldTypeFrontend, FieldTypeBackend> = {
  'futbol5': 'FUTBOL_5',
  'futbol7': 'FUTBOL_7',
  'futbol11': 'FUTBOL_11'
};

export const FIELD_TYPE_REVERSE_MAP: Record<FieldTypeBackend, FieldTypeFrontend> = {
  'FUTBOL_5': 'futbol5',
  'FUTBOL_7': 'futbol7',
  'FUTBOL_11': 'futbol11'
};

export interface CreateFieldRequest {
  tipo: FieldTypeBackend;
  valorHora: number;
  duenioId: string;
}

export interface UpdateFieldRequest {
  tipo: FieldTypeBackend;
  valorHora: number;
  duenioId: string;
}

export interface FieldResponseFromAPI {
  id: string;
  tipo: FieldTypeBackend;
  valorHora: number;
  calificacion: number;
  duenio: {
    id: string;
    usuario: {
      id: string;
      nombreCompleto: string;
      correo: string;
      documentoIdentidad: string;
      edad: number;
      genero: string;
      verificacionEdad: boolean;
      createdAt: string;
      fechaNacimiento: string;
      profilePicture: string;
      estado: boolean;
      rol: {
        id: string;
        nombre: string;
        descripcion: string;
        permisos: string[];
      };
    };
    nit: string;
    correoElectronicoEmpresarial: string;
    correoElectronicoFacturacion: string;
    razonSocial: string;
    telefonoContacto: string;
    telefonoEstablecimiento: string;
    direccion: string;
    coordenadaX: number;
    coordenadaY: number;
    rut: string;
    camaraComercio: string;
    certificacionBancaria: string;
    cedulaRepresentanteLegal: string;
    horaApertura: string;
    horaCierre: string;
    fotosEstablecimiento: string[];
    duenioVerificado: boolean;
    canchas: any[]; 
  };
  subcanchas: any[];
}

export interface FieldForFrontend {
  id: string;
  name: string;
  type: FieldTypeFrontend;
  capacity: number;
  pricePerHour: number;
  hasLighting: boolean;
  isIndoor: boolean;
  amenities: string[];
  images: string[];
  isActive: boolean;
  rating?: number;
  // Campos del backend
  backendType: FieldTypeBackend;
  ownerId: string;
  ownerInfo?: {
    businessName: string;
    address: string;
    openTime: string;
    closeTime: string;
  };
}

export interface CreateFieldForm {
  name: string;
  type: FieldTypeFrontend;
  pricePerHour: number;
}

export interface UpdateFieldForm {
  name: string;
  type: FieldTypeFrontend;
  pricePerHour: number;
}

export const getFieldCapacity = (type: FieldTypeFrontend): number => {
  switch (type) {
    case 'futbol5': return 10;
    case 'futbol7': return 14;
    case 'futbol11': return 22;
    default: return 10;
  }
};

export const getFieldDisplayName = (type: FieldTypeFrontend): string => {
  switch (type) {
    case 'futbol5': return 'Fútbol 5';
    case 'futbol7': return 'Fútbol 7';
    case 'futbol11': return 'Fútbol 11';
    default: return 'Fútbol 5';
  }
};

export const getFieldEmoji = (type: FieldTypeFrontend): string => {
  switch (type) {
    case 'futbol5': return '⚽';
    case 'futbol7': return '🥅';
    case 'futbol11': return '🏟️';
    default: return '⚽';
  }
};

export const getFieldColor = (type: FieldTypeFrontend): string => {
  switch (type) {
    case 'futbol5': return '#4CAF50';
    case 'futbol7': return '#FF9800';
    case 'futbol11': return '#2196F3';
    default: return '#4CAF50';
  }
};

export interface FieldServiceResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}