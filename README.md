# Pathly - Personal Journey Recorder

> **Don't just go places — remember them.**

Pathly is a beautiful, production-ready mobile app that lets you record, save, and retrace your driving or walking routes. Built with React Native and Expo, it features a polished UI with smooth animations and comprehensive GPS tracking capabilities.

## 🚀 Features

### Core Functionality
- **GPS Journey Tracking**: Record your routes with high-precision location tracking
- **Route Management**: Save, organize, and manage your recorded journeys
- **Interactive Maps**: View your routes on beautiful, interactive maps
- **Photo Integration**: Add photos to your routes for better memories
- **Route Replay**: Follow your saved routes with visual guidance

### User Experience
- **Modern UI**: Clean, elegant interface with Tamagui design system
- **Smooth Animations**: Fluid transitions powered by Moti
- **Dark/Light Mode**: Automatic theme switching
- **Offline Storage**: All data stored locally with AsyncStorage
- **Cross-Platform**: Works on both iOS and Android

## 🛠 Tech Stack

- **Framework**: React Native (Expo SDK 52)
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **UI Library**: Tamagui + NativeWind (Tailwind for RN)
- **Animations**: Moti + Reanimated 3
- **Maps**: React Native Maps
- **Location**: Expo Location + BackgroundFetch
- **Storage**: AsyncStorage (local persistence)
- **State Management**: Zustand

## 📱 Screens

1. **Home Screen**: Start/stop journey tracking with live map
2. **Save Route Screen**: Add details, photos, and save your journey
3. **Routes Screen**: Browse your saved routes with previews
4. **Route Details Screen**: View full route details and replay
5. **Settings Screen**: Customize app preferences and permissions

## 🎨 Design System

- **Primary Color**: `#2563EB` (Blue)
- **Accent Color**: `#22D3EE` (Cyan)
- **Background**: `#F8FAFC`
- **Typography**: Inter font family
- **Design Philosophy**: Google Maps meets Notion

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Expo CLI
- iOS Simulator or Android Emulator (for testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pathly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## 📋 Features Overview

### Journey Tracking
- Start/stop GPS tracking with a single tap
- Real-time location updates with configurable intervals
- Live map display with route visualization
- Distance and duration tracking
- Background location tracking support

### Route Management
- Save journeys with custom names and descriptions
- Add photos from camera or gallery
- Organize routes by date and activity
- Search and filter saved routes
- Delete unwanted routes

### Map Integration
- Interactive maps with zoom and pan
- Route visualization with colored polylines
- Start/end markers for each journey
- Map type switching (standard/satellite)
- Region auto-fitting for route display

### Settings & Customization
- Dark/light mode toggle
- Location permission management
- Tracking interval configuration
- Data export capabilities
- Clear all data option

## 🔧 Configuration

### Location Permissions
The app requires location permissions for GPS tracking:
- **iOS**: NSLocationWhenInUseUsageDescription
- **Android**: ACCESS_FINE_LOCATION, ACCESS_BACKGROUND_LOCATION

### Camera Permissions
For photo capture functionality:
- **iOS**: NSCameraUsageDescription, NSPhotoLibraryUsageDescription
- **Android**: CAMERA, READ_EXTERNAL_STORAGE

## 📦 Project Structure

```
src/
├── components/          # Reusable UI components
├── navigation/          # Navigation configuration
├── screens/            # App screens
├── stores/             # Zustand state management
├── types/              # TypeScript type definitions
├── utils/               # Utility functions and services
└── navigation/         # Navigation setup
```

## 🎯 Demo Data

The app includes 3 demo routes to showcase functionality:
1. **Morning Coffee Walk** - Short urban walk
2. **Weekend Hiking Trail** - Nature trail exploration
3. **Evening City Stroll** - City center evening walk

## 🚀 Deployment

### Development Build
```bash
expo build:android
expo build:ios
```

### Production Build
```bash
expo build:android --type app-bundle
expo build:ios --type archive
```

## 🔮 Future Enhancements

- **Cloud Sync**: Firebase integration for cross-device sync
- **Voice Notes**: Audio recording during journeys
- **Social Features**: Share routes with friends
- **Analytics**: Journey statistics and insights
- **Offline Maps**: Download maps for offline use
- **Route Planning**: Plan routes before starting

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.


**Built with ❤️ using React Native and Expo**
