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
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Colors, Gradients } from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";

const { width } = Dimensions.get("window");

// Mock data para reportes
const mockReportsData = {
  revenue: {
    total: 2650000,
    thisMonth: 485000,
    lastMonth: 420000,
    growth: 15.5,
    daily: [
      { date: "2025-06-21", amount: 45000 },
      { date: "2025-06-22", amount: 62000 },
      { date: "2025-06-23", amount: 38000 },
      { date: "2025-06-24", amount: 71000 },
      { date: "2025-06-25", amount: 85000 },
      { date: "2025-06-26", amount: 52000 },
      { date: "2025-06-27", amount: 67000 },
    ]
  },
  users: {
    total: 1247,
    players: 1089,
    hosts: 34,
    admins: 3,
    newThisWeek: 23,
    activeUsers: 892,
    retentionRate: 71.5,
  },
  events: {
    total: 89,
    completed: 67,
    cancelled: 8,
    active: 14,
    averageParticipants: 12.5,
    popularTime: "18:00-20:00",
    popularDay: "Viernes",
  },
  hosts: {
    total: 34,
    active: 31,
    pending: 3,
    topRated: [
      { name: "Canchas Express", rating: 4.8, events: 23 },
      { name: "Deportes Villa", rating: 4.6, events: 18 },
      { name: "Futbol Center", rating: 4.5, events: 15 },
    ],
    averageRating: 4.3,
  },
  geography: {
    topCities: [
      { city: "Villavicencio", users: 456, percentage: 36.5 },
      { city: "Bogotá", users: 312, percentage: 25.0 },
      { city: "Medellín", users: 198, percentage: 15.9 },
      { city: "Cali", users: 156, percentage: 12.5 },
      { city: "Otros", users: 125, percentage: 10.1 },
    ]
  }
};

const AdminReportsScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "quarter" | "year">("month");
  const [reportsData, setReportsData] = useState(mockReportsData);

  useEffect(() => {
    loadReportsData();
  }, [selectedPeriod]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      // Simular carga de API
      setTimeout(() => {
        setReportsData(mockReportsData);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error loading reports data:", error);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReportsData();
    setRefreshing(false);
  };

  const handleExportReport = (type: "pdf" | "excel" | "csv") => {
    Alert.alert(
      "Exportar Reporte",
      `¿Deseas exportar el reporte en formato ${type.toUpperCase()}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Exportar",
          onPress: () => {
            Alert.alert("Éxito", `Reporte exportado en formato ${type.toUpperCase()}`);
          },
        },
      ]
    );
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {[
        { key: "week", label: "Semana" },
        { key: "month", label: "Mes" },
        { key: "quarter", label: "Trimestre" },
        { key: "year", label: "Año" },
      ].map((period) => (
        <TouchableOpacity
          key={period.key}
          style={[
            styles.periodButton,
            selectedPeriod === period.key && styles.periodButtonActive
          ]}
          onPress={() => setSelectedPeriod(period.key as any)}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === period.key && styles.periodButtonTextActive
          ]}>
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderRevenueReport = () => (
    <View style={styles.reportSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>💰 Ingresos</Text>
        <TouchableOpacity onPress={() => handleExportReport("excel")}>
          <Ionicons name="download-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.revenueCards}>
        <LinearGradient
          colors={[Colors.success, "#81C784"]}
          style={styles.revenueCard}
        >
          <Text style={styles.revenueCardLabel}>Total General</Text>
          <Text style={styles.revenueCardValue}>
            ${(reportsData.revenue.total / 1000000).toFixed(1)}M
          </Text>
          <Text style={styles.revenueCardSubtext}>Acumulado</Text>
        </LinearGradient>

        <View style={styles.revenueCard}>
          <Text style={styles.revenueCardLabel}>Este Mes</Text>
          <Text style={styles.revenueCardValueDark}>
            ${(reportsData.revenue.thisMonth / 1000).toFixed(0)}K
          </Text>
          <View style={styles.growthIndicator}>
            <Ionicons name="trending-up" size={12} color={Colors.success} />
            <Text style={styles.growthText}>+{reportsData.revenue.growth}%</Text>
          </View>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Ingresos últimos 7 días</Text>
        <View style={styles.simpleChart}>
          {reportsData.revenue.daily.map((day, index) => {
            const maxAmount = Math.max(...reportsData.revenue.daily.map(d => d.amount));
            const height = (day.amount / maxAmount) * 80;
            
            return (
              <View key={index} style={styles.chartBarContainer}>
                <View style={[styles.chartBar, { height }]} />
                <Text style={styles.chartBarLabel}>
                  {new Date(day.date).getDate()}
                </Text>
                <Text style={styles.chartBarValue}>
                  ${(day.amount / 1000).toFixed(0)}K
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );

  const renderUsersReport = () => (
    <View style={styles.reportSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>👥 Usuarios</Text>
        <TouchableOpacity onPress={() => handleExportReport("pdf")}>
          <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.usersGrid}>
        <View style={styles.userStatCard}>
          <Ionicons name="people" size={24} color={Colors.info} />
          <Text style={styles.userStatValue}>{reportsData.users.total.toLocaleString()}</Text>
          <Text style={styles.userStatLabel}>Total usuarios</Text>
        </View>

        <View style={styles.userStatCard}>
          <Ionicons name="person-add" size={24} color={Colors.success} />
          <Text style={styles.userStatValue}>+{reportsData.users.newThisWeek}</Text>
          <Text style={styles.userStatLabel}>Nuevos (semana)</Text>
        </View>

        <View style={styles.userStatCard}>
          <Ionicons name="pulse" size={24} color={Colors.warning} />
          <Text style={styles.userStatValue}>{reportsData.users.activeUsers}</Text>
          <Text style={styles.userStatLabel}>Usuarios activos</Text>
        </View>

        <View style={styles.userStatCard}>
          <Ionicons name="heart" size={24} color={Colors.error} />
          <Text style={styles.userStatValue}>{reportsData.users.retentionRate}%</Text>
          <Text style={styles.userStatLabel}>Retención</Text>
        </View>
      </View>

      <View style={styles.userTypeBreakdown}>
        <Text style={styles.breakdownTitle}>Distribución por tipo</Text>
        <View style={styles.breakdownBars}>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Jugadores</Text>
            <View style={styles.breakdownBarContainer}>
              <View style={[
                styles.breakdownBar,
                { 
                  width: `${(reportsData.users.players / reportsData.users.total) * 100}%`,
                  backgroundColor: Colors.info 
                }
              ]} />
            </View>
            <Text style={styles.breakdownValue}>{reportsData.users.players}</Text>
          </View>

          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Anfitriones</Text>
            <View style={styles.breakdownBarContainer}>
              <View style={[
                styles.breakdownBar,
                { 
                  width: `${(reportsData.users.hosts / reportsData.users.total) * 100}%`,
                  backgroundColor: Colors.warning 
                }
              ]} />
            </View>
            <Text style={styles.breakdownValue}>{reportsData.users.hosts}</Text>
          </View>

          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Admins</Text>
            <View style={styles.breakdownBarContainer}>
              <View style={[
                styles.breakdownBar,
                { 
                  width: `${(reportsData.users.admins / reportsData.users.total) * 100}%`,
                  backgroundColor: Colors.error 
                }
              ]} />
            </View>
            <Text style={styles.breakdownValue}>{reportsData.users.admins}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderEventsReport = () => (
    <View style={styles.reportSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📅 Eventos</Text>
        <TouchableOpacity onPress={() => handleExportReport("csv")}>
          <Ionicons name="stats-chart-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.eventsStats}>
        <View style={styles.eventStatItem}>
          <View style={styles.eventStatIcon}>
            <Ionicons name="calendar" size={20} color={Colors.primary} />
          </View>
          <View style={styles.eventStatInfo}>
            <Text style={styles.eventStatValue}>{reportsData.events.total}</Text>
            <Text style={styles.eventStatLabel}>Total eventos</Text>
          </View>
        </View>

        <View style={styles.eventStatItem}>
          <View style={styles.eventStatIcon}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
          </View>
          <View style={styles.eventStatInfo}>
            <Text style={styles.eventStatValue}>{reportsData.events.completed}</Text>
            <Text style={styles.eventStatLabel}>Completados</Text>
          </View>
        </View>

        <View style={styles.eventStatItem}>
          <View style={styles.eventStatIcon}>
            <Ionicons name="people" size={20} color={Colors.info} />
          </View>
          <View style={styles.eventStatInfo}>
            <Text style={styles.eventStatValue}>{reportsData.events.averageParticipants}</Text>
            <Text style={styles.eventStatLabel}>Promedio jugadores</Text>
          </View>
        </View>
      </View>

      <View style={styles.eventInsights}>
        <Text style={styles.insightsTitle}>📊 Insights</Text>
        <View style={styles.insightItem}>
          <Ionicons name="time" size={16} color={Colors.textSecondary} />
          <Text style={styles.insightText}>
            Horario más popular: <Text style={styles.insightHighlight}>{reportsData.events.popularTime}</Text>
          </Text>
        </View>
        <View style={styles.insightItem}>
          <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.insightText}>
            Día más activo: <Text style={styles.insightHighlight}>{reportsData.events.popularDay}</Text>
          </Text>
        </View>
      </View>
    </View>
  );

  const renderHostsReport = () => (
    <View style={styles.reportSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🏢 Anfitriones</Text>
        <TouchableOpacity onPress={() => Alert.alert("Top Hosts", "Ver ranking completo de anfitriones")}>
          <Ionicons name="trophy-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.hostsOverview}>
        <View style={styles.hostOverviewItem}>
          <Text style={styles.hostOverviewValue}>{reportsData.hosts.total}</Text>
          <Text style={styles.hostOverviewLabel}>Total</Text>
        </View>
        <View style={styles.hostOverviewItem}>
          <Text style={styles.hostOverviewValue}>{reportsData.hosts.active}</Text>
          <Text style={styles.hostOverviewLabel}>Activos</Text>
        </View>
        <View style={styles.hostOverviewItem}>
          <Text style={styles.hostOverviewValue}>{reportsData.hosts.pending}</Text>
          <Text style={styles.hostOverviewLabel}>Pendientes</Text>
        </View>
        <View style={styles.hostOverviewItem}>
          <Text style={styles.hostOverviewValue}>{reportsData.hosts.averageRating}</Text>
          <Text style={styles.hostOverviewLabel}>Rating promedio</Text>
        </View>
      </View>

      <View style={styles.topHosts}>
        <Text style={styles.topHostsTitle}>🏆 Top anfitriones</Text>
        {reportsData.hosts.topRated.map((host, index) => (
          <View key={index} style={styles.topHostItem}>
            <View style={styles.topHostRank}>
              <Text style={styles.topHostRankText}>{index + 1}</Text>
            </View>
            <View style={styles.topHostInfo}>
              <Text style={styles.topHostName}>{host.name}</Text>
              <Text style={styles.topHostStats}>{host.events} eventos</Text>
            </View>
            <View style={styles.topHostRating}>
              <Ionicons name="star" size={14} color={Colors.warning} />
              <Text style={styles.topHostRatingText}>{host.rating}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderGeographyReport = () => (
    <View style={styles.reportSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🌍 Distribución geográfica</Text>
        <TouchableOpacity onPress={() => Alert.alert("Mapa", "Ver mapa interactivo")}>
          <Ionicons name="map-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.geographyList}>
        {reportsData.geography.topCities.map((city, index) => (
          <View key={index} style={styles.cityItem}>
            <View style={styles.cityInfo}>
              <Text style={styles.cityName}>{city.city}</Text>
              <Text style={styles.cityUsers}>{city.users} usuarios</Text>
            </View>
            <View style={styles.cityPercentageContainer}>
              <View style={styles.cityPercentageBar}>
                <View style={[
                  styles.cityPercentageFill,
                  { width: `${city.percentage}%` }
                ]} />
              </View>
              <Text style={styles.cityPercentageText}>{city.percentage}%</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderExportOptions = () => (
    <View style={styles.exportSection}>
      <Text style={styles.sectionTitle}>📤 Exportar reportes</Text>
      
      <View style={styles.exportButtons}>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={() => handleExportReport("pdf")}
        >
          <LinearGradient
            colors={[Colors.error, "#EF5350"]}
            style={styles.exportButtonGradient}
          >
            <Ionicons name="document-text" size={24} color="white" />
            <Text style={styles.exportButtonText}>PDF</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.exportButton}
          onPress={() => handleExportReport("excel")}
        >
          <LinearGradient
            colors={[Colors.success, "#66BB6A"]}
            style={styles.exportButtonGradient}
          >
            <Ionicons name="grid" size={24} color="white" />
            <Text style={styles.exportButtonText}>Excel</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.exportButton}
          onPress={() => handleExportReport("csv")}
        >
          <LinearGradient
            colors={[Colors.info, "#42A5F5"]}
            style={styles.exportButtonGradient}
          >
            <Ionicons name="download" size={24} color="white" />
            <Text style={styles.exportButtonText}>CSV</Text>
          </LinearGradient>
        </TouchableOpacity>
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

      {/* Header */}
      <LinearGradient
        colors={Gradients.primary}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Reportes</Text>
            <Text style={styles.headerSubtitle}>
              Análisis y métricas del sistema
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.refreshButton} 
            activeOpacity={0.7}
            onPress={handleRefresh}
          >
            <Ionicons name="refresh" size={24} color={Colors.textLight} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
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
        {renderPeriodSelector()}
        {renderRevenueReport()}
        {renderUsersReport()}
        {renderEventsReport()}
        {renderHostsReport()}
        {renderGeographyReport()}
        {renderExportOptions()}
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
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  periodSelector: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  periodButtonTextActive: {
    color: "white",
  },
  reportSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  revenueCards: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  revenueCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  revenueCardLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  revenueCardValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  revenueCardValueDark: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  revenueCardSubtext: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.6)",
  },
  growthIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  growthText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: "600",
  },
  chartContainer: {
    marginTop: 20,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  simpleChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
    paddingHorizontal: 8,
  },
  chartBarContainer: {
    alignItems: "center",
    flex: 1,
  },
  chartBar: {
    width: 20,
    backgroundColor: Colors.primary,
    borderRadius: 4,
    marginBottom: 8,
  },
  chartBarLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  chartBarValue: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  usersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  userStatCard: {
    width: "47%",
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  userStatValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  userStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  userTypeBreakdown: {
    marginTop: 20,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  breakdownBars: {
    gap: 12,
  },
  breakdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  breakdownLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    width: 80,
  },
  breakdownBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: 4,
    overflow: "hidden",
  },
  breakdownBar: {
    height: "100%",
    borderRadius: 4,
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textPrimary,
    width: 40,
    textAlign: "right",
  },
  eventsStats: {
    gap: 16,
    marginBottom: 20,
  },
  eventStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  eventStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  eventStatInfo: {
    flex: 1,
  },
  eventStatValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  eventStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  eventInsights: {
    marginTop: 20,
    gap: 8,
  },
  insightsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  insightText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  insightHighlight: {
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  hostsOverview: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  hostOverviewItem: {
    alignItems: "center",
  },
  hostOverviewValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  hostOverviewLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  topHosts: {
    marginTop: 20,
  },
  topHostsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  topHostItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },
  topHostRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  topHostRankText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
  topHostInfo: {
    flex: 1,
  },
  topHostName: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  topHostStats: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  topHostRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  topHostRatingText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  geographyList: {
    gap: 12,
  },
  cityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  cityUsers: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  cityPercentageContainer: {
    alignItems: "flex-end",
    gap: 4,
  },
  cityPercentageBar: {
    width: 80,
    height: 6,
    backgroundColor: Colors.background,
    borderRadius: 3,
    overflow: "hidden",
  },
  cityPercentageFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  cityPercentageText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  exportSection: {
    marginHorizontal: 20,
    marginBottom: 40,
  },
  exportButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  exportButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  exportButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    gap: 8,
  },
  exportButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
});

export default AdminReportsScreen;