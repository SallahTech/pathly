import { Route } from '../types';

export const demoRoutes: Omit<Route, 'id' | 'createdAt'>[] = [
  {
    name: 'Morning Coffee Walk',
    description: 'A peaceful morning walk to my favorite coffee shop downtown. Perfect way to start the day with some fresh air and great coffee.',
    coordinates: [
      { latitude: 37.7749, longitude: -122.4194, timestamp: Date.now() - 3600000 },
      { latitude: 37.7750, longitude: -122.4190, timestamp: Date.now() - 3590000 },
      { latitude: 37.7752, longitude: -122.4185, timestamp: Date.now() - 3580000 },
      { latitude: 37.7755, longitude: -122.4180, timestamp: Date.now() - 3570000 },
      { latitude: 37.7758, longitude: -122.4175, timestamp: Date.now() - 3560000 },
      { latitude: 37.7760, longitude: -122.4170, timestamp: Date.now() - 3550000 },
      { latitude: 37.7762, longitude: -122.4165, timestamp: Date.now() - 3540000 },
      { latitude: 37.7765, longitude: -122.4160, timestamp: Date.now() - 3530000 },
      { latitude: 37.7768, longitude: -122.4155, timestamp: Date.now() - 3520000 },
      { latitude: 37.7770, longitude: -122.4150, timestamp: Date.now() - 3510000 },
    ],
    startTime: Date.now() - 3600000,
    endTime: Date.now() - 3510000,
    duration: 540, // 9 minutes
    distance: 850, // 850 meters
  },
  {
    name: 'Weekend Hiking Trail',
    description: 'Beautiful hiking trail through the local nature reserve. Great for exercise and connecting with nature.',
    coordinates: [
      { latitude: 37.7849, longitude: -122.4094, timestamp: Date.now() - 7200000 },
      { latitude: 37.7855, longitude: -122.4085, timestamp: Date.now() - 7150000 },
      { latitude: 37.7860, longitude: -122.4075, timestamp: Date.now() - 7100000 },
      { latitude: 37.7865, longitude: -122.4065, timestamp: Date.now() - 7050000 },
      { latitude: 37.7870, longitude: -122.4055, timestamp: Date.now() - 7000000 },
      { latitude: 37.7875, longitude: -122.4045, timestamp: Date.now() - 6950000 },
      { latitude: 37.7880, longitude: -122.4035, timestamp: Date.now() - 6900000 },
      { latitude: 37.7885, longitude: -122.4025, timestamp: Date.now() - 6850000 },
      { latitude: 37.7890, longitude: -122.4015, timestamp: Date.now() - 6800000 },
      { latitude: 37.7895, longitude: -122.4005, timestamp: Date.now() - 6750000 },
      { latitude: 37.7900, longitude: -122.3995, timestamp: Date.now() - 6700000 },
      { latitude: 37.7905, longitude: -122.3985, timestamp: Date.now() - 6650000 },
      { latitude: 37.7910, longitude: -122.3975, timestamp: Date.now() - 6600000 },
      { latitude: 37.7915, longitude: -122.3965, timestamp: Date.now() - 6550000 },
      { latitude: 37.7920, longitude: -122.3955, timestamp: Date.now() - 6500000 },
    ],
    startTime: Date.now() - 7200000,
    endTime: Date.now() - 6500000,
    duration: 700, // 11 minutes 40 seconds
    distance: 1200, // 1.2 km
  },
  {
    name: 'Evening City Stroll',
    description: 'Relaxing evening walk through the city center, enjoying the sunset and city lights.',
    coordinates: [
      { latitude: 37.7849, longitude: -122.4094, timestamp: Date.now() - 10800000 },
      { latitude: 37.7845, longitude: -122.4090, timestamp: Date.now() - 10750000 },
      { latitude: 37.7840, longitude: -122.4085, timestamp: Date.now() - 10700000 },
      { latitude: 37.7835, longitude: -122.4080, timestamp: Date.now() - 10650000 },
      { latitude: 37.7830, longitude: -122.4075, timestamp: Date.now() - 10600000 },
      { latitude: 37.7825, longitude: -122.4070, timestamp: Date.now() - 10550000 },
      { latitude: 37.7820, longitude: -122.4065, timestamp: Date.now() - 10500000 },
      { latitude: 37.7815, longitude: -122.4060, timestamp: Date.now() - 10450000 },
      { latitude: 37.7810, longitude: -122.4055, timestamp: Date.now() - 10400000 },
      { latitude: 37.7805, longitude: -122.4050, timestamp: Date.now() - 10350000 },
      { latitude: 37.7800, longitude: -122.4045, timestamp: Date.now() - 10300000 },
      { latitude: 37.7795, longitude: -122.4040, timestamp: Date.now() - 10250000 },
      { latitude: 37.7790, longitude: -122.4035, timestamp: Date.now() - 10200000 },
      { latitude: 37.7785, longitude: -122.4030, timestamp: Date.now() - 10150000 },
      { latitude: 37.7780, longitude: -122.4025, timestamp: Date.now() - 10100000 },
    ],
    startTime: Date.now() - 10800000,
    endTime: Date.now() - 10100000,
    duration: 700, // 11 minutes 40 seconds
    distance: 950, // 950 meters
  },
];

export const addDemoRoutes = (addRoute: (route: Omit<Route, 'id' | 'createdAt'>) => void) => {
  demoRoutes.forEach(route => {
    addRoute(route);
  });
};
