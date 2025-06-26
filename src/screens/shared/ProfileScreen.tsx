import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Polygon,
  Line,
  Text as SvgText,
  Circle,
  Path,
  Defs,
  RadialGradient,
  Stop,
} from "react-native-svg";

import { Player, Host, PlayerPosition } from "../../types";
import { Colors, Gradients } from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";
import CustomButton from "../../components/common/CustomButton";

const { width: screenWidth } = Dimensions.get("window");

// Colores grises elegantes
const ImprovedColors = {
  primary: "#3C464F", // Gris principal elegante
  primaryLight: "#5A6B7A",
  primaryDark: "#2A3239",
  secondary: "#8B9CAF", // Gris azulado
  accent: "#7B8FA3", // Gris suave
  background: "#F5F7FA",
  surface: "#FFFFFF",
  textPrimary: "#1A1D23",
  textSecondary: "#4A5568",
  textMuted: "#718096",
  textLight: "#FFFFFF",
  border: "#E2E8F0",
  divider: "#F1F5F9",
  success: "#48BB78",
  warning: "#ED8936",
  error: "#E53E3E",
  gradientStart: "#3C464F",
  gradientEnd: "#5A6B7A",
};

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isLogoutPressed, setIsLogoutPressed] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const handleLogout = () => {
    Alert.alert(
      "🔐 Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar tu sesión?\n\nTus datos estarán seguros y podrás volver cuando quieras.",
      [
        { 
          text: "Cancelar", 
          style: "cancel",
          onPress: () => console.log("Logout cancelado")
        },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: () => {
            console.log("Cerrando sesión...");
            logout();
          },
        },
      ],
      { 
        cancelable: true,
        userInterfaceStyle: 'light'
      }
    );
  };

  const flipCard = () => {
    const toValue = isCardFlipped ? 0 : 1;

    Animated.timing(flipAnimation, {
      toValue,
      duration: 600, 
      useNativeDriver: true,
    }).start();

    setIsCardFlipped(!isCardFlipped);
  };

  const getPositionName = (position: PlayerPosition): string => {
    switch (position) {
      case "goalkeeper":
        return "Arquero";
      case "defender":
        return "Defensa";
      case "midfielder":
        return "Mediocampo";
      case "forward":
        return "Delantero";
      default:
        return position;
    }
  };

  const getPositionAbbr = (position: PlayerPosition): string => {
    switch (position) {
      case "goalkeeper":
        return "ARQ";
      case "defender":
        return "DEF";
      case "midfielder":
        return "MED";
      case "forward":
        return "DEL";
      default:
        return "JUG";
    }
  };

  const getExperienceLevel = (experience: string): string => {
    switch (experience) {
      case "beginner":
        return "Principiante";
      case "intermediate":
        return "Intermedio";
      case "advanced":
        return "Avanzado";
      case "professional":
        return "Profesional";
      default:
        return experience;
    }
  };

  const getOverallRating = (stats: any): number => {
    return Math.round(
      (stats.pace +
        stats.shooting +
        stats.passing +
        stats.dribbling +
        stats.defending +
        stats.physical) /
        6
    );
  };

  const getOverallColor = (rating: number): string => {
    if (rating >= 90) return "#48BB78"; // Verde éxito
    if (rating >= 80) return "#ED8936"; // Naranja/ámbar
    if (rating >= 70) return "#5A6B7A"; // Gris medio
    if (rating >= 60) return "#8B5A3A"; // Bronce
    return "#6B5B73"; // Gris oscuro
  };

  // Componente mejorado para el título de la sección de tarjeta
  const PlayerCardSectionHeader: React.FC = () => {
    return (
      <View style={styles.playerCardSectionHeader}>
        {/* Background decorativo */}
        <LinearGradient
          colors={['rgba(60, 70, 79, 0.1)', 'rgba(60, 70, 79, 0.05)', 'transparent']}
          style={styles.headerBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        {/* Elementos decorativos izquierda */}
        <View style={styles.decorativeLeft}>
          <View style={styles.decorativeDot} />
          <View style={[styles.decorativeDot, styles.decorativeDotSmall]} />
        </View>

        {/* Contenido principal */}
        <View style={styles.headerContent}>
          {/* Icono principal */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[ImprovedColors.primary, ImprovedColors.primaryLight]}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="card" size={24} color="#FFFFFF" />
            </LinearGradient>
          </View>

          {/* Título con gradiente */}
          <View style={styles.titleContainer}>
            <Text style={styles.sectionTitleEnhanced}>Tu Tarjeta de</Text>
            <LinearGradient
              colors={[ImprovedColors.primary, ImprovedColors.primaryLight, ImprovedColors.secondary]}
              style={styles.titleGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.gradientTitle}>JUGADOR</Text>
            </LinearGradient>
            
            {/* Subtítulo */}
            <Text style={styles.subtitle}>Estadísticas profesionales estilo FIFA</Text>
          </View>
        </View>

        {/* Elementos decorativos derecha */}
        <View style={styles.decorativeRight}>
          <View style={styles.decorativeLines}>
            <View style={styles.decorativeLine} />
            <View style={[styles.decorativeLine, styles.decorativeLineShort]} />
            <View style={[styles.decorativeLine, styles.decorativeLineShorter]} />
          </View>
          <Ionicons 
            name="football" 
            size={20} 
            color={ImprovedColors.primary} 
            style={styles.footballIcon}
          />
        </View>

        {/* Efecto de brillo sutil */}
        <LinearGradient
          colors={['transparent', 'rgba(255, 255, 255, 0.1)', 'transparent']}
          style={styles.shineEffect}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </View>
    );
  };

  // Componente de radar chart mejorado
  const RadarChart: React.FC<{ stats: any }> = ({ stats }) => {
    const size = 220;
    const center = size / 2;
    const maxRadius = 80;
    const levels = 5;

    const angles = [0, 60, 120, 180, 240, 300];
    const statNames = ["VEL", "TIR", "PAS", "REG", "DEF", "FIS"];
    const statValues = [
      stats.pace,
      stats.shooting,
      stats.passing,
      stats.dribbling,
      stats.defending,
      stats.physical,
    ];

    const getPoint = (
      angle: number,
      value: number,
      radius: number = maxRadius
    ) => {
      const radian = (angle - 90) * (Math.PI / 180);
      const actualRadius = (value / 100) * radius;
      return {
        x: center + actualRadius * Math.cos(radian),
        y: center + actualRadius * Math.sin(radian),
      };
    };

    const getLevelPoint = (angle: number, level: number) => {
      const radian = (angle - 90) * (Math.PI / 180);
      const levelRadius = (level / levels) * maxRadius;
      return {
        x: center + levelRadius * Math.cos(radian),
        y: center + levelRadius * Math.sin(radian),
      };
    };

    const dataPoints = angles.map((angle, index) =>
      getPoint(angle, statValues[index])
    );
    const dataPath =
      `M ${dataPoints[0].x} ${dataPoints[0].y} ` +
      dataPoints
        .slice(1)
        .map((point) => `L ${point.x} ${point.y}`)
        .join(" ") +
      " Z";

    return (
      <View style={styles.radarContainer}>
        <Svg height={size} width={size}>
          <Defs>
            <RadialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
              <Stop
                offset="0%"
                stopColor={ImprovedColors.primary}
                stopOpacity="0.3"
              />
              <Stop
                offset="100%"
                stopColor={ImprovedColors.primary}
                stopOpacity="0.1"
              />
            </RadialGradient>
          </Defs>

          {/* Líneas de nivel */}
          {Array.from({ length: levels }, (_, i) => {
            const level = i + 1;
            const levelPoints = angles.map((angle) =>
              getLevelPoint(angle, level)
            );
            const levelPath =
              `M ${levelPoints[0].x} ${levelPoints[0].y} ` +
              levelPoints
                .slice(1)
                .map((point) => `L ${point.x} ${point.y}`)
                .join(" ") +
              " Z";

            return (
              <Path
                key={level}
                d={levelPath}
                fill="none"
                stroke={ImprovedColors.border}
                strokeWidth="1"
                opacity={0.3}
              />
            );
          })}

          {/* Líneas radiales */}
          {angles.map((angle, index) => {
            const endPoint = getPoint(angle, 100);
            return (
              <Line
                key={index}
                x1={center}
                y1={center}
                x2={endPoint.x}
                y2={endPoint.y}
                stroke={ImprovedColors.border}
                strokeWidth="1"
                opacity={0.3}
              />
            );
          })}

          {/* Área de datos */}
          <Path
            d={dataPath}
            fill="url(#radarGrad)"
            stroke={ImprovedColors.primary}
            strokeWidth="2"
          />

          {/* Puntos de datos */}
          {dataPoints.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={ImprovedColors.primary}
            />
          ))}

          {/* Labels */}
          {angles.map((angle, index) => {
            const labelPoint = getPoint(angle, 130);
            return (
              <SvgText
                key={index}
                x={labelPoint.x}
                y={labelPoint.y}
                fontSize="12"
                fill={ImprovedColors.textSecondary}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontWeight="600"
              >
                {statNames[index]}
              </SvgText>
            );
          })}
        </Svg>

        <View style={styles.statsValues}>
          {statNames.map((name, index) => (
            <View key={name} style={styles.radarStatValue}>
              <Text style={styles.statValueNumber}>{statValues[index]}</Text>
              <Text style={styles.statValueLabel}>{name}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const FIFAPlayerCard: React.FC<{ player: Player }> = ({ player }) => {
    const overall = getOverallRating(player.stats);
    const cardColor = getOverallColor(overall);

    const frontInterpolate = flipAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "180deg"],
    });

    const backInterpolate = flipAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ["180deg", "360deg"],
    });

    return (
      <View style={styles.fifaCardContainer}>
        <TouchableOpacity onPress={flipCard} activeOpacity={0.9}>
          <View style={styles.cardWrapper}>
            {/* FRONT SIDE */}
            <Animated.View
              style={[
                styles.cardSide,
                {
                  transform: [{ rotateY: frontInterpolate }],
                },
              ]}
            >
              <LinearGradient
                colors={[cardColor, "#2A3239", "#1A1D23"]}
                style={styles.fifaCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Header */}
                <View style={styles.fifaHeader}>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.overallText}>{overall}</Text>
                    <Text style={styles.positionText}>
                      {getPositionAbbr(player.position)}
                    </Text>
                  </View>

                  <View style={styles.playerAvatar}>
                    <Text style={styles.avatarInitials}>
                      {player.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </Text>
                  </View>
                </View>

                {/* Nombre del jugador */}
                <View style={styles.playerNameContainer}>
                  <Text style={styles.playerName} numberOfLines={1}>
                    {player.fullName.toUpperCase()}
                  </Text>
                  <Text style={styles.playerSubInfo}>
                    {getExperienceLevel(player.experience)} •{" "}
                    {player.preferredFoot === "left" ? "Zurdo" : "Diestro"}
                  </Text>
                </View>

                {/* Stats principales */}
                <View style={styles.mainStats}>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{player.stats.pace}</Text>
                      <Text style={styles.statLabel}>VEL</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>
                        {player.stats.shooting}
                      </Text>
                      <Text style={styles.statLabel}>TIR</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>
                        {player.stats.passing}
                      </Text>
                      <Text style={styles.statLabel}>PAS</Text>
                    </View>
                  </View>

                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>
                        {player.stats.dribbling}
                      </Text>
                      <Text style={styles.statLabel}>REG</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>
                        {player.stats.defending}
                      </Text>
                      <Text style={styles.statLabel}>DEF</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>
                        {player.stats.physical}
                      </Text>
                      <Text style={styles.statLabel}>FÍS</Text>
                    </View>
                  </View>
                </View>

                {/* Info física */}
                <View style={styles.physicalInfo}>
                  <Text style={styles.physicalText}>
                    {player.height}cm • {player.weight}kg
                  </Text>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* BACK SIDE */}
            <Animated.View
              style={[
                styles.cardSide,
                {
                  transform: [{ rotateY: backInterpolate }],
                },
              ]}
            >
              <LinearGradient
                colors={["#2A3239", "#1A1D23", cardColor]}
                style={styles.fifaCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.backHeader}>
                  <Text style={styles.backTitle}>ESTADÍSTICAS DETALLADAS</Text>
                  <Text style={styles.backSubtitle} numberOfLines={1}>
                    {player.fullName.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.detailedStats}>
                  <View style={styles.statRow}>
                    <Text style={styles.detailStatLabel}>Velocidad</Text>
                    <View style={styles.statBarContainer}>
                      <View
                        style={[
                          styles.statBar,
                          { width: `${player.stats.pace}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.detailStatValue}>
                      {player.stats.pace}
                    </Text>
                  </View>

                  <View style={styles.statRow}>
                    <Text style={styles.detailStatLabel}>Disparo</Text>
                    <View style={styles.statBarContainer}>
                      <View
                        style={[
                          styles.statBar,
                          { width: `${player.stats.shooting}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.detailStatValue}>
                      {player.stats.shooting}
                    </Text>
                  </View>

                  <View style={styles.statRow}>
                    <Text style={styles.detailStatLabel}>Pase</Text>
                    <View style={styles.statBarContainer}>
                      <View
                        style={[
                          styles.statBar,
                          { width: `${player.stats.passing}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.detailStatValue}>
                      {player.stats.passing}
                    </Text>
                  </View>

                  <View style={styles.statRow}>
                    <Text style={styles.detailStatLabel}>Regate</Text>
                    <View style={styles.statBarContainer}>
                      <View
                        style={[
                          styles.statBar,
                          { width: `${player.stats.dribbling}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.detailStatValue}>
                      {player.stats.dribbling}
                    </Text>
                  </View>

                  <View style={styles.statRow}>
                    <Text style={styles.detailStatLabel}>Defensa</Text>
                    <View style={styles.statBarContainer}>
                      <View
                        style={[
                          styles.statBar,
                          { width: `${player.stats.defending}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.detailStatValue}>
                      {player.stats.defending}
                    </Text>
                  </View>

                  <View style={styles.statRow}>
                    <Text style={styles.detailStatLabel}>Físico</Text>
                    <View style={styles.statBarContainer}>
                      <View
                        style={[
                          styles.statBar,
                          { width: `${player.stats.physical}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.detailStatValue}>
                      {player.stats.physical}
                    </Text>
                  </View>
                </View>

                <View style={styles.backFooter}>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerInfoText} numberOfLines={1}>
                      {getPositionName(player.position)} •{" "}
                      {getExperienceLevel(player.experience)}
                    </Text>
                    <Text style={styles.playerInfoText}>
                      Pie preferido:{" "}
                      {player.preferredFoot === "left" ? "Izquierdo" : "Derecho"}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const StatBar: React.FC<{ label: string; value: number; color: string }> = ({
    label,
    value,
    color,
  }) => (
    <View style={styles.modernStatBar}>
      <View style={styles.statHeader}>
        <Text style={styles.statBarLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <View style={styles.statTrack}>
        <View
          style={[
            styles.statFill,
            { width: `${value}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );

  const ProfileOption: React.FC<{
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showChevron?: boolean;
    rightComponent?: React.ReactNode;
  }> = ({
    icon,
    title,
    subtitle,
    onPress,
    showChevron = true,
    rightComponent,
  }) => (
    <TouchableOpacity
      style={styles.profileOption}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.optionLeft}>
        <View style={styles.optionIcon}>
          <Ionicons name={icon as any} size={20} color={"#ffffff"} />
        </View>
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>{title}</Text>
          {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
        </View>
      </View>

      <View style={styles.optionRight}>
        {rightComponent}
        {showChevron && !rightComponent && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={ImprovedColors.textMuted}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  // Componente mejorado para la sección de logout
  const LogoutSection: React.FC = () => {
    const handlePressIn = () => setIsLogoutPressed(true);
    const handlePressOut = () => setIsLogoutPressed(false);

    return (
      <View style={styles.logoutSection}>
        {/* Header de la sección */}
        <View style={styles.logoutHeader}>
          <View style={styles.logoutHeaderContent}>
            <View style={styles.logoutIconContainer}>
              <Ionicons name="shield-checkmark" size={20} color={ImprovedColors.warning} />
            </View>
            <View>
              <Text style={styles.logoutHeaderTitle}>Zona de Seguridad</Text>
              <Text style={styles.logoutHeaderSubtitle}>Gestiona tu sesión de forma segura</Text>
            </View>
          </View>
        </View>

        {/* Cards de acciones */}
        <View style={styles.securityActions}>
          {/* Configurar PIN */}
          <TouchableOpacity style={styles.securityCard} activeOpacity={0.8}>
            <LinearGradient
              colors={['rgba(72, 187, 120, 0.1)', 'rgba(72, 187, 120, 0.05)']}
              style={styles.securityCardGradient}
            >
              <View style={styles.securityCardIcon}>
                <Ionicons name="lock-closed" size={20} color={ImprovedColors.success} />
              </View>
              <View style={styles.securityCardContent}>
                <Text style={styles.securityCardTitle}>Configurar PIN</Text>
                <Text style={styles.securityCardSubtitle}>Protege tu cuenta con un PIN</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={ImprovedColors.textMuted} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Backup de datos */}
          <TouchableOpacity style={styles.securityCard} activeOpacity={0.8}>
            <LinearGradient
              colors={['rgba(69, 183, 209, 0.1)', 'rgba(69, 183, 209, 0.05)']}
              style={styles.securityCardGradient}
            >
              <View style={[styles.securityCardIcon, { backgroundColor: 'rgba(69, 183, 209, 0.1)' }]}>
                <Ionicons name="cloud-upload" size={20} color="#45B7D1" />
              </View>
              <View style={styles.securityCardContent}>
                <Text style={styles.securityCardTitle}>Respaldar datos</Text>
                <Text style={styles.securityCardSubtitle}>Guarda tu información en la nube</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={ImprovedColors.textMuted} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Botón de logout mejorado */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            isLogoutPressed && styles.logoutButtonPressed
          ]}
          onPress={handleLogout}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <LinearGradient
            colors={isLogoutPressed 
              ? ['#E53E3E', '#C53030', '#9B2C2C'] 
              : ['#E53E3E', '#C53030']
            }
            style={styles.logoutButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Efecto de brillo */}
            <View style={styles.logoutButtonShine} />
            
            {/* Contenido del botón */}
            <View style={styles.logoutButtonContent}>
              <View style={styles.logoutButtonIconContainer}>
                <Ionicons 
                  name="log-out" 
                  size={20} 
                  color="white" 
                  style={styles.logoutButtonIcon}
                />
              </View>
              
              <View style={styles.logoutButtonTextContainer}>
                <Text style={styles.logoutButtonTitle}>Cerrar Sesión</Text>
                <Text style={styles.logoutButtonSubtitle}>Salir de forma segura</Text>
              </View>
              
              <View style={styles.logoutButtonArrow}>
                <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.8)" />
              </View>
            </View>

            {/* Decoración */}
            <View style={styles.logoutButtonDecoration}>
              <View style={styles.decorationDot} />
              <View style={[styles.decorationDot, styles.decorationDotSmall]} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer informativo */}
        <View style={styles.logoutFooter}>
          <View style={styles.footerContent}>
            <Ionicons name="information-circle-outline" size={16} color={ImprovedColors.textMuted} />
            <Text style={styles.footerText}>
              Tu sesión se cerrará automáticamente después de 30 días de inactividad
            </Text>
          </View>
          
          <TouchableOpacity style={styles.footerAction} activeOpacity={0.7}>
            <Text style={styles.footerActionText}>Cambiar configuración</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderPlayerProfile = (player: Player) => (
    <View style={styles.playerProfile}>
      {/* Tarjeta FIFA con header mejorado */}
      <View style={styles.section}>
        <PlayerCardSectionHeader />
        <FIFAPlayerCard player={player} />
      </View>

      {/* Radar Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Análisis de Habilidades</Text>
        <RadarChart stats={player.stats} />
      </View>

      {/* Stats detalladas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estadísticas Detalladas</Text>
        <View style={styles.statsContainer}>
          <StatBar
            label="Velocidad"
            value={player.stats.pace}
            color={ImprovedColors.primary}
          />
          <StatBar
            label="Disparo"
            value={player.stats.shooting}
            color={ImprovedColors.secondary}
          />
          <StatBar
            label="Pase"
            value={player.stats.passing}
            color={ImprovedColors.primary}
          />
          <StatBar
            label="Regate"
            value={player.stats.dribbling}
            color={ImprovedColors.secondary}
          />
          <StatBar
            label="Defensa"
            value={player.stats.defending}
            color={ImprovedColors.primary}
          />
          <StatBar
            label="Físico"
            value={player.stats.physical}
            color={ImprovedColors.secondary}
          />
        </View>
      </View>

      {/* Player Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información deportiva</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Posición</Text>
            <Text style={styles.infoValue}>
              {getPositionName(player.position)}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Experiencia</Text>
            <Text style={styles.infoValue}>
              {getExperienceLevel(player.experience)}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Pie preferido</Text>
            <Text style={styles.infoValue}>
              {player.preferredFoot === "left"
                ? "Izquierdo"
                : player.preferredFoot === "right"
                ? "Derecho"
                : "Ambos"}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Físico</Text>
            <Text style={styles.infoValue}>
              {player.height}cm / {player.weight}kg
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderHostProfile = (host: Host) => (
    <View style={styles.hostProfile}>
      {/* Business Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información del negocio</Text>

        <View style={styles.businessCard}>
          <Text style={styles.businessName}>{host.businessName}</Text>
          <Text style={styles.businessAddress}>{host.address}</Text>
          <Text style={styles.businessDescription}>{host.description}</Text>

          <View style={styles.ratingContainer}>
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color={ImprovedColors.warning} />
              <Text style={styles.ratingText}>{host.rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.reviewsText}>
              ({host.totalReviews} reseñas)
            </Text>
          </View>
        </View>
      </View>

      {/* Fields Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mis canchas</Text>

        <View style={styles.fieldsContainer}>
          {host.fields.map((field, index) => (
            <View key={field.id} style={styles.fieldCard}>
              <Text style={styles.fieldName}>{field.name}</Text>
              <Text style={styles.fieldType}>
                {field.type.replace("futbol", "Fútbol ")}
              </Text>
              <Text style={styles.fieldPrice}>
                ${field.pricePerHour.toLocaleString()}/hora
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={ImprovedColors.background}
        />
        <View style={styles.loadingContainer}>
          <Text>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={ImprovedColors.primary}
      />

      {/* Header mejorado */}
      <LinearGradient
        colors={[ImprovedColors.gradientStart, ImprovedColors.gradientEnd]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.editAvatarButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name="camera"
                size={16}
                color={ImprovedColors.textLight}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.fullName}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.userType}>
              <Ionicons
                name={user.userType === "player" ? "football" : "business"}
                size={14}
                color={ImprovedColors.textLight}
              />
              <Text style={styles.userTypeText}>
                {user.userType === "player" ? "Jugador" : "Anfitrión"}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editButton} activeOpacity={0.7}>
            <Ionicons
              name="pencil"
              size={20}
              color={ImprovedColors.textLight}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Content */}
        {user.userType === "player" && renderPlayerProfile(user as Player)}
        {user.userType === "host" && renderHostProfile(user as Host)}

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>

          <View style={styles.optionsContainer}>
            <ProfileOption
              icon="notifications-outline"
              title="Notificaciones"
              subtitle="Recibe alertas de eventos y mensajes"
              showChevron={false}
              rightComponent={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{
                    false: ImprovedColors.border,
                    true: ImprovedColors.primaryLight,
                  }}
                  thumbColor={
                    notificationsEnabled
                      ? ImprovedColors.primary
                      : ImprovedColors.textMuted
                  }
                />
              }
            />

            <ProfileOption
              icon="location-outline"
              title="Ubicación"
              subtitle="Permite acceso a tu ubicación"
              showChevron={false}
              rightComponent={
                <Switch
                  value={locationEnabled}
                  onValueChange={setLocationEnabled}
                  trackColor={{
                    false: ImprovedColors.border,
                    true: ImprovedColors.primaryLight,
                  }}
                  thumbColor={
                    locationEnabled
                      ? ImprovedColors.primary
                      : ImprovedColors.textMuted
                  }
                />
              }
            />

            <ProfileOption
              icon="shield-checkmark-outline"
              title="Privacidad"
              subtitle="Controla quién puede ver tu información"
              onPress={() =>
                Alert.alert("Privacidad", "Configurar opciones de privacidad")
              }
            />

            <ProfileOption
              icon="help-circle-outline"
              title="Ayuda y soporte"
              subtitle="Encuentra respuestas a tus preguntas"
              onPress={() => Alert.alert("Ayuda", "Centro de ayuda de TUNG")}
            />

            <ProfileOption
              icon="information-circle-outline"
              title="Acerca de TUNG"
              subtitle="Versión 1.0.0"
              onPress={() =>
                Alert.alert(
                  "TUNG",
                  "Versión 1.0.0\nConecta jugadores y canchas"
                )
              }
            />
          </View>
        </View>

        {/* Sección de Logout Mejorada */}
        <LogoutSection />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ImprovedColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 35,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: ImprovedColors.textLight,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: ImprovedColors.textLight,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ImprovedColors.accent,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: ImprovedColors.textLight,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: ImprovedColors.textLight,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: ImprovedColors.textLight,
    opacity: 0.9,
    marginBottom: 4,
  },
  userType: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  userTypeText: {
    fontSize: 14,
    color: ImprovedColors.textLight,
    opacity: 0.9,
  },
  editButton: {
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
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: ImprovedColors.divider,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: ImprovedColors.textPrimary,
    marginBottom: 20,
  },
  playerProfile: {},

  playerCardSectionHeader: {
    top: 10,
    position: 'relative',
    paddingVertical:24,
    paddingHorizontal: 20,
    marginHorizontal: -20,
    marginTop: -24,
    marginBottom: 16,
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  decorativeLeft: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: [{ translateY: -15 }],
  },
  decorativeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ImprovedColors.primary,
    opacity: 0.3,
    marginBottom: 6,
  },
  decorativeDotSmall: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    opacity: 0.2,
  },
  iconContainer: {
    shadowColor: ImprovedColors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  titleContainer: {
    flex: 1,
  },
  sectionTitleEnhanced: {
    fontSize: 16,
    fontWeight: '600',
    color: ImprovedColors.textSecondary,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  titleGradient: {
    alignSelf: 'flex-start',
    paddingHorizontal: 2,
    borderRadius: 4,
  },
  gradientTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 12,
    color: ImprovedColors.textMuted,
    marginTop: 4,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  decorativeRight: {
    alignItems: 'center',
    gap: 8,
  },
  decorativeLines: {
    alignItems: 'flex-end',
    gap: 3,
  },
  decorativeLine: {
    height: 2,
    width: 24,
    backgroundColor: ImprovedColors.primary,
    opacity: 0.3,
    borderRadius: 1,
  },
  decorativeLineShort: {
    width: 18,
    opacity: 0.2,
  },
  decorativeLineShorter: {
    width: 12,
    opacity: 0.1,
  },
  footballIcon: {
    opacity: 0.4,
  },
  shineEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },

  // ESTILOS CORREGIDOS PARA LA TARJETA FIFA
  fifaCardContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  cardWrapper: {
    width: screenWidth - 60,
    height: 380,
  },
  cardSide: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
  },
  cardBack: {},
  fifaCard: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12,
  },
  fifaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  ratingContainer: {
    alignItems: "center",
  },
  overallText: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  positionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    opacity: 0.95,
    marginTop: -4,
    letterSpacing: 1,
  },
  playerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  playerNameContainer: {
    marginBottom: 20,
  },
  playerName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
    lineHeight: 22,
  },
  playerSubInfo: {
    fontSize: 13,
    color: "#FFFFFF",
    opacity: 0.9,
    marginTop: 4,
    fontWeight: "500",
  },
  mainStats: {
    flex: 1,
    justifyContent: "space-around",
    paddingVertical: 0,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 6,
  },
  statItem: {
    alignItems: "center",
    minWidth: 50,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 10,
    color: "#FFFFFF",
    opacity: 0.9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  physicalInfo: {
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  physicalText: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.9,
    fontWeight: "600",
  },
  flipIndicator: {
    position: "absolute",
    bottom: 12,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  flipText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },

  // ESTILOS PARA EL REVERSO DE LA TARJETA
  backHeader: {
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  backTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1,
    textAlign: "center",
  },
  backSubtitle: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.8,
    marginTop: 3,
    fontWeight: "600",
  },
  detailedStats: {
    flex: 1,
    justifyContent: "space-around",
    paddingVertical: 6,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  detailStatLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
    width: 60,
  },
  statBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    marginHorizontal: 10,
    overflow: "hidden",
  },
  statBar: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
  },
  detailStatValue: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "bold",
    width: 25,
    textAlign: "right",
  },
  backFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  playerInfo: {
    alignItems: "center",
  },
  playerInfoText: {
    fontSize: 10,
    color: "#FFFFFF",
    opacity: 0.8,
    textAlign: "center",
    marginVertical: 1,
  },

  // RESTO DE ESTILOS
  radarContainer: {
    alignItems: "center",
    marginVertical: 20,
    backgroundColor: ImprovedColors.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  statsValues: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginTop: 24,
    width: "100%",
  },
  radarStatValue: {
    alignItems: "center",
    width: "30%",
    marginVertical: 8,
  },
  statValueNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: ImprovedColors.primary,
  },
  statValueLabel: {
    fontSize: 12,
    color: ImprovedColors.textMuted,
    marginTop: 4,
    fontWeight: "600",
  },
  statsContainer: {
    gap: 20,
    marginBottom: 20,
  },
  modernStatBar: {
    gap: 12,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statBarLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: ImprovedColors.textPrimary,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: ImprovedColors.primary,
  },
  statTrack: {
    height: 10,
    backgroundColor: ImprovedColors.surface,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: ImprovedColors.border,
  },
  statFill: {
    height: "100%",
    borderRadius: 5,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  infoCard: {
    width: "47%",
    backgroundColor: ImprovedColors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: ImprovedColors.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: ImprovedColors.textMuted,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    color: ImprovedColors.textPrimary,
    fontWeight: "700",
  },
  hostProfile: {},
  businessCard: {
    backgroundColor: ImprovedColors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: ImprovedColors.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  businessName: {
    fontSize: 22,
    fontWeight: "bold",
    color: ImprovedColors.textPrimary,
    marginBottom: 8,
  },
  businessAddress: {
    fontSize: 16,
    color: ImprovedColors.textSecondary,
    marginBottom: 12,
  },
  businessDescription: {
    fontSize: 14,
    color: ImprovedColors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: ImprovedColors.textPrimary,
  },
  reviewsText: {
    fontSize: 14,
    color: ImprovedColors.textMuted,
  },
  fieldsContainer: {
    gap: 16,
  },
  fieldCard: {
    backgroundColor: ImprovedColors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: ImprovedColors.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  fieldName: {
    fontSize: 16,
    fontWeight: "600",
    color: ImprovedColors.textPrimary,
    marginBottom: 4,
  },
  fieldType: {
    fontSize: 14,
    color: ImprovedColors.primary,
    fontWeight: "500",
    marginBottom: 8,
  },
  fieldPrice: {
    fontSize: 14,
    color: ImprovedColors.textSecondary,
  },
  optionsContainer: {
    gap: 0,
  },
  profileOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: ImprovedColors.divider,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ImprovedColors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: ImprovedColors.textPrimary,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: ImprovedColors.textSecondary,
  },
  optionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  // ESTILOS PARA LA SECCIÓN DE LOGOUT MEJORADA
  logoutSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: ImprovedColors.background,
  },
  
  // Header de la sección
  logoutHeader: {
    marginBottom: 20,
  },
  logoutHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(237, 137, 54, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ImprovedColors.textPrimary,
    marginBottom: 2,
  },
  logoutHeaderSubtitle: {
    fontSize: 14,
    color: ImprovedColors.textSecondary,
  },

  // Cards de acciones de seguridad
  securityActions: {
    gap: 12,
    marginBottom: 24,
  },
  securityCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  securityCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: ImprovedColors.surface,
    gap: 12,
  },
  securityCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(72, 187, 120, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityCardContent: {
    flex: 1,
  },
  securityCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ImprovedColors.textPrimary,
    marginBottom: 2,
  },
  securityCardSubtitle: {
    fontSize: 14,
    color: ImprovedColors.textSecondary,
  },

  // Botón de logout principal
  logoutButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#E53E3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    transform: [{ scale: 1 }],
  },
  logoutButtonPressed: {
    transform: [{ scale: 0.98 }],
    elevation: 4,
    shadowOpacity: 0.2,
  },
  logoutButtonGradient: {
    position: 'relative',
    paddingVertical: 20,
    paddingHorizontal: 24,
    minHeight: 80,
    justifyContent: 'center',
  },
  logoutButtonShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoutButtonIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoutButtonIcon: {
    transform: [{ rotate: '0deg' }],
  },
  logoutButtonTextContainer: {
    flex: 1,
  },
  logoutButtonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  logoutButtonSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  logoutButtonArrow: {
    opacity: 0.8,
  },
  logoutButtonDecoration: {
    position: 'absolute',
    right: 16,
    top: 12,
    gap: 4,
  },

  // Footer informativo
  logoutFooter: {
    backgroundColor: ImprovedColors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: ImprovedColors.border,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  footerText: {
    flex: 1,
    fontSize: 13,
    color: ImprovedColors.textMuted,
    lineHeight: 18,
  },
  footerAction: {
    alignSelf: 'flex-start',
  },
  footerActionText: {
    fontSize: 14,
    color: ImprovedColors.primary,
    fontWeight: '600',
  },
});

export default ProfileScreen;