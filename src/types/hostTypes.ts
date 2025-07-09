export interface CreateHostRequest {
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
  duenioCancha: {
    usuarioId: string; 
    nit: string;
    correoElectronicoEmpresarial: string;
    correoElectronicoFacturacion: string;
    razonSocial: string; // ✅ CAMPO AGREGADO
    telefonoContacto: string;
    telefonoEstablecimiento: string;
    direccion: string;
    coordenadaX: number;
    coordenadaY: number;
    rut?: string;
    camaraComercio?: string;
    certificacionBancaria?: string;
    cedulaRepresentanteLegal?: string;
    horaApertura: string;
    horaCierre: string;
    duenioVerificado: boolean;
    fotosEstablecimiento: string[];
  };
}

export interface CreateHostResponse {
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
  duenioCancha: {
    id: string;
    usuarioId: string;
    nit: string;
    correoElectronicoEmpresarial: string;
    correoElectronicoFacturacion: string;
    razonSocial: string; // ✅ CAMPO AGREGADO
    telefonoContacto: string;
    telefonoEstablecimiento: string;
    direccion: string;
    coordenadaX: number;
    coordenadaY: number;
    rut?: string;
    camaraComercio?: string;
    certificacionBancaria?: string;
    cedulaRepresentanteLegal?: string;
    horaApertura: string;
    horaCierre: string;
    duenioVerificado: boolean;
    fotosEstablecimiento: string[];
    createdAt: string;
    updatedAt: string;
  };
}

export interface MultipleImageUploadResponse {
  success: boolean;
  urls: string[];
  message: string;
}

export interface SingleImageUploadResponse {
  success: boolean;
  urls: string[];
  message: string;
}

export interface HostEmailVerificationResponse {
  message: string;
  verified: boolean;
}

export const HOST_ROLE_ID = "51191d1a-b935-4ea1-92cd-a2eb185eb691";

export const HOST_GENDER_MAP = {
  'male': 'MASCULINO',
  'female': 'FEMENINO',
  'other': 'OTRO'
} as const;

export type HostFrontendGender = keyof typeof HOST_GENDER_MAP;
export type HostBackendGender = typeof HOST_GENDER_MAP[HostFrontendGender];

export interface HostValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface HostServiceResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface ExtendedHostRegistrationForm {
  businessName: string;
  address: string;
  description: string;

  adminName: string;
  adminEmail: string;
  adminPassword: string;
  adminConfirmPassword: string;
  adminPhone: string;
  adminGender: string;
  adminBirthDate: Date;
  adminDocumentNumber: string;

  nit: string;
  businessEmail: string;
  billingEmail: string;
  businessPhone: string;
  razonSocial: string; 

  openTime: string;
  closeTime: string;

  contactInfo: {
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
  };
}