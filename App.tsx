import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppNavigator from './src/navigation/AppNavigator';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { useRoutesStore } from './src/stores/routesStore';
import { useOnboardingStore } from './src/stores/onboardingStore';
import { addDemoRoutes } from './src/utils/demoData';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

function AppContent() {
  const { routes, addRoute } = useRoutesStore();
  const { hasCompletedOnboarding, setOnboardingCompleted } = useOnboardingStore();
  const { isDark } = useTheme();

  useEffect(() => {
    // Add demo routes if no routes exist
    if (routes.length === 0) {
      addDemoRoutes(addRoute);
    }
  }, [routes.length, addRoute]);

  const handleOnboardingComplete = () => {
    setOnboardingCompleted(true);
  };

  if (!hasCompletedOnboarding) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
