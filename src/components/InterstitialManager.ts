import { AdMobInterstitial } from 'expo-ads-admob';

const INTERSTITIAL_TEST_UNIT = 'ca-app-pub-3940256099942544/1033173712';

export async function showInterstitial(): Promise<void> {
  AdMobInterstitial.setAdUnitID(INTERSTITIAL_TEST_UNIT);
  await AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true });
  await AdMobInterstitial.showAdAsync();
}

