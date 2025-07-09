// context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, LoginForm, RegisterForm, UserType, BackendUser } from "../types";
import {
  apiService,
  LoginRequest,
  LoginResponse,
  RoleResponse,
  UserTokenData,
} from "../services/UserAuthServices";
import {
  playerService,
  CreatePlayerResponse
} from "../services/playerService";
import { PlayerRegistrationForm } from "../types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginForm) => Promise<boolean>;
  register: (data: RegisterForm) => Promise<boolean>;
  registerPlayer: (data: PlayerRegistrationForm, stats: Record<string, number>, profileImage?: string) => Promise<{ success: boolean; message: string; data?: any }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const MOCK_USERS = {
  // Jugador mockeado
  "jugador@gmail.com": {
    user: {
      id: "mock-player-001",
      email: "jugador@gmail.com",
      fullName: "Carlos Pérez",
      documentoIdentidad: "12345678",
      phone: "+57 300 123 4567",
      userType: "player" as UserType,
      isActive: true,
      createdAt: new Date().toISOString(),
      rolId: "player-role-id",
      rolNombre: "JUGADOR",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      // Campos específicos del jugador
      position: "midfielder" as const,
      stats: {
        pace: 85,
        shooting: 78,
        passing: 82,
        dribbling: 88,
        defending: 65,
        physical: 80,
      },
      preferredFoot: "right" as const,
      experience: "advanced" as const,
      height: 175,
      weight: 72,
    } as User,
    loginResponse: {
      accessToken: "mock-player-token-123",
      refreshToken: "mock-player-refresh-456",
      tokenType: "Bearer",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
      refreshExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
      expiresIn: 86400,
    } as LoginResponse
  },

  // Anfitrión mockeado
  "anfitrion@gmail.com": {
    user: {
      id: "mock-host-001",
      email: "anfitrion@gmail.com",
      fullName: "María González",
      documentoIdentidad: "87654321",
      phone: "+57 301 987 6543",
      userType: "host" as UserType,
      isActive: true,
      createdAt: new Date().toISOString(),
      rolId: "host-role-id",
      rolNombre: "ANFITRION",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face",
      // Campos específicos del anfitrión
      businessName: "Complejo Deportivo El Campeón",
      address: "Calle 123 #45-67, Barranquilla, Atlántico",
      coordinates: {
        latitude: 10.9878,
        longitude: -74.7889,
      },
      description: "Moderno complejo deportivo con canchas de fútbol 5, 7 y 11. Equipado con iluminación LED, césped sintético de alta calidad y amplias zonas de parqueadero.",
      fields: [
        {
          id: "field-001",
          name: "Cancha Principal",
          type: "futbol7" as const,
          capacity: 14,
          pricePerHour: 80000,
          hasLighting: true,
          isIndoor: false,
          amenities: ["Vestuarios", "Parqueadero", "Cafetería", "Graderías"],
          images: [
            "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300",
            "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=300"
          ],
          isActive: true,
        },
        {
          id: "field-002",
          name: "Cancha Sintética",
          type: "futbol5" as const,
          capacity: 10,
          pricePerHour: 60000,
          hasLighting: true,
          isIndoor: false,
          amenities: ["Vestuarios", "Parqueadero"],
          images: [
            "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300"
          ],
          isActive: true,
        }
      ],
      rating: 4.7,
      totalReviews: 124,
      businessHours: {
        monday: { open: "06:00", close: "22:00", isOpen: true },
        tuesday: { open: "06:00", close: "22:00", isOpen: true },
        wednesday: { open: "06:00", close: "22:00", isOpen: true },
        thursday: { open: "06:00", close: "22:00", isOpen: true },
        friday: { open: "06:00", close: "23:00", isOpen: true },
        saturday: { open: "07:00", close: "23:00", isOpen: true },
        sunday: { open: "07:00", close: "21:00", isOpen: true },
      },
      contactInfo: {
        whatsapp: "+57 301 987 6543",
        instagram: "@complejoelcampeon",
        facebook: "Complejo Deportivo El Campeón",
      },
    } as User,
    loginResponse: {
      accessToken: "mock-host-token-789",
      refreshToken: "mock-host-refresh-012",
      tokenType: "Bearer",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      refreshExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      expiresIn: 86400,
    } as LoginResponse
  }
};

const getMockedUserByEmail = (email: string) => {
  return MOCK_USERS[email as keyof typeof MOCK_USERS] || null;
};

const getMockedUserByDocument = (documentoIdentidad: string) => {
  const documentToEmailMap: Record<string, string> = {
    "12345678": "jugador@gmail.com",
    "87654321": "anfitrion@gmail.com",
  };

  const email = documentToEmailMap[documentoIdentidad];
  return email ? getMockedUserByEmail(email) : null;
};

const mapRoleToUserType = (rolNombre: string): UserType => {
  switch (rolNombre.toUpperCase()) {
    case "ADMIN":
      return "admin";
    case "JUGADOR":
      return "player";
    case "ANFITRION":
        case "DUEÑO CANCHA":
          return "host";
   default:
         console.warn(`Rol desconocido: "${rolNombre}". Se asignará 'player' por defecto.`);
         return "player";
  }
};

const createBaseUserFromBackend = (
  backendUser: BackendUser,
  roleData: RoleResponse
): User => {
  const userType = mapRoleToUserType(roleData.nombre);

  const baseUser = {
    id: backendUser.id,
    email: backendUser.correo,
    fullName: backendUser.nombreCompleto,
    documentoIdentidad: backendUser.documentoIdentidad,
    phone: "",
    userType,
    isActive: true,
    createdAt: new Date().toISOString(),
    rolId: backendUser.rolId,
    rolNombre: roleData.nombre,
  };

  switch (userType) {
    case "admin":
      return {
        ...baseUser,
        userType: "admin",
        permissions: roleData.permisos || [],
        adminLevel: "standard" as const,
      };

    case "host":
      return {
        ...baseUser,
        userType: "host",
        businessName: "",
        address: "",
        coordinates: { latitude: 0, longitude: 0 },
        description: "",
        fields: [],
        rating: 0,
        totalReviews: 0,
        businessHours: {},
        contactInfo: {},
      };

    case "player":
    default:
      return {
        ...baseUser,
        userType: "player",
        position: "midfielder" as const,
        stats: {
          pace: 50,
          shooting: 50,
          passing: 50,
          dribbling: 50,
          defending: 50,
          physical: 50,
        },
        preferredFoot: "right" as const,
        experience: "intermediate" as const,
        height: 170,
        weight: 70,
      };
  }
};

const convertPlayerResponseToUser = (playerResponse: CreatePlayerResponse): User => {
  const { usuario, jugador } = playerResponse;

  const positionMap = {
    'PORTERO': 'goalkeeper',
    'DEFENSA': 'defender',
    'MEDIO': 'midfielder',
    'DELANTERO': 'forward'
  } as const;

  return {
    id: usuario.id,
    email: usuario.correo,
    fullName: usuario.nombreCompleto,
    documentoIdentidad: usuario.documentoIdentidad,
    phone: "", 
    userType: "player",
    isActive: usuario.estado,
    createdAt: usuario.createdAt,
    rolId: usuario.rolId,
    rolNombre: "Jugador",
    avatar: usuario.profilePicture,
    position: positionMap[jugador.posicion as keyof typeof positionMap] || "midfielder",
    stats: {
      pace: jugador.ritmo || jugador.velocidad || 50,
      shooting: jugador.tiro || 50,
      passing: jugador.pase || 50,
      dribbling: jugador.regates || 50,
      defending: jugador.defensa || jugador.posicionamiento || 50,
      physical: jugador.fisico || jugador.reflejos || 50,
    },
    preferredFoot: "right" as const,
    experience: "intermediate" as const,
    height: 170, 
    weight: 70, 
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      setIsLoading(true);

      const accessToken = await AsyncStorage.getItem("@tung_access_token");
      const userData = await AsyncStorage.getItem("@tung_user");

      if (accessToken && userData) {
        if (accessToken.startsWith("mock-")) {
          setUser(JSON.parse(userData));
        } else {
          const tokenData = apiService.decodeJWT(accessToken);

          if (tokenData && tokenData.exp * 1000 > Date.now()) {
            setUser(JSON.parse(userData));
          } else {
            try {
              await refreshToken();
            } catch (error) {
              console.error("Error refreshing token:", error);
              await clearAuthData();
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading user from storage:", error);
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const saveAuthData = async (loginResponse: LoginResponse, userData: User) => {
    try {
      await AsyncStorage.multiSet([
        ["@tung_access_token", loginResponse.accessToken],
        ["@tung_refresh_token", loginResponse.refreshToken],
        ["@tung_user", JSON.stringify(userData)],
        ["@tung_token_expires_at", loginResponse.expiresAt],
      ]);
    } catch (error) {
      console.error("Error saving auth data:", error);
      throw error;
    }
  };

  const clearAuthData = async () => {
    try {
      await AsyncStorage.multiRemove([
        "@tung_access_token",
        "@tung_refresh_token",
        "@tung_user",
        "@tung_token_expires_at",
      ]);
      setUser(null);
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  };

  const refreshToken = async () => {
    try {
      const loginResponse = await apiService.refreshToken();

      const tokenData = apiService.decodeJWT(loginResponse.accessToken);
      if (!tokenData) {
        throw new Error("Invalid token data");
      }

      const roleData = await apiService.getRole(tokenData.rolId);

      const backendUser: BackendUser = {
        id: tokenData.sub,
        correo: tokenData.correo,
        nombreCompleto: tokenData.nombreCompleto,
        documentoIdentidad: "",
        rolId: tokenData.rolId,
        rolNombre: roleData.nombre,
      };

      const userData = createBaseUserFromBackend(backendUser, roleData);

      await saveAuthData(loginResponse, userData);
      setUser(userData);

      return userData;
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error;
    }
  };

  const login = async (credentials: LoginForm): Promise<boolean> => {
    try {
      setIsLoading(true);

      // 🎭 VERIFICAR SI ES UN USUARIO MOCKEADO
      const mockedUser = getMockedUserByDocument(credentials.documentoIdentidad);

      if (mockedUser) {
        console.log("🎭 Using mocked user for:", credentials.documentoIdentidad);

        await new Promise(resolve => setTimeout(resolve, 1000));

        await saveAuthData(mockedUser.loginResponse, mockedUser.user);
        setUser(mockedUser.user);

        console.log("✅ Mocked login successful:", mockedUser.user.fullName, "as", mockedUser.user.userType);
        return true;
      }

      console.log("🌐 Using real API for:", credentials.documentoIdentidad);

      const loginRequest: LoginRequest = {
        documentoIdentidad: credentials.documentoIdentidad,
        password: credentials.password,
      };

      const loginResponse = await apiService.login(loginRequest);

      const tokenData = apiService.decodeJWT(loginResponse.accessToken);
      if (!tokenData) {
        throw new Error("Invalid token received");
      }

      const roleData = await apiService.getRole(tokenData.rolId);

      const backendUser: BackendUser = {
        id: tokenData.sub,
        correo: tokenData.correo,
        nombreCompleto: tokenData.nombreCompleto,
        documentoIdentidad: credentials.documentoIdentidad,
        rolId: tokenData.rolId,
        rolNombre: roleData.nombre,
      };

      const userData = createBaseUserFromBackend(backendUser, roleData);

      await saveAuthData(loginResponse, userData);
      setUser(userData);

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterForm): Promise<boolean> => {
    try {
      setIsLoading(true);

      console.log("Registering user:", data);

      return true;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const registerPlayer = async (
    data: PlayerRegistrationForm,
    stats: Record<string, number>,
    profileImage?: string
  ): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      setIsLoading(true);

      console.log("🎯 Registering player:", data.nickname);

      const result = await playerService.createPlayerWithValidation(
        data,
        stats,
        profileImage
      );

      if (result.success && result.data) {
        const userData = convertPlayerResponseToUser(result.data);

        await AsyncStorage.setItem("@tung_registered_user", JSON.stringify(userData));

        console.log("✅ Player registered successfully:", userData);

        return {
          success: true,
          message: "Jugador registrado exitosamente",
          data: userData,
        };
      } else {
        return {
          success: false,
          message: result.message || "Error al registrar el jugador",
        };
      }

    } catch (error) {
      console.error("❌ Player registration error:", error);

      let errorMessage = "Error al registrar el jugador";

      if (error instanceof Error) {
        if (error.message.includes("400")) {
          errorMessage = "Los datos proporcionados no son válidos";
        } else if (error.message.includes("409")) {
          errorMessage = "Ya existe un usuario con este correo o documento";
        } else if (error.message.includes("500")) {
          errorMessage = "Error del servidor. Intenta más tarde";
        } else if (error.message.includes("Network")) {
          errorMessage = "Error de conexión. Verifica tu internet";
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      const accessToken = await AsyncStorage.getItem("@tung_access_token");

      if (accessToken && !accessToken.startsWith("mock-")) {
        try {
          await apiService.logout();
        } catch (error) {
        }
      }

      await clearAuthData();

      await AsyncStorage.removeItem("@tung_registered_user");

    } catch (error) {
      // console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (user) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        await AsyncStorage.setItem("@tung_user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Update user error:", error);
    }
  };

  const refreshUserData = async () => {
    try {
      if (user) {
        const accessToken = await AsyncStorage.getItem("@tung_access_token");
        if (accessToken && accessToken.startsWith("mock-")) {
          console.log("🎭 Skipping refresh for mocked user");
          return;
        }

        const roleData = await apiService.getRole(user.rolId);
        const backendUser: BackendUser = {
          id: user.id,
          correo: user.email,
          nombreCompleto: user.fullName,
          documentoIdentidad: user.documentoIdentidad,
          rolId: user.rolId,
          rolNombre: roleData.nombre,
        };
        const updatedUser = createBaseUserFromBackend(backendUser, roleData);
        setUser(updatedUser);
        await AsyncStorage.setItem("@tung_user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Refresh user data error:", error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    registerPlayer,
    logout,
    updateUser,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};