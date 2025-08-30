import React from 'react';
import { View } from 'react-native';
import { AdMobBanner } from 'expo-ads-admob';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  adUnitId: string;
};

export default function BannerAd({ adUnitId }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: insets.bottom, backgroundColor: '#F9FAFB' }}>
      <AdMobBanner
        bannerSize="smartBannerPortrait"
        adUnitID={adUnitId}
        servePersonalizedAds
        onDidFailToReceiveAdWithError={() => {}}
      />
    </View>
  );
}

