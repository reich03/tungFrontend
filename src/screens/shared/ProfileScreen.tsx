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

const FootballColors = {
  primary: "#16A34A",
  primaryLight: "#22C55E", 
  primaryDark: "#15803D", 
  secondary: "#059669", 
  accent: "#10B981", 
  background: "#F0FDF4", 
  surface: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#64748B",
  textLight: "#FFFFFF",
  border: "#E2E8F0",
  divider: "#F1F5F9",
  success: "#16A34A",
  warning: "#F59E0B",
  error: "#DC2626",
  gradientStart: "#16A34A",
  gradientEnd: "#22C55E",
  statsBase: "#3B82F6", 
  statsGain: "#16A34A", 
  cardGold: "#F59E0B", 
  cardDiamond: "#8B5CF6",
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

  const getCardType = (rating: number): { color: string; label: string; gradient: string[] } => {
    if (rating >= 95) return {
      color: "#8B5CF6",
      label: "LEGEND",
      gradient: ["#8B5CF6", "#A855F7", "#C084FC"]
    };
    if (rating >= 90) return {
      color: "#F59E0B",
      label: "GOLD",
      gradient: ["#F59E0B", "#FBBF24", "#FCD34D"]
    };
    if (rating >= 85) return {
      color: "#16A34A",
      label: "RARE",
      gradient: ["#16A34A", "#22C55E", "#4ADE80"]
    };
    if (rating >= 80) return {
      color: "#3B82F6",
      label: "BLUE",
      gradient: ["#3B82F6", "#60A5FA", "#93C5FD"]
    };
    return {
      color: "#6B7280",
      label: "BRONZE",
      gradient: ["#6B7280", "#9CA3AF", "#D1D5DB"]
    };
  };

  const getPlayerStatsWithBase = (stats: any) => {
    return {
      pace: { base: Math.max(30, stats.pace - 5), current: stats.pace },
      shooting: { base: Math.max(30, stats.shooting - 3), current: stats.shooting },
      passing: { base: Math.max(30, stats.passing - 4), current: stats.passing },
      dribbling: { base: Math.max(30, stats.dribbling - 6), current: stats.dribbling },
      defending: { base: Math.max(30, stats.defending - 2), current: stats.defending },
      physical: { base: Math.max(30, stats.physical - 4), current: stats.physical },
    };
  };

  const PlayerCardSectionHeader: React.FC = () => {
    return (
      <View style={styles.playerCardSectionHeader}>
        <LinearGradient
          colors={['rgba(22, 163, 74, 0.1)', 'rgba(22, 163, 74, 0.05)', 'transparent']}
          style={styles.headerBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <View style={styles.decorativeLeft}>
          <View style={styles.decorativeDot} />
          <View style={[styles.decorativeDot, styles.decorativeDotSmall]} />
        </View>

        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[FootballColors.primary, FootballColors.primaryLight]}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="football" size={24} color="#FFFFFF" />
            </LinearGradient>
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.sectionTitleEnhanced}>Tu Tarjeta de</Text>
            <LinearGradient
              colors={[FootballColors.primary, FootballColors.primaryLight, FootballColors.secondary]}
              style={styles.titleGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.gradientTitle}>FUTBOLISTA</Text>
            </LinearGradient>

            <Text style={styles.subtitle}>Estadísticas profesionales estilo FIFA Ultimate Team</Text>
          </View>
        </View>

        <View style={styles.decorativeRight}>
          <View style={styles.decorativeLines}>
            <View style={styles.decorativeLine} />
            <View style={[styles.decorativeLine, styles.decorativeLineShort]} />
            <View style={[styles.decorativeLine, styles.decorativeLineShorter]} />
          </View>
          <Ionicons
            name="trophy"
            size={20}
            color={FootballColors.primary}
            style={styles.footballIcon}
          />
        </View>

        <LinearGradient
          colors={['transparent', 'rgba(255, 255, 255, 0.1)', 'transparent']}
          style={styles.shineEffect}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </View>
    );
  };

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
                stopColor={FootballColors.primary}
                stopOpacity="0.3"
              />
              <Stop
                offset="100%"
                stopColor={FootballColors.primary}
                stopOpacity="0.1"
              />
            </RadialGradient>
          </Defs>

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
                stroke={FootballColors.border}
                strokeWidth="1"
                opacity={0.3}
              />
            );
          })}

          {angles.map((angle, index) => {
            const endPoint = getPoint(angle, 100);
            return (
              <Line
                key={index}
                x1={center}
                y1={center}
                x2={endPoint.x}
                y2={endPoint.y}
                stroke={FootballColors.border}
                strokeWidth="1"
                opacity={0.3}
              />
            );
          })}

          <Path
            d={dataPath}
            fill="url(#radarGrad)"
            stroke={FootballColors.primary}
            strokeWidth="2"
          />

          {dataPoints.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={FootballColors.primary}
            />
          ))}

          {angles.map((angle, index) => {
            const labelPoint = getPoint(angle, 130);
            return (
              <SvgText
                key={index}
                x={labelPoint.x}
                y={labelPoint.y}
                fontSize="12"
                fill={FootballColors.textSecondary}
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
    const cardType = getCardType(overall);

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
            <Animated.View
              style={[
                styles.cardSide,
                {
                  transform: [{ rotateY: frontInterpolate }],
                },
              ]}
            >
              <LinearGradient
                colors={cardType.gradient}
                style={styles.fifaCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardPattern}>
                  <View style={styles.patternCircle1} />
                  <View style={styles.patternCircle2} />
                  <View style={styles.patternCircle3} />
                </View>

                <View style={styles.fifaHeader}>
                  <View style={styles.cardTypeContainer}>
                    <Text style={styles.cardTypeText}>{cardType.label}</Text>
                    <View style={styles.cardStars}>
                      {Array.from({ length: Math.floor(overall / 20) + 1 }, (_, i) => (
                        <Ionicons key={i} name="star" size={10} color="rgba(255,255,255,0.9)" />
                      ))}
                    </View>
                  </View>

                  <View style={styles.ratingContainer}>
                    <Text style={styles.overallText}>{overall}</Text>
                    <Text style={styles.positionText}>
                      {getPositionAbbr(player.position)}
                    </Text>
                  </View>

                  <View style={styles.playerAvatar}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                      style={styles.avatarGradient}
                    >
                      <Text style={styles.avatarInitials}>
                        {player.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </Text>
                    </LinearGradient>
                  </View>
                </View>

                <View style={styles.clubLogo}>
                  <View style={styles.logoContainer}>
                    <Ionicons name="shield" size={24} color="rgba(255,255,255,0.8)" />
                  </View>
                  <Text style={styles.clubName}>TUNG FC</Text>
                </View>
                <View style={styles.playerNameContainer}>
                  <Text style={styles.playerName} numberOfLines={1}>
                    {player.fullName.toUpperCase()}
                  </Text>
                  <View style={styles.playerDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="fitness" size={12} color="rgba(255,255,255,0.8)" />
                      <Text style={styles.playerSubInfo}>
                        {getExperienceLevel(player.experience)}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="footsteps" size={12} color="rgba(255,255,255,0.8)" />
                      <Text style={styles.playerSubInfo}>
                        {player.preferredFoot === "left" ? "Zurdo" : "Diestro"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.mainStats}>
                  <View style={styles.statsGrid}>
                    <View style={styles.statPair}>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{player.stats.pace}</Text>
                        <Text style={styles.statLabel}>VEL</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{player.stats.shooting}</Text>
                        <Text style={styles.statLabel}>TIR</Text>
                      </View>
                    </View>

                    <View style={styles.statPair}>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{player.stats.passing}</Text>
                        <Text style={styles.statLabel}>PAS</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{player.stats.dribbling}</Text>
                        <Text style={styles.statLabel}>REG</Text>
                      </View>
                    </View>

                    <View style={styles.statPair}>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{player.stats.defending}</Text>
                        <Text style={styles.statLabel}>DEF</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{player.stats.physical}</Text>
                        <Text style={styles.statLabel}>FÍS</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.physicalInfo}>
                  <View style={styles.physicalStats}>
                    <View style={styles.physicalItem}>
                      <Ionicons name="resize" size={14} color="rgba(255,255,255,0.8)" />
                      <Text style={styles.physicalText}>{player.height}cm</Text>
                    </View>
                    <View style={styles.physicalDivider} />
                    <View style={styles.physicalItem}>
                      <Ionicons name="barbell" size={14} color="rgba(255,255,255,0.8)" />
                      <Text style={styles.physicalText}>{player.weight}kg</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.flipIndicator}>
                  <Ionicons name="sync" size={14} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.flipText}>VOLTEAR</Text>
                </View>
              </LinearGradient>
            </Animated.View>

            <Animated.View
              style={[
                styles.cardSide,
                {
                  transform: [{ rotateY: backInterpolate }],
                },
              ]}
            >
              <LinearGradient
                colors={[...cardType.gradient].reverse()}
                style={styles.fifaCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardPattern}>
                  <View style={styles.patternCircle1} />
                  <View style={styles.patternCircle2} />
                  <View style={styles.patternCircle3} />
                </View>

                <View style={styles.backHeader}>
                  <Text style={styles.backTitle}>ESTADÍSTICAS DETALLADAS</Text>
                  <Text style={styles.backSubtitle} numberOfLines={1}>
                    {player.fullName.toUpperCase()}
                  </Text>
                  <View style={styles.overallBadge}>
                    <Text style={styles.overallBadgeText}>{overall} OVR</Text>
                  </View>
                </View>

                <View style={styles.detailedStats}>
                  <View style={styles.statRow}>
                    <Text style={styles.detailStatLabel}>Velocidad</Text>
                    <View style={styles.statBarContainer}>
                      <View style={[styles.statBar, { width: `${player.stats.pace}%` }]} />
                    </View>
                    <Text style={styles.detailStatValue}>{player.stats.pace}</Text>
                  </View>

                  <View style={styles.statRow}>
                    <Text style={styles.detailStatLabel}>Disparo</Text>
                    <View style={styles.statBarContainer}>
                      <View style={[styles.statBar, { width: `${player.stats.shooting}%` }]} />
                    </View>
                    <Text style={styles.detailStatValue}>{player.stats.shooting}</Text>
                  </View>

                  <View style={styles.statRow}>
                    <Text style={styles.detailStatLabel}>Pase</Text>
                    <View style={styles.statBarContainer}>
                      <View style={[styles.statBar, { width: `${player.stats.passing}%` }]} />
                    </View>
                    <Text style={styles.detailStatValue}>{player.stats.passing}</Text>
                  </View>

                  <View style={styles.statRow}>
                    <Text style={styles.detailStatLabel}>Regate</Text>
                    <View style={styles.statBarContainer}>
                      <View style={[styles.statBar, { width: `${player.stats.dribbling}%` }]} />
                    </View>
                    <Text style={styles.detailStatValue}>{player.stats.dribbling}</Text>
                  </View>

                  <View style={styles.statRow}>
                    <Text style={styles.detailStatLabel}>Defensa</Text>
                    <View style={styles.statBarContainer}>
                      <View style={[styles.statBar, { width: `${player.stats.defending}%` }]} />
                    </View>
                    <Text style={styles.detailStatValue}>{player.stats.defending}</Text>
                  </View>

                  <View style={styles.statRow}>
                    <Text style={styles.detailStatLabel}>Físico</Text>
                    <View style={styles.statBarContainer}>
                      <View style={[styles.statBar, { width: `${player.stats.physical}%` }]} />
                    </View>
                    <Text style={styles.detailStatValue}>{player.stats.physical}</Text>
                  </View>
                </View>

                <View style={styles.backFooter}>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerInfoText} numberOfLines={1}>
                      {getPositionName(player.position)} • {getExperienceLevel(player.experience)}
                    </Text>
                    <Text style={styles.playerInfoText}>
                      Pie preferido: {player.preferredFoot === "left" ? "Izquierdo" : "Derecho"}
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

  const StatBar: React.FC<{ label: string; baseValue: number; currentValue: number }> = ({
    label,
    baseValue,
    currentValue,
  }) => {
    const gainValue = currentValue - baseValue;

    return (
      <View style={styles.modernStatBar}>
        <View style={styles.statHeader}>
          <Text style={styles.statBarLabel}>{label}</Text>
          <View style={styles.statValues}>
            <Text style={styles.statValueBase}>{baseValue}</Text>
            {gainValue > 0 && (
              <>
                <Text style={styles.statValuePlus}>+{gainValue}</Text>
                <Text style={styles.statValueCurrent}> = {currentValue}</Text>
              </>
            )}
          </View>
        </View>
        <View style={styles.statTrack}>
          <View
            style={[
              styles.statFillBase,
              { width: `${baseValue}%` }
            ]}
          />
          {gainValue > 0 && (
            <View
              style={[
                styles.statFillGain,
                {
                  width: `${gainValue}%`,
                  left: `${baseValue}%`
                }
              ]}
            />
          )}
          <View
            style={[
              styles.statIndicator,
              { left: `${currentValue}%` }
            ]}
          />
        </View>
      </View>
    );
  };

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
            color={FootballColors.textMuted}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  const LogoutSection: React.FC = () => {
    const handlePressIn = () => setIsLogoutPressed(true);
    const handlePressOut = () => setIsLogoutPressed(false);

    return (
      <View style={styles.logoutSection}>
        <View style={styles.logoutHeader}>
          <View style={styles.logoutHeaderContent}>
            <View style={styles.logoutIconContainer}>
              <Ionicons name="shield-checkmark" size={20} color={FootballColors.warning} />
            </View>
            <View>
              <Text style={styles.logoutHeaderTitle}>Zona de Seguridad</Text>
              <Text style={styles.logoutHeaderSubtitle}>Gestiona tu sesión de forma segura</Text>
            </View>
          </View>
        </View>

        <View style={styles.securityActions}>
          <TouchableOpacity style={styles.securityCard} activeOpacity={0.8}>
            <LinearGradient
              colors={['rgba(22, 163, 74, 0.1)', 'rgba(22, 163, 74, 0.05)']}
              style={styles.securityCardGradient}
            >
              <View style={styles.securityCardIcon}>
                <Ionicons name="lock-closed" size={20} color={FootballColors.success} />
              </View>
              <View style={styles.securityCardContent}>
                <Text style={styles.securityCardTitle}>Configurar PIN</Text>
                <Text style={styles.securityCardSubtitle}>Protege tu cuenta con un PIN</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={FootballColors.textMuted} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.securityCard} activeOpacity={0.8}>
            <LinearGradient
              colors={['rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0.05)']}
              style={styles.securityCardGradient}
            >
              <View style={[styles.securityCardIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Ionicons name="cloud-upload" size={20} color="#3B82F6" />
              </View>
              <View style={styles.securityCardContent}>
                <Text style={styles.securityCardTitle}>Respaldar datos</Text>
                <Text style={styles.securityCardSubtitle}>Guarda tu información en la nube</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={FootballColors.textMuted} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

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
              ? ['#DC2626', '#B91C1C', '#991B1B']
              : ['#DC2626', '#B91C1C']
            }
            style={styles.logoutButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.logoutButtonShine} />

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

            <View style={styles.logoutButtonDecoration}>
              <View style={styles.decorationDot} />
              <View style={[styles.decorationDot, styles.decorationDotSmall]} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.logoutFooter}>
          <View style={styles.footerContent}>
            <Ionicons name="information-circle-outline" size={16} color={FootballColors.textMuted} />
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

  const renderPlayerProfile = (player: Player) => {
    const playerStatsWithBase = getPlayerStatsWithBase(player.stats);

    return (
      <View style={styles.playerProfile}>
        <View style={styles.section}>
          <PlayerCardSectionHeader />
          <FIFAPlayerCard player={player} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Análisis de Habilidades</Text>
          <RadarChart stats={player.stats} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progreso de Estadísticas</Text>
          <Text style={styles.sectionSubtitle}>
            Azul: Base • Verde: Mejora • Total: Estadística actual
          </Text>
          <View style={styles.statsContainer}>
            <StatBar
              label="Velocidad"
              baseValue={playerStatsWithBase.pace.base}
              currentValue={playerStatsWithBase.pace.current}
            />
            <StatBar
              label="Disparo"
              baseValue={playerStatsWithBase.shooting.base}
              currentValue={playerStatsWithBase.shooting.current}
            />
            <StatBar
              label="Pase"
              baseValue={playerStatsWithBase.passing.base}
              currentValue={playerStatsWithBase.passing.current}
            />
            <StatBar
              label="Regate"
              baseValue={playerStatsWithBase.dribbling.base}
              currentValue={playerStatsWithBase.dribbling.current}
            />
            <StatBar
              label="Defensa"
              baseValue={playerStatsWithBase.defending.base}
              currentValue={playerStatsWithBase.defending.current}
            />
            <StatBar
              label="Físico"
              baseValue={playerStatsWithBase.physical.base}
              currentValue={playerStatsWithBase.physical.current}
            />
          </View>
        </View>

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
  };

  const renderHostProfile = (host: Host) => (
    <View style={styles.hostProfile}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información del negocio</Text>

        <View style={styles.businessCard}>
          <Text style={styles.businessName}>{host.businessName}</Text>
          <Text style={styles.businessAddress}>{host.address}</Text>
          <Text style={styles.businessDescription}>{host.description}</Text>

          <View style={styles.ratingContainer}>
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color={FootballColors.warning} />
              <Text style={styles.ratingText}>{host.rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.reviewsText}>
              ({host.totalReviews} reseñas)
            </Text>
          </View>
        </View>
      </View>

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
          backgroundColor={FootballColors.background}
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
        backgroundColor={FootballColors.primary}
      />

      <LinearGradient
        colors={[FootballColors.gradientStart, FootballColors.gradientEnd]}
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
                color={FootballColors.textLight}
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
                color={FootballColors.textLight}
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
              color={FootballColors.textLight}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {user.userType === "player" && renderPlayerProfile(user as Player)}
        {user.userType === "host" && renderHostProfile(user as Host)}

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
                    false: FootballColors.border,
                    true: FootballColors.primaryLight,
                  }}
                  thumbColor={
                    notificationsEnabled
                      ? FootballColors.primary
                      : FootballColors.textMuted
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
                    false: FootballColors.border,
                    true: FootballColors.primaryLight,
                  }}
                  thumbColor={
                    locationEnabled
                      ? FootballColors.primary
                      : FootballColors.textMuted
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

        <LogoutSection />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FootballColors.background,
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
    borderColor: FootballColors.textLight,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: FootballColors.textLight,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: FootballColors.accent,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: FootballColors.textLight,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: FootballColors.textLight,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: FootballColors.textLight,
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
    color: FootballColors.textLight,
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
    borderBottomColor: FootballColors.divider,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: FootballColors.textPrimary,
    marginBottom: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: FootballColors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  playerProfile: {},

  playerCardSectionHeader: {
    position: 'relative',
    paddingVertical: 24,
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
    backgroundColor: FootballColors.primary,
    opacity: 0.3,
    marginBottom: 6,
  },
  decorativeDotSmall: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    opacity: 0.2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    shadowColor: FootballColors.primary,
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
    color: FootballColors.textSecondary,
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
    color: FootballColors.textMuted,
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
    backgroundColor: FootballColors.primary,
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

  fifaCardContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  cardWrapper: {
    width: screenWidth - 60,
    height: 420,
  },
  cardSide: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
  },
  fifaCard: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
  },
  cardPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  patternCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -50,
    right: -50,
  },
  patternCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -20,
    left: -20,
  },
  patternCircle3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: 150,
    left: 50,
  },
  fifaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    zIndex: 1,
  },
  cardTypeContainer: {
    alignItems: 'center',
  },
  cardTypeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1.5,
    opacity: 0.9,
  },
  cardStars: {
    flexDirection: 'row',
    marginTop: 2,
    gap: 1,
  },
  ratingContainer: {
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  overallText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  positionText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
    opacity: 0.95,
    marginTop: -2,
    letterSpacing: 1,
  },
  playerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  clubLogo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  clubName: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
  },
  playerNameContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  playerName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  playerDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playerSubInfo: {
    fontSize: 10,
    color: "#FFFFFF",
    opacity: 0.8,
    fontWeight: "600",
  },
  mainStats: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 8,
  },
  statsGrid: {
    gap: 12,
  },
  statPair: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 60,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    color: "#FFFFFF",
    opacity: 0.9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  physicalInfo: {
    alignItems: "center",
    marginTop: 8,
  },
  physicalStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  physicalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  physicalDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 12,
  },
  physicalText: {
    fontSize: 11,
    color: "#FFFFFF",
    opacity: 0.9,
    fontWeight: "700",
  },
  flipIndicator: {
    position: "absolute",
    bottom: 16,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  flipText: {
    fontSize: 9,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  // ESTILOS PARA EL REVERSO DE LA TARJETA
  backHeader: {
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  backTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1.5,
    textAlign: "center",
    marginBottom: 6,
  },
  backSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
    fontWeight: "700",
    marginBottom: 8,
  },
  overallBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  overallBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  detailedStats: {
    flex: 1,
    justifyContent: "space-around",
    paddingVertical: 8,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: 8,
  },
  detailStatLabel: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "700",
    width: 60,
  },
  statBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: "hidden",
  },
  statBar: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  detailStatValue: {
    fontSize: 11,
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

  radarContainer: {
    alignItems: "center",
    marginVertical: 20,
    backgroundColor: FootballColors.surface,
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
    color: FootballColors.primary,
  },
  statValueLabel: {
    fontSize: 12,
    color: FootballColors.textMuted,
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
    color: FootballColors.textPrimary,
  },
  statValues: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statValueBase: {
    fontSize: 16,
    fontWeight: "600",
    color: FootballColors.statsBase,
  },
  statValuePlus: {
    fontSize: 14,
    fontWeight: "700",
    color: FootballColors.statsGain,
  },
  statValueCurrent: {
    fontSize: 16,
    fontWeight: "bold",
    color: FootballColors.textPrimary,
  },
  statTrack: {
    height: 12,
    backgroundColor: FootballColors.surface,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: FootballColors.border,
    position: 'relative',
  },
  statFillBase: {
    position: 'absolute',
    height: "100%",
    backgroundColor: FootballColors.statsBase,
    borderRadius: 5,
    left: 0,
    top: 0,
  },
  statFillGain: {
    position: 'absolute',
    height: "100%",
    backgroundColor: FootballColors.statsGain,
    borderRadius: 5,
    top: 0,
  },
  statIndicator: {
    position: 'absolute',
    width: 3,
    height: '100%',
    backgroundColor: FootballColors.textPrimary,
    top: 0,
    borderRadius: 2,
  },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  infoCard: {
    width: "47%",
    backgroundColor: FootballColors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: FootballColors.border,
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
    color: FootballColors.textMuted,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    color: FootballColors.textPrimary,
    fontWeight: "700",
  },

  // HOST PROFILE
  hostProfile: {},
  businessCard: {
    backgroundColor: FootballColors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: FootballColors.border,
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
    color: FootballColors.textPrimary,
    marginBottom: 8,
  },
  businessAddress: {
    fontSize: 16,
    color: FootballColors.textSecondary,
    marginBottom: 12,
  },
  businessDescription: {
    fontSize: 14,
    color: FootballColors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: FootballColors.textPrimary,
  },
  reviewsText: {
    fontSize: 14,
    color: FootballColors.textMuted,
  },
  fieldsContainer: {
    gap: 16,
  },
  fieldCard: {
    backgroundColor: FootballColors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: FootballColors.border,
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
    color: FootballColors.textPrimary,
    marginBottom: 4,
  },
  fieldType: {
    fontSize: 14,
    color: FootballColors.primary,
    fontWeight: "500",
    marginBottom: 8,
  },
  fieldPrice: {
    fontSize: 14,
    color: FootballColors.textSecondary,
  },

  // PROFILE OPTIONS
  optionsContainer: {
    gap: 0,
  },
  profileOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: FootballColors.divider,
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
    backgroundColor: FootballColors.primaryLight,
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
    color: FootballColors.textPrimary,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: FootballColors.textSecondary,
  },
  optionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  // LOGOUT SECTION
  logoutSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: FootballColors.background,
  },
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
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FootballColors.textPrimary,
    marginBottom: 2,
  },
  logoutHeaderSubtitle: {
    fontSize: 14,
    color: FootballColors.textSecondary,
  },
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
    backgroundColor: FootballColors.surface,
    gap: 12,
  },
  securityCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityCardContent: {
    flex: 1,
  },
  securityCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: FootballColors.textPrimary,
    marginBottom: 2,
  },
  securityCardSubtitle: {
    fontSize: 14,
    color: FootballColors.textSecondary,
  },
  logoutButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#DC2626',
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
  decorationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoutFooter: {
    backgroundColor: FootballColors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: FootballColors.border,
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
    color: FootballColors.textMuted,
    lineHeight: 18,
  },
  footerAction: {
    alignSelf: 'flex-start',
  },
  footerActionText: {
    fontSize: 14,
    color: FootballColors.primary,
    fontWeight: '600',
  },
});

export default ProfileScreen;