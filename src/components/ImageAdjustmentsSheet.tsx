import React, { useState, useCallback } from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from './PrimaryButton';
import { MotiView } from 'moti';

export type ImageAdjustments = {
  brightness: number; // -1 to 1
  contrast: number;   // -1 to 1
  saturation: number; // -1 to 1
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: (adjustments: ImageAdjustments) => void;
  initialValues?: ImageAdjustments;
};

const defaultAdjustments: ImageAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
};

export default function ImageAdjustmentsSheet({ 
  visible, 
  onClose, 
  onApply, 
  initialValues = defaultAdjustments 
}: Props) {
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(initialValues);

  const updateAdjustment = useCallback((key: keyof ImageAdjustments, value: number) => {
    setAdjustments(prev => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setAdjustments(defaultAdjustments);
  }, []);

  const apply = useCallback(() => {
    onApply(adjustments);
    onClose();
  }, [adjustments, onApply, onClose]);

  const AdjustmentSlider = ({ 
    label, 
    value, 
    onValueChange, 
    icon 
  }: { 
    label: string; 
    value: number; 
    onValueChange: (v: number) => void;
    icon: keyof typeof Ionicons.glyphMap;
  }) => (
    <MotiView 
      from={{ opacity: 0, translateX: -20 }} 
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'spring', damping: 15, stiffness: 150 }}
      className="mb-8"
    >
      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 rounded-2xl bg-primary-100 items-center justify-center mr-4">
          <Ionicons name={icon} size={20} color="#0284C7" />
        </View>
        <Text className="text-text-primary text-lg flex-1" style={{ fontFamily: 'Inter_500Medium' }}>
          {label}
        </Text>
        <View className="bg-slate-100 px-4 py-2 rounded-xl">
          <Text className="text-slate-700 text-sm" style={{ fontFamily: 'Inter_700Bold' }}>
            {value > 0 ? '+' : ''}{Math.round(value * 100)}
          </Text>
        </View>
      </View>
      <View className="bg-slate-50 rounded-2xl p-4 border border-border-light">
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={-1}
          maximumValue={1}
          value={value}
          onValueChange={onValueChange}
          minimumTrackTintColor="#0284C7"
          maximumTrackTintColor="#E2E8F0"
          thumbStyle={{ 
            backgroundColor: '#0284C7', 
            width: 24, 
            height: 24,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4
          }}
        />
        <View className="flex-row justify-between mt-2">
          <Text className="text-text-tertiary text-xs" style={{ fontFamily: 'Inter_400Regular' }}>-100</Text>
          <Text className="text-text-tertiary text-xs" style={{ fontFamily: 'Inter_400Regular' }}>0</Text>
          <Text className="text-text-tertiary text-xs" style={{ fontFamily: 'Inter_400Regular' }}>+100</Text>
        </View>
      </View>
    </MotiView>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-surface rounded-t-4xl p-8 shadow-xl border-t border-border-light max-h-[85%]">
          <View className="w-16 h-1.5 bg-slate-300 rounded-full self-center mb-8" />
          
          <View className="flex-row items-center justify-between mb-8">
            <Text className="text-text-primary text-2xl" style={{ fontFamily: 'Inter_700Bold' }}>
              Adjust Image
            </Text>
            <Pressable onPress={reset} className="bg-slate-100 px-4 py-2 rounded-xl shadow-soft">
              <Text className="text-slate-700 text-sm" style={{ fontFamily: 'Inter_500Medium' }}>Reset</Text>
            </Pressable>
          </View>

          <AdjustmentSlider
            label="Brightness"
            value={adjustments.brightness}
            onValueChange={(v) => updateAdjustment('brightness', v)}
            icon="sunny-outline"
          />

          <AdjustmentSlider
            label="Contrast"
            value={adjustments.contrast}
            onValueChange={(v) => updateAdjustment('contrast', v)}
            icon="contrast-outline"
          />

          <AdjustmentSlider
            label="Saturation"
            value={adjustments.saturation}
            onValueChange={(v) => updateAdjustment('saturation', v)}
            icon="color-palette-outline"
          />

          <View className="flex-row space-x-4 mt-4">
            <PrimaryButton 
              title="Cancel" 
              onPress={onClose} 
              variant="secondary" 
              size="xl"
              fullWidth
              style={{ flex: 1 }}
            />
            <PrimaryButton 
              title="Apply" 
              icon="checkmark"
              onPress={apply} 
              size="xl"
              fullWidth
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}