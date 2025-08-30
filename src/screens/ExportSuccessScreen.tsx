import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import * as Sharing from 'expo-sharing';
import BannerAd from '../components/BannerAd';
import { useAdManager } from '../hooks/useAdManager';
// pdf utils not needed here
import * as FileSystem from 'expo-file-system';
import { openPdf, saveToDownloadsAndroid } from '../utils/openUtils';
import PrimaryButton from '../components/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

type Props = NativeStackScreenProps<RootStackParamList, 'ExportSuccess'>;

export default function ExportSuccessScreen({ route, navigation }: Props) {
  const { fileUri, hd } = route.params;
  const ad = useAdManager();
  const [busy, setBusy] = useState(false);
  const [currentFile, setCurrentFile] = useState(fileUri);
  const [isHd, setIsHd] = useState(hd);

  const share = useCallback(async () => {
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('Sharing not available', 'Your device does not support sharing this file.');
        return;
      }
      await Sharing.shareAsync(currentFile, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
    } catch (e) {
      Alert.alert('Share failed', 'Could not share the PDF.');
    }
  }, [currentFile]);

  const open = useCallback(async () => {
    const ok = await openPdf(currentFile);
    if (!ok) Alert.alert('Open failed', 'No app found to open PDF.');
  }, [currentFile]);

  const saveToDownloads = useCallback(async () => {
    if (Platform.OS !== 'android') return;
    setBusy(true);
    const ok = await saveToDownloadsAndroid(currentFile, currentFile.split('/').pop());
    setBusy(false);
    if (ok) {
      Alert.alert('Saved', 'Saved to selected folder.');
    } else {
      Alert.alert('Save failed', 'Could not save to Downloads.');
    }
  }, [currentFile]);

  const upgradeToHD = useCallback(async () => {
    try {
      setBusy(true);
      const ok = await ad.showRewardedForHD();
      if (!ok) {
        Alert.alert('Ad unavailable', 'Could not show rewarded ad at this time.');
        return;
      }
      // To upgrade, we need original images; if not available here, we can try reading pages back which is not feasible.
      // Simplest approach: instruct user to re-export from Edit after unlocking. For demo, attempt to re-process using same file (not possible lossless).
      Alert.alert(
        'HD Export',
        'HD export is unlocked. Re-export from Arrange screen for best quality.',
        [
          { text: 'OK' },
          { text: 'Go to Arrange', onPress: () => navigation.popToTop() },
        ]
      );
      setIsHd(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert('Upgrade failed', 'Could not upgrade to HD.');
    } finally {
      setBusy(false);
    }
  }, [ad, navigation]);

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-12 pb-8 items-center">
        <Animated.View entering={FadeInDown.duration(250)}>
          <View className="w-20 h-20 rounded-full bg-accent-100 items-center justify-center mb-6">
            <Ionicons name="checkmark-circle" size={40} color="#10B981" />
          </View>
          <Text className="text-3xl text-text-primary text-center" style={{ fontFamily: 'Inter_700Bold' }}>
            Export Complete!
          </Text>
          <Text className="text-text-secondary mt-3 text-center text-lg leading-6" style={{ fontFamily: 'Inter_400Regular' }}>
            Your PDF has been created and is ready to share or save.
          </Text>
        </Animated.View>
      </View>

      <View className="px-6 mb-6">
        <View className="bg-surface rounded-3xl p-5 shadow-medium border border-border-light">
          <Text className="text-text-tertiary text-sm mb-1" style={{ fontFamily: 'Inter_500Medium' }}>File Location</Text>
          <Text className="text-text-secondary" style={{ fontFamily: 'Inter_400Regular' }} numberOfLines={2}>
            {currentFile.replace(FileSystem.documentDirectory || '', '')}
          </Text>
          {isHd && (
            <View className="flex-row items-center mt-3">
              <View className="bg-accent-100 px-3 py-1.5 rounded-lg">
                <Text className="text-accent-700" style={{ fontFamily: 'Inter_700Bold' }}>HD Quality</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <View className="px-6 mb-4">
        <View className="flex-row space-x-3">
          <PrimaryButton 
            title="Share PDF" 
            icon="share-social-outline" 
            onPress={share} 
            size="lg"
            style={{ flex: 1 }} 
          />
          <PrimaryButton 
            title="Open" 
            icon="open-outline" 
            onPress={open} 
            variant="secondary" 
            size="lg"
            style={{ flex: 1 }} 
          />
        </View>
      </View>

      {Platform.OS === 'android' && (
        <View className="px-6 mb-4">
          {busy ? (
            <View className="bg-neutral-800 rounded-2xl py-4 items-center shadow-medium">
              <ActivityIndicator color="#fff" size="small" />
              <Text className="text-white mt-2" style={{ fontFamily: 'Inter_500Medium' }}>Saving...</Text>
            </View>
          ) : (
            <PrimaryButton 
              title="Save to Downloads" 
              icon="download-outline" 
              onPress={saveToDownloads} 
              variant="dark" 
              size="lg"
            />
          )}
        </View>
      )}

      <View className="px-6 mb-8">
        {isHd ? (
          <View className="bg-accent-50 rounded-2xl p-4 items-center border border-accent-200">
            <View className="flex-row items-center">
              <Ionicons name="sparkles" size={18} color="#10B981" />
              <Text className="text-accent-700 ml-2" style={{ fontFamily: 'Inter_700Bold' }}>HD Quality Enabled</Text>
            </View>
          </View>
        ) : (
          <Pressable 
            disabled={busy} 
            onPress={upgradeToHD} 
            className="bg-accent-600 rounded-2xl p-4 items-center shadow-medium border border-accent-600"
          >
            {busy ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="#fff" size="small" />
                <Text className="text-white ml-2" style={{ fontFamily: 'Inter_700Bold' }}>Loading...</Text>
              </View>
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="sparkles-outline" size={18} color="#FFFFFF" />
                <Text className="text-white ml-2" style={{ fontFamily: 'Inter_700Bold' }}>Upgrade to HD Quality</Text>
              </View>
            )}
          </Pressable>
        )}
      </View>

      <BannerAd adUnitId={ad.bannerUnitId} />
    </View>
  );
}

