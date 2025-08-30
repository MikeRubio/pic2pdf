import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Image, Dimensions, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import PrimaryButton from '../components/PrimaryButton';
import * as ImageManipulator from 'expo-image-manipulator';

type Props = NativeStackScreenProps<RootStackParamList, 'CropEditor'>;

export default function CropEditorScreen({ route, navigation }: Props) {
  const { uri, imageWidth, imageHeight, aspect, onComplete } = route.params;
  const [imgW, setImgW] = useState(imageWidth || 0);
  const [imgH, setImgH] = useState(imageHeight || 0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!imgW || !imgH) {
      Image.getSize(uri, (w, h) => { setImgW(w); setImgH(h); }, () => {});
    }
  }, [uri]);

  const screen = Dimensions.get('window');
  const padding = 16;
  const cropW = screen.width - padding * 2;
  const cropH = useMemo(() => {
    if (aspect && aspect > 0) return Math.min(cropW / aspect, screen.height * 0.55);
    // default to up to 55% height with image aspect
    const a = imgW && imgH ? imgW / imgH : 3 / 4;
    return Math.min(cropW / a, screen.height * 0.55);
  }, [aspect, imgW, imgH]);

  // base display size to cover crop area ("cover")
  const base = useMemo(() => {
    const imgRatio = imgW && imgH ? imgW / imgH : 3 / 4;
    const cropRatio = cropW / cropH;
    if (imgRatio > cropRatio) {
      // wider
      const h = cropH;
      const w = h * imgRatio;
      return { w, h };
    } else {
      const w = cropW;
      const h = w / imgRatio;
      return { w, h };
    }
  }, [imgW, imgH, cropW, cropH]);

  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const minScale = useMemo(() => 1, []);
  const maxScale = 5;

  const pan = Gesture.Pan().onChange((e) => {
    tx.value += e.changeX;
    ty.value += e.changeY;
  });
  const pinch = Gesture.Pinch().onChange((e) => {
    const next = Math.max(minScale, Math.min(maxScale, scale.value * e.scale));
    scale.value = next;
  });

  const composed = Gesture.Simultaneous(pan, pinch);

  const imgStyle = useAnimatedStyle(() => ({
    width: base.w * scale.value,
    height: base.h * scale.value,
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
    ],
  }));

  const doSave = useCallback(async () => {
    if (!imgW || !imgH) return;
    try {
      setBusy(true);
      // Compute crop rectangle in image pixels
      const dispW = base.w * scale.value;
      const dispH = base.h * scale.value;
      const left = (cropW - dispW) / 2 + tx.value;
      const top = (cropH - dispH) / 2 + ty.value;
      const originX = Math.max(0, Math.min(imgW, (0 - left) / dispW * imgW));
      const originY = Math.max(0, Math.min(imgH, (0 - top) / dispH * imgH));
      const widthPx = Math.max(1, Math.min(imgW - originX, cropW / dispW * imgW));
      const heightPx = Math.max(1, Math.min(imgH - originY, cropH / dispH * imgH));

      const result = await ImageManipulator.manipulateAsync(uri, [{ crop: { originX, originY, width: widthPx, height: heightPx } }], {
        compress: 1,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      if (onComplete) onComplete(result);
      navigation.goBack();
    } catch (e) {
      setBusy(false);
    }
  }, [imgW, imgH, base.w, base.h, cropW, cropH, uri, navigation]);

  return (
    <View className="flex-1 bg-background">
      <View style={{ padding: padding + 4, paddingTop: 24 }}>
        <Text className="text-3xl text-text-primary mb-4" style={{ fontFamily: 'Inter_700Bold' }}>Adjust Crop Area</Text>
        <Text className="text-text-secondary text-lg mb-8 leading-7" style={{ fontFamily: 'Inter_400Regular' }}>
          Pinch to zoom and drag to reposition your image within the crop area
        </Text>
        <View 
          style={{ 
            width: cropW, 
            height: cropH, 
            alignSelf: 'center', 
            backgroundColor: '#000', 
            borderRadius: 32, 
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 12
          }}
        >
          <GestureDetector gesture={composed}>
            <Animated.Image source={{ uri }} resizeMode="cover" style={[{ alignSelf: 'center' }, imgStyle]} />
          </GestureDetector>
          {/* Overlay grid */}
          <View pointerEvents="none" style={{ position: 'absolute', inset: 0, borderWidth: 4, borderColor: 'rgba(255,255,255,0.9)' }} />
          <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: cropH/3, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.6)' }} />
          <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: (cropH/3)*2, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.6)' }} />
          <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: cropW/3, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.6)' }} />
          <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: (cropW/3)*2, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.6)' }} />
        </View>
      </View>
      <View className="px-6 mt-10">
        <View className="flex-row space-x-4">
          <PrimaryButton 
            title="Reset" 
            variant="secondary" 
            onPress={() => { 
              scale.value = withTiming(1); 
              tx.value = withTiming(0); 
              ty.value = withTiming(0); 
            }} 
            size="xl"
            fullWidth
            style={{ flex: 1 }} 
          />
          <PrimaryButton 
            title="Apply Crop" 
            icon="checkmark"
            onPress={doSave} 
            size="xl"
            fullWidth
            style={{ flex: 1 }} 
          />
        </View>
      </View>
    </View>
  );
}

