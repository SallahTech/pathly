import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useRoutesStore } from '../stores/routesStore';
import { useTheme } from '../contexts/ThemeContext';
import { Route, Location } from '../types';
import { routeFollowingService, RouteProgress } from '../utils/routeFollowingService';
import { locationService } from '../utils/locationService';

export default function RouteFollowingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  const { getRoute } = useRoutesStore();
  
  const routeId = (route.params as { routeId: string })?.routeId;
  const routeData = getRoute(routeId);
  
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [progress, setProgress] = useState<RouteProgress | null>(null);
  const [guidance, setGuidance] = useState<string>('Starting route following...');

  const themedStyles = createThemedStyles(colors);

  useEffect(() => {
    if (!routeData) {
      Alert.alert('Error', 'Route not found');
      navigation.goBack();
      return;
    }

    // Start route following
    routeFollowingService.startFollowing(routeData.id, routeData.coordinates);
    
    // Set up event listeners
    routeFollowingService.setOnProgressUpdate((newProgress) => {
      setProgress(newProgress);
    });

    routeFollowingService.setOnGuidanceUpdate((newGuidance) => {
      setGuidance(newGuidance);
    });

    routeFollowingService.setOnRouteComplete(() => {
      Alert.alert(
        'Route Completed!',
        'Congratulations! You have successfully completed the route.',
        [
          {
            text: 'OK',
            onPress: () => {
              (navigation as any).goBack();
              (navigation as any).goBack();
            },
          },
        ]
      );
    });

    // Start location tracking
    startLocationTracking();

    return () => {
      routeFollowingService.stopFollowing();
      locationService.stopTracking();
    };
  }, [routeData, navigation]);

  const startLocationTracking = async () => {
    try {
      const hasPermission = await locationService.checkPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Location permission is required for route following.');
        navigation.goBack();
        return;
      }

      await locationService.startTracking((location) => {
        setCurrentLocation(location);
        routeFollowingService.updateLocation(location);
      }, 2000); // Update every 2 seconds
    } catch (error) {
      console.error('Error starting location tracking:', error);
      Alert.alert('Error', 'Failed to start location tracking.');
    }
  };

  const handleStopFollowing = () => {
    Alert.alert(
      'Stop Following Route',
      'Are you sure you want to stop following this route?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: () => {
            routeFollowingService.stopFollowing();
            // Go back to Routes screen
            (navigation as any).goBack();
            (navigation as any).goBack();
          },
        },
      ]
    );
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const getMapRegion = () => {
    if (!currentLocation || !routeData) {
      return {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    return {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  };

  if (!routeData) {
    return (
      <SafeAreaView style={themedStyles.container}>
        <View style={themedStyles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={themedStyles.errorTitle}>Route Not Found</Text>
          <TouchableOpacity
            style={themedStyles.errorButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={themedStyles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={themedStyles.container}>
      {/* Header */}
      <View style={themedStyles.header}>
        <TouchableOpacity
          style={themedStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={themedStyles.headerTitle}>Following Route</Text>
        <TouchableOpacity
          style={themedStyles.stopButton}
          onPress={handleStopFollowing}
        >
          <Ionicons name="stop" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>

      {/* Guidance */}
      <View style={themedStyles.guidanceCard}>
        <Ionicons name="navigate" size={24} color="#2563EB" />
        <Text style={themedStyles.guidanceText}>{guidance}</Text>
      </View>

      {/* Progress */}
      {progress && (
        <View style={themedStyles.progressCard}>
          <Text style={themedStyles.progressTitle}>Progress</Text>
          <View style={themedStyles.progressBar}>
            <View 
              style={[
                themedStyles.progressFill, 
                { width: `${progress.progressPercentage}%` }
              ]} 
            />
          </View>
          <Text style={themedStyles.progressText}>
            {Math.round(progress.progressPercentage)}% Complete
          </Text>
          
          <View style={themedStyles.statsContainer}>
            <View style={themedStyles.statItem}>
              <Ionicons name="location" size={16} color="#2563EB" />
              <Text style={themedStyles.statLabel}>Distance to Next</Text>
              <Text style={themedStyles.statValue}>
                {formatDistance(progress.distanceToNext)}
              </Text>
            </View>
            
            <View style={themedStyles.statItem}>
              <Ionicons name="flag" size={16} color="#2563EB" />
              <Text style={themedStyles.statLabel}>Remaining</Text>
              <Text style={themedStyles.statValue}>
                {formatDistance(progress.distanceRemaining)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Map */}
      <View style={themedStyles.mapContainer}>
        <MapView
          style={themedStyles.map}
          region={getMapRegion()}
          showsUserLocation={true}
          showsMyLocationButton={false}
          followsUserLocation={true}
        >
          {/* Route Path */}
          {routeData.coordinates.length > 1 && (
            <Polyline
              coordinates={routeData.coordinates}
              strokeColor="#2563EB"
              strokeWidth={4}
              lineCap="round"
              lineJoin="round"
            />
          )}
          
          {/* Start Marker */}
          {routeData.coordinates.length > 0 && (
            <Marker
              coordinate={routeData.coordinates[0]}
              title="Route Start"
              pinColor="green"
            />
          )}
          
          {/* End Marker */}
          {routeData.coordinates.length > 1 && (
            <Marker
              coordinate={routeData.coordinates[routeData.coordinates.length - 1]}
              title="Route End"
              pinColor="red"
            />
          )}
        </MapView>
      </View>
    </SafeAreaView>
  );
}

const createThemedStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  stopButton: {
    padding: 8,
  },
  guidanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  guidanceText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  progressCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 2,
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  map: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
