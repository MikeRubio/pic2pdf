import React, { useCallback, useRef, useState } from 'react';
import { View, Text, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import PrimaryButton from '../components/PrimaryButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

type Slide = { key: string; title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap };

const slides: Slide[] = [
  { key: 'pick', title: 'Pick Your Photos', subtitle: 'Choose from gallery or snap with camera.', icon: 'images-outline' },
  { key: 'reorder', title: 'Arrange Easily', subtitle: 'Drag-and-drop to reorder seamlessly.', icon: 'reorder-three-outline' },
  { key: 'export', title: 'Export as PDF', subtitle: 'One tap to create and share.', icon: 'document-text-outline' },
];

type Props = { onDone: () => void };

export default function OnboardingScreen({ onDone }: Props) {
  const [index, setIndex] = useState(0);
  const ref = useRef<FlatList<Slide>>(null);

  const next = useCallback(async () => {
    if (index < slides.length - 1) {
      ref.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      await AsyncStorage.setItem('p2p:onboarded', '1');
      onDone();
    }
  }, [index, onDone]);

  return (
    <View className="flex-1 bg-background">
      <FlatList
        ref={ref}
        data={slides}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(i);
        }}
        renderItem={({ item }) => (
          <View style={{ width }} className="px-8 pt-20 items-center">
            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'timing', duration: 350 }}
              style={{ width: 96, height: 96, borderRadius: 16, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 }}
            >
              <Ionicons name={item.icon} size={48} color="#fff" />
            </MotiView>
            <Text className="text-2xl text-text mt-8" style={{ fontFamily: 'Inter_700Bold' }}>{item.title}</Text>
            <Text className="text-gray-600 mt-2 text-center" style={{ fontFamily: 'Inter_400Regular' }}>{item.subtitle}</Text>
          </View>
        )}
      />

      <View className="px-8 pb-12">
        <View className="flex-row justify-center mb-4">
          {slides.map((_, i) => (
            <View key={i} className={`h-2 rounded-full mx-1 ${i === index ? 'bg-primary w-6' : 'bg-gray-300 w-2'}`} />
          ))}
        </View>
        <PrimaryButton title={index === slides.length - 1 ? 'Get Started' : 'Next'} onPress={next} />
      </View>
    </View>
  );
}
