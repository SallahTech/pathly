import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';

interface PathlyLogoProps {
  size?: number;
  color?: string;
}

export const PathlyLogo: React.FC<PathlyLogoProps> = ({ 
  size = 32, 
  color 
}) => {
  const { colors } = useTheme();
  const logoColor = color || colors.primary;
  
  // Create a winding path that forms the letter "P"
  // This is a simplified version - in a real app you'd want a more refined design
  const pathData = `
    M ${size * 0.1} ${size * 0.1}
    L ${size * 0.1} ${size * 0.9}
    L ${size * 0.3} ${size * 0.9}
    Q ${size * 0.5} ${size * 0.9} ${size * 0.5} ${size * 0.7}
    Q ${size * 0.5} ${size * 0.5} ${size * 0.3} ${size * 0.5}
    L ${size * 0.1} ${size * 0.5}
    M ${size * 0.1} ${size * 0.1}
    L ${size * 0.4} ${size * 0.1}
    Q ${size * 0.6} ${size * 0.1} ${size * 0.6} ${size * 0.3}
    Q ${size * 0.6} ${size * 0.5} ${size * 0.4} ${size * 0.5}
    L ${size * 0.1} ${size * 0.5}
  `;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Path
          d={pathData}
          stroke={logoColor}
          strokeWidth={size * 0.08}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PathlyLogo;
