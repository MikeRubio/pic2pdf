import React from 'react';
import { Pressable, Text, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'dark' | 'accent';
};

export default function PrimaryButton({ title, onPress, icon, style, disabled, variant = 'primary' }: Props) {
  const bg = variant === 'primary' ? 'bg-primary' : variant === 'accent' ? 'bg-accent' : variant === 'dark' ? 'bg-text' : 'bg-white';
  const text = variant === 'secondary' ? 'text-text' : 'text-white';
  const opacity = disabled ? 'opacity-60' : '';
  return (
    <Pressable disabled={disabled} onPress={onPress} className={`${bg} ${opacity} rounded-2xl p-4 items-center flex-row justify-center`} style={style}>
      {icon ? <Ionicons name={icon} size={20} color={variant === 'secondary' ? '#111827' : '#fff'} style={{ marginRight: 8 }} /> : null}
      <Text className={text} style={{ fontFamily: 'Inter_700Bold' }}>{title}</Text>
    </Pressable>
  );
}

