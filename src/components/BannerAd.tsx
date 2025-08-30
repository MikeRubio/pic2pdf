import React, { useMemo } from 'react';
import { View } from 'react-native';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  adUnitId: string;
};

export default function BannerAd({ adUnitId }: Props) {
  const insets = useSafeAreaInsets();
  const AdComponent = useMemo(() => {
    if (Constants.appOwnership === 'expo') return null; // Expo Go doesn't include AdMob native module
    try {
      // Dynamically require so Expo Go can run without this native module
      const mod = require('expo-ads-admob');
      return mod?.AdMobBanner ?? null;
    } catch {
      return null;
    }
  }, []);

  if (!AdComponent) return null;

  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: insets.bottom, backgroundColor: '#F9FAFB' }}>
      <AdComponent bannerSize="smartBannerPortrait" adUnitID={adUnitId} servePersonalizedAds onDidFailToReceiveAdWithError={() => {}} />
    </View>
  );
}
