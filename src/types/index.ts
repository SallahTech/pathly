export interface Location {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  timestamp: number;
}

export interface VoiceNote {
  id: string;
  uri: string;
  duration: number; // in seconds
  timestamp: number;
  location?: Location;
}

export interface Route {
  id: string;
  name: string;
  description?: string;
  image?: string;
  coordinates: Location[];
  voiceNotes?: VoiceNote[];
  startTime: number;
  endTime: number;
  duration: number; // in seconds
  distance?: number; // in meters
  createdAt: number;
}

export interface JourneyState {
  isTracking: boolean;
  currentLocation?: Location;
  coordinates: Location[];
  startTime?: number;
  distance: number;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  locationPermissionGranted: boolean;
  trackingInterval: number; // in milliseconds
}

export interface NavigationProps {
  navigation: any;
  route: any;
}
