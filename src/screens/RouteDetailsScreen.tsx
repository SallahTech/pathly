import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Text,  TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MotiView } from 'moti';
import Slider from '@react-native-community/slider';

import { useRoutesStore } from '../stores/routesStore';
import { useTheme } from '../contexts/ThemeContext';
import { Route, VoiceNote } from '../types';
import { voiceService } from '../utils/voiceService';

export default function RouteDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  const { getRoute, deleteRoute } = useRoutesStore();
  
  const routeId = (route.params as { routeId: string })?.routeId;
  const routeData = getRoute(routeId);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [currentlyPlayingUri, setCurrentlyPlayingUri] = useState<string | null>(null);
  const [playbackPosition, setPlaybackPosition] = useState<number>(0);
  const [playbackDuration, setPlaybackDuration] = useState<number>(0);
  const [isSeeking, setIsSeeking] = useState<boolean>(false);

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

  const handleDeleteRoute = () => {
    Alert.alert(
      'Delete Route',
      `Are you sure you want to delete "${routeData.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteRoute(routeData.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleFollowRoute = () => {
    (navigation as any).navigate('FollowRoute', { routeId: routeData.id });
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

  const formatTimestamp = (timestamp: number) => {
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

  const formatVoiceNoteTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatVoiceNoteDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Track playback state
  useEffect(() => {
    const interval = setInterval(() => {
      const isPlaying = voiceService.isCurrentlyPlaying();
      const currentUri = voiceService.getCurrentPlayingUri();
      const position = voiceService.getPlaybackPosition();
      const duration = voiceService.getPlaybackDuration();
      
      setCurrentlyPlayingUri(isPlaying ? currentUri : null);
      setPlaybackPosition(position);
      setPlaybackDuration(duration);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handlePlayVoiceNote = async (voiceNote: VoiceNote) => {
    try {
      // Reset both UI state and voice service state
      voiceService.resetPlaybackState();
      setPlaybackPosition(0);
      setPlaybackDuration(0);
      
      await voiceService.playRecording(voiceNote.uri);
    } catch (error) {
      console.error('Error playing voice note:', error);
      Alert.alert('Error', 'Failed to play voice note.');
    }
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = async (value: number) => {
    if (!isSeeking) {
      setIsSeeking(true);
      try {
        await voiceService.seekToPosition(value);
      } catch (error) {
        console.error('Error seeking:', error);
      } finally {
        setIsSeeking(false);
      }
    }
  };

  const handleSeekComplete = async (value: number) => {
    try {
      await voiceService.seekToPosition(value);
    } catch (error) {
      console.error('Error seeking to final position:', error);
    }
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
          {/* Route Header */}
          <View style={themedStyles.header}>
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

          {/* Route Image */}
          {routeData.image && (
            <View style={themedStyles.imageCard}>
              <Image source={{ uri: routeData.image }} style={themedStyles.routeImage} />
            </View>
          )}

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
                      title="Journey Start"
                      description={`Started at ${formatTime(routeData.startTime)}`}
                      pinColor="green"
                    />
                    <Marker
                      coordinate={routeData.coordinates[routeData.coordinates.length - 1]}
                      title="Journey End"
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
            <Text style={themedStyles.statsTitle}>Journey Details</Text>
            
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
                  <Text style={themedStyles.statLabel}>Points Recorded</Text>
                </View>
                <Text style={themedStyles.statValue}>
                  {routeData.coordinates.length}
                </Text>
              </View>
              
              <View style={themedStyles.statRow}>
                <View style={themedStyles.statLabelContainer}>
                  <Ionicons name="play" size={20} color="#2563EB" />
                  <Text style={themedStyles.statLabel}>Started</Text>
                </View>
                <Text style={themedStyles.statValue}>
                  {formatTimestamp(routeData.startTime)}
                </Text>
              </View>
              
              <View style={themedStyles.statRow}>
                <View style={themedStyles.statLabelContainer}>
                  <Ionicons name="stop" size={20} color="#2563EB" />
                  <Text style={themedStyles.statLabel}>Ended</Text>
                </View>
                <Text style={themedStyles.statValue}>
                  {formatTimestamp(routeData.endTime)}
                </Text>
              </View>
            </View>
          </View>

          {/* Voice Notes */}
          {routeData.voiceNotes && routeData.voiceNotes.length > 0 && (
            <View style={themedStyles.voiceNotesCard}>
              <Text style={themedStyles.voiceNotesTitle}>Voice Notes</Text>
              
              {routeData.voiceNotes.map((voiceNote, index) => {
                const isCurrentlyPlaying = currentlyPlayingUri === voiceNote.uri;
                const currentPosition = isCurrentlyPlaying ? playbackPosition : 0;
                // Use actual playback duration if playing, otherwise use voice note duration
                const currentDuration = isCurrentlyPlaying && playbackDuration > 0 
                  ? playbackDuration 
                  : (voiceNote.duration || 0) * 1000;
                
                // Debug logging
                if (isCurrentlyPlaying) {
                  console.log('Voice note playback debug:', {
                    uri: voiceNote.uri,
                    position: currentPosition,
                    duration: currentDuration,
                    voiceNoteDuration: voiceNote.duration,
                    playbackDuration,
                    playbackPosition
                  });
                }
                
                return (
                  <View key={voiceNote.id} style={themedStyles.voiceNoteItem}>
                    <View style={themedStyles.voiceNoteHeader}>
                      <View style={themedStyles.voiceNoteInfo}>
                        <Ionicons name="mic" size={16} color="#2563EB" />
                        <Text style={themedStyles.voiceNoteTime}>
                          {formatVoiceNoteTime(voiceNote.timestamp)}
                        </Text>
                        <Text style={themedStyles.voiceNoteDuration}>
                          {formatVoiceNoteDuration(voiceNote.duration)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={themedStyles.playButton}
                        onPress={() => handlePlayVoiceNote(voiceNote)}
                      >
                        <Ionicons 
                          name={isCurrentlyPlaying ? "pause" : "play"} 
                          size={20} 
                          color="white" 
                        />
                      </TouchableOpacity>
                    </View>
                    
                    {/* Seek Bar - always show for voice notes */}
                    <View style={themedStyles.seekContainer}>
                        <Text style={themedStyles.seekTimeText}>
                          {formatTime(currentPosition)}
                        </Text>
                        <Slider
                          style={themedStyles.seekSlider}
                          minimumValue={0}
                          maximumValue={Math.max(currentDuration, 1)} // Ensure minimum of 1 to avoid division by zero
                          value={Math.min(currentPosition, currentDuration)} // Ensure value doesn't exceed duration
                          onValueChange={handleSeek}
                          onSlidingComplete={handleSeekComplete}
                          minimumTrackTintColor="#2563EB"
                          maximumTrackTintColor={colors.border}
                          thumbTintColor="#2563EB"
                        />
                        <Text style={themedStyles.seekTimeText}>
                          {formatTime(currentDuration)}
                        </Text>
                      </View>
                    
                    {voiceNote.location && (
                      <View style={themedStyles.voiceNoteLocation}>
                        <Ionicons name="location" size={12} color={colors.textSecondary} />
                        <Text style={themedStyles.voiceNoteLocationText}>
                          {voiceNote.location.latitude.toFixed(4)}, {voiceNote.location.longitude.toFixed(4)}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Action Buttons */}
          <View style={themedStyles.actionButtons}>
            <TouchableOpacity
              style={themedStyles.followButton}
              onPress={handleFollowRoute}
            >
              <Ionicons name="navigate" size={24} color="white" />
              <Text style={themedStyles.buttonText}>Follow This Route</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={themedStyles.deleteButton}
              onPress={handleDeleteRoute}
            >
              <Ionicons name="trash" size={24} color="white" />
              <Text style={themedStyles.buttonText}>Delete Route</Text>
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
  routeImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
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
  content: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  routeTitle: {
    fontSize: 24,
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
  imageCard: {
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
  actionButtons: {
    padding: 16,
    gap: 12,
  },
  followButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  deleteButton: {
    backgroundColor: colors.error,
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
  voiceNotesCard: {
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
  voiceNotesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  voiceNoteItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  voiceNoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  voiceNoteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceNoteTime: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  voiceNoteDuration: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  playButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceNoteLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voiceNoteLocationText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  seekContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  seekTimeText: {
    fontSize: 11,
    color: colors.textSecondary,
    minWidth: 35,
    textAlign: 'center',
    fontWeight: '500',
  },
  seekSlider: {
    flex: 1,
    height: 30,
    marginHorizontal: 8,
  },
});
