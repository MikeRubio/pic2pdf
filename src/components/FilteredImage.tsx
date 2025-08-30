import React, { useMemo } from 'react';
import { View, Platform } from 'react-native';
import { ImageAdjustments } from '../utils/imageAdjustments';
import Constants from 'expo-constants';

type Props = {
  source: { uri: string };
  style?: any;
  adjustments?: ImageAdjustments;
  onFilterApplied?: (uri: string) => void;
};

export default function FilteredImage({ source, style, adjustments, onFilterApplied }: Props) {
  const { Image: RNImage } = require('react-native');

  // Expo Go or Web: skip native filter kit entirely
  const canUseFilterKit = useMemo(() => {
    if (Platform.OS === 'web') return false;
    if (Constants.appOwnership === 'expo') return false; // Expo Go
    return true;
  }, []);

  // If no adjustments, render plain image
  const noAdj = !adjustments || (!adjustments.brightness && !adjustments.contrast && !adjustments.saturation);
  if (noAdj || !canUseFilterKit) {
    return <RNImage source={source} style={style} />;
  }

  // Try dynamic require of native module only when needed
  let FilterKitImage: any = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    FilterKitImage = require('react-native-image-filter-kit').Image;
  } catch {
    return <RNImage source={source} style={style} />;
  }

  const brightness = adjustments.brightness * 0.5; // -0.5 to 0.5
  const contrast = (adjustments.contrast + 1) * 1.5; // 0 to 3
  const saturation = (adjustments.saturation + 1) * 1.5; // 0 to 3

  return (
    <View style={style}>
      <FilterKitImage
        source={source}
        style={style}
        config={{
          name: 'ColorMatrix',
          matrix: [
            contrast, 0, 0, 0, brightness * 255,
            0, contrast, 0, 0, brightness * 255,
            0, 0, contrast, 0, brightness * 255,
            0, 0, 0, 1, 0
          ]
        }}
        onFilterApplied={onFilterApplied}
      />
    </View>
  );
}
