import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { FitMode, PaperPreset, Orientation } from '../utils/pdfUtils';

type Props = {
  visible: boolean;
  onClose: () => void;
  value: { paper: PaperPreset; orientation: Orientation; margins: 'none' | 'small' | 'medium' | 'large'; fit: FitMode };
  onChange: (v: Props['value']) => void;
};

const Item = ({ title, selected, onPress }: { title: string; selected: boolean; onPress: () => void }) => (
  <Pressable onPress={onPress} className={`px-3 py-2 rounded-xl mr-2 mb-2 ${selected ? 'bg-primary' : 'bg-gray-100'}`}>
    <Text style={{ fontFamily: 'Inter_500Medium' }} className={selected ? 'text-white' : 'text-text'}>{title}</Text>
  </Pressable>
);

export default function PdfOptionsSheet({ visible, onClose, value, onChange }: Props) {
  const set = (partial: Partial<Props['value']>) => onChange({ ...value, ...partial });
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white rounded-t-2xl p-4">
          <Text className="text-text text-lg mb-2" style={{ fontFamily: 'Inter_700Bold' }}>PDF Options</Text>
          <Text className="text-gray-500 mb-1" style={{ fontFamily: 'Inter_500Medium' }}>Paper</Text>
          <View className="flex-row flex-wrap">
            {(['auto','A4','Letter','Legal'] as PaperPreset[]).map(p => (
              <Item key={p} title={p} selected={value.paper===p} onPress={() => set({ paper: p })} />
            ))}
          </View>
          <Text className="text-gray-500 mb-1 mt-2" style={{ fontFamily: 'Inter_500Medium' }}>Orientation</Text>
          <View className="flex-row flex-wrap">
            {(['auto','portrait','landscape'] as Orientation[]).map(o => (
              <Item key={o} title={o} selected={value.orientation===o} onPress={() => set({ orientation: o })} />
            ))}
          </View>
          <Text className="text-gray-500 mb-1 mt-2" style={{ fontFamily: 'Inter_500Medium' }}>Margins</Text>
          <View className="flex-row flex-wrap">
            {(['none','small','medium','large'] as const).map(m => (
              <Item key={m} title={m} selected={value.margins===m} onPress={() => set({ margins: m })} />
            ))}
          </View>
          <Text className="text-gray-500 mb-1 mt-2" style={{ fontFamily: 'Inter_500Medium' }}>Fit</Text>
          <View className="flex-row flex-wrap">
            {(['contain','cover','stretch'] as FitMode[]).map(f => (
              <Item key={f} title={f} selected={value.fit===f} onPress={() => set({ fit: f })} />
            ))}
          </View>
          <View className="flex-row mt-3">
            <Pressable onPress={onClose} className="flex-1 bg-text rounded-2xl p-3 items-center">
              <Text className="text-white" style={{ fontFamily: 'Inter_700Bold' }}>Done</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

