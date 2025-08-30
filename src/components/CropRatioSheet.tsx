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
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white rounded-t-2xl p-4">
          <Text className="text-text text-lg mb-3" style={{ fontFamily: 'Inter_700Bold' }}>Choose Crop Ratio</Text>
          <View className="flex-row flex-wrap">
            {ratios.map((r) => (
              <Pressable key={r.key} onPress={() => onSelect(r.key, r.ratio)} className="px-3 py-2 rounded-xl bg-gray-100 mr-2 mb-2">
                <Text className="text-text" style={{ fontFamily: 'Inter_500Medium' }}>{r.key}</Text>
              </Pressable>
            ))}
          </View>
          <View className="flex-row mt-3">
            <Pressable onPress={onClose} className="flex-1 bg-text rounded-2xl p-3 items-center">
              <Text className="text-white" style={{ fontFamily: 'Inter_700Bold' }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

