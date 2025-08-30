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
  <Pressable 
    onPress={onPress} 
    className={`px-4 py-3 rounded-2xl mr-3 mb-3 border ${
      selected 
        ? 'bg-primary-600 border-primary-600' 
        : 'bg-surface border-border'
    }`}
  >
    <Text 
      style={{ fontFamily: 'Inter_500Medium' }} 
      className={selected ? 'text-white' : 'text-text-primary'}
    >
      {title}
    </Text>
  </Pressable>
);

export default function PdfOptionsSheet({ visible, onClose, value, onChange }: Props) {
  const set = (partial: Partial<Props['value']>) => onChange({ ...value, ...partial });
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-surface rounded-t-3xl p-6 shadow-large">
          <View className="w-12 h-1 bg-neutral-300 rounded-full self-center mb-6" />
          <Text className="text-text-primary text-xl mb-6" style={{ fontFamily: 'Inter_700Bold' }}>PDF Export Options</Text>
          
          <Text className="text-text-secondary mb-3" style={{ fontFamily: 'Inter_500Medium' }}>Paper Size</Text>
          <View className="flex-row flex-wrap">
            {(['auto','A4','Letter','Legal'] as PaperPreset[]).map(p => (
              <Item key={p} title={p} selected={value.paper===p} onPress={() => set({ paper: p })} />
            ))}
          </View>
          
          <Text className="text-text-secondary mb-3 mt-4" style={{ fontFamily: 'Inter_500Medium' }}>Orientation</Text>
          <View className="flex-row flex-wrap">
            {(['auto','portrait','landscape'] as Orientation[]).map(o => (
              <Item key={o} title={o} selected={value.orientation===o} onPress={() => set({ orientation: o })} />
            ))}
          </View>
          
          <Text className="text-text-secondary mb-3 mt-4" style={{ fontFamily: 'Inter_500Medium' }}>Margins</Text>
          <View className="flex-row flex-wrap">
            {(['none','small','medium','large'] as const).map(m => (
              <Item key={m} title={m} selected={value.margins===m} onPress={() => set({ margins: m })} />
            ))}
          </View>
          
          <Text className="text-text-secondary mb-3 mt-4" style={{ fontFamily: 'Inter_500Medium' }}>Image Fit</Text>
          <View className="flex-row flex-wrap">
            {(['contain','cover','stretch'] as FitMode[]).map(f => (
              <Item key={f} title={f} selected={value.fit===f} onPress={() => set({ fit: f })} />
            ))}
          </View>
          
          <View className="flex-row mt-8">
            <Pressable onPress={onClose} className="flex-1 bg-primary-600 rounded-2xl py-4 items-center shadow-medium">
              <Text className="text-white text-lg" style={{ fontFamily: 'Inter_700Bold' }}>Apply Settings</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

