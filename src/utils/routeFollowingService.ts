import { Location } from '../types';

export interface RouteProgress {
  currentStep: number;
  totalSteps: number;
  distanceToNext: number;
  distanceRemaining: number;
  progressPercentage: number;
  isOnRoute: boolean;
  nextTurn?: string;
  guidance?: string;
}

export interface RouteFollowingState {
  isFollowing: boolean;
  routeId: string | null;
  routeCoordinates: Location[];
  currentProgress: RouteProgress;
  startTime: number;
  completedSteps: number[];
}

export class RouteFollowingService {
  private state: RouteFollowingState = {
    isFollowing: false,
    routeId: null,
    routeCoordinates: [],
    currentProgress: {
      currentStep: 0,
      totalSteps: 0,
      distanceToNext: 0,
      distanceRemaining: 0,
      progressPercentage: 0,
      isOnRoute: false,
    },
    startTime: 0,
    completedSteps: [],
  };

  private onProgressUpdate?: (progress: RouteProgress) => void;
  private onGuidanceUpdate?: (guidance: string) => void;
  private onRouteComplete?: () => void;

  startFollowing(routeId: string, routeCoordinates: Location[]): void {
    this.state = {
      isFollowing: true,
      routeId,
      routeCoordinates,
      currentProgress: {
        currentStep: 0,
        totalSteps: routeCoordinates.length,
        distanceToNext: 0,
        distanceRemaining: this.calculateTotalDistance(routeCoordinates),
        progressPercentage: 0,
        isOnRoute: false,
      },
      startTime: Date.now(),
      completedSteps: [],
    };

    console.log('Route following started:', routeId);
  }

  stopFollowing(): void {
    this.state.isFollowing = false;
    this.state.routeId = null;
    this.state.routeCoordinates = [];
    this.state.completedSteps = [];
    console.log('Route following stopped');
  }

  updateLocation(currentLocation: Location): RouteProgress {
    if (!this.state.isFollowing || this.state.routeCoordinates.length === 0) {
      return this.state.currentProgress;
    }

    const progress = this.calculateProgress(currentLocation);
    this.state.currentProgress = progress;

    // Check if route is complete
    if (progress.progressPercentage >= 95) {
      this.completeRoute();
    }

    // Notify listeners
    if (this.onProgressUpdate) {
      this.onProgressUpdate(progress);
    }

    if (this.onGuidanceUpdate && progress.guidance) {
      this.onGuidanceUpdate(progress.guidance);
    }

    return progress;
  }

  private calculateProgress(currentLocation: Location): RouteProgress {
    const { routeCoordinates, completedSteps } = this.state;
    const totalSteps = routeCoordinates.length;
    
    // Find the closest point on the route
    let closestStep = 0;
    let minDistance = Infinity;
    
    for (let i = 0; i < routeCoordinates.length; i++) {
      const distance = this.calculateDistance(currentLocation, routeCoordinates[i]);
      if (distance < minDistance) {
        minDistance = distance;
        closestStep = i;
      }
    }

    // Check if user is on route (within 50 meters)
    const isOnRoute = minDistance < 50;

    // Find the next uncompleted step
    let currentStep = closestStep;
    for (let i = closestStep; i < routeCoordinates.length; i++) {
      if (!completedSteps.includes(i)) {
        currentStep = i;
        break;
      }
    }

    // Mark completed steps
    if (isOnRoute && !completedSteps.includes(currentStep)) {
      this.state.completedSteps.push(currentStep);
    }

    // Calculate distances
    const distanceToNext = this.calculateDistance(currentLocation, routeCoordinates[currentStep]);
    const distanceRemaining = this.calculateRemainingDistance(currentStep, routeCoordinates);
    const progressPercentage = (completedSteps.length / totalSteps) * 100;

    // Generate guidance
    const guidance = this.generateGuidance(currentStep, routeCoordinates, currentLocation);

    return {
      currentStep,
      totalSteps,
      distanceToNext,
      distanceRemaining,
      progressPercentage,
      isOnRoute,
      guidance,
    };
  }

  private generateGuidance(currentStep: number, routeCoordinates: Location[], currentLocation: Location): string {
    if (currentStep >= routeCoordinates.length - 1) {
      return "You have reached your destination!";
    }

    const currentPoint = routeCoordinates[currentStep];
    const nextPoint = routeCoordinates[currentStep + 1];
    const distance = this.calculateDistance(currentLocation, nextPoint);

    // Calculate bearing to next point
    const bearing = this.calculateBearing(currentLocation, nextPoint);
    const direction = this.getDirectionFromBearing(bearing);

    if (distance < 10) {
      return "Continue straight ahead";
    } else if (distance < 50) {
      return `In ${Math.round(distance)}m, ${direction}`;
    } else {
      return `Head ${direction} for ${Math.round(distance)}m`;
    }
  }

  private getDirectionFromBearing(bearing: number): string {
    const directions = [
      'North', 'Northeast', 'East', 'Southeast',
      'South', 'Southwest', 'West', 'Northwest'
    ];
    
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
  }

  private calculateBearing(from: Location, to: Location): number {
    const lat1 = (from.latitude * Math.PI) / 180;
    const lat2 = (to.latitude * Math.PI) / 180;
    const deltaLon = ((to.longitude - from.longitude) * Math.PI) / 180;

    const y = Math.sin(deltaLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);

    let bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360;
  }

  private calculateRemainingDistance(currentStep: number, routeCoordinates: Location[]): number {
    let totalDistance = 0;
    for (let i = currentStep; i < routeCoordinates.length - 1; i++) {
      totalDistance += this.calculateDistance(routeCoordinates[i], routeCoordinates[i + 1]);
    }
    return totalDistance;
  }

  private calculateTotalDistance(coordinates: Location[]): number {
    let totalDistance = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
      totalDistance += this.calculateDistance(coordinates[i], coordinates[i + 1]);
    }
    return totalDistance;
  }

  private calculateDistance(loc1: Location, loc2: Location): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (loc1.latitude * Math.PI) / 180;
    const φ2 = (loc2.latitude * Math.PI) / 180;
    const Δφ = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
    const Δλ = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  private completeRoute(): void {
    console.log('Route completed!');
    this.state.currentProgress.progressPercentage = 100;
    this.state.currentProgress.guidance = "Route completed successfully!";
    
    if (this.onRouteComplete) {
      this.onRouteComplete();
    }
  }

  // Event listeners
  setOnProgressUpdate(callback: (progress: RouteProgress) => void): void {
    this.onProgressUpdate = callback;
  }

  setOnGuidanceUpdate(callback: (guidance: string) => void): void {
    this.onGuidanceUpdate = callback;
  }

  setOnRouteComplete(callback: () => void): void {
    this.onRouteComplete = callback;
  }

  // Getters
  getState(): RouteFollowingState {
    return { ...this.state };
  }

  isCurrentlyFollowing(): boolean {
    return this.state.isFollowing;
  }

  getCurrentProgress(): RouteProgress {
    return { ...this.state.currentProgress };
  }
}

export const routeFollowingService = new RouteFollowingService();
