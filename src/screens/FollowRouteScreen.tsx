import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useRoutesStore } from '../stores/routesStore';
import { useTheme } from '../contexts/ThemeContext';
import { Route } from '../types';

export default function FollowRouteScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  const { getRoute } = useRoutesStore();
  
  const routeId = (route.params as { routeId: string })?.routeId;
  const routeData = getRoute(routeId);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');

  const themedStyles = createThemedStyles(colors);

  if (!routeData) {
    return (
      <SafeAreaView style={themedStyles.container}>
        <View style={themedStyles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={themedStyles.errorTitle}>Route Not Found</Text>
          <Text style={themedStyles.errorSubtitle}>
            This route may have been deleted or doesn't exist.
          </Text>
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

  const handleStartFollowing = () => {
    Alert.alert(
      'Start Following Route',
      `Ready to follow "${routeData.name}"? This will start route following with turn-by-turn guidance.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Following',
          onPress: () => {
            (navigation as any).navigate('RouteFollowing', { routeId: routeData.id });
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  };

  const getMapRegion = () => {
    if (routeData.coordinates.length === 0) {
      return {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    const lats = routeData.coordinates.map(c => c.latitude);
    const lngs = routeData.coordinates.map(c => c.longitude);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latDelta = Math.max((maxLat - minLat) * 1.2, 0.01);
    const lngDelta = Math.max((maxLng - minLng) * 1.2, 0.01);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  };

  return (
    <SafeAreaView style={themedStyles.container}>
      <ScrollView style={themedStyles.scrollView}>
        <View style={themedStyles.content}>
          {/* Header */}
          <View style={themedStyles.header}>
            <TouchableOpacity
              style={themedStyles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={themedStyles.headerTitle}>Follow Route</Text>
            <View style={themedStyles.placeholder} />
          </View>

          {/* Route Info */}
          <View style={themedStyles.routeCard}>
            <Text style={themedStyles.routeTitle}>{routeData.name}</Text>
            {routeData.description && (
              <Text style={themedStyles.routeDescription}>
                {routeData.description}
              </Text>
            )}
            <Text style={themedStyles.routeDate}>
              {formatDate(routeData.createdAt)}
            </Text>
          </View>

          {/* Map */}
          <View style={themedStyles.mapCard}>
            <View style={themedStyles.mapContainer}>
              <MapView
                style={themedStyles.map}
                region={getMapRegion()}
                mapType={mapType}
                showsUserLocation={false}
                showsMyLocationButton={false}
              >
                {routeData.coordinates.length > 1 && (
                  <Polyline
                    coordinates={routeData.coordinates}
                    strokeColor="#2563EB"
                    strokeWidth={4}
                    lineCap="round"
                    lineJoin="round"
                  />
                )}
                
                {routeData.coordinates.length > 0 && (
                  <>
                    <Marker
                      coordinate={routeData.coordinates[0]}
                      title="Route Start"
                      description={`Started at ${formatTime(routeData.startTime)}`}
                      pinColor="green"
                    />
                    <Marker
                      coordinate={routeData.coordinates[routeData.coordinates.length - 1]}
                      title="Route End"
                      description={`Ended at ${formatTime(routeData.endTime)}`}
                      pinColor="red"
                    />
                  </>
                )}
              </MapView>
              
              {/* Map Type Toggle */}
              <View style={themedStyles.mapControls}>
                <TouchableOpacity
                  style={themedStyles.mapToggleButton}
                  onPress={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}
                >
                  <Ionicons name="map" size={16} color="#2563EB" />
                  <Text style={themedStyles.mapToggleText}>
                    {mapType === 'standard' ? 'Satellite' : 'Standard'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Route Stats */}
          <View style={themedStyles.statsCard}>
            <Text style={themedStyles.statsTitle}>Route Information</Text>
            
            <View style={themedStyles.statsContainer}>
              <View style={themedStyles.statRow}>
                <View style={themedStyles.statLabelContainer}>
                  <Ionicons name="time" size={20} color="#2563EB" />
                  <Text style={themedStyles.statLabel}>Duration</Text>
                </View>
                <Text style={themedStyles.statValue}>
                  {formatDuration(routeData.duration)}
                </Text>
              </View>
              
              <View style={themedStyles.statRow}>
                <View style={themedStyles.statLabelContainer}>
                  <Ionicons name="location" size={20} color="#2563EB" />
                  <Text style={themedStyles.statLabel}>Distance</Text>
                </View>
                <Text style={themedStyles.statValue}>
                  {formatDistance(routeData.distance || 0)}
                </Text>
              </View>
              
              <View style={themedStyles.statRow}>
                <View style={themedStyles.statLabelContainer}>
                  <Ionicons name="navigate" size={20} color="#2563EB" />
                  <Text style={themedStyles.statLabel}>Points</Text>
                </View>
                <Text style={themedStyles.statValue}>
                  {routeData.coordinates.length}
                </Text>
              </View>
            </View>
          </View>

          {/* Instructions */}
          <View style={themedStyles.instructionsCard}>
            <Text style={themedStyles.instructionsTitle}>How to Follow This Route</Text>
            <Text style={themedStyles.instructionsText}>
              1. Make sure you're at the starting point of the route{'\n'}
              2. Tap "Start Following" when you're ready{'\n'}
              3. Follow the path and voice guidance{'\n'}
              4. The app will track your progress along the route
            </Text>
          </View>

          {/* Start Button */}
          <View style={themedStyles.actionButtons}>
            <TouchableOpacity
              style={themedStyles.startFollowingButton}
              onPress={handleStartFollowing}
            >
              <Ionicons name="navigate" size={24} color="white" />
              <Text style={themedStyles.buttonText}>Start Following</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createThemedStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 1,
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
  placeholder: {
    width: 40,
  },
  routeCard: {
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
  routeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  routeDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  routeDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  mapCard: {
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
  mapContainer: {
    height: 300,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapControls: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  mapToggleButton: {
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  mapToggleText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  statsCard: {
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
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  statsContainer: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 16,
    color: colors.text,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  instructionsCard: {
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
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  actionButtons: {
    padding: 16,
  },
  startFollowingButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
  errorSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
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
