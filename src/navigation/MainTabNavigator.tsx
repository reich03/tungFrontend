import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { MainTabParamList, HomeStackParamList } from "../types";
import { Colors } from "../constants/Colors";

import HomeScreen from "../screens/player/HomeScreen";
import EventsScreen from "../screens/shared/EventsScreen";
import ProfileScreen from "../screens/shared/ProfileScreen";
import HostDashboardScreen from "../screens/host/HostDashboardScreen";
import EventDetailsScreen from "../screens/shared/EventDetailsScreen";
import JoinEventScreen from "../screens/player/JoinEventScreen";
import ChallengesScreen from "../screens/player/ChallengesScreen";
import PlayerEventsScreen from "@/screens/player/PlayerEvents";
const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();

const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="MapView" component={HomeScreen} />
      <HomeStack.Screen name="EventDetails" component={EventDetailsScreen} />
      <HomeStack.Screen name="JoinEvent" component={JoinEventScreen} />
    </HomeStack.Navigator>
  );
};

const MainTabNavigator: React.FC = () => {
  const { user } = useAuth();
  
  const isHost = user?.userType === "host" || user?.rolNombre === "ANFITRION";
  const isPlayer = user?.userType === "player" || user?.rolNombre === "JUGADOR";

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case "Home":
              iconName = focused ? "map" : "map-outline";
              break;
            case "Events":
              iconName = focused ? "football" : "football-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
            case "HostDashboard":
              iconName = focused ? "business" : "business-outline";
              break;
            case "Challenges":
              iconName = focused ? "trophy" : "trophy-outline";
              break;
            default:
              iconName = "help-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: "Mapa",
        }}
      />

      <Tab.Screen
        name="Events"
        component={PlayerEventsScreen}
        options={{
          tabBarLabel: "Eventos",
        }}
      />

      {isHost && (
        <Tab.Screen
          name="HostDashboard"
          component={HostDashboardScreen}
          options={{
            tabBarLabel: "Mi Negocio",
          }}
        />
      )}

      {isPlayer && (
        <Tab.Screen
          name="Challenges"
          component={ChallengesScreen}
          options={{
            tabBarLabel: "Retos",
          }}
        />
      )}

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Perfil",
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;