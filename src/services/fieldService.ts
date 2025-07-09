
import {
  CreateFieldRequest,
  UpdateFieldRequest,
  FieldResponseFromAPI,
  FieldForFrontend,
  CreateFieldForm,
  UpdateFieldForm,
  FieldServiceResponse,
  FIELD_TYPE_MAP,
  FIELD_TYPE_REVERSE_MAP,
  getFieldCapacity,
  getFieldDisplayName,
  FieldTypeFrontend,
  FieldTypeBackend
} from '../types/fieldTypes';

const API_BASE_URL = process.env.API_BASE_URL || "https://back.tungdeportes.com/api";

class FieldService {

  async createField(
    fieldForm: CreateFieldForm,
    ownerId: string
  ): Promise<FieldServiceResponse<FieldForFrontend>> {
    try {
      console.log("🏗️ Creating field:", fieldForm);

      const backendType = FIELD_TYPE_MAP[fieldForm.type];

      const createRequest: CreateFieldRequest = {
        tipo: backendType,
        valorHora: fieldForm.pricePerHour,
        duenioId: ownerId
      };

      console.log("📤 Request payload:", createRequest);

      const response = await fetch(`${API_BASE_URL}/canchas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createRequest),
      });

      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Create field error:", errorText);

        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const fieldData: FieldResponseFromAPI = await response.json();
      console.log("✅ Field created successfully:", fieldData);

      const frontendField = this.mapBackendToFrontend(fieldData, fieldForm.name);

      return {
        success: true,
        message: "Cancha creada exitosamente",
        data: frontendField,
      };

    } catch (error) {
      console.error("❌ Error creating field:", error);

      let errorMessage = "Error al crear la cancha";

      if (error instanceof Error) {
        if (error.message.includes("400")) {
          errorMessage = "Los datos proporcionados no son válidos";
        } else if (error.message.includes("409")) {
          errorMessage = "Ya existe una cancha con estos datos";
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

  async updateField(
    fieldId: string,
    fieldForm: UpdateFieldForm,
    ownerId: string
  ): Promise<FieldServiceResponse<FieldForFrontend>> {
    try {
      console.log("📝 Updating field:", fieldId, fieldForm);

      const backendType = FIELD_TYPE_MAP[fieldForm.type];

      const updateRequest: UpdateFieldRequest = {
        tipo: backendType,
        valorHora: fieldForm.pricePerHour,
        duenioId: ownerId
      };

      console.log("📤 Update request payload:", updateRequest);

      const response = await fetch(`${API_BASE_URL}/canchas/${fieldId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateRequest),
      });

      console.log("📥 Update response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Update field error:", errorText);

        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const fieldData: FieldResponseFromAPI = await response.json();
      console.log("✅ Field updated successfully:", fieldData);

      const frontendField = this.mapBackendToFrontend(fieldData, fieldForm.name);

      return {
        success: true,
        message: "Cancha actualizada exitosamente",
        data: frontendField,
      };

    } catch (error) {
      console.error("❌ Error updating field:", error);

      let errorMessage = "Error al actualizar la cancha";

      if (error instanceof Error) {
        if (error.message.includes("404")) {
          errorMessage = "Cancha no encontrada";
        } else if (error.message.includes("400")) {
          errorMessage = "Los datos proporcionados no son válidos";
        } else if (error.message.includes("500")) {
          errorMessage = "Error del servidor. Intenta más tarde";
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

  async getOwnerFields(ownerId: string): Promise<FieldServiceResponse<FieldForFrontend[]>> {
    try {
      console.log("📋 Getting fields for owner:", ownerId);

      const response = await fetch(`${API_BASE_URL}/canchas/duenio/${ownerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("📥 Get fields response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Get fields error:", errorText);

        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const fieldsData: FieldResponseFromAPI[] = await response.json();
      console.log("✅ Fields retrieved successfully:", fieldsData.length, "fields");

      const frontendFields: FieldForFrontend[] = fieldsData.map(field =>
        this.mapBackendToFrontend(field)
      );

      return {
        success: true,
        message: "Canchas obtenidas exitosamente",
        data: frontendFields,
      };

    } catch (error) {
      console.error("❌ Error getting fields:", error);

      let errorMessage = "Error al cargar las canchas";

      if (error instanceof Error) {
        if (error.message.includes("404")) {
          errorMessage = "No se encontraron canchas";
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
        data: [],
      };
    }
  }

  async deleteField(fieldId: string): Promise<FieldServiceResponse<boolean>> {
    try {
      console.log("🗑️ Deleting field:", fieldId);

      const response = await fetch(`${API_BASE_URL}/canchas/${fieldId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("📥 Delete response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Delete field error:", errorText);

        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      console.log("✅ Field deleted successfully");

      return {
        success: true,
        message: "Cancha eliminada exitosamente",
        data: true,
      };

    } catch (error) {
      console.error("❌ Error deleting field:", error);

      let errorMessage = "Error al eliminar la cancha";

      if (error instanceof Error) {
        if (error.message.includes("404")) {
          errorMessage = "Cancha no encontrada";
        } else if (error.message.includes("500")) {
          errorMessage = "Error del servidor. Intenta más tarde";
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        message: errorMessage,
        data: false,
      };
    }
  }

  private mapBackendToFrontend(
    backendField: FieldResponseFromAPI,
    customName?: string
  ): FieldForFrontend {

    const frontendType = FIELD_TYPE_REVERSE_MAP[backendField.tipo];

    return {
      id: backendField.id,
      name: customName || this.generateFieldName(frontendType, backendField.id),
      type: frontendType,
      capacity: getFieldCapacity(frontendType),
      pricePerHour: backendField.valorHora,
      hasLighting: false,
      isIndoor: false,
      amenities: [],
      images: backendField.duenio?.fotosEstablecimiento || [],
      isActive: true,
      rating: backendField.calificacion,
      backendType: backendField.tipo,
      ownerId: backendField.duenio?.id || '',
      ownerInfo: backendField.duenio ? {
        businessName: backendField.duenio.razonSocial,
        address: backendField.duenio.direccion,
        openTime: backendField.duenio.horaApertura,
        closeTime: backendField.duenio.horaCierre,
      } : undefined,
    };
  }

  private generateFieldName(type: FieldTypeFrontend, id: string): string {
    const displayName = getFieldDisplayName(type);
    const shortId = id.slice(-4).toUpperCase();
    return `${displayName} ${shortId}`;
  }

  validateFieldForm(form: CreateFieldForm | UpdateFieldForm): FieldServiceResponse<boolean> {
    const errors: string[] = [];

    if (!form.type || !Object.keys(FIELD_TYPE_MAP).includes(form.type)) {
      errors.push("Tipo de cancha inválido");
    }

    if (!form.pricePerHour || form.pricePerHour <= 0) {
      errors.push("El precio por hora debe ser mayor a 0");
    }

    if (form.pricePerHour && form.pricePerHour > 1000000) {
      errors.push("El precio por hora no puede exceder $1,000,000");
    }

    return {
      success: errors.length === 0,
      message: errors.length === 0 ? "Formulario válido" : "Errores en el formulario",
      errors,
      data: errors.length === 0,
    };
  }
}

export const fieldService = new FieldService();
export default fieldService;