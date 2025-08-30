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
          <View style={{ width }} className="px-8 pt-24 items-center">
            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'timing', duration: 350 }}
              className="w-24 h-24 rounded-3xl bg-primary-600 items-center justify-center shadow-large"
            >
              <Ionicons name={item.icon} size={40} color="#fff" />
            </MotiView>
            <Text className="text-3xl text-text-primary mt-8 text-center" style={{ fontFamily: 'Inter_700Bold' }}>
              {item.title}
            </Text>
            <Text className="text-text-secondary mt-3 text-center text-lg leading-6 px-4" style={{ fontFamily: 'Inter_400Regular' }}>
              {item.subtitle}
            </Text>
          </View>
        )}
      />

      <View className="px-8 pb-16">
        <View className="flex-row justify-center mb-8">
          {slides.map((_, i) => (
            <View 
              key={i} 
              className={`h-2 rounded-full mx-1 transition-all duration-300 ${
                i === index ? 'bg-primary-600 w-8' : 'bg-neutral-300 w-2'
              }`} 
            />
          ))}
        </View>
        <PrimaryButton 
          title={index === slides.length - 1 ? 'Get Started' : 'Next'} 
          onPress={next} 
          size="lg"
          icon={index === slides.length - 1 ? 'checkmark' : 'arrow-forward'}
        />
      </View>
    </View>
  );
}
