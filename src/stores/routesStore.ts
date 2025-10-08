import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Route, Location } from '../types';

interface RoutesStore {
  routes: Route[];
  addRoute: (route: Omit<Route, 'id' | 'createdAt'>) => void;
  updateRoute: (id: string, updates: Partial<Route>) => void;
  deleteRoute: (id: string) => void;
  getRoute: (id: string) => Route | undefined;
  clearAllRoutes: () => void;
}

export const useRoutesStore = create<RoutesStore>()(
  persist(
    (set, get) => ({
      routes: [],

      addRoute: (routeData) => {
        const newRoute: Route = {
          ...routeData,
          id: generateId(),
          createdAt: Date.now(),
        };
        
        set((state) => ({
          routes: [newRoute, ...state.routes],
        }));
      },

      updateRoute: (id, updates) => {
        set((state) => ({
          routes: state.routes.map((route) =>
            route.id === id ? { ...route, ...updates } : route
          ),
        }));
      },

      deleteRoute: (id) => {
        set((state) => ({
          routes: state.routes.filter((route) => route.id !== id),
        }));
      },

      getRoute: (id) => {
        const { routes } = get();
        return routes.find((route) => route.id === id);
      },

      clearAllRoutes: () => {
        set({ routes: [] });
      },
    }),
    {
      name: 'routes-storage',
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

// Helper function to generate unique IDs
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
