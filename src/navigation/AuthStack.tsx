import React from "react";
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";
import { AuthStackParamList } from "../types";
import WelcomeScreen from "../screens/auth/WelcomeScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import PlayerRegistrationScreen from "../screens/auth/PlayerRegistrationScreen";
import HostRegistrationScreen from "../screens/auth/HostRegistrationScreen";

const Stack = createStackNavigator<AuthStackParamList>();

const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: "horizontal",
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen
        name="PlayerRegistration"
        component={PlayerRegistrationScreen}
      />
      <Stack.Screen
        name="HostRegistration"
        component={HostRegistrationScreen}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
