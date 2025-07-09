export interface LoginRequest {
  documentoIdentidad: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: string;
  refreshExpiresAt: string;
  expiresIn: number;
}

export interface RoleResponse {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: string[];
}

export interface UserTokenData {
  sub: string;
  iat: number;
  exp: number;
  correo: string;
  nombreCompleto: string;
  rolId: string;
  tokenType: string;
}
