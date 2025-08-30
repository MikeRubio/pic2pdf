import { useCallback, useMemo, useRef, useState } from 'react';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BANNER_TEST_UNIT = 'ca-app-pub-3940256099942544/6300978111';
const INTERSTITIAL_TEST_UNIT = 'ca-app-pub-3940256099942544/1033173712';
const REWARDED_TEST_UNIT = 'ca-app-pub-3940256099942544/5224354917';

const INTERSTITIAL_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes
const STORAGE_LAST_INTERSTITIAL = 'p2p:last_interstitial_at';

export type AdManager = {
  bannerUnitId: string;
  showInterstitialIfAllowed: () => Promise<boolean>;
  cooldownRemaining: number;
  showRewardedForHD: (onReward?: () => void) => Promise<boolean>;
  rewardedLoading: boolean;
  interstitialLoading: boolean;
};

export function useAdManager(): AdManager {
  const [rewardedLoading, setRewardedLoading] = useState(false);
  const [interstitialLoading, setInterstitialLoading] = useState(false);
  const cooldownRef = useRef(0);
  const admobRef = useRef<any | null>(null);

  const bannerUnitId = useMemo(() => BANNER_TEST_UNIT, []);

  const getCooldownRemaining = useCallback(async () => {
    try {
      const v = await AsyncStorage.getItem(STORAGE_LAST_INTERSTITIAL);
      const last = v ? Number(v) : 0;
      const now = Date.now();
      const remaining = Math.max(0, last + INTERSTITIAL_COOLDOWN_MS - now);
      cooldownRef.current = remaining;
      return remaining;
    } catch {
      cooldownRef.current = 0;
      return 0;
    }
  }, []);

  const setCooldownNow = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_LAST_INTERSTITIAL, String(Date.now()));
    } catch {}
  }, []);

  const showInterstitialIfAllowed = useCallback(async () => {
    if (Constants.appOwnership === 'expo') return false; // Not supported in Expo Go
    const remaining = await getCooldownRemaining();
    if (remaining > 0) return false;
    try {
      setInterstitialLoading(true);
      if (!admobRef.current) {
        try {
          admobRef.current = require('expo-ads-admob');
        } catch {
          return false; // Not available (e.g., Expo Go)
        }
      }
      const { AdMobInterstitial } = admobRef.current;
      if (!AdMobInterstitial) return false;
      AdMobInterstitial.setAdUnitID(INTERSTITIAL_TEST_UNIT);
      await AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true });
      await AdMobInterstitial.showAdAsync();
      await setCooldownNow();
      return true;
    } catch (e) {
      // Fail silently and proceed
      return false;
    } finally {
      setInterstitialLoading(false);
    }
  }, [getCooldownRemaining, setCooldownNow]);

  const showRewardedForHD = useCallback(async (onReward?: () => void) => {
    if (Constants.appOwnership === 'expo') return false; // Not supported in Expo Go
    try {
      setRewardedLoading(true);
      if (!admobRef.current) {
        try {
          admobRef.current = require('expo-ads-admob');
        } catch {
          return false;
        }
      }
      const { AdMobRewarded } = admobRef.current;
      if (!AdMobRewarded) return false;
      AdMobRewarded.setAdUnitID(REWARDED_TEST_UNIT);
      await AdMobRewarded.requestAdAsync();
      await AdMobRewarded.showAdAsync();
      // Expo's result may not explicitly return reward; invoke callback post-show
      onReward?.();
      return true;
    } catch (e) {
      return false;
    } finally {
      setRewardedLoading(false);
    }
  }, []);

  return {
    bannerUnitId,
    showInterstitialIfAllowed,
    cooldownRemaining: cooldownRef.current,
    showRewardedForHD,
    rewardedLoading,
    interstitialLoading,
  };
}
