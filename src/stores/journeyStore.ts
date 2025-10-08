import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JourneyState, Location, VoiceNote } from '../types';

interface JourneyStore extends JourneyState {
  voiceNotes: VoiceNote[];
  startJourney: () => void;
  stopJourney: () => void;
  updateLocation: (location: Location) => void;
  addCoordinate: (coordinate: Location) => void;
  addVoiceNote: (voiceNote: VoiceNote) => void;
  resetJourney: () => void;
  getDuration: () => number;
}

export const useJourneyStore = create<JourneyStore>()(
  persist(
    (set, get) => ({
      isTracking: false,
      coordinates: [],
      distance: 0,
      currentLocation: undefined,
      startTime: undefined,
      voiceNotes: [],

      startJourney: () => {
        console.log('Journey store: Starting journey');
        set({
          isTracking: true,
          coordinates: [],
          distance: 0,
          startTime: Date.now(),
          voiceNotes: [],
        });
        console.log('Journey store: Journey started, isTracking set to true');
      },

      stopJourney: () => {
        set({
          isTracking: false,
        });
      },

      updateLocation: (location: Location) => {
        set({ currentLocation: location });
      },

      addCoordinate: (coordinate: Location) => {
        console.log('Journey store: Adding coordinate:', coordinate);
        const { coordinates, distance } = get();
        const newCoordinates = [...coordinates, coordinate];
        console.log('Journey store: Previous coordinates count:', coordinates.length, 'New count:', newCoordinates.length);
        
        // Calculate distance if we have previous coordinates
        let newDistance = distance;
        if (coordinates.length > 0) {
          const lastCoordinate = coordinates[coordinates.length - 1];
          const distanceDelta = calculateDistance(
            lastCoordinate.latitude,
            lastCoordinate.longitude,
            coordinate.latitude,
            coordinate.longitude
          );
          newDistance += distanceDelta;
          console.log('Journey store: Distance delta:', distanceDelta, 'Total distance:', newDistance);
        }

        set({
          coordinates: newCoordinates,
          distance: newDistance,
        });
        console.log('Journey store: Coordinate added successfully');
      },

        addVoiceNote: (voiceNote: VoiceNote) => {
          const { voiceNotes } = get();
          set({
            voiceNotes: [...voiceNotes, voiceNote],
          });
        },

        resetJourney: () => {
          set({
            isTracking: false,
            coordinates: [],
            distance: 0,
            currentLocation: undefined,
            startTime: undefined,
            voiceNotes: [],
          });
        },

      getDuration: () => {
        const { startTime, isTracking } = get();
        if (!startTime) return 0;
        
        if (isTracking) {
          return Date.now() - startTime;
        }
        
        return 0;
      },
    }),
    {
      name: 'journey-storage',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}
