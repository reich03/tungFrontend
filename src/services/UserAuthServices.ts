import AsyncStorage from "@react-native-async-storage/async-storage";
import { Base64 } from 'js-base64';
import {
  LoginRequest,
  LoginResponse,
  RoleResponse,
  UserTokenData,
} from "../types/userTypes";

const API_BASE_URL = process.env.API_BASE_URL || "https://back.tungdeportes.com/api";
console.log("API_BASE_URL:", API_BASE_URL);

class ApiService {
  private getAuthHeader = async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem("@tung_access_token");
      return token ? `Bearer ${token}` : null;
    } catch (error) {
      console.error("Error getting auth header:", error);
      return null;
    }
  };

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders: { [key: string]: string } = {
      "Content-Type": "application/json",
      ...(options.headers as { [key: string]: string }),
    };

    if (!endpoint.includes("/auth/login")) {
      const authHeader = await this.getAuthHeader();
      if (authHeader) {
        defaultHeaders.Authorization = authHeader;
      }
    }

    console.log("🌐 Making request to:", url);
    console.log("📤 Headers:", defaultHeaders);

    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders,
    });

    console.log("📥 Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ HTTP Error:", response.status, errorData);
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    console.log("✅ Response received successfully");
    return data;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log("🔐 Attempting login...");
    return this.makeRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async getRole(roleId: string): Promise<RoleResponse> {
    console.log("👥 Getting role for ID:", roleId);
    return this.makeRequest<RoleResponse>(`/roles/${roleId}`);
  }

  decodeJWT(token: string): UserTokenData | null {
    try {
      console.log("🔍 Decoding JWT token with js-base64...");
      
      
      const parts = token.split(".");
      if (parts.length !== 3) {
        console.error("❌ Token JWT inválido - no tiene 3 partes");
        return null;
      }

      const base64Url = parts[1];
      console.log("📋 Base64URL payload:", base64Url.substring(0, 50) + "...");
      
      const jsonPayload = Base64.decode(base64Url);
      console.log("📋 Decoded JSON string:", jsonPayload.substring(0, 100) + "...");
      
      const decoded = JSON.parse(jsonPayload);
      
      console.log("✅ JWT decoded successfully");
      console.log("👤 User info:", {
        sub: decoded.sub,
        correo: decoded.correo,
        nombreCompleto: decoded.nombreCompleto,
        rolId: decoded.rolId,
        exp: new Date(decoded.exp * 1000).toISOString()
      });
      
      return decoded;
    } catch (error) {
      console.error("❌ Error decoding JWT:", error);
      console.error("❌ Error details:", error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  async refreshToken(): Promise<LoginResponse> {
    const refreshToken = await AsyncStorage.getItem("@tung_refresh_token");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    console.log("🔄 Refreshing token...");
    return this.makeRequest<LoginResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout(): Promise<void> {
    console.log("👋 Logging out...");
    return this.makeRequest<void>("/auth/logout", {
      method: "POST",
    });
  }
}

export const apiService = new ApiService();
export type { LoginResponse, LoginRequest, RoleResponse, UserTokenData };