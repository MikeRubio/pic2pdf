import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import PrimaryButton from "./PrimaryButton";

type RatioKey = '1:1' | '4:3' | '3:2' | 'A4 Portrait' | 'A4 Landscape';

export type CropRatioSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (key: RatioKey, ratio: number) => void;
};

const ratios: Array<{ key: RatioKey; ratio: number }> = [
  { key: '1:1', ratio: 1 },
  { key: '4:3', ratio: 4 / 3 },
  { key: '3:2', ratio: 3 / 2 },
  { key: 'A4 Portrait', ratio: 210 / 297 },
  { key: 'A4 Landscape', ratio: 297 / 210 },
];

export default function CropRatioSheet({ visible, onClose, onSelect }: CropRatioSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-surface rounded-t-4xl p-8 shadow-xl border-t border-border-light">
          <View className="w-16 h-1.5 bg-slate-300 rounded-full self-center mb-8" />
          <Text className="text-text-primary text-2xl mb-8" style={{ fontFamily: 'Inter_700Bold' }}>Choose Crop Ratio</Text>
          <View className="flex-row flex-wrap mb-6">
            {ratios.map((r) => (
              <Pressable 
                key={r.key} 
                onPress={() => onSelect(r.key, r.ratio)} 
                className="px-5 py-4 rounded-2xl bg-surfaceElevated border border-border mr-3 mb-3 shadow-soft"
              >
                <Text className="text-text-primary text-base" style={{ fontFamily: 'Inter_500Medium' }}>{r.key}</Text>
              </Pressable>
            ))}
          </View>
          <PrimaryButton 
            title="Cancel" 
            onPress={onClose} 
            variant="secondary" 
            size="xl"
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
}

