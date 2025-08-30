import React from 'react';
import { Pressable, Text, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';

type Props = {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'dark' | 'accent' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function PrimaryButton({ 
  title, 
  onPress, 
  icon, 
  style, 
  disabled, 
  variant = 'primary',
  size = 'md',
  fullWidth = false
}: Props) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-600 border border-primary-600 shadow-medium';
      case 'accent':
        return 'bg-accent-600 border border-accent-600 shadow-medium';
      case 'dark':
        return 'bg-slate-800 border border-slate-800 shadow-medium';
      case 'secondary':
        return 'bg-surface border border-border shadow-soft';
      case 'outline':
        return 'bg-transparent border-2 border-primary-600';
      case 'ghost':
        return 'bg-transparent border border-transparent';
      default:
        return 'bg-primary-600 border border-primary-600 shadow-medium';
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'text-text-primary';
      case 'outline':
        return 'text-primary-600';
      case 'ghost':
        return 'text-primary-600';
      default:
        return 'text-white';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2.5 min-h-[40px]';
      case 'lg':
        return 'px-8 py-4 min-h-[56px]';
      case 'xl':
        return 'px-10 py-5 min-h-[64px]';
      default:
        return 'px-6 py-3.5 min-h-[48px]';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'lg': return 22;
      case 'xl': return 24;
      default: return 20;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return 14;
      case 'lg': return 17;
      case 'xl': return 18;
      default: return 16;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'secondary':
        return '#0F172A';
      case 'outline':
      case 'ghost':
        return '#0284C7';
      default:
        return '#FFFFFF';
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  const disabledStyles = disabled ? 'opacity-40' : '';
  const widthStyles = fullWidth ? 'w-full' : '';
  const baseStyles = `${getVariantStyles()} ${getSizeStyles()} ${disabledStyles} ${widthStyles} rounded-2xl items-center flex-row justify-center`;

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
          size={getIconSize()} 
          color={getIconColor()} 
          style={{ marginRight: title ? 8 : 0 }} 
        />
      )}
      {title && (
        <Text 
          className={getTextStyles()} 
          style={{ 
            fontFamily: 'Inter_700Bold',
            fontSize: getFontSize()
          }}
        >
          {title}
        </Text>
      )}
    </AnimatedPressable>
  );
}