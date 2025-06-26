import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Gradients } from "../../constants/Colors";

const { width } = Dimensions.get("window");

const videoChallenges = [
  {
    id: "v1",
    title: "Reto de Control",
    thumbnail: require("../../../assets/logoDestacado.webp"),
    videoUrl: "https://www.youtube.com/watch?v=abc123",
    difficulty: "Intermedio",
    duration: "5 min",
    reward: "150 XP",
    icon: "football-outline",
    color: "#FF6B6B",
  },
  {
    id: "v2",
    title: "Reto de Pase Largo",
    thumbnail: require("../../../assets/logoDestacado.webp"),
    videoUrl: "https://www.youtube.com/watch?v=def456",
    difficulty: "Avanzado",
    duration: "8 min",
    reward: "250 XP",
    icon: "locate-outline",
    color: "#4ECDC4",
  },
  {
    id: "v3",
    title: "Finalizaciones",
    thumbnail: require("../../../assets/logoDestacado.webp"),
    videoUrl: "https://www.youtube.com/watch?v=ghi789",
    difficulty: "Principiante",
    duration: "3 min",
    reward: "100 XP",
    icon: "trophy-outline",
    color: "#45B7D1",
  },
];

const weeklyChallenges = [
  {
    id: "w1",
    title: "Maestro de la Precisión",
    description: "Anota 5 goles desde fuera del área esta semana",
    progress: 3,
    total: 5,
    reward: "300 XP + Badge",
    timeLeft: "4 días",
    icon: "radio-button-on-outline",
    gradient: ["#FF9A9E", "#FECFEF"],
    completed: false,
  },
  {
    id: "w2",
    title: "Rey de los Pases",
    description: "Completa 30 pases perfectos en tus partidos",
    progress: 18,
    total: 30,
    reward: "200 XP",
    timeLeft: "2 días",
    icon: "arrow-forward-circle-outline",
    gradient: ["#A8EDEA", "#FED6E3"],
    completed: false,
  },
  {
    id: "w3",
    title: "Defensa Inquebrantable",
    description: "Mantén tu portería en cero durante 2 partidos completos",
    progress: 2,
    total: 2,
    reward: "400 XP + Título",
    timeLeft: "Completado",
    icon: "shield-checkmark-outline",
    gradient: ["#D299C2", "#FEF9D7"],
    completed: true,
  },
];

const achievements = [
  {
    id: "a1",
    title: "Primer Gol",
    description: "Anota tu primer gol",
    icon: "trophy",
    color: "#FFD700",
    unlocked: true,
  },
  {
    id: "a2",
    title: "Hat Trick",
    description: "Anota 3 goles en un partido",
    icon: "star",
    color: "#FF6B6B",
    unlocked: true,
  },
  {
    id: "a3",
    title: "Asistente",
    description: "Da 5 asistencias",
    icon: "people",
    color: "#4ECDC4",
    unlocked: false,
  },
  {
    id: "a4",
    title: "Leyenda",
    description: "Gana 10 partidos",
    icon: "medal",
    color: "#45B7D1",
    unlocked: false,
  },
];

const ChallengesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState<
    "challenges" | "videos" | "achievements"
  >("challenges");

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Principiante":
        return "#4CAF50";
      case "Intermedio":
        return "#FF9800";
      case "Avanzado":
        return "#F44336";
      default:
        return Colors.primary;
    }
  };

  const VideoCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.videoCard} activeOpacity={0.8}>
      <View style={styles.videoImageContainer}>
        <Image source={item.thumbnail} style={styles.videoThumbnail} />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.videoOverlay}
        >
          <View style={styles.playButton}>
            <Ionicons name="play" size={20} color="white" />
          </View>
        </LinearGradient>

        <View
          style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(item.difficulty) },
          ]}
        >
          <Text style={styles.difficultyText}>{item.difficulty}</Text>
        </View>
      </View>

      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle}>{item.title}</Text>
        <View style={styles.videoMeta}>
          <View style={styles.metaItem}>
            <Ionicons
              name="time-outline"
              size={12}
              color={Colors.textSecondary}
            />
            <Text style={styles.metaText}>{item.duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="star-outline" size={12} color={Colors.warning} />
            <Text style={styles.metaText}>{item.reward}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const ChallengeCard = ({ item }: { item: any }) => {
    const progressPercentage = (item.progress / item.total) * 100;

    return (
      <View style={styles.challengeCard}>
        <LinearGradient
          colors={item.gradient}
          style={styles.challengeGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.challengeHeader}>
            <View style={styles.challengeIconContainer}>
              <Ionicons name={item.icon as any} size={24} color="white" />
            </View>

            <View style={styles.challengeInfo}>
              <Text style={styles.challengeTitle}>{item.title}</Text>
              <Text style={styles.challengeDescription}>
                {item.description}
              </Text>
            </View>

            {item.completed && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              </View>
            )}
          </View>

          <View style={styles.challengeProgress}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                {item.progress}/{item.total}{" "}
                {item.completed ? "¡Completado!" : ""}
              </Text>
              <Text style={styles.timeLeftText}>{item.timeLeft}</Text>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPercentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressPercentage}>
                {Math.round(progressPercentage)}%
              </Text>
            </View>
          </View>

          <View style={styles.challengeFooter}>
            <View style={styles.rewardContainer}>
              <Ionicons
                name="gift-outline"
                size={16}
                color="rgba(255,255,255,0.8)"
              />
              <Text style={styles.rewardText}>{item.reward}</Text>
            </View>

            <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
              <Text style={styles.actionButtonText}>
                {item.completed ? "Reclamar" : "Ver detalles"}
              </Text>
              <Ionicons name="arrow-forward" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const AchievementCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.achievementCard,
        !item.unlocked && styles.achievementCardLocked,
      ]}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.achievementIcon,
          { backgroundColor: item.unlocked ? item.color : Colors.border },
        ]}
      >
        <Ionicons
          name={item.icon as any}
          size={24}
          color={item.unlocked ? "white" : Colors.textMuted}
        />
      </View>

      <View style={styles.achievementInfo}>
        <Text
          style={[
            styles.achievementTitle,
            !item.unlocked && styles.achievementTitleLocked,
          ]}
        >
          {item.title}
        </Text>
        <Text
          style={[
            styles.achievementDescription,
            !item.unlocked && styles.achievementDescriptionLocked,
          ]}
        >
          {item.description}
        </Text>
      </View>

      {item.unlocked && (
        <View style={styles.unlockedBadge}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
        </View>
      )}
    </TouchableOpacity>
  );

  const TabButton = ({ title, isActive, onPress, icon }: any) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.tabButtonActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons
        name={icon}
        size={20}
        color={isActive ? Colors.primary : Colors.textSecondary}
      />
      <Text
        style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case "videos":
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🎥 Entrena con videos</Text>
              <Text style={styles.sectionSubtitle}>
                Mejora tus habilidades con estos retos prácticos
              </Text>
            </View>

            <FlatList
              data={videoChallenges}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.videoRow}
              renderItem={({ item }) => <VideoCard item={item} />}
              scrollEnabled={false}
            />
          </ScrollView>
        );

      case "achievements":
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🏆 Logros</Text>
              <Text style={styles.sectionSubtitle}>
                Desbloquea insignias y títulos especiales
              </Text>
            </View>

            <View style={styles.achievementsGrid}>
              {achievements.map((item) => (
                <AchievementCard key={item.id} item={item} />
              ))}
            </View>
          </ScrollView>
        );

      default:
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⚡ Retos Semanales</Text>
              <Text style={styles.sectionSubtitle}>
                Mejora tu rendimiento y acumula XP para tus estadísticas
              </Text>
            </View>

            {weeklyChallenges.map((item) => (
              <ChallengeCard key={item.id} item={item} />
            ))}
          </ScrollView>
        );
    }
  };

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
          <View>
            <Text style={styles.headerTitle}>Retos & Desafíos</Text>
            <Text style={styles.headerSubtitle}>Demuestra tu talento</Text>
          </View>

          {/* <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1,250</Text>
              <Text style={styles.statLabel}>XP Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Logros</Text>
            </View>
          </View> */}
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TabButton
          title="Retos"
          icon="flag-outline"
          isActive={selectedTab === "challenges"}
          onPress={() => setSelectedTab("challenges")}
        />
        <TabButton
          title="Videos"
          icon="play-circle-outline"
          isActive={selectedTab === "videos"}
          onPress={() => setSelectedTab("videos")}
        />
        <TabButton
          title="Logros"
          icon="trophy-outline"
          isActive={selectedTab === "achievements"}
          onPress={() => setSelectedTab("achievements")}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>{renderContent()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textLight,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  headerStats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 12,
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textLight,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 8,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginTop: -10,
    borderRadius: 12,
    padding: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: Colors.primaryLight,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  tabButtonTextActive: {
    color: Colors.primary,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  // Challenge Cards
  challengeCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  challengeGradient: {
    padding: 20,
  },
  challengeHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  challengeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  challengeProgress: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  timeLeftText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
    minWidth: 40,
    textAlign: "right",
  },
  challengeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.9)",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },

  // Video Cards
  videoRow: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  videoCard: {
    width: (width - 60) / 2,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  videoImageContainer: {
    position: "relative",
  },
  videoThumbnail: {
    width: "100%",
    height: 100,
  },
  videoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  difficultyBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
  videoInfo: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  videoMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // Achievement Cards
  achievementsGrid: {
    gap: 12,
  },
  achievementCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  achievementCardLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  achievementTitleLocked: {
    color: Colors.textMuted,
  },
  achievementDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  achievementDescriptionLocked: {
    color: Colors.textMuted,
  },
  unlockedBadge: {
    marginLeft: 12,
  },
});

export default ChallengesScreen;
