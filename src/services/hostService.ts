import {
  CreateHostRequest,
  CreateHostResponse,
  ExtendedHostRegistrationForm,
  HOST_ROLE_ID,
  HOST_GENDER_MAP,
  HostFrontendGender,
  HostValidationResult,
  HostServiceResponse,
  MultipleImageUploadResponse,
  SingleImageUploadResponse,
  HostEmailVerificationResponse,
} from "../types/hostTypes";

const API_BASE_URL = process.env.API_BASE_URL || "https://back.tungdeportes.com/api";

class HostService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders: { [key: string]: string } = {
      "Content-Type": "application/json",
      ...(options.headers as { [key: string]: string }),
    };

    console.log("🌐 Making HOST request to:", url);
    console.log("📤 Request method:", options.method || 'GET');
    console.log("📤 Request headers:", defaultHeaders);

    if (options.body && typeof options.body === 'string') {
      console.log("📤 Request body COMPLETE:", options.body);
      try {
        const bodyObj = JSON.parse(options.body);
        console.log("📤 Parsed body structure:");
        console.log("👤 Usuario:", JSON.stringify(bodyObj.usuario, null, 2));
        console.log("🏢 DuenioCancha:", JSON.stringify(bodyObj.duenioCancha, null, 2));
      } catch (e) {
        console.log("📤 Could not parse body as JSON");
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: defaultHeaders,
        timeout: 30000,
      });

      console.log("📥 HOST Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ HOST HTTP Error Details:", {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText,
          url: url
        });

        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error("📋 HOST Parsed error data:", errorData);
        } catch (parseError) {
          console.error("⚠️ HOST Could not parse error response as JSON");
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("✅ HOST Response received successfully");
      return data;
    } catch (error) {
      console.error("💥 HOST Network/Request Error:", error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Error de conexión: Verifica tu internet y que el servidor esté disponible');
      }
      throw error;
    }
  }

  private getMimeType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase() || '';

    const mimeTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'bmp': 'image/bmp',
      'svg': 'image/svg+xml',

      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'txt': 'text/plain',
    };

    return mimeTypes[extension] || 'application/octet-stream';
  }

  async uploadSingleImage(imageUri: string): Promise<string | null> {
    try {
      console.log("📸 HOST Uploading single image...");
      console.log("📸 HOST Image URI:", imageUri);

      if (!imageUri || !imageUri.trim()) {
        console.error("❌ HOST No image URI provided");
        return null;
      }

      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'host-file.jpg';
      const mimeType = this.getMimeType(filename);

      console.log("📄 HOST File details:", {
        filename,
        mimeType,
        uri: imageUri
      });

      const fileObject = {
        uri: imageUri,
        type: mimeType,
        name: filename,
      } as any;

      formData.append('foto', fileObject);

      console.log("📸 HOST Making single image upload request...");

      const response = await fetch(`${API_BASE_URL}/fotos/upload/single`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        timeout: 60000,
      });

      console.log("📸 HOST Single image upload response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ HOST Single image upload error:", errorText);
        throw new Error(`Failed to upload single image: ${response.status} - ${errorText}`);
      }

      const data: SingleImageUploadResponse = await response.json();
      console.log("📸 HOST Single image upload response:", data);

      if (data.success && data.urls && data.urls.length > 0) {
        console.log("✅ HOST Single image uploaded successfully:", data.urls[0]);
        return data.urls[0];
      } else {
        console.error("❌ HOST Single image upload response indicates failure:", data);
        throw new Error(data.message || "No image URL returned from server");
      }

    } catch (error) {
      console.error("💥 HOST Error uploading single image:", error);
      return null;
    }
  }

  async uploadMultipleImages(imageUris: string[]): Promise<string[]> {
    try {
      console.log("📸 HOST Uploading multiple images using single upload method...");
      console.log("📸 HOST Image URIs count:", imageUris.length);

      if (!imageUris || imageUris.length === 0) {
        console.log("⚠️ HOST No images to upload");
        return [];
      }

      const uploadedUrls: string[] = [];

      for (let i = 0; i < imageUris.length; i++) {
        const uri = imageUris[i];
        console.log(`📸 HOST Uploading image ${i + 1}/${imageUris.length}:`, uri);

        try {
          const uploadedUrl = await this.uploadSingleImage(uri);
          if (uploadedUrl) {
            uploadedUrls.push(uploadedUrl);
            console.log(`✅ HOST Image ${i + 1} uploaded successfully:`, uploadedUrl);
          } else {
            console.error(`❌ HOST Failed to upload image ${i + 1}`);
          }
        } catch (imageError) {
          console.error(`💥 HOST Error uploading image ${i + 1}:`, imageError);
        }
      }

      console.log(`📸 HOST Multiple images upload completed: ${uploadedUrls.length}/${imageUris.length} successful`);
      console.log("📸 HOST All uploaded URLs:", uploadedUrls);
      return uploadedUrls;

    } catch (error) {
      console.error("💥 HOST Error uploading multiple images:", error);
      return [];
    }
  }

  async createHost(hostData: CreateHostRequest): Promise<CreateHostResponse> {
    console.log("🎯 HOST Creating host...");
    console.log("📋 HOST Host data:", JSON.stringify(hostData, null, 2));

    return this.makeRequest<CreateHostResponse>("/duenios/usuario-duenio", {
      method: "POST",
      body: JSON.stringify(hostData),
    });
  }

  async verifyEmail(verificationCode: string): Promise<HostEmailVerificationResponse> {
    console.log("📧 HOST Verifying email with code:", verificationCode);

    return this.makeRequest<HostEmailVerificationResponse>("/auth/verification/verify-email", {
      method: "POST",
      body: JSON.stringify({ verificationCode }),
    });
  }

  mapFormDataToBackend(
    formData: ExtendedHostRegistrationForm,
    location: { latitude: number; longitude: number },
    uploadedFiles: {
      profilePicture?: string;
      rut?: string;
      camaraComercio?: string;
      certificacionBancaria?: string;
      cedulaRepresentanteLegal?: string;
      fotosEstablecimiento: string[];
    }
  ): CreateHostRequest {
    console.log("🔄 HOST ===== INICIANDO MAPEO DE DATOS =====");
    console.log("📥 HOST Frontend data INPUT:", {
      businessName: formData.businessName,
      adminName: formData.adminName,
      adminEmail: formData.adminEmail?.trim(),
      nit: formData.nit,
      razonSocial: formData.razonSocial,
      address: formData.address,
      adminPhone: formData.adminPhone,
      businessPhone: formData.businessPhone,
      businessEmail: formData.businessEmail,
      billingEmail: formData.billingEmail,
      hasLocation: !!(location?.latitude && location?.longitude),
      location: location,
      uploadedFilesCount: Object.values(uploadedFiles).filter(Boolean).length,
      fotosEstablecimientoCount: uploadedFiles.fotosEstablecimiento.length,
    });

    console.log("📸 HOST Fotos del establecimiento recibidas:", uploadedFiles.fotosEstablecimiento);
    console.log("📄 HOST Documentos subidos:", {
      rut: uploadedFiles.rut,
      camaraComercio: uploadedFiles.camaraComercio,
      certificacionBancaria: uploadedFiles.certificacionBancaria,
      cedulaRepresentanteLegal: uploadedFiles.cedulaRepresentanteLegal,
    });

    const cleanAdminEmail = formData.adminEmail?.trim();
    const cleanAdminName = formData.adminName?.trim();
    const cleanBusinessName = formData.businessName?.trim();
    const cleanNit = formData.nit?.trim();
    const cleanAdminPassword = formData.adminPassword?.trim();
    const cleanAdminDocumentNumber = formData.adminDocumentNumber?.trim();
    const cleanRazonSocial = formData.razonSocial?.trim();
    const cleanAddress = formData.address?.trim();
    const cleanAdminPhone = formData.adminPhone?.trim();
    const cleanBusinessPhone = formData.businessPhone?.trim();
    const cleanBusinessEmail = formData.businessEmail?.trim();
    const cleanBillingEmail = formData.billingEmail?.trim();

    if (!cleanAdminEmail) throw new Error("Email del administrador es requerido");
    if (!cleanAdminName) throw new Error("Nombre del administrador es requerido");
    if (!cleanNit) throw new Error("NIT es requerido");
    if (!cleanRazonSocial) throw new Error("Razón social es requerida");
    if (!cleanAddress) throw new Error("Dirección es requerida");
    if (!cleanAdminPhone) throw new Error("Teléfono del administrador es requerido");
    if (!location?.latitude || !location?.longitude) throw new Error("Coordenadas son requeridas");

    const birthDate = new Date(formData.adminBirthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    const formatDate = (date: Date): string => {
      return date.toISOString().split('T')[0];
    };

    const formattedDate = formatDate(birthDate);
    console.log("📅 HOST Formatted date:", formattedDate);
    console.log("📊 HOST Calculated age:", age);

    const gender = HOST_GENDER_MAP[formData.adminGender as HostFrontendGender];
    console.log("🔀 HOST Gender mapping:", formData.adminGender, "→", gender);

    const createHostRequest: CreateHostRequest = {
      usuario: {
        nombreCompleto: cleanAdminName,
        correo: cleanAdminEmail,
        documentoIdentidad: cleanAdminDocumentNumber,
        contraseña: cleanAdminPassword,
        edad: age,
        genero: gender,
        verificacionEdad: age >= 18,
        fechaNacimiento: formattedDate,
        profilePicture: uploadedFiles.profilePicture || undefined,
        estado: true,
        rolId: HOST_ROLE_ID,
      },
      duenioCancha: {
        usuarioId: "00000000-0000-0000-0000-000000000000",
        nit: cleanNit,
        correoElectronicoEmpresarial: cleanBusinessEmail || cleanAdminEmail,
        correoElectronicoFacturacion: cleanBillingEmail || cleanAdminEmail,
        razonSocial: cleanRazonSocial,
        telefonoContacto: cleanAdminPhone,
        telefonoEstablecimiento: cleanBusinessPhone || cleanAdminPhone,
        direccion: cleanAddress,
        coordenadaX: location.latitude,
        coordenadaY: location.longitude,
        rut: uploadedFiles.rut || undefined,
        camaraComercio: uploadedFiles.camaraComercio || undefined,
        certificacionBancaria: uploadedFiles.certificacionBancaria || undefined,
        cedulaRepresentanteLegal: uploadedFiles.cedulaRepresentanteLegal || undefined,
        horaApertura: formData.openTime || "06:00",
        horaCierre: formData.closeTime || "23:00",
        duenioVerificado: true,
        fotosEstablecimiento: uploadedFiles.fotosEstablecimiento || [],
      },
    };

    console.log("🔄 HOST ===== MAPEO COMPLETADO =====");
    console.log("📤 HOST Backend data OUTPUT:");
    console.log("👤 HOST Usuario:", JSON.stringify(createHostRequest.usuario, null, 2));
    console.log("🏢 HOST DuenioCancha:", JSON.stringify(createHostRequest.duenioCancha, null, 2));

    console.log("🔍 HOST VERIFICACIÓN FINAL DETALLADA:");
    console.log("📧 HOST Correos:", {
      adminEmail: createHostRequest.usuario.correo,
      businessEmail: createHostRequest.duenioCancha.correoElectronicoEmpresarial,
      billingEmail: createHostRequest.duenioCancha.correoElectronicoFacturacion,
    });
    console.log("🏢 HOST Datos empresa:", {
      nit: createHostRequest.duenioCancha.nit,
      razonSocial: createHostRequest.duenioCancha.razonSocial,
      direccion: createHostRequest.duenioCancha.direccion,
    });
    console.log("📞 HOST Teléfonos:", {
      contacto: createHostRequest.duenioCancha.telefonoContacto,
      establecimiento: createHostRequest.duenioCancha.telefonoEstablecimiento,
    });
    console.log("🌍 HOST Coordenadas:", {
      latitude: createHostRequest.duenioCancha.coordenadaX,
      longitude: createHostRequest.duenioCancha.coordenadaY,
    });
    console.log("📄 HOST Documentos:", {
      rut: !!createHostRequest.duenioCancha.rut,
      camaraComercio: !!createHostRequest.duenioCancha.camaraComercio,
      certificacionBancaria: !!createHostRequest.duenioCancha.certificacionBancaria,
      cedulaRepresentanteLegal: !!createHostRequest.duenioCancha.cedulaRepresentanteLegal,
    });
    console.log("📸 HOST Fotos en el objeto final:", createHostRequest.duenioCancha.fotosEstablecimiento);
    console.log("📸 HOST Cantidad de fotos:", createHostRequest.duenioCancha.fotosEstablecimiento?.length || 0);

    return createHostRequest;
  }

  validateHostData(formData: ExtendedHostRegistrationForm): HostValidationResult {
    console.log("🔍 HOST ===== INICIANDO VALIDACIÓN DE DATOS =====");

    const errors: string[] = [];

    const cleanedFormData = {
      ...formData,
      businessName: formData.businessName?.trim(),
      adminName: formData.adminName?.trim(),
      adminEmail: formData.adminEmail?.trim(),
      adminPassword: formData.adminPassword?.trim(),
      adminConfirmPassword: formData.adminConfirmPassword?.trim(),
      adminPhone: formData.adminPhone?.trim(),
      adminDocumentNumber: formData.adminDocumentNumber?.trim(),
      nit: formData.nit?.trim(),
      address: formData.address?.trim(),
      razonSocial: formData.razonSocial?.trim(),
    };

    if (!cleanedFormData.businessName) {
      errors.push("El nombre del negocio es requerido");
    }
    if (!cleanedFormData.adminName) {
      errors.push("El nombre del administrador es requerido");
    }
    if (!cleanedFormData.adminEmail) {
      errors.push("El email del administrador es requerido");
    }
    if (!cleanedFormData.adminPassword) {
      errors.push("La contraseña es requerida");
    }
    if (!cleanedFormData.adminDocumentNumber) {
      errors.push("El número de documento del administrador es requerido");
    }
    if (!cleanedFormData.adminPhone) {
      errors.push("El teléfono del administrador es requerido");
    }
    if (!cleanedFormData.nit) {
      errors.push("El NIT del establecimiento es requerido");
    }
    if (!cleanedFormData.address) {
      errors.push("La dirección es requerida");
    }
    if (!cleanedFormData.razonSocial) {
      errors.push("La razón social es requerida");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (cleanedFormData.adminEmail && !emailRegex.test(cleanedFormData.adminEmail)) {
      console.error("❌ HOST Email validation failed:", {
        email: `"${cleanedFormData.adminEmail}"`,
        regexTest: emailRegex.test(cleanedFormData.adminEmail),
      });
      errors.push("El email no tiene un formato válido");
    }

    
    if (cleanedFormData.adminPassword && cleanedFormData.adminPassword.length < 6) {
      errors.push("La contraseña debe tener al menos 6 caracteres");
    }

    if (cleanedFormData.adminPassword !== cleanedFormData.adminConfirmPassword) {
      errors.push("Las contraseñas no coinciden");
    }

    const phoneRegex = /^3[0-9]{9}$/;
    if (cleanedFormData.adminPhone && !phoneRegex.test(cleanedFormData.adminPhone)) {
      errors.push("El teléfono debe tener el formato: 3001234567");
    }

    if (cleanedFormData.adminDocumentNumber && cleanedFormData.adminDocumentNumber.length < 7) {
      errors.push("El número de documento debe tener al menos 7 dígitos");
    }

    if (cleanedFormData.nit && cleanedFormData.nit.length < 9) {
      errors.push("El NIT debe tener al menos 9 dígitos");
    }

    if (cleanedFormData.razonSocial && cleanedFormData.razonSocial.length < 3) {
      errors.push("La razón social debe tener al menos 3 caracteres");
    }

    if (formData.adminBirthDate) {
      const today = new Date();
      const birth = new Date(formData.adminBirthDate);
      const age = today.getFullYear() - birth.getFullYear();

      if (age < 18) {
        errors.push("El administrador debe ser mayor de edad");
      }

      if (age > 100) {
        errors.push("La fecha de nacimiento no es válida");
      }
    }

    const isValid = errors.length === 0;

    console.log("🔍 HOST ===== RESULTADO DE VALIDACIÓN =====");
    if (isValid) {
      console.log("✅ HOST Validación exitosa: Todos los datos son correctos");
    } else {
      console.log("❌ HOST Validación falló con errores:", errors);
    }

    return {
      isValid,
      errors
    };
  }

  async createHostWithValidation(
    formData: ExtendedHostRegistrationForm,
    location: { latitude: number; longitude: number },
    files: {
      profileImage?: string;
      documents: {
        rut?: string;
        camaraComercio?: string;
        certificacionBancaria?: string;
        cedulaRepresentanteLegal?: string;
      };
      businessImages: string[];
    }
  ): Promise<HostServiceResponse<CreateHostResponse>> {
    try {
      console.log("🚀 HOST ===== INICIANDO PROCESO DE CREACIÓN DE HOST =====");

      console.log("🔍 HOST Paso 1: Validando datos del formulario...");
      const validation = this.validateHostData(formData);
      if (!validation.isValid) {
        console.error("❌ HOST Validación falló:", validation.errors);
        return {
          success: false,
          message: "Datos inválidos: " + validation.errors.join(', '),
          errors: validation.errors,
        };
      }
      console.log("✅ HOST Paso 1 completado: Validación pasó correctamente");

      console.log("📸 HOST Paso 2: Subiendo archivos...");

      const uploadedFiles: {
        profilePicture?: string;
        rut?: string;
        camaraComercio?: string;
        certificacionBancaria?: string;
        cedulaRepresentanteLegal?: string;
        fotosEstablecimiento: string[];
      } = {
        fotosEstablecimiento: [], 
      };

      if (files.profileImage) {
        console.log("📸 HOST Subiendo foto de perfil...");
        const profilePictureUrl = await this.uploadSingleImage(files.profileImage);
        if (profilePictureUrl) {
          uploadedFiles.profilePicture = profilePictureUrl;
          console.log("✅ HOST Foto de perfil subida:", profilePictureUrl);
        }
      }

      const documentKeys = ['rut', 'camaraComercio', 'certificacionBancaria', 'cedulaRepresentanteLegal'] as const;

      for (const docKey of documentKeys) {
        if (files.documents[docKey]) {
          console.log(`📄 HOST Subiendo ${docKey}...`);
          const documentUrl = await this.uploadSingleImage(files.documents[docKey]!);
          if (documentUrl) {
            uploadedFiles[docKey] = documentUrl;
            console.log(`✅ HOST ${docKey} subido:`, documentUrl);
          }
        }
      }

      if (files.businessImages.length > 0) {
        console.log("📸 HOST Subiendo fotos del establecimiento usando método mejorado...");
        console.log("📸 HOST Cantidad de fotos a subir:", files.businessImages.length);

        const uploadedBusinessImages = await this.uploadMultipleImages(files.businessImages);


        uploadedFiles.fotosEstablecimiento = uploadedBusinessImages;

        console.log(`📸 HOST Fotos del establecimiento subidas: ${uploadedFiles.fotosEstablecimiento.length}/${files.businessImages.length}`);
        console.log("📸 HOST URLs de fotos subidas:", uploadedFiles.fotosEstablecimiento);
      }

      console.log("✅ HOST Paso 2 completado: Archivos subidos");
      console.log("📊 HOST Archivos subidos exitosamente:", {
        profilePicture: !!uploadedFiles.profilePicture,
        rut: !!uploadedFiles.rut,
        camaraComercio: !!uploadedFiles.camaraComercio,
        certificacionBancaria: !!uploadedFiles.certificacionBancaria,
        cedulaRepresentanteLegal: !!uploadedFiles.cedulaRepresentanteLegal,
        fotosEstablecimiento: uploadedFiles.fotosEstablecimiento.length,
        fotosEstablecimientoUrls: uploadedFiles.fotosEstablecimiento, 
      });

      console.log("🔄 HOST Paso 3: Mapeando datos para el backend...");
      const backendData = this.mapFormDataToBackend(formData, location, uploadedFiles);
      console.log("✅ HOST Paso 3 completado: Datos mapeados correctamente");

      console.log("🎯 HOST Paso 4: Enviando petición de creación al backend...");
      const response = await this.createHost(backendData);
      console.log("✅ HOST Paso 4 completado: Host created successfully!");

      console.log("📧 HOST Paso 5: Verificación de email debe ser enviada a:", formData.adminEmail);
      console.log("🎉 HOST ===== PROCESO COMPLETADO EXITOSAMENTE =====");

      return {
        success: true,
        message: "Anfitrión creado exitosamente. Revisa tu email para verificar tu cuenta.",
        data: response,
      };

    } catch (error) {
      console.error("💥 HOST ===== ERROR EN EL PROCESO DE CREACIÓN =====");
      console.error("💥 HOST Error details:", error);

      let errorMessage = "Error al crear el anfitrión";

      if (error instanceof Error) {
        const message = error.message.toLowerCase();

        if (message.includes("400") || message.includes("bad request")) {
          errorMessage = "Los datos proporcionados no son válidos. Verifica la información ingresada.";
        } else if (message.includes("409") || message.includes("conflict")) {
          errorMessage = "Ya existe un usuario con este correo o documento de identidad";
        } else if (message.includes("500") || message.includes("internal server")) {
          errorMessage = "Error del servidor. Por favor intenta más tarde.";
        } else if (message.includes("network") || message.includes("fetch")) {
          errorMessage = "Error de conexión. Verifica tu conexión a internet.";
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

  async verifyHostEmail(verificationCode: string): Promise<HostServiceResponse<HostEmailVerificationResponse>> {
    try {
      console.log("📧 HOST Starting email verification...");

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
      console.error("❌ HOST Error verifying email:", error);

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

export const hostService = new HostService();
export type {
  CreateHostRequest,
  CreateHostResponse,
  ExtendedHostRegistrationForm,
  MultipleImageUploadResponse,
  SingleImageUploadResponse,
  HostEmailVerificationResponse
};