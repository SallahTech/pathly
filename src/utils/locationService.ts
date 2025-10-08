import * as Location from 'expo-location';
import { Location as ExpoLocation } from 'expo-location';
import { Location as AppLocation } from '../types';

export class LocationService {
  private watchId: Location.LocationSubscription | null = null;
  private isTracking = false;

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return false;
      }
      return true;

      // const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
      // return backgroundStatus.status === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  async checkPermissions(): Promise<boolean> {
    try {
      const foregroundStatus = await Location.getForegroundPermissionsAsync();
      
      // For now, we only need foreground permissions for basic tracking
      // Background permissions are optional and may not be available in Expo Go
      return foregroundStatus.status === 'granted';
    } catch (error) {
      console.error('Error checking location permissions:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<AppLocation | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude || undefined,
        accuracy: location.coords.accuracy || undefined,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  async startTracking(
    onLocationUpdate: (location: AppLocation) => void,
    interval: number = 5000
  ): Promise<void> {
    console.log('LocationService: Starting tracking, current isTracking:', this.isTracking);
    
    if (this.isTracking) {
      console.log('LocationService: Already tracking, returning');
      return;
    }

    this.isTracking = true;
    console.log('LocationService: Set isTracking to true');

    try {
      console.log('LocationService: Calling watchPositionAsync with interval:', interval);
      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: interval,
          distanceInterval: 5, // Update every 5 meters for better tracking
        },
        (location) => {
          console.log('LocationService: Location update received:', location.coords);
          const appLocation: AppLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            altitude: location.coords.altitude || undefined,
            accuracy: location.coords.accuracy || undefined,
            timestamp: location.timestamp,
          };
          console.log('LocationService: Calling onLocationUpdate with:', appLocation);
          onLocationUpdate(appLocation);
        }
      );
      console.log('LocationService: watchPositionAsync started successfully');
    } catch (error) {
      console.error('LocationService: Error starting location tracking:', error);
      this.isTracking = false;
    }
  }

  stopTracking(): void {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
    this.isTracking = false;
  }

  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }
}

export const locationService = new LocationService();
