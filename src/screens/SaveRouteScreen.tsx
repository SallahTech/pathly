import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, Image, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
// import { MotiView } from 'moti';

import { useJourneyStore } from '../stores/journeyStore';
import { useRoutesStore } from '../stores/routesStore';
import { useTheme } from '../contexts/ThemeContext';
import { SuccessAnimation } from '../components/SuccessAnimation';

export default function SaveRouteScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { coordinates, distance, startTime, voiceNotes, resetJourney } = useJourneyStore();
  const { addRoute } = useRoutesStore();
  
  const [routeName, setRouteName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  useEffect(() => {
    // Generate default route name based on date
    const now = new Date();
    const defaultName = `Journey ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    setRouteName(defaultName);
  }, []);

  const handlePickImage = async () => {
    try {
      // Request media library permissions first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Photo Library Permission Required',
          'Pathly needs photo library access to select photos for your routes. Please enable photo library permissions in your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      // Request camera permissions first
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Pathly needs camera access to take photos for your routes. Please enable camera permissions in your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleAnimationComplete = () => {
    setShowSuccessAnimation(false);
    navigation.navigate('Routes' as never);
  };

  const handleSaveRoute = async () => {
    if (!routeName.trim()) {
      Alert.alert('Error', 'Please enter a route name.');
      return;
    }

    if (coordinates.length === 0) {
      Alert.alert('Error', 'No journey data to save.');
      return;
    }

    setIsSaving(true);

    try {
      const endTime = Date.now();
      const duration = startTime ? Math.floor((endTime - startTime) / 1000) : 0;

      addRoute({
        name: routeName.trim(),
        description: description.trim() || undefined,
        image: image || undefined,
        coordinates,
        voiceNotes: voiceNotes.length > 0 ? voiceNotes : undefined,
        startTime: startTime || endTime,
        endTime,
        duration,
        distance,
      });

      // Reset journey state
      resetJourney();

      // Show success animation
      setShowSuccessAnimation(true);
    } catch (error) {
      console.error('Error saving route:', error);
      Alert.alert('Error', 'Failed to save route. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDuration = () => {
    if (!startTime) return '0:00';
    const duration = Date.now() - startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  };

  const getMapRegion = () => {
    if (coordinates.length === 0) {
      return {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    const lats = coordinates.map(c => c.latitude);
    const lngs = coordinates.map(c => c.longitude);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latDelta = (maxLat - minLat) * 1.2;
    const lngDelta = (maxLng - minLng) * 1.2;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    };
  };

  const themedStyles = createThemedStyles(colors);

  return (
    <SafeAreaView style={themedStyles.container}>
      <ScrollView style={themedStyles.scrollView}>
        <View style={themedStyles.content}>
          {/* Route Preview */}
          <View style={themedStyles.routePreviewCard}>
            <View style={themedStyles.mapContainer}>
              <MapView
                style={themedStyles.map}
                region={getMapRegion()}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                {coordinates.length > 1 && (
                  <Polyline
                    coordinates={coordinates}
                    strokeColor="#2563EB"
                    strokeWidth={4}
                    lineCap="round"
                    lineJoin="round"
                  />
                )}
                
                {coordinates.length > 0 && (
                  <>
                    <Marker
                      coordinate={coordinates[0]}
                      title="Start"
                      pinColor="green"
                    />
                    <Marker
                      coordinate={coordinates[coordinates.length - 1]}
                      title="End"
                      pinColor="red"
                    />
                  </>
                )}
              </MapView>
            </View>
            
            <View style={themedStyles.statsContainer}>
              <View style={themedStyles.statsRow}>
                <View style={themedStyles.statItem}>
                  <Text style={themedStyles.statValue}>{formatDistance(distance)}</Text>
                  <Text style={themedStyles.statLabel}>Distance</Text>
                </View>
                
                <View style={themedStyles.statItem}>
                  <Text style={themedStyles.statValue}>{formatDuration()}</Text>
                  <Text style={themedStyles.statLabel}>Duration</Text>
                </View>
                
                <View style={themedStyles.statItem}>
                  <Text style={themedStyles.statValue}>{coordinates.length}</Text>
                  <Text style={themedStyles.statLabel}>Points</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Route Details Form */}
          <View style={themedStyles.formContainer}>
            <View style={themedStyles.inputGroup}>
              <Text style={themedStyles.inputLabel}>Route Name</Text>
              <TextInput
                style={themedStyles.textInput}
                value={routeName}
                onChangeText={setRouteName}
                placeholder="Enter route name"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={themedStyles.inputGroup}>
              <Text style={themedStyles.inputLabel}>Description (Optional)</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Add a description for this route..."
                style={themedStyles.textArea}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={themedStyles.inputGroup}>
              <Text style={themedStyles.inputLabel}>Photo (Optional)</Text>
              
              {image ? (
                <View style={themedStyles.imageCard}>
                  <Image source={{ uri: image }} style={themedStyles.imagePreview} />
                  <View style={themedStyles.imageButtons}>
                    <TouchableOpacity
                      style={themedStyles.removeButton}
                      onPress={() => setImage(null)}
                    >
                      <Ionicons name="trash" size={16} color="white" />
                      <Text style={themedStyles.buttonText}>Remove</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={themedStyles.changeButton}
                      onPress={handlePickImage}
                    >
                      <Ionicons name="camera" size={16} color="white" />
                      <Text style={themedStyles.buttonText}>Change</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={themedStyles.photoButtons}>
                  <TouchableOpacity
                    style={themedStyles.photoButton}
                    onPress={handlePickImage}
                  >
                    <Ionicons name="image" size={20} color="#2563EB" />
                    <Text style={themedStyles.photoButtonText}>Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={themedStyles.photoButton}
                    onPress={handleTakePhoto}
                  >
                    <Ionicons name="camera" size={20} color="#2563EB" />
                    <Text style={themedStyles.photoButtonText}>Camera</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[themedStyles.saveButton, isSaving && themedStyles.saveButtonDisabled]}
            onPress={handleSaveRoute}
            disabled={isSaving}
          >
            {!isSaving && <Ionicons name="save" size={24} color="white" />}
            <Text style={themedStyles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save Route'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <SuccessAnimation 
        visible={showSuccessAnimation} 
        onComplete={handleAnimationComplete} 
      />
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
    height: 200,
  },
  map: {
    flex: 1,
  },
  imagePreview: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  saveButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 16,
  },
  saveButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  routePreviewCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statsContainer: {
    padding: 12,
    backgroundColor: colors.card,
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
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  formContainer: {
    gap: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 16,
    color: colors.text,
  },
  imageCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  removeButton: {
    backgroundColor: colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  changeButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  photoButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  photoButtonText: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});
