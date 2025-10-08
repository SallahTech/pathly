import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface SuccessAnimationProps {
  visible: boolean;
  onComplete?: () => void;
}

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ 
  visible, 
  onComplete 
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Start animation sequence
      Animated.sequence([
        // Scale in the circle
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        // Animate checkmark
        Animated.spring(checkmarkAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 150,
          friction: 8,
        }),
      ]).start(() => {
        // Auto-hide after animation completes
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onComplete?.();
          });
        }, 1500);
      });
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      checkmarkAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  const themedStyles = createThemedStyles(colors);

  return (
    <View style={themedStyles.overlay}>
      <Animated.View
        style={[
          themedStyles.animationContainer,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <View style={themedStyles.circle}>
          <Animated.View
            style={[
              themedStyles.checkmarkContainer,
              {
                transform: [
                  {
                    scale: checkmarkAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons name="checkmark" size={40} color="white" />
          </Animated.View>
        </View>
        <Text style={themedStyles.successText}>Route Saved!</Text>
      </Animated.View>
    </View>
  );
};

const createThemedStyles = (colors: any) => StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    animationContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    circle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.success,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 8,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    checkmarkContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    successText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 16,
      textAlign: 'center',
    },
  });

export default SuccessAnimation;
