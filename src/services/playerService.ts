import {
  CreatePlayerRequest,
  CreatePlayerResponse,
  GetRolesResponse,
  PLAYER_ROLE_ID,
  GENDER_MAP,
  POSITION_MAP,
  FrontendGender,
  FrontendPosition,
  ValidationResult,
  PlayerServiceResponse,
} from "../types/playerTypes";
import { PlayerRegistrationForm } from "../types";

const API_BASE_URL = process.env.API_BASE_URL || "https://back.tungdeportes.com/api";

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

class PlayerService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders: { [key: string]: string } = {
      "Content-Type": "application/json",
      ...(options.headers as { [key: string]: string }),
    };

    console.log("🌐 Making request to:", url);
    console.log("📤 Request body:", options.body);

    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders,
    });

    console.log("📥 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ HTTP Error:", response.status, errorText);

      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("✅ Response received successfully");
    return data;
  }

  async createPlayer(playerData: CreatePlayerRequest): Promise<CreatePlayerResponse> {
    console.log("🎯 Creating player...");
    console.log("📋 Player data:", JSON.stringify(playerData, null, 2));

    return this.makeRequest<CreatePlayerResponse>("/jugadores/usuario-jugador", {
      method: "POST",
      body: JSON.stringify(playerData),
    });
  }

  async getRoles(): Promise<GetRolesResponse[]> {
    console.log("👥 Getting all roles...");
    return this.makeRequest<GetRolesResponse[]>("/roles/todos");
  }

  async getRoleById(roleId: string): Promise<GetRolesResponse> {
    console.log("👥 Getting role by ID:", roleId);
    return this.makeRequest<GetRolesResponse>(`/roles/${roleId}`);
  }

  async uploadImage(imageUri: string): Promise<string | null> {
    try {
      console.log("📸 Uploading image to backend...");

      const formData = new FormData();


      const imageFile = {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile-image.jpg',
      } as any;

      formData.append('foto', imageFile);

      const response = await fetch(`${API_BASE_URL}/fotos/upload/single`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("📸 Image upload response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Image upload error:", errorText);
        throw new Error(`Failed to upload image: ${response.status}`);
      }

      const data: ImageUploadResponse = await response.json();
      console.log("✅ Image uploaded successfully:", data);

      if (data.success && data.urls && data.urls.length > 0) {
        return data.urls[0];
      }

      throw new Error("No image URL returned from server");

    } catch (error) {
      console.error("❌ Error uploading image:", error);
      return null;
    }
  }


  async verifyEmail(verificationCode: string): Promise<EmailVerificationResponse> {
    console.log("📧 Verifying email with code:", verificationCode);

    return this.makeRequest<EmailVerificationResponse>("/auth/verification/verify-email", {
      method: "POST",
      body: JSON.stringify({ verificationCode }),
    });
  }

  mapFormDataToBackend(
    formData: PlayerRegistrationForm,
    stats: Record<string, number>,
    profileImageUrl?: string
  ): CreatePlayerRequest {
    console.log("🔄 Mapping form data to backend format...");

    const birthDate = new Date(formData.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    const formatDate = (date: Date): string => {
      return date.toISOString().split('T')[0];
    };


    const gender = GENDER_MAP[formData.gender as FrontendGender];
    const position = POSITION_MAP[formData.position as FrontendPosition];

    const jugadorBase = {
      posicion: position,
      ranking: 50.0,
      membresia: false,
      nickName: formData.nickname,
    };

    const createPlayerRequest: CreatePlayerRequest = {
      usuario: {
        nombreCompleto: `${formData.firstName} ${formData.lastName}`,
        correo: formData.email,
        documentoIdentidad: formData.documentNumber,
        contraseña: formData.password,
        edad: age,
        genero: gender,
        verificacionEdad: age >= 18,
        fechaNacimiento: formatDate(birthDate),
        profilePicture: profileImageUrl,
        estado: false,
        rolId: PLAYER_ROLE_ID,
      },
      jugador: {
        ...jugadorBase,
        estirada: undefined,
        paradas: undefined,
        reflejos: undefined,
        velocidad: undefined,
        saque: undefined,
        posicionamiento: undefined,
        ritmo: undefined,
        tiro: undefined,
        pase: undefined,
        regates: undefined,
        defensa: undefined,
        fisico: undefined,
      },
    };

    if (formData.position === 'goalkeeper') {
      createPlayerRequest.jugador.estirada = stats.reach || 30;
      createPlayerRequest.jugador.paradas = stats.saves || 30;
      createPlayerRequest.jugador.reflejos = stats.reflexes || 30;
      createPlayerRequest.jugador.velocidad = stats.speed || 30;
      createPlayerRequest.jugador.saque = stats.throw || 30;
      createPlayerRequest.jugador.posicionamiento = stats.positioning || 30;
    } else {
      createPlayerRequest.jugador.ritmo = stats.pace || 30;
      createPlayerRequest.jugador.tiro = stats.shooting || 30;
      createPlayerRequest.jugador.pase = stats.passing || 30;
      createPlayerRequest.jugador.regates = stats.dribbling || 30;
      createPlayerRequest.jugador.defensa = stats.defending || 30;
      createPlayerRequest.jugador.fisico = stats.physical || 30;
    }

    const cleanedJugador = Object.fromEntries(
      Object.entries(createPlayerRequest.jugador).filter(([_, value]) => value !== undefined)
    );

    createPlayerRequest.jugador = cleanedJugador as any;

    console.log("✅ Form data mapped successfully");
    console.log("🎯 Final player object:", JSON.stringify(createPlayerRequest, null, 2));

    return createPlayerRequest;
  }

  validatePlayerData(formData: PlayerRegistrationForm): ValidationResult {
    console.log("🔍 Validating player data...");

    const errors: string[] = [];

    if (!formData.firstName?.trim()) {
      errors.push("El nombre es requerido");
    }
    if (!formData.lastName?.trim()) {
      errors.push("El apellido es requerido");
    }
    if (!formData.email?.trim()) {
      errors.push("El email es requerido");
    }
    if (!formData.password?.trim()) {
      errors.push("La contraseña es requerida");
    }
    if (!formData.documentNumber?.trim()) {
      errors.push("El número de documento es requerido");
    }
    if (!formData.phone?.trim()) {
      errors.push("El teléfono es requerido");
    }
    if (!formData.nickname?.trim()) {
      errors.push("El nickname es requerido");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push("El email no tiene un formato válido");
    }

    if (formData.password && formData.password.length < 6) {
      errors.push("La contraseña debe tener al menos 6 caracteres");
    }

    if (formData.password !== formData.confirmPassword) {
      errors.push("Las contraseñas no coinciden");
    }

    if (formData.documentNumber && formData.documentNumber.length < 7) {
      errors.push("El número de documento debe tener al menos 7 dígitos");
    }

    const phoneRegex = /^3[0-9]{9}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      errors.push("El teléfono debe tener el formato: 3001234567");
    }

    if (formData.birthDate) {
      const today = new Date();
      const birth = new Date(formData.birthDate);
      const age = today.getFullYear() - birth.getFullYear();

      if (age < 13) {
        errors.push("Debe ser mayor de 13 años para registrarse");
      }

      if (age > 100) {
        errors.push("La fecha de nacimiento no es válida");
      }
    }

    if (formData.height && (formData.height < 140 || formData.height > 220)) {
      errors.push("La altura debe estar entre 140 y 220 cm");
    }

    if (formData.weight && (formData.weight < 40 || formData.weight > 150)) {
      errors.push("El peso debe estar entre 40 y 150 kg");
    }

    const isValid = errors.length === 0;

    if (isValid) {
      console.log("✅ Player data validation passed");
    } else {
      console.log("❌ Player data validation failed:", errors);
    }

    return {
      isValid,
      errors
    };
  }

  async createPlayerWithValidation(
    formData: PlayerRegistrationForm,
    stats: Record<string, number>,
    profileImage?: string
  ): Promise<PlayerServiceResponse<CreatePlayerResponse>> {
    try {
      console.log("🚀 Starting player creation process...");

      const validation = this.validatePlayerData(formData);
      if (!validation.isValid) {
        return {
          success: false,
          message: "Datos inválidos",
          errors: validation.errors,
        };
      }

      // Subir imagen si existe
      let uploadedImageUrl: string | undefined;
      if (profileImage) {
        console.log("📸 Uploading profile image...");
        uploadedImageUrl = await this.uploadImage(profileImage) || undefined;

        if (!uploadedImageUrl) {
          console.log("⚠️ Image upload failed, continuing without image");
        } else {
          console.log("✅ Image uploaded successfully:", uploadedImageUrl);
        }
      }

      const backendData = this.mapFormDataToBackend(formData, stats, uploadedImageUrl);

      console.log("🎯 Creating player in backend...");
      const response = await this.createPlayer(backendData);

      console.log("✅ Player created successfully!");
      console.log("📧 Verification email should be sent to:", formData.email);

      return {
        success: true,
        message: "Jugador creado exitosamente. Revisa tu email para verificar tu cuenta.",
        data: response,
      };

    } catch (error) {
      console.error("❌ Error creating player:", error);

      let errorMessage = "Error al crear el jugador";

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
    }
  }

  async verifyPlayerEmail(verificationCode: string): Promise<PlayerServiceResponse<EmailVerificationResponse>> {
    try {
      console.log("📧 Starting email verification...");

      const response = await this.verifyEmail(verificationCode);

      if (response.verified) {
        return {
          success: true,
          message: "Email verificado exitosamente. ¡Ya puedes iniciar sesión!",
          data: response,
        };
      } else {
        return {
          success: false,
          message: "Código de verificación inválido",
        };
      }

    } catch (error) {
      console.error("❌ Error verifying email:", error);

      let errorMessage = "Error al verificar el email";

      if (error instanceof Error) {
        if (error.message.includes("400")) {
          errorMessage = "Código de verificación inválido";
        } else if (error.message.includes("404")) {
          errorMessage = "Código no encontrado o expirado";
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  }
}

export const playerService = new PlayerService();
export type {
  CreatePlayerRequest,
  CreatePlayerResponse,
  GetRolesResponse,
  ImageUploadResponse,
  EmailVerificationRequest,
  EmailVerificationResponse
};