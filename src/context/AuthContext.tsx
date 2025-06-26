import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Player, Host, LoginForm, RegisterForm } from "../types";

type User = Player | Host;

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginForm) => Promise<boolean>;
  register: (data: RegisterForm) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
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
      const userData = await AsyncStorage.getItem("@tung_user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error loading user from storage:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserToStorage = async (userData: User) => {
    try {
      await AsyncStorage.setItem("@tung_user", JSON.stringify(userData));
    } catch (error) {
      console.error("Error saving user to storage:", error);
    }
  };

  const login = async (credentials: LoginForm): Promise<boolean> => {
    try {
      setIsLoading(true);
    const isHost = credentials.email.toLowerCase().includes("host");

      const mockUser: User = isHost
      ? {
          id: "2",
          email: credentials.email,
          fullName: "Carlos Canchas",
          phone: "+57 301 555 1111",
          userType: "host",
          isActive: true,
          createdAt: new Date().toISOString(),
          businessName: "Canchas Express",
          address: "Cra 15 #22-33",
          coordinates: { latitude: 4.1, longitude: -73.6 },
          description: "Canchas de fútbol sintético techadas",
          fields: [],
          rating: 4.5,
          totalReviews: 12,
          businessHours: {},
          contactInfo: {},
        }
      : {
          id: "1",
          email: credentials.email,
          fullName: "Juan Pérez",
          phone: "+57 300 123 4567",
          userType: "player",
          isActive: true,
          createdAt: new Date().toISOString(),
          position: "midfielder",
          stats: {
            pace: 75,
            shooting: 70,
            passing: 85,
            dribbling: 80,
            defending: 60,
            physical: 75,
          },
          preferredFoot: "right",
          experience: "intermediate",
          height: 175,
          weight: 70,
        };

      setUser(mockUser);
      await saveUserToStorage(mockUser);
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

  const logout = async () => {
    try {
      setIsLoading(true);
      await AsyncStorage.removeItem("@tung_user");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (user) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        await saveUserToStorage(updatedUser);
      }
    } catch (error) {
      console.error("Update user error:", error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
