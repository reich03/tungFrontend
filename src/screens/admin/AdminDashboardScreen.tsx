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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Colors, Gradients } from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";

const mockStats = {
  totalUsers: 1247,
  totalEvents: 89,
  totalHosts: 34,
  totalRevenue: 2650000,
  activeEvents: 12,
  pendingApprovals: 5,
  newUsersThisWeek: 23,
  conversionRate: 68.5,
};

const mockRecentActivity = [
  {
    id: "1",
    type: "user_signup",
    title: "Nuevo usuario registrado",
    description: "Juan Pérez se registró como jugador",
    time: "Hace 5 min",
    icon: "person-add",
    color: Colors.success,
  },
  {
    id: "2",
    type: "event_created",
    title: "Evento creado",
    description: 'Canchas Express creó "Fútbol 7 - Viernes"',
    time: "Hace 15 min",
    icon: "calendar",
    color: Colors.info,
  },
  {
    id: "3",
    type: "host_approval",
    title: "Anfitrión pendiente",
    description: "Campo Verde solicita aprobación",
    time: "Hace 1 hora",
    icon: "checkmark-circle",
    color: Colors.warning,
  },
  {
    id: "4",
    type: "payment_received",
    title: "Pago procesado",
    description: "Comisión de $15,000 recibida",
    time: "Hace 2 horas",
    icon: "cash",
    color: Colors.success,
  },
];

const AdminDashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(mockStats);
  const [recentActivity, setRecentActivity] = useState(mockRecentActivity);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        setStats(mockStats);
        setRecentActivity(mockRecentActivity);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "approve_hosts":
        Alert.alert("Aprobar Anfitriones", "Revisar anfitriones pendientes");
        break;
      case "manage_events":
        Alert.alert("Gestionar Eventos", "Ver eventos del sistema");
        break;
      case "view_reports":
        Alert.alert("Ver Reportes", "Acceder a reportes detallados");
        break;
      case "system_settings":
        Alert.alert("Configuración", "Configurar el sistema");
        break;
    }
  };

  const renderStatsGrid = () => (
    <View style={styles.statsGrid}>
      <LinearGradient
        colors={["#4CAF50", "#81C784"]}
        style={[styles.statCard, styles.gradientCard]}
      >
        <Ionicons name="people" size={28} color="white" />
        <Text style={styles.statValueWhite}>{stats.totalUsers.toLocaleString()}</Text>
        <Text style={styles.statLabelWhite}>Total usuarios</Text>
      </LinearGradient>

      <LinearGradient
        colors={["#2196F3", "#64B5F6"]}
        style={[styles.statCard, styles.gradientCard]}
      >
        <Ionicons name="calendar" size={28} color="white" />
        <Text style={styles.statValueWhite}>{stats.totalEvents}</Text>
        <Text style={styles.statLabelWhite}>Eventos totales</Text>
      </LinearGradient>

      <LinearGradient
        colors={["#FF9800", "#FFB74D"]}
        style={[styles.statCard, styles.gradientCard]}
      >
        <Ionicons name="business" size={28} color="white" />
        <Text style={styles.statValueWhite}>{stats.totalHosts}</Text>
        <Text style={styles.statLabelWhite}>Anfitriones</Text>
      </LinearGradient>

      <LinearGradient
        colors={["#9C27B0", "#BA68C8"]}
        style={[styles.statCard, styles.gradientCard]}
      >
        <Ionicons name="cash" size={28} color="white" />
        <Text style={styles.statValueWhite}>
          ${(stats.totalRevenue / 1000000).toFixed(1)}M
        </Text>
        <Text style={styles.statLabelWhite}>Ingresos totales</Text>
      </LinearGradient>
    </View>
  );

  const renderKeyMetrics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📊 Métricas clave</Text>
      
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <View style={styles.metricIcon}>
            <Ionicons name="trending-up" size={24} color={Colors.success} />
          </View>
          <View style={styles.metricInfo}>
            <Text style={styles.metricValue}>+{stats.newUsersThisWeek}</Text>
            <Text style={styles.metricLabel}>Nuevos esta semana</Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricIcon}>
            <Ionicons name="flash" size={24} color={Colors.info} />
          </View>
          <View style={styles.metricInfo}>
            <Text style={styles.metricValue}>{stats.activeEvents}</Text>
            <Text style={styles.metricLabel}>Eventos activos</Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricIcon}>
            <Ionicons name="time" size={24} color={Colors.warning} />
          </View>
          <View style={styles.metricInfo}>
            <Text style={styles.metricValue}>{stats.pendingApprovals}</Text>
            <Text style={styles.metricLabel}>Pendientes aprobación</Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricIcon}>
            <Ionicons name="stats-chart" size={24} color={Colors.primary} />
          </View>
          <View style={styles.metricInfo}>
            <Text style={styles.metricValue}>{stats.conversionRate}%</Text>
            <Text style={styles.metricLabel}>Tasa conversión</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🚀 Acciones rápidas</Text>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => handleQuickAction("approve_hosts")}
        >
          <LinearGradient
            colors={[Colors.warning, "#FFB74D"]}
            style={styles.quickActionGradient}
          >
            <Ionicons name="checkmark-circle" size={32} color="white" />
            <Text style={styles.quickActionTitle}>Aprobar</Text>
            <Text style={styles.quickActionSubtitle}>Anfitriones</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => handleQuickAction("manage_events")}
        >
          <LinearGradient
            colors={[Colors.info, "#64B5F6"]}
            style={styles.quickActionGradient}
          >
            <Ionicons name="calendar" size={32} color="white" />
            <Text style={styles.quickActionTitle}>Gestionar</Text>
            <Text style={styles.quickActionSubtitle}>Eventos</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => handleQuickAction("view_reports")}
        >
          <LinearGradient
            colors={[Colors.success, "#81C784"]}
            style={styles.quickActionGradient}
          >
            <Ionicons name="document-text" size={32} color="white" />
            <Text style={styles.quickActionTitle}>Reportes</Text>
            <Text style={styles.quickActionSubtitle}>Ver datos</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => handleQuickAction("system_settings")}
        >
          <LinearGradient
            colors={[Colors.primary, "#4CAF50"]}
            style={styles.quickActionGradient}
          >
            <Ionicons name="settings" size={32} color="white" />
            <Text style={styles.quickActionTitle}>Configurar</Text>
            <Text style={styles.quickActionSubtitle}>Sistema</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecentActivity = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📋 Actividad reciente</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Ver todo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.activityList}>
        {recentActivity.map((activity) => (
          <TouchableOpacity key={activity.id} style={styles.activityCard}>
            <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
              <Ionicons name={activity.icon as any} size={20} color={activity.color} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityDescription}>{activity.description}</Text>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
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

      
      <LinearGradient
        colors={Gradients.primary}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Panel Admin</Text>
            <Text style={styles.headerSubtitle}>
              Bienvenido, {user.fullName}
            </Text>
          </View>

          <TouchableOpacity style={styles.notificationButton} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={24} color={Colors.textLight} />
            {stats.pendingApprovals > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {stats.pendingApprovals}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      
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
        <View style={styles.overviewContainer}>
          {renderStatsGrid()}
          {renderKeyMetrics()}
          {renderQuickActions()}
          {renderRecentActivity()}
        </View>
      </ScrollView>
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

    marginTop:20,
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
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  notificationBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  overviewContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
    marginTop: 20,
  },
  statCard: {
    width: "47%",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gradientCard: {
    borderWidth: 0,
  },
  statValueWhite: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabelWhite: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  metricsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    width: "47%",
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  metricInfo: {
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionCard: {
    width: "47%",
    borderRadius: 16,
    overflow: "hidden",
  },
  quickActionGradient: {
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  activityList: {
    gap: 12,
  },
  activityCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});

export default AdminDashboardScreen;