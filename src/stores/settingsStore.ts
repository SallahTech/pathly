import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '../types';

interface SettingsStore extends AppSettings {
  setTheme: (theme: 'light' | 'dark') => void;
  setLocationPermission: (granted: boolean) => void;
  setTrackingInterval: (interval: number) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'light',
  locationPermissionGranted: false,
  trackingInterval: 5000, // 5 seconds
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setTheme: (theme) => {
        set({ theme });
      },

      setLocationPermission: (granted) => {
        set({ locationPermissionGranted: granted });
      },

      setTrackingInterval: (interval) => {
        set({ trackingInterval: interval });
      },

      resetSettings: () => {
        set(defaultSettings);
      },
    }),
    {
      name: 'settings-storage',
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
