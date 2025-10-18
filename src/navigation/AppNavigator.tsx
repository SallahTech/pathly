import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import RoutesScreen from '../screens/RoutesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import RouteDetailsScreen from '../screens/RouteDetailsScreen';
import SaveRouteScreen from '../screens/SaveRouteScreen';
import FollowRouteScreen from '../screens/FollowRouteScreen';
import RouteFollowingScreen from '../screens/RouteFollowingScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SaveRoute"
        component={SaveRouteScreen}
        options={{
          title: 'Save Route',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.surface,
        }}
      />
    </Stack.Navigator>
  );
}

function RoutesStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="RoutesMain"
        component={RoutesScreen}
        options={{ 
          headerShown: false,
           title: 'My Routes',
            headerTitleStyle: { color: colors.text },
            headerTintColor: colors.text,
          }}
      />
      <Stack.Screen
        name="RouteDetails"
        component={RouteDetailsScreen}
        options={{
          title: 'Route Details',
          headerStyle: { backgroundColor: colors.primary },
          headerTitleStyle: { color: colors.text },
          headerTintColor: colors.text,
        }}
      />
      <Stack.Screen
        name="FollowRoute"
        component={FollowRouteScreen}
        options={{
          title: 'Follow Route',
          headerStyle: { backgroundColor: colors.primary },
          headerTitleStyle: { color: colors.text },
          headerTintColor: colors.text,
        }}
      />
      <Stack.Screen
        name="RouteFollowing"
        component={RouteFollowingScreen}
        options={{
          title: 'Following Route',
          headerStyle: { backgroundColor: colors.primary },
          headerTitleStyle: { color: colors.text },
          headerTintColor: colors.text,
        }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { colors } = useTheme();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Routes') {
              iconName = focused ? 'map' : 'map-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Routes"
          component={RoutesStack}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ headerShown: false }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
