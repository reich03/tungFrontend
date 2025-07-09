import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../types";
import AuthStack from "./AuthStack";
import MainTabNavigator from "./MainTabNavigator";
import AdminTabNavigator from "./AdminTabNavigator";
import LoadingScreen from "../components/common/LoadingScreen";

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  const getMainStack = () => {
    if (!user) return null;

    switch (user.userType) {
      case "admin":
        return <Stack.Screen name="AdminStack" component={AdminTabNavigator} />;
      case "player":
      case "host":
      default:
        return <Stack.Screen name="MainStack" component={MainTabNavigator} />;
    }
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        getMainStack()
      ) : (
        <Stack.Screen name="AuthStack" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;