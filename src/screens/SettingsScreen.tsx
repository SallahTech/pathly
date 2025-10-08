import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Switch, Linking, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
// import { MotiView } from 'moti';

import { useSettingsStore } from '../stores/settingsStore';
import { useRoutesStore } from '../stores/routesStore';
import { useJourneyStore } from '../stores/journeyStore';
import { useTheme } from '../contexts/ThemeContext';
import { locationService } from '../utils/locationService';
import { PathlyLogo } from '../components/PathlyLogo';

export default function SettingsScreen() {
  const { colors, isDark } = useTheme();
  const { 
    theme, 
    locationPermissionGranted, 
    trackingInterval,
    setTheme, 
    setLocationPermission,
    setTrackingInterval 
  } = useSettingsStore();
  
  const { clearAllRoutes, routes } = useRoutesStore();
  const { resetJourney } = useJourneyStore();
  const [isDarkMode, setIsDarkMode] = useState(isDark);

  useEffect(() => {
    setIsDarkMode(isDark);
  }, [isDark]);

  const handleThemeToggle = (value: boolean) => {
    setIsDarkMode(value);
    setTheme(value ? 'dark' : 'light');
  };

  const handleLocationPermission = async () => {
    try {
      const hasPermission = await locationService.checkPermissions();
      if (hasPermission) {
        Alert.alert(
          'Location Permission',
          'Location permission is already granted.',
          [{ text: 'OK' }]
        );
      } else {
        const granted = await locationService.requestPermissions();
        setLocationPermission(granted);
        
        if (!granted) {
          Alert.alert(
            'Permission Required',
            'Pathly needs location access to track your journeys. You can enable it in your device settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
        }
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      Alert.alert('Error', 'Failed to check location permission.');
    }
  };

  const handleTrackingIntervalChange = (interval: number) => {
    setTrackingInterval(interval);
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your saved routes and cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => {
            clearAllRoutes();
            resetJourney();
            Alert.alert('Success', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Data export feature coming soon! You\'ll be able to backup your routes to the cloud.',
      [{ text: 'OK' }]
    );
  };

  const formatInterval = (ms: number) => {
    const seconds = ms / 1000;
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = seconds / 60;
    return `${minutes}m`;
  };

  const themedStyles = createThemedStyles(colors);

  return (
    <SafeAreaView style={themedStyles.container}>
      <View style={themedStyles.content}>
        {/* Header */}
        <View style={themedStyles.header}>
          <View style={themedStyles.headerContent}>
            <PathlyLogo size={28} />
            <View style={themedStyles.headerText}>
              <Text style={themedStyles.title}>Settings</Text>
              <Text style={themedStyles.subtitle}>
                Customize your Pathly experience
              </Text>
            </View>
          </View>
        </View>

        <View style={themedStyles.settingsContainer}>
          {/* Appearance */}
          <View style={themedStyles.sectionCard}>
            <Text style={themedStyles.sectionTitle}>Appearance</Text>
            
            <View style={themedStyles.settingRow}>
              <View style={themedStyles.settingLabel}>
                <Ionicons name="moon" size={20} color={colors.primary} />
                <Text style={themedStyles.settingText}>Dark Mode</Text>
              </View>
              
              <Switch
                value={isDarkMode}
                onValueChange={handleThemeToggle}
                trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
                thumbColor={isDarkMode ? '#FFFFFF' : '#F4F4F5'}
              />
            </View>
          </View>

          {/* Location Settings */}
          <View style={themedStyles.sectionCard}>
            <Text style={themedStyles.sectionTitle}>Location</Text>
            
            <View style={themedStyles.settingsList}>
              <View style={themedStyles.settingRow}>
                <View style={themedStyles.settingLabel}>
                  <Ionicons name="location" size={20} color={colors.primary} />
                  <Text style={themedStyles.settingText}>Location Permission</Text>
                </View>
                
                <View style={themedStyles.permissionStatus}>
                  <Ionicons 
                    name={locationPermissionGranted ? "checkmark-circle" : "close-circle"} 
                    size={20} 
                    color={locationPermissionGranted ? "#10B981" : "#EF4444"} 
                  />
                  <TouchableOpacity
                    style={[themedStyles.button, locationPermissionGranted ? themedStyles.buttonGranted : themedStyles.buttonRequest]}
                    onPress={handleLocationPermission}
                  >
                    <Text style={themedStyles.buttonText}>
                      {locationPermissionGranted ? 'Granted' : 'Request'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={themedStyles.settingRow}>
                <View style={themedStyles.settingLabel}>
                  <Ionicons name="time" size={20} color={colors.primary} />
                  <Text style={themedStyles.settingText}>Tracking Interval</Text>
                </View>
                
                <View style={themedStyles.intervalButtons}>
                  {[3000, 5000, 10000].map((interval) => (
                    <TouchableOpacity
                      key={interval}
                      style={[
                        themedStyles.intervalButton,
                        trackingInterval === interval ? themedStyles.intervalButtonActive : themedStyles.intervalButtonInactive
                      ]}
                      onPress={() => handleTrackingIntervalChange(interval)}
                    >
                      <Text style={[
                        themedStyles.intervalButtonText,
                        trackingInterval === interval ? themedStyles.intervalButtonTextActive : themedStyles.intervalButtonTextInactive
                      ]}>
                        {formatInterval(interval)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Data Management */}
          <View style={themedStyles.sectionCard}>
            <Text style={themedStyles.sectionTitle}>Data Management</Text>
            
            <View style={themedStyles.settingsList}>
              <View style={themedStyles.settingRow}>
                <View style={themedStyles.settingLabel}>
                  <Ionicons name="download" size={20} color={colors.primary} />
                  <Text style={themedStyles.settingText}>Export Data</Text>
                </View>
                
                <TouchableOpacity
                  style={themedStyles.button}
                  onPress={handleExportData}
                >
                  <Text style={themedStyles.buttonText}>Export</Text>
                </TouchableOpacity>
              </View>
              
              <View style={themedStyles.settingRow}>
                <View style={themedStyles.settingLabel}>
                  <Ionicons name="trash" size={20} color={colors.error} />
                  <Text style={themedStyles.settingText}>Clear All Data</Text>
                </View>
                
                <TouchableOpacity
                  style={[themedStyles.button, themedStyles.clearButton]}
                  onPress={handleClearAllData}
                >
                  <Text style={[themedStyles.buttonText, themedStyles.clearButtonText]}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* App Info */}
          <View style={themedStyles.sectionCard}>
            <Text style={themedStyles.sectionTitle}>About Pathly</Text>
            
            <View style={themedStyles.settingsList}>
              <View style={themedStyles.settingRow}>
                <Text style={themedStyles.settingText}>Version</Text>
                <Text style={themedStyles.settingValue}>1.0.0</Text>
              </View>
              
              <View style={themedStyles.settingRow}>
                <Text style={themedStyles.settingText}>Saved Routes</Text>
                <Text style={themedStyles.settingValue}>{routes.length}</Text>
              </View>
              
              <Text style={themedStyles.tagline}>
                Don't just go places — remember them.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createThemedStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  settingsContainer: {
    padding: 16,
    gap: 16,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  settingsList: {
    gap: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: colors.text,
  },
  settingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  permissionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonGranted: {
    backgroundColor: colors.success,
  },
  buttonRequest: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: colors.error,
  },
  clearButtonText: {
    color: 'white',
  },
  intervalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  intervalButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  intervalButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  intervalButtonInactive: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  intervalButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  intervalButtonTextActive: {
    color: 'white',
  },
  intervalButtonTextInactive: {
    color: colors.textSecondary,
  },
  tagline: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
