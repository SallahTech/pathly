import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
// import { MotiView } from 'moti';

import { useJourneyStore } from '../stores/journeyStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useTheme } from '../contexts/ThemeContext';
import { locationService } from '../utils/locationService';
import { voiceService } from '../utils/voiceService';
import { Location, VoiceNote } from '../types';
import { PathlyLogo } from '../components/PathlyLogo';

export default function HomeScreen() {
  const navigation = useNavigation();
  const {
    isTracking,
    currentLocation,
    coordinates,
    distance,
    startTime,
    voiceNotes,
    startJourney,
    stopJourney,
    updateLocation,
    addCoordinate,
    addVoiceNote,
    resetJourney,
    getDuration
  } = useJourneyStore();
  
  const { locationPermissionGranted, trackingInterval } = useSettingsStore();
  const { colors, isDark } = useTheme();
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [duration, setDuration] = useState(0);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  useEffect(() => {
    console.log('useEffect triggered - isTracking:', isTracking, 'locationPermissionGranted:', locationPermissionGranted);
    
    if (isTracking && locationPermissionGranted) {
      console.log('Starting location tracking from useEffect');
      startLocationTracking();
    } else if (!isTracking) {
      console.log('Stopping location tracking from useEffect');
      locationService.stopTracking();
    }
  }, [isTracking, locationPermissionGranted]);

  // Timer effect to update duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTracking) {
      interval = setInterval(() => {
        setDuration(getDuration());
      }, 1000); // Update every second
    } else {
      setDuration(0);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTracking, getDuration]);

  const checkLocationPermission = async () => {
    const hasPermission = await locationService.checkPermissions();
    console.log('Initial permission check:', hasPermission);
    
    if (!hasPermission) {
      const granted = await locationService.requestPermissions();
      console.log('Permission request result:', granted);
      
      // Update the settings store with the permission status
      const { setLocationPermission } = useSettingsStore.getState();
      setLocationPermission(granted);
      
      if (!granted) {
        Alert.alert(
          'Location Permission Required',
          'Pathly needs location access to track your journeys. Please enable location permissions in your device settings.',
          [{ text: 'OK' }]
        );
      }
    } else {
      // Update the settings store with the permission status
      const { setLocationPermission } = useSettingsStore.getState();
      setLocationPermission(true);
    }
  };

  const startLocationTracking = async () => {
    console.log('Starting location tracking with interval:', trackingInterval);
    
    // Check if already tracking to prevent duplicates
    if (locationService.isCurrentlyTracking()) {
      console.log('Location tracking already active, skipping');
      return;
    }
    
    try {
      await locationService.startTracking((location: Location) => {
        console.log('Location update in HomeScreen:', location);
        console.log('Current coordinates count before update:', coordinates.length);
        updateLocation(location);
        addCoordinate(location);
        console.log('Current coordinates count after update:', coordinates.length + 1);
        
        // Update map region to follow user
        setRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }, trackingInterval);
      console.log('Location tracking started successfully');
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      Alert.alert('Error', 'Failed to start location tracking. Please check your location permissions.');
    }
  };

  const handleStartJourney = async () => {
    console.log('Starting journey...');
    console.log('Location permission granted:', locationPermissionGranted);
    
    if (!locationPermissionGranted) {
      const granted = await locationService.requestPermissions();
      console.log('Permission granted after request:', granted);
      
      // Update the settings store with the permission status
      const { setLocationPermission } = useSettingsStore.getState();
      setLocationPermission(granted);
      
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please enable location permissions to start tracking your journey.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    console.log('Calling startJourney...');
    startJourney();
    
    // Check the store state directly instead of component state
    const store = useJourneyStore.getState();
    console.log('Journey started, isTracking from store:', store.isTracking);
    
    // Manually start location tracking since the useEffect might not trigger immediately
    if (store.isTracking && locationPermissionGranted) {
      console.log('Manually starting location tracking after journey start');
      startLocationTracking();
    }
  };

  const handleStopJourney = () => {
    stopJourney();
    locationService.stopTracking();
    
    if (coordinates.length > 0) {
      navigation.navigate('SaveRoute' as never);
    } else {
      Alert.alert(
        'No Journey Data',
        'No location data was recorded. Please try again.',
        [{ text: 'OK' }]
      );
      resetJourney();
    }
  };

  const handleStartVoiceRecording = async () => {
    if (!isTracking) {
      Alert.alert('Error', 'Please start a journey first before recording voice notes.');
      return;
    }

    try {
      const result = await voiceService.startRecording();
      if (result) {
        setIsRecordingVoice(true);
        console.log('Voice recording started');
      } else {
        Alert.alert('Error', 'Failed to start voice recording. Please check microphone permissions.');
      }
    } catch (error) {
      console.error('Error starting voice recording:', error);
      Alert.alert('Error', 'Failed to start voice recording.');
    }
  };

  const handleStopVoiceRecording = async () => {
    try {
      const result = await voiceService.stopRecording();
      if (result) {
        setIsRecordingVoice(false);
        
        // Create voice note object with actual duration
        const voiceNote: VoiceNote = {
          id: Date.now().toString(),
          uri: result.uri,
          duration: result.duration,
          timestamp: Date.now(),
          location: currentLocation,
        };
        
        addVoiceNote(voiceNote);
        console.log('Voice note added:', voiceNote);
      }
    } catch (error) {
      console.error('Error stopping voice recording:', error);
      setIsRecordingVoice(false);
    }
  };

  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  };

  const themedStyles = createThemedStyles(colors);

  return (
    <SafeAreaView style={themedStyles.container}>
      <View style={themedStyles.content}>
        {/* Header */}
        <View style={themedStyles.header}>
          <View style={themedStyles.headerContent}>
            <PathlyLogo size={32} />
            <View style={themedStyles.headerText}>
              <Text style={themedStyles.title}>Pathly</Text>
              <Text style={themedStyles.subtitle}>Don't just go places — remember them.</Text>
            </View>
          </View>
          
          {isTracking && (
            <View style={themedStyles.recordingIndicator}>
              <View style={themedStyles.recordingDot} />
            </View>
          )}
        </View>

        {/* Map */}
        <View style={themedStyles.mapContainer}>
          <MapView
            style={themedStyles.map}
            region={region}
            showsUserLocation={true}
            showsMyLocationButton={false}
            followsUserLocation={isTracking}
            userLocationAnnotationTitle="Your Location"
          >
            {/* Draw path if tracking */}
            {isTracking && coordinates.length > 1 && (
              <Polyline
                coordinates={coordinates}
                strokeColor="#2563EB"
                strokeWidth={4}
                lineCap="round"
                lineJoin="round"
              />
            )}
            
            {/* Markers for start and end points */}
            {coordinates.length > 0 && (
              <Marker
                coordinate={coordinates[0]}
                title="Journey Start"
                pinColor="green"
              />
            )}
            
            {!isTracking && coordinates.length > 0 && (
              <Marker
                coordinate={coordinates[coordinates.length - 1]}
                title="Journey End"
                pinColor="red"
              />
            )}
          </MapView>
        </View>

        {/* Journey Stats */}
        {isTracking && startTime && (
          <View style={themedStyles.statsCard}>
            <View style={themedStyles.statsRow}>
              <View style={themedStyles.statItem}>
                <Text style={themedStyles.statValue}>{formatDuration(duration)}</Text>
                <Text style={themedStyles.statLabel}>Duration</Text>
              </View>
              
              <View style={themedStyles.statItem}>
                <Text style={themedStyles.statValue}>{formatDistance(distance)}</Text>
                <Text style={themedStyles.statLabel}>Distance</Text>
              </View>
              
              <View style={themedStyles.statItem}>
                <Text style={themedStyles.statValue}>{coordinates.length}</Text>
                <Text style={themedStyles.statLabel}>Points</Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={themedStyles.actionContainer}>
          {!isTracking ? (
            <TouchableOpacity
              style={[themedStyles.actionButton, themedStyles.startButton]}
              onPress={handleStartJourney}
            >
              <Ionicons name="play" size={24} color="white" />
              <Text style={themedStyles.buttonText}>Start Journey</Text>
            </TouchableOpacity>
          ) : (
            <View style={themedStyles.journeyActions}>
              <TouchableOpacity
                style={[themedStyles.actionButton, themedStyles.stopButton]}
                onPress={handleStopJourney}
              >
                <Ionicons name="stop" size={24} color="white" />
                <Text style={themedStyles.buttonText}>Stop Journey</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  themedStyles.voiceButton,
                  isRecordingVoice && themedStyles.voiceButtonRecording
                ]}
                onPress={isRecordingVoice ? handleStopVoiceRecording : handleStartVoiceRecording}
              >
                <Ionicons 
                  name={isRecordingVoice ? "stop" : "mic"} 
                  size={20} 
                  color={isRecordingVoice ? "white" : colors.primary} 
                />
                <Text style={[
                  themedStyles.voiceButtonText,
                  isRecordingVoice && themedStyles.voiceButtonTextRecording
                ]}>
                  {isRecordingVoice ? "Stop Recording" : "Voice Note"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
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
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  recordingIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  map: {
    flex: 1,
  },
  statsCard: {
    backgroundColor: colors.card,
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  actionContainer: {
    padding: 16,
    alignItems: 'center',
  },
  journeyActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
  },
  startButton: {
    backgroundColor: colors.primary,
  },
  stopButton: {
    backgroundColor: colors.error,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  voiceButtonRecording: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  voiceButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  voiceButtonTextRecording: {
    color: 'white',
  },
});