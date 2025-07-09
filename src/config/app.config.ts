export const AppConfig = {
  API: {
    BASE_URL: process.env.API_BASE_URL || 'https://back.tungdeportes.com/api',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    ENDPOINTS: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',

      CREATE_PLAYER: '/jugadores/usuario-jugador',
      GET_PLAYER: '/jugadores',
      UPDATE_PLAYER: '/jugadores',

      GET_ROLES: '/roles/todos',
      GET_ROLE_BY_ID: '/roles',

      UPLOAD_IMAGE: '/upload/profile-image',
    },
  },

  APP: {
    NAME: 'TUNG',
    VERSION: '1.0.0',
    ENVIRONMENT: process.env.NODE_ENV || 'development',
  },

  PLAYER: {
    ROLE_ID: '4b2e4930-f487-45ad-9af7-0c329bc366b9',
    DEFAULT_STATS: {
      GOALKEEPER: {
        reach: 30,
        saves: 30,
        reflexes: 30,
        speed: 30,
        throw: 30,
        positioning: 30,
      },
      FIELD_PLAYER: {
        pace: 30,
        shooting: 30,
        passing: 30,
        dribbling: 30,
        defending: 30,
        physical: 30,
      },
    },
    VALIDATION: {
      MIN_AGE: 13,
      MAX_AGE: 100,
      MIN_HEIGHT: 140,
      MAX_HEIGHT: 220,
      MIN_WEIGHT: 40,
      MAX_WEIGHT: 150,
      MIN_DOCUMENT_LENGTH: 7,
      MAX_DOCUMENT_LENGTH: 11,
      MIN_PASSWORD_LENGTH: 6,
      MAX_STATS_VALUE: 60,
    },
  },

  STORAGE: {
    ACCESS_TOKEN: '@tung_access_token',
    REFRESH_TOKEN: '@tung_refresh_token',
    USER_DATA: '@tung_user',
    TOKEN_EXPIRES_AT: '@tung_token_expires_at',
    REGISTERED_USER: '@tung_registered_user',
  },

  UI: {
    REGISTRATION_STEPS: 5,
    IMAGE_QUALITY: 0.8,
    IMAGE_ASPECT_RATIO: [1, 1],
    ANIMATION_DURATION: 300,
  },

  REGEX: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_COLOMBIA: /^3[0-9]{9}$/,
    DOCUMENT_NUMBER: /^[0-9]{7,11}$/,
  },

  ERRORS: {
    NETWORK: 'Error de conexión. Verifica tu internet e intenta nuevamente.',
    SERVER: 'Error del servidor. Intenta más tarde.',
    VALIDATION: 'Los datos proporcionados no son válidos.',
    DUPLICATE: 'Ya existe un usuario con este correo o documento.',
    UNAUTHORIZED: 'Credenciales inválidas. Verifica tu información.',
    TIMEOUT: 'La solicitud tardó demasiado. Intenta nuevamente.',
    UNKNOWN: 'Ocurrió un error inesperado. Intenta nuevamente.',
  },

  SUCCESS: {
    PLAYER_CREATED: 'Tu perfil de jugador ha sido creado exitosamente.',
    LOGIN_SUCCESS: 'Inicio de sesión exitoso.',
    LOGOUT_SUCCESS: 'Sesión cerrada exitosamente.',
    PROFILE_UPDATED: 'Perfil actualizado exitosamente.',
  },
};

export const { API, APP, PLAYER, STORAGE, UI, REGEX, ERRORS, SUCCESS } = AppConfig;

export const isDevelopment = AppConfig.APP.ENVIRONMENT === 'development';
export const isProduction = AppConfig.APP.ENVIRONMENT === 'production';

export const getApiUrl = (endpoint: string): string => {
  return `${AppConfig.API.BASE_URL}${endpoint}`;
};

export const getStorageKey = (key: keyof typeof AppConfig.STORAGE): string => {
  return AppConfig.STORAGE[key];
};