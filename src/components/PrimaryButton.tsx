import React from 'react';
import { Pressable, Text, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

type Props = {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'dark' | 'accent' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function PrimaryButton({ 
  title, 
  onPress, 
  icon, 
  style, 
  disabled, 
  variant = 'primary',
  size = 'md'
}: Props) {
  const scale = useSharedValue(1);
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-600 border border-primary-600';
      case 'accent':
        return 'bg-accent-600 border border-accent-600';
      case 'dark':
        return 'bg-neutral-800 border border-neutral-800';
      case 'secondary':
        return 'bg-surface border border-border';
      case 'ghost':
        return 'bg-transparent border border-transparent';
      default:
        return 'bg-primary-600 border border-primary-600';
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'text-text-primary';
      case 'ghost':
        return 'text-primary-600';
      default:
        return 'text-white';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2.5';
      case 'lg':
        return 'px-6 py-4';
      default:
        return 'px-5 py-3.5';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'secondary':
        return '#0F172A';
      case 'ghost':
        return '#2563EB';
      default:
        return '#FFFFFF';
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  const opacity = disabled ? 'opacity-50' : '';
  const baseStyles = `${getVariantStyles()} ${getSizeStyles()} ${opacity} rounded-2xl items-center flex-row justify-center shadow-soft`;

  return (
    <AnimatedPressable 
      disabled={disabled} 
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className={baseStyles}
      style={[animatedStyle, style]}
    >
      {icon && (
        <Ionicons 
          name={icon} 
          size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} 
          color={getIconColor()} 
          style={{ marginRight: 8 }} 
        />
      )}
      <Text 
        className={getTextStyles()} 
        style={{ 
          fontFamily: 'Inter_700Bold',
          fontSize: size === 'sm' ? 14 : size === 'lg' ? 17 : 15
        }}
      >
        {title}
      </Text>
    </AnimatedPressable>
  );
}