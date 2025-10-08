import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { PathlyLogo } from '../components/PathlyLogo';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: 'map-outline',
      title: 'Track Your Journeys',
      description: 'Record your walking and driving routes with GPS precision. Never lose track of where you\'ve been.',
    },
    {
      icon: 'mic-outline',
      title: 'Add Voice Notes',
      description: 'Capture memories and thoughts during your journey with voice recordings.',
    },
    {
      icon: 'camera-outline',
      title: 'Save Photos',
      description: 'Take photos along your route to create rich, visual memories of your journeys.',
    },
    {
      icon: 'play-outline',
      title: 'Replay Routes',
      description: 'Relive your journeys by replaying your saved routes on the map.',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const themedStyles = createThemedStyles(colors);

  return (
    <SafeAreaView style={themedStyles.container}>
      <View style={themedStyles.content}>
        {/* Header */}
        <View style={themedStyles.header}>
          <PathlyLogo size={48} />
          <Text style={themedStyles.appName}>Pathly</Text>
          <Text style={themedStyles.tagline}>Don't just go places — remember them.</Text>
        </View>

        {/* Progress Indicator */}
        <View style={themedStyles.progressContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                themedStyles.progressDot,
                index === currentStep && themedStyles.progressDotActive,
                index < currentStep && themedStyles.progressDotCompleted,
              ]}
            />
          ))}
        </View>

        {/* Step Content */}
        <View style={themedStyles.stepContainer}>
          <View style={themedStyles.iconContainer}>
            <Ionicons 
              name={steps[currentStep].icon as any} 
              size={80} 
              color={colors.primary} 
            />
          </View>
          
          <Text style={themedStyles.stepTitle}>{steps[currentStep].title}</Text>
          <Text style={themedStyles.stepDescription}>{steps[currentStep].description}</Text>
        </View>

        {/* Navigation Buttons */}
        <View style={themedStyles.buttonContainer}>
          <TouchableOpacity
            style={themedStyles.skipButton}
            onPress={handleSkip}
          >
            <Text style={themedStyles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={themedStyles.nextButton}
            onPress={handleNext}
          >
            <Text style={themedStyles.nextButtonText}>
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons 
              name={currentStep === steps.length - 1 ? 'checkmark' : 'arrow-forward'} 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
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
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
  },
  tagline: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
    gap: 12,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    transform: [{ scale: 1.2 }],
  },
  progressDotCompleted: {
    backgroundColor: colors.success,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
