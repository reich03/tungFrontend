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
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Colors, Gradients } from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";
import { UserType } from "../../types";

interface MockUser {
  id: string;
  fullName: string;
  email: string;
  userType: UserType;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  phone?: string;
  documentoIdentidad?: string;
  businessName?: string; 
  rating?: number; 
  totalEvents?: number;
  preferredPosition?: string; 
  stats?: any; 
}

const mockUsers: MockUser[] = [
  {
    id: "1",
    fullName: "Carlos Canchas",
    email: "carlos@canchasexpress.com",
    userType: "host",
    isActive: true,
    createdAt: "2025-01-15",
    lastLogin: "2025-06-27",
    phone: "+57 301 555 1111",
    documentoIdentidad: "12345678",
    businessName: "Canchas Express",
    rating: 4.5,
    totalEvents: 23,
  },
  {
    id: "2",
    fullName: "Juan Pérez",
    email: "juan@email.com",
    userType: "player",
    isActive: true,
    createdAt: "2025-02-10",
    lastLogin: "2025-06-26",
    phone: "+57 300 123 4567",
    documentoIdentidad: "87654321",
    preferredPosition: "Mediocampista",
  },
  {
    id: "3",
    fullName: "Ana Administradora",
    email: "ana@tungapp.com",
    userType: "admin",
    isActive: true,
    createdAt: "2025-01-01",
    lastLogin: "2025-06-27",
    phone: "+57 320 999 8888",
    documentoIdentidad: "11111111",
  },
  {
    id: "4",
    fullName: "Pedro Futbol",
    email: "pedro@email.com",
    userType: "player",
    isActive: false,
    createdAt: "2025-03-05",
    lastLogin: "2025-06-20",
    phone: "+57 315 567 8901",
    documentoIdentidad: "22222222",
    preferredPosition: "Delantero",
  },
  {
    id: "5",
    fullName: "Deportes Villa",
    email: "info@deportesvilla.com",
    userType: "host",
    isActive: true,
    createdAt: "2025-02-28",
    lastLogin: "2025-06-25",
    phone: "+57 310 444 5555",
    documentoIdentidad: "33333333",
    businessName: "Deportes Villa",
    rating: 4.2,
    totalEvents: 15,
  },
];

const AdminUsersScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<MockUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<MockUser[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<"all" | UserType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, selectedFilter, searchQuery]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        setUsers(mockUsers);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error loading users:", error);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const filterUsers = () => {
    let filtered = users;

    if (selectedFilter !== "all") {
      filtered = filtered.filter(u => u.userType === selectedFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.fullName.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.documentoIdentidad?.includes(query) ||
        (u.businessName && u.businessName.toLowerCase().includes(query))
      );
    }

    setFilteredUsers(filtered);
  };

  const getUserTypeLabel = (type: UserType): string => {
    switch (type) {
      case "admin": return "Administrador";
      case "host": return "Anfitrión";
      case "player": return "Jugador";
      default: return type;
    }
  };

  const getUserTypeColor = (type: UserType): string => {
    switch (type) {
      case "admin": return Colors.error;
      case "host": return Colors.warning;
      case "player": return Colors.info;
      default: return Colors.textMuted;
    }
  };

  const getUserTypeIcon = (type: UserType): string => {
    switch (type) {
      case "admin": return "shield-checkmark";
      case "host": return "business";
      case "player": return "person";
      default: return "person";
    }
  };

  const handleUserAction = (userId: string, action: "view" | "activate" | "deactivate" | "edit" | "delete") => {
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;

    switch (action) {
      case "view":
        setSelectedUser(userToUpdate);
        setShowUserModal(true);
        break;
      case "activate":
        Alert.alert(
          "Activar Usuario",
          `¿Estás seguro de que quieres activar a ${userToUpdate.fullName}?`,
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Activar",
              onPress: () => {
                setUsers(users.map(u => 
                  u.id === userId ? { ...u, isActive: true } : u
                ));
                Alert.alert("Éxito", "Usuario activado correctamente");
              },
            },
          ]
        );
        break;
      case "deactivate":
        Alert.alert(
          "Desactivar Usuario",
          `¿Estás seguro de que quieres desactivar a ${userToUpdate.fullName}?`,
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Desactivar",
              style: "destructive",
              onPress: () => {
                setUsers(users.map(u => 
                  u.id === userId ? { ...u, isActive: false } : u
                ));
                Alert.alert("Éxito", "Usuario desactivado correctamente");
              },
            },
          ]
        );
        break;
      case "edit":
        Alert.alert("Editar Usuario", `Editar perfil de ${userToUpdate.fullName}`);
        break;
      case "delete":
        Alert.alert(
          "Eliminar Usuario",
          `¿Estás seguro de que quieres eliminar permanentemente a ${userToUpdate.fullName}?`,
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Eliminar",
              style: "destructive",
              onPress: () => {
                setUsers(users.filter(u => u.id !== userId));
                Alert.alert("Eliminado", "Usuario eliminado permanentemente");
              },
            },
          ]
        );
        break;
    }
  };

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar usuarios..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterTabs}
        contentContainerStyle={styles.filterTabsContent}
      >
        {[
          { key: "all", label: "Todos", count: users.length },
          { key: "player", label: "Jugadores", count: users.filter(u => u.userType === "player").length },
          { key: "host", label: "Anfitriones", count: users.filter(u => u.userType === "host").length },
          { key: "admin", label: "Admins", count: users.filter(u => u.userType === "admin").length },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              selectedFilter === filter.key && styles.filterTabActive
            ]}
            onPress={() => setSelectedFilter(filter.key as any)}
          >
            <Text style={[
              styles.filterTabText,
              selectedFilter === filter.key && styles.filterTabTextActive
            ]}>
              {filter.label}
            </Text>
            <View style={[
              styles.filterTabBadge,
              selectedFilter === filter.key && styles.filterTabBadgeActive
            ]}>
              <Text style={[
                styles.filterTabBadgeText,
                selectedFilter === filter.key && styles.filterTabBadgeTextActive
              ]}>
                {filter.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderUsersList = () => (
    <View style={styles.usersList}>
      {filteredUsers.map((user) => (
        <TouchableOpacity
          key={user.id}
          style={[
            styles.userCard,
            !user.isActive && styles.userCardInactive
          ]}
          onPress={() => handleUserAction(user.id, "view")}
        >
          <View style={styles.userCardHeader}>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Ionicons 
                  name={getUserTypeIcon(user.userType) as any} 
                  size={24} 
                  color={getUserTypeColor(user.userType)} 
                />
              </View>
              <View style={styles.userDetails}>
                <Text style={[
                  styles.userName,
                  !user.isActive && styles.userNameInactive
                ]}>
                  {user.fullName}
                </Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.userMeta}>
                  <View style={[
                    styles.userTypeBadge,
                    { backgroundColor: getUserTypeColor(user.userType) + '20' }
                  ]}>
                    <Text style={[
                      styles.userTypeText,
                      { color: getUserTypeColor(user.userType) }
                    ]}>
                      {getUserTypeLabel(user.userType)}
                    </Text>
                  </View>
                  <Text style={styles.userJoinDate}>
                    Desde {new Date(user.createdAt).toLocaleDateString('es-ES', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.userActions}>
              <View style={[
                styles.userStatus,
                { backgroundColor: user.isActive ? Colors.success : Colors.error }
              ]}>
                <Text style={styles.userStatusText}>
                  {user.isActive ? "Activo" : "Inactivo"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.moreButton}
                onPress={() => {
                  Alert.alert(
                    "Acciones",
                    `¿Qué acción deseas realizar con ${user.fullName}?`,
                    [
                      { text: "Ver perfil", onPress: () => handleUserAction(user.id, "view") },
                      { text: "Editar", onPress: () => handleUserAction(user.id, "edit") },
                      { 
                        text: user.isActive ? "Desactivar" : "Activar", 
                        onPress: () => handleUserAction(user.id, user.isActive ? "deactivate" : "activate") 
                      },
                      { 
                        text: "Eliminar", 
                        style: "destructive",
                        onPress: () => handleUserAction(user.id, "delete") 
                      },
                      { text: "Cancelar", style: "cancel" },
                    ]
                  );
                }}
              >
                <Ionicons name="ellipsis-vertical" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Info adicional según tipo de usuario */}
          {user.userType === "host" && (
            <View style={styles.userExtraInfo}>
              <View style={styles.extraInfoItem}>
                <Ionicons name="business-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.extraInfoText}>{user.businessName}</Text>
              </View>
              <View style={styles.extraInfoItem}>
                <Ionicons name="star" size={14} color={Colors.warning} />
                <Text style={styles.extraInfoText}>{user.rating?.toFixed(1)}</Text>
              </View>
              <View style={styles.extraInfoItem}>
                <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.extraInfoText}>{user.totalEvents} eventos</Text>
              </View>
            </View>
          )}

          {user.userType === "player" && user.preferredPosition && (
            <View style={styles.userExtraInfo}>
              <View style={styles.extraInfoItem}>
                <Ionicons name="football-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.extraInfoText}>Posición: {user.preferredPosition}</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      ))}

      {filteredUsers.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyStateTitle}>No se encontraron usuarios</Text>
          <Text style={styles.emptyStateText}>
            {searchQuery 
              ? `No hay usuarios que coincidan con "${searchQuery}"`
              : "No hay usuarios para mostrar"
            }
          </Text>
        </View>
      )}
    </View>
  );

  const renderUserModal = () => (
    <Modal
      visible={showUserModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowUserModal(false)}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Perfil de Usuario</Text>
          <TouchableOpacity onPress={() => selectedUser && handleUserAction(selectedUser.id, "edit")}>
            <Ionicons name="pencil" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {selectedUser && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.userProfileHeader}>
              <View style={styles.userProfileAvatar}>
                <Ionicons 
                  name={getUserTypeIcon(selectedUser.userType) as any} 
                  size={48} 
                  color={getUserTypeColor(selectedUser.userType)} 
                />
              </View>
              <Text style={styles.userProfileName}>{selectedUser.fullName}</Text>
              <Text style={styles.userProfileEmail}>{selectedUser.email}</Text>
              <View style={[
                styles.userProfileTypeBadge,
                { backgroundColor: getUserTypeColor(selectedUser.userType) }
              ]}>
                <Text style={styles.userProfileTypeText}>
                  {getUserTypeLabel(selectedUser.userType)}
                </Text>
              </View>
            </View>

            <View style={styles.userDetailsSection}>
              <Text style={styles.sectionTitle}>📋 Información básica</Text>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Documento de identidad</Text>
                <Text style={styles.detailValue}>{selectedUser.documentoIdentidad}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Teléfono</Text>
                <Text style={styles.detailValue}>{selectedUser.phone || "No disponible"}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Estado</Text>
                <View style={[
                  styles.statusBadgeModal,
                  { backgroundColor: selectedUser.isActive ? Colors.success : Colors.error }
                ]}>
                  <Text style={styles.statusBadgeText}>
                    {selectedUser.isActive ? "Activo" : "Inactivo"}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Fecha de registro</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedUser.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Último acceso</Text>
                <Text style={styles.detailValue}>
                  {selectedUser.lastLogin 
                    ? new Date(selectedUser.lastLogin).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })
                    : "Nunca"
                  }
                </Text>
              </View>
            </View>

            {selectedUser.userType === "host" && (
              <View style={styles.userDetailsSection}>
                <Text style={styles.sectionTitle}>🏢 Información del negocio</Text>
                
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Nombre del negocio</Text>
                  <Text style={styles.detailValue}>{selectedUser.businessName}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Calificación</Text>
                  <Text style={styles.detailValue}>{selectedUser.rating?.toFixed(1)} ⭐</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Total eventos</Text>
                  <Text style={styles.detailValue}>{selectedUser.totalEvents}</Text>
                </View>
              </View>
            )}

            {selectedUser.userType === "player" && (
              <View style={styles.userDetailsSection}>
                <Text style={styles.sectionTitle}>⚽ Información del jugador</Text>
                
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Posición preferida</Text>
                  <Text style={styles.detailValue}>{selectedUser.preferredPosition || "No especificada"}</Text>
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => handleUserAction(selectedUser.id, "edit")}
              >
                <Ionicons name="pencil" size={16} color="white" />
                <Text style={styles.actionButtonText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  selectedUser.isActive ? styles.deactivateButton : styles.activateButton
                ]}
                onPress={() => handleUserAction(
                  selectedUser.id, 
                  selectedUser.isActive ? "deactivate" : "activate"
                )}
              >
                <Ionicons 
                  name={selectedUser.isActive ? "pause" : "play"} 
                  size={16} 
                  color="white" 
                />
                <Text style={styles.actionButtonText}>
                  {selectedUser.isActive ? "Desactivar" : "Activar"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleUserAction(selectedUser.id, "delete")}
              >
                <Ionicons name="trash" size={16} color="white" />
                <Text style={styles.actionButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
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

      <LinearGradient
        colors={Gradients.primary}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Usuarios</Text>
            <Text style={styles.headerSubtitle}>
              {filteredUsers.length} de {users.length} usuarios
            </Text>
          </View>

          <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
            <Ionicons name="person-add" size={24} color={Colors.textLight} />
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
        {renderFilters()}
        {renderUsersList()}
      </ScrollView>

      {renderUserModal()}
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
  addButton: {
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
  filtersContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  filterTabs: {
    flexGrow: 0,
  },
  filterTabsContent: {
    gap: 8,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: "white",
  },
  filterTabBadge: {
    backgroundColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  filterTabBadgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  filterTabBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.textMuted,
  },
  filterTabBadgeTextActive: {
    color: "white",
  },
  usersList: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userCardInactive: {
    opacity: 0.6,
  },
  userCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  userInfo: {
    flexDirection: "row",
    flex: 1,
    gap: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  userNameInactive: {
    color: Colors.textMuted,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  userMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userTypeBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  userTypeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  userJoinDate: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  userActions: {
    alignItems: "flex-end",
    gap: 8,
  },
  userStatus: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  userStatusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
  moreButton: {
    padding: 8,
  },
  userExtraInfo: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    gap: 16,
  },
  extraInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  extraInfoText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 40,
  },

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
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  userProfileHeader: {
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 24,
  },
  userProfileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  userProfileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  userProfileEmail: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  userProfileTypeBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  userProfileTypeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  userDetailsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
  },
  statusBadgeModal: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  editButton: {
    backgroundColor: Colors.primary,
  },
  activateButton: {
    backgroundColor: Colors.success,
  },
  deactivateButton: {
    backgroundColor: Colors.warning,
  },
  deleteButton: {
    backgroundColor: Colors.error,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
});

export default AdminUsersScreen;