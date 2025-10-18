import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, Alert, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
// import { MotiView } from 'moti';

import { useRoutesStore } from '../stores/routesStore';
import { useTheme } from '../contexts/ThemeContext';
import { Route } from '../types';
import { PathlyLogo } from '../components/PathlyLogo';

export default function RoutesScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { routes, deleteRoute } = useRoutesStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>(routes);

  React.useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = routes.filter(route =>
        route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (route.description && route.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredRoutes(filtered);
    } else {
      setFilteredRoutes(routes);
    }
  }, [routes, searchQuery]);

  const handleRoutePress = (route: Route) => {
    (navigation as any).navigate('RouteDetails', { routeId: route.id });
  };

  const handleDeleteRoute = (route: Route) => {
    Alert.alert(
      'Delete Route',
      `Are you sure you want to delete "${route.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteRoute(route.id),
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const getMapRegion = (coordinates: any[]) => {
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

    const latDelta = Math.max((maxLat - minLat) * 1.2, 0.01);
    const lngDelta = Math.max((maxLng - minLng) * 1.2, 0.01);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  };

  const renderRouteItem = ({ item, index }: { item: Route; index: number }) => (
    <View>
      <TouchableOpacity
        style={themedStyles.routeCard}
        onPress={() => handleRoutePress(item)}
      >
        {/* Map Preview */}
        <View style={themedStyles.mapContainer}>
          <MapView
            style={themedStyles.map}
            region={getMapRegion(item.coordinates)}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
            mapType="standard"
          >
            {item.coordinates.length > 1 && (
              <Polyline
                coordinates={item.coordinates}
                strokeColor="#2563EB"
                strokeWidth={3}
                lineCap="round"
                lineJoin="round"
              />
            )}
            
            {item.coordinates.length > 0 && (
              <>
                <Marker
                  coordinate={item.coordinates[0]}
                  pinColor="green"
                />
                <Marker
                  coordinate={item.coordinates[item.coordinates.length - 1]}
                  pinColor="red"
                />
              </>
            )}
          </MapView>
        </View>

        {/* Route Info */}
        <View style={themedStyles.routeInfo}>
          <View style={themedStyles.routeHeader}>
            <View style={themedStyles.routeTitleContainer}>
              <Text style={themedStyles.routeName} numberOfLines={1}>
                {item.name}
              </Text>
              {item.description && (
                <Text style={themedStyles.routeDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
            </View>
            
            <TouchableOpacity
              style={themedStyles.deleteButton}
              onPress={() => handleDeleteRoute(item)}
            >
              <Ionicons name="trash" size={16} color="white" />
            </TouchableOpacity>
          </View>

          {/* Route Stats */}
          <View style={themedStyles.routeStats}>
            <View style={themedStyles.statItem}>
              <Text style={themedStyles.statValue}>{formatDistance(item.distance || 0)}</Text>
              <Text style={themedStyles.statLabel}>Distance</Text>
            </View>
            
            <View style={themedStyles.statItem}>
              <Text style={themedStyles.statValue}>{formatDuration(item.duration)}</Text>
              <Text style={themedStyles.statLabel}>Duration</Text>
            </View>
            
            <View style={themedStyles.statItem}>
              <Text style={themedStyles.statValue}>{item.coordinates.length}</Text>
              <Text style={themedStyles.statLabel}>Points</Text>
            </View>
            
            <Text style={themedStyles.routeDate}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View>
      <View style={themedStyles.emptyState}>
        <Ionicons name="map-outline" size={64} color="#94A3B8" />
        <Text style={themedStyles.emptyTitle}>No Routes Yet</Text>
        <Text style={themedStyles.emptySubtitle}>
          Start your first journey to see your routes here
        </Text>
        <TouchableOpacity
          style={themedStyles.startButton}
          onPress={() => (navigation as any).navigate('Home')}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={themedStyles.startButtonText}>Start Journey</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const themedStyles = createThemedStyles(colors);

  return (
    <SafeAreaView style={themedStyles.container}>
      <View style={themedStyles.content}>
        {/* Header */}
        <View style={themedStyles.header}>
          <View style={themedStyles.headerContent}>
            <PathlyLogo size={28} />
            <View style={themedStyles.headerText}>
              <Text style={themedStyles.title}>My Routes</Text>
              <Text style={themedStyles.subtitle}>
                {routes.length} saved route{routes.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Search */}
        <View style={themedStyles.searchContainer}>
          <TextInput
            style={themedStyles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search routes..."
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Routes List */}
        <FlatList
          data={filteredRoutes}
          renderItem={renderRouteItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={themedStyles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
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
    padding: 16,
    paddingBottom: 8,
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  routeCard: {
    backgroundColor: colors.card,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mapContainer: {
    height: 120,
  },
  map: {
    flex: 1,
  },
  routeInfo: {
    padding: 12,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  routeTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  routeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  routeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  deleteButton: {
    backgroundColor: colors.error,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeStats: {
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
  routeDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});