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
    className={`px-5 py-4 rounded-2xl mr-3 mb-3 border shadow-soft ${
      selected 
        ? 'bg-primary-600 border-primary-600' 
        : 'bg-surfaceElevated border-border'
    }`}
  >
    <Text 
      style={{ fontFamily: 'Inter_500Medium', fontSize: 16 }} 
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
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-surface rounded-t-4xl p-8 shadow-xl border-t border-border-light">
          <View className="w-16 h-1.5 bg-slate-300 rounded-full self-center mb-8" />
          <Text className="text-text-primary text-2xl mb-8" style={{ fontFamily: 'Inter_700Bold' }}>PDF Export Options</Text>
          
          <Text className="text-text-secondary mb-4 text-lg" style={{ fontFamily: 'Inter_500Medium' }}>Paper Size</Text>
          <View className="flex-row flex-wrap">
            {(['auto','A4','Letter','Legal'] as PaperPreset[]).map(p => (
              <Item key={p} title={p} selected={value.paper===p} onPress={() => set({ paper: p })} />
            ))}
          </View>
          
          <Text className="text-text-secondary mb-4 mt-6 text-lg" style={{ fontFamily: 'Inter_500Medium' }}>Orientation</Text>
          <View className="flex-row flex-wrap">
            {(['auto','portrait','landscape'] as Orientation[]).map(o => (
              <Item key={o} title={o} selected={value.orientation===o} onPress={() => set({ orientation: o })} />
            ))}
          </View>
          
          <Text className="text-text-secondary mb-4 mt-6 text-lg" style={{ fontFamily: 'Inter_500Medium' }}>Margins</Text>
          <View className="flex-row flex-wrap">
            {(['none','small','medium','large'] as const).map(m => (
              <Item key={m} title={m} selected={value.margins===m} onPress={() => set({ margins: m })} />
            ))}
          </View>
          
          <Text className="text-text-secondary mb-4 mt-6 text-lg" style={{ fontFamily: 'Inter_500Medium' }}>Image Fit</Text>
          <View className="flex-row flex-wrap">
            {(['contain','cover','stretch'] as FitMode[]).map(f => (
              <Item key={f} title={f} selected={value.fit===f} onPress={() => set({ fit: f })} />
            ))}
          </View>
          
          <View className="mt-10">
            <PrimaryButton 
              title="Apply Settings" 
              onPress={onClose} 
              size="xl"
              fullWidth
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

