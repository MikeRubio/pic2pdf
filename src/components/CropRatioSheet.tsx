import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';

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
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-surface rounded-t-3xl p-6 shadow-large">
          <View className="w-12 h-1 bg-neutral-300 rounded-full self-center mb-6" />
          <Text className="text-text-primary text-xl mb-6" style={{ fontFamily: 'Inter_700Bold' }}>Choose Crop Ratio</Text>
          <View className="flex-row flex-wrap">
            {ratios.map((r) => (
              <Pressable 
                key={r.key} 
                onPress={() => onSelect(r.key, r.ratio)} 
                className="px-4 py-3 rounded-2xl bg-surface border border-border mr-3 mb-3"
              >
                <Text className="text-text-primary" style={{ fontFamily: 'Inter_500Medium' }}>{r.key}</Text>
              </Pressable>
            ))}
          </View>
          <View className="flex-row mt-6">
            <Pressable onPress={onClose} className="flex-1 bg-neutral-800 rounded-2xl py-4 items-center shadow-medium">
              <Text className="text-white text-lg" style={{ fontFamily: 'Inter_700Bold' }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

