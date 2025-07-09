import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Switch,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Colors, Gradients } from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";

const mockSettings = {
  general: {
    appName: "TUNG App",
    version: "1.0.0",
    environment: "production",
    maintenanceMode: false,
    allowRegistrations: true,
    emailVerificationRequired: true,
    defaultLanguage: "es",
    timezone: "America/Bogota",
  },
  payments: {
    commissionRate: 15.0,
    minimumPayout: 50000,
    currency: "COP",
    paymentMethods: ["PSE", "Credit Card", "Nequi", "Daviplata"],
    autoPayoutEnabled: true,
    payoutFrequency: "weekly",
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    systemAlerts: true,
    weeklyReports: true,
  },
  security: {
    twoFactorAuth: true,
    passwordExpiration: 90,
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    apiRateLimit: 1000,
    encryptionEnabled: true,
  },
  content: {
    maxEventsPerHost: 20,
    maxPlayersPerEvent: 22,
    eventCancellationWindow: 24,
    reviewWindow: 7,
    autoApproveHosts: false,
    moderateReviews: true,
  },
  integrations: {
    googleMapsEnabled: true,
    facebookLogin: true,
    googleLogin: true,
    appleLogin: true,
    whatsappSupport: true,
    analyticsEnabled: true,
  }
};

const AdminSettingsScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState(mockSettings);
  const [selectedTab, setSelectedTab] = useState<"general" | "payments" | "notifications" | "security" | "content" | "integrations">("general");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // Simular carga de API
      setTimeout(() => {
        setSettings(mockSettings);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error loading settings:", error);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSettings();
    setRefreshing(false);
  };

  const handleToggleSetting = (category: string, setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));

    Alert.alert(
      "Configuración actualizada",
      `${setting} ha sido ${value ? "activado" : "desactivado"}`,
      [{ text: "OK" }]
    );
  };

  const handleEditSetting = (field: string, currentValue: string | number) => {
    setEditingField(field);
    setEditingValue(currentValue.toString());
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editingField) return;

    Alert.alert(
      "Configuración actualizada",
      `${editingField} ha sido actualizado a: ${editingValue}`,
      [{ text: "OK" }]
    );

    setShowEditModal(false);
    setEditingField(null);
    setEditingValue("");
  };

  const handleSystemAction = (action: string) => {
    switch (action) {
      case "backup":
        Alert.alert(
          "Backup del sistema",
          "¿Deseas crear un backup completo del sistema?",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Crear backup",
              onPress: () => Alert.alert("Éxito", "Backup creado exitosamente")
            }
          ]
        );
        break;
      case "maintenance":
        Alert.alert(
          "Modo mantenimiento",
          "¿Activar modo mantenimiento? Los usuarios no podrán acceder temporalmente.",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Activar",
              style: "destructive",
              onPress: () => {
                handleToggleSetting("general", "maintenanceMode", true);
              }
            }
          ]
        );
        break;
      case "cache":
        Alert.alert("Cache limpiado", "La cache del sistema ha sido limpiada");
        break;
      case "logs":
        Alert.alert("Logs del sistema", "Ver logs detallados del sistema");
        break;
    }
  };

  const renderTabButtons = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.tabsContainer}
      contentContainerStyle={styles.tabsContent}
    >
      {[
        { key: "general", label: "General", icon: "settings-outline" },
        { key: "payments", label: "Pagos", icon: "card-outline" },
        { key: "notifications", label: "Notificaciones", icon: "notifications-outline" },
        { key: "security", label: "Seguridad", icon: "shield-outline" },
        { key: "content", label: "Contenido", icon: "document-text-outline" },
        { key: "integrations", label: "Integraciones", icon: "link-outline" },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tabButton,
            selectedTab === tab.key && styles.tabButtonActive
          ]}
          onPress={() => setSelectedTab(tab.key as any)}
        >
          <Ionicons 
            name={tab.icon as any} 
            size={18} 
            color={selectedTab === tab.key ? "white" : Colors.textMuted} 
          />
          <Text style={[
            styles.tabButtonText,
            selectedTab === tab.key && styles.tabButtonTextActive
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderSettingItem = (
    title: string,
    value: string | number | boolean,
    onPress?: () => void,
    description?: string,
    type: "toggle" | "text" | "number" | "select" = "text"
  ) => {
    if (type === "toggle") {
      return (
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>{title}</Text>
            {description && <Text style={styles.settingDescription}>{description}</Text>}
          </View>
          <Switch
            value={value as boolean}
            onValueChange={onPress}
            trackColor={{ false: Colors.border, true: Colors.primaryLight }}
            thumbColor={value ? Colors.primary : Colors.textMuted}
          />
        </View>
      );
    }

    return (
      <TouchableOpacity style={styles.settingItem} onPress={onPress}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{title}</Text>
          {description && <Text style={styles.settingDescription}>{description}</Text>}
        </View>
        <View style={styles.settingValue}>
          <Text style={styles.settingValueText}>{value}</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderGeneralSettings = () => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>⚙️ Configuración general</Text>
      
      {renderSettingItem(
        "Nombre de la aplicación",
        settings.general.appName,
        () => handleEditSetting("App Name", settings.general.appName)
      )}
      
      {renderSettingItem(
        "Versión",
        settings.general.version,
        undefined,
        "Versión actual de la aplicación"
      )}
      
      {renderSettingItem(
        "Modo mantenimiento",
        settings.general.maintenanceMode,
        (value) => handleToggleSetting("general", "maintenanceMode", value),
        "Deshabilita acceso para usuarios",
        "toggle"
      )}
      
      {renderSettingItem(
        "Permitir registros",
        settings.general.allowRegistrations,
        (value) => handleToggleSetting("general", "allowRegistrations", value),
        "Los usuarios pueden crear nuevas cuentas",
        "toggle"
      )}
      
      {renderSettingItem(
        "Verificación de email requerida",
        settings.general.emailVerificationRequired,
        (value) => handleToggleSetting("general", "emailVerificationRequired", value),
        "Los usuarios deben verificar su email",
        "toggle"
      )}
      
      {renderSettingItem(
        "Idioma por defecto",
        settings.general.defaultLanguage,
        () => handleEditSetting("Default Language", settings.general.defaultLanguage)
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleSystemAction("backup")}
        >
          <Ionicons name="cloud-upload" size={20} color={Colors.info} />
          <Text style={styles.actionButtonText}>Crear backup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleSystemAction("cache")}
        >
          <Ionicons name="refresh" size={20} color={Colors.warning} />
          <Text style={styles.actionButtonText}>Limpiar cache</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPaymentSettings = () => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>💳 Configuración de pagos</Text>
      
      {renderSettingItem(
        "Comisión (%)",
        `${settings.payments.commissionRate}%`,
        () => handleEditSetting("Commission Rate", settings.payments.commissionRate)
      )}
      
      {renderSettingItem(
        "Pago mínimo",
        `$${settings.payments.minimumPayout.toLocaleString()}`,
        () => handleEditSetting("Minimum Payout", settings.payments.minimumPayout),
        "Monto mínimo para retiro"
      )}
      
      {renderSettingItem(
        "Moneda",
        settings.payments.currency,
        () => handleEditSetting("Currency", settings.payments.currency)
      )}
      
      {renderSettingItem(
        "Pagos automáticos",
        settings.payments.autoPayoutEnabled,
        (value) => handleToggleSetting("payments", "autoPayoutEnabled", value),
        "Procesar pagos automáticamente",
        "toggle"
      )}
      
      {renderSettingItem(
        "Frecuencia de pagos",
        settings.payments.payoutFrequency,
        () => handleEditSetting("Payout Frequency", settings.payments.payoutFrequency)
      )}

      <View style={styles.paymentMethods}>
        <Text style={styles.subsectionTitle}>Métodos de pago habilitados</Text>
        {settings.payments.paymentMethods.map((method, index) => (
          <View key={index} style={styles.paymentMethodItem}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            <Text style={styles.paymentMethodText}>{method}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderNotificationSettings = () => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>🔔 Configuración de notificaciones</Text>
      
      {renderSettingItem(
        "Notificaciones por email",
        settings.notifications.emailNotifications,
        (value) => handleToggleSetting("notifications", "emailNotifications", value),
        "Enviar notificaciones por correo",
        "toggle"
      )}
      
      {renderSettingItem(
        "Notificaciones push",
        settings.notifications.pushNotifications,
        (value) => handleToggleSetting("notifications", "pushNotifications", value),
        "Notificaciones en dispositivos móviles",
        "toggle"
      )}
      
      {renderSettingItem(
        "Notificaciones SMS",
        settings.notifications.smsNotifications,
        (value) => handleToggleSetting("notifications", "smsNotifications", value),
        "Enviar SMS a usuarios",
        "toggle"
      )}
      
      {renderSettingItem(
        "Emails de marketing",
        settings.notifications.marketingEmails,
        (value) => handleToggleSetting("notifications", "marketingEmails", value),
        "Promociones y ofertas",
        "toggle"
      )}
      
      {renderSettingItem(
        "Alertas del sistema",
        settings.notifications.systemAlerts,
        (value) => handleToggleSetting("notifications", "systemAlerts", value),
        "Notificar errores y alertas",
        "toggle"
      )}
      
      {renderSettingItem(
        "Reportes semanales",
        settings.notifications.weeklyReports,
        (value) => handleToggleSetting("notifications", "weeklyReports", value),
        "Enviar resumen semanal",
        "toggle"
      )}
    </View>
  );

  const renderSecuritySettings = () => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>🔒 Configuración de seguridad</Text>
      
      {renderSettingItem(
        "Autenticación de dos factores",
        settings.security.twoFactorAuth,
        (value) => handleToggleSetting("security", "twoFactorAuth", value),
        "Requerir 2FA para administradores",
        "toggle"
      )}
      
      {renderSettingItem(
        "Expiración de contraseñas (días)",
        settings.security.passwordExpiration,
        () => handleEditSetting("Password Expiration", settings.security.passwordExpiration),
        "Días antes de requerir cambio"
      )}
      
      {renderSettingItem(
        "Máximo intentos de login",
        settings.security.maxLoginAttempts,
        () => handleEditSetting("Max Login Attempts", settings.security.maxLoginAttempts),
        "Intentos antes de bloquear cuenta"
      )}
      
      {renderSettingItem(
        "Timeout de sesión (min)",
        settings.security.sessionTimeout,
        () => handleEditSetting("Session Timeout", settings.security.sessionTimeout),
        "Minutos de inactividad"
      )}
      
      {renderSettingItem(
        "Límite de API (req/min)",
        settings.security.apiRateLimit,
        () => handleEditSetting("API Rate Limit", settings.security.apiRateLimit),
        "Requests por minuto por IP"
      )}
      
      {renderSettingItem(
        "Encriptación habilitada",
        settings.security.encryptionEnabled,
        (value) => handleToggleSetting("security", "encryptionEnabled", value),
        "Encriptar datos sensibles",
        "toggle"
      )}

      <View style={styles.securityActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.securityButton]}
          onPress={() => Alert.alert("Logs de seguridad", "Ver eventos de seguridad")}
        >
          <Ionicons name="eye" size={20} color={Colors.error} />
          <Text style={styles.actionButtonText}>Ver logs de seguridad</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContentSettings = () => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>📝 Configuración de contenido</Text>
      
      {renderSettingItem(
        "Máximo eventos por anfitrión",
        settings.content.maxEventsPerHost,
        () => handleEditSetting("Max Events Per Host", settings.content.maxEventsPerHost),
        "Límite de eventos simultáneos"
      )}
      
      {renderSettingItem(
        "Máximo jugadores por evento",
        settings.content.maxPlayersPerEvent,
        () => handleEditSetting("Max Players Per Event", settings.content.maxPlayersPerEvent),
        "Capacidad máxima por evento"
      )}
      
      {renderSettingItem(
        "Ventana de cancelación (horas)",
        settings.content.eventCancellationWindow,
        () => handleEditSetting("Event Cancellation Window", settings.content.eventCancellationWindow),
        "Horas antes del evento para cancelar"
      )}
      
      {renderSettingItem(
        "Ventana de reseñas (días)",
        settings.content.reviewWindow,
        () => handleEditSetting("Review Window", settings.content.reviewWindow),
        "Días para dejar reseña después del evento"
      )}
      
      {renderSettingItem(
        "Auto-aprobar anfitriones",
        settings.content.autoApproveHosts,
        (value) => handleToggleSetting("content", "autoApproveHosts", value),
        "Aprobar automáticamente nuevos anfitriones",
        "toggle"
      )}
      
      {renderSettingItem(
        "Moderar reseñas",
        settings.content.moderateReviews,
        (value) => handleToggleSetting("content", "moderateReviews", value),
        "Revisar reseñas antes de publicar",
        "toggle"
      )}
    </View>
  );

  const renderIntegrationsSettings = () => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>🔗 Integraciones</Text>
      
      {renderSettingItem(
        "Google Maps",
        settings.integrations.googleMapsEnabled,
        (value) => handleToggleSetting("integrations", "googleMapsEnabled", value),
        "Usar Google Maps para ubicaciones",
        "toggle"
      )}
      
      {renderSettingItem(
        "Login con Facebook",
        settings.integrations.facebookLogin,
        (value) => handleToggleSetting("integrations", "facebookLogin", value),
        "Permitir login con Facebook",
        "toggle"
      )}
      
      {renderSettingItem(
        "Login con Google",
        settings.integrations.googleLogin,
        (value) => handleToggleSetting("integrations", "googleLogin", value),
        "Permitir login con Google",
        "toggle"
      )}
      
      {renderSettingItem(
        "Login con Apple",
        settings.integrations.appleLogin,
        (value) => handleToggleSetting("integrations", "appleLogin", value),
        "Permitir login con Apple ID",
        "toggle"
      )}
      
      {renderSettingItem(
        "Soporte WhatsApp",
        settings.integrations.whatsappSupport,
        (value) => handleToggleSetting("integrations", "whatsappSupport", value),
        "Chat de soporte por WhatsApp",
        "toggle"
      )}
      
      {renderSettingItem(
        "Analytics habilitado",
        settings.integrations.analyticsEnabled,
        (value) => handleToggleSetting("integrations", "analyticsEnabled", value),
        "Recopilar datos de uso",
        "toggle"
      )}

      <View style={styles.integrationStatus}>
        <Text style={styles.subsectionTitle}>Estado de servicios</Text>
        <View style={styles.serviceStatusList}>
          {[
            { name: "Google Maps API", status: "active" },
            { name: "Payment Gateway", status: "active" },
            { name: "Email Service", status: "active" },
            { name: "SMS Service", status: "inactive" },
            { name: "Push Notifications", status: "active" },
          ].map((service, index) => (
            <View key={index} style={styles.serviceStatusItem}>
              <Text style={styles.serviceStatusName}>{service.name}</Text>
              <View style={[
                styles.serviceStatusBadge,
                { backgroundColor: service.status === "active" ? Colors.success : Colors.error }
              ]}>
                <Text style={styles.serviceStatusText}>
                  {service.status === "active" ? "Activo" : "Inactivo"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowEditModal(false)}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Editar configuración</Text>
          <TouchableOpacity onPress={handleSaveEdit}>
            <Text style={styles.saveButton}>Guardar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <Text style={styles.editLabel}>{editingField}</Text>
          <TextInput
            style={styles.editInput}
            value={editingValue}
            onChangeText={setEditingValue}
            placeholder="Ingresa el nuevo valor"
            multiline={editingField?.includes("Description")}
            numberOfLines={editingField?.includes("Description") ? 3 : 1}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );

  if (!user || user.userType !== "admin") {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Esta pantalla es solo para administradores</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <LinearGradient
        colors={Gradients.primary}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Configuración</Text>
            <Text style={styles.headerSubtitle}>
              Ajustes del sistema
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.logoutButton} 
            activeOpacity={0.7}
            onPress={() => {
              Alert.alert(
                "Cerrar sesión",
                "¿Estás seguro de que quieres cerrar sesión?",
                [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Cerrar sesión", onPress: logout }
                ]
              );
            }}
          >
            <Ionicons name="log-out-outline" size={24} color={Colors.textLight} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {renderTabButtons()}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {selectedTab === "general" && renderGeneralSettings()}
        {selectedTab === "payments" && renderPaymentSettings()}
        {selectedTab === "notifications" && renderNotificationSettings()}
        {selectedTab === "security" && renderSecuritySettings()}
        {selectedTab === "content" && renderContentSettings()}
        {selectedTab === "integrations" && renderIntegrationsSettings()}
      </ScrollView>

      {renderEditModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    paddingTop: 35,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.textLight,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    opacity: 0.9,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  tabsContainer: {
    flexGrow: 0,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabsContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textMuted,
  },
  tabButtonTextActive: {
    color: "white",
  },
  content: {
    flex: 1,
  },
  settingsSection: {
    margin: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  settingValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingValueText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  securityButton: {
    backgroundColor: Colors.error + '20',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  paymentMethods: {
    marginTop: 20,
  },
  paymentMethodItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 8,
  },
  paymentMethodText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  securityActions: {
    marginTop: 20,
  },
  integrationStatus: {
    marginTop: 20,
  },
  serviceStatusList: {
    gap: 8,
  },
  serviceStatusItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  serviceStatusName: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  serviceStatusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  serviceStatusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: Colors.surface,
    textAlignVertical: "top",
  },
});

export default AdminSettingsScreen;