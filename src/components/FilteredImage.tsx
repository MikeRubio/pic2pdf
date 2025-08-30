import React from 'react';
import { View, Platform } from 'react-native';
import { Image } from 'react-native-image-filter-kit';
import { ImageAdjustments } from '../utils/imageAdjustments';

type Props = {
  source: { uri: string };
  style?: any;
  adjustments?: ImageAdjustments;
  onFilterApplied?: (uri: string) => void;
};

export default function FilteredImage({ source, style, adjustments, onFilterApplied }: Props) {
  // On web platform, fall back to regular image
  if (Platform.OS === 'web') {
    const { Image: RNImage } = require('react-native');
    return <RNImage source={source} style={style} />;
  }

  // If no adjustments, use regular image
  if (!adjustments || (!adjustments.brightness && !adjustments.contrast && !adjustments.saturation)) {
    const { Image: RNImage } = require('react-native');
    return <RNImage source={source} style={style} />;
  }

  try {
    // Convert adjustments to filter values
    const brightness = adjustments.brightness * 0.5; // -0.5 to 0.5
    const contrast = (adjustments.contrast + 1) * 1.5; // 0 to 3
    const saturation = (adjustments.saturation + 1) * 1.5; // 0 to 3

    return (
      <View style={style}>
        <Image
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
  } catch (error) {
    // Fallback to regular image if filter fails
    const { Image: RNImage } = require('react-native');
    return <RNImage source={source} style={style} />;
  }
}