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
import * as Haptics from 'expo-haptics';
import { motion } from 'framer-motion/native';

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
      <View className="px-6 pt-8 pb-4 items-center">
        <motion.View initial={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }}>
          <Text className="text-2xl text-text text-center" style={{ fontFamily: 'Inter_700Bold' }}>Export Successful</Text>
          <Text className="text-gray-600 mt-2 text-center" style={{ fontFamily: 'Inter_400Regular' }}>
            Your PDF is saved locally and ready to share.
          </Text>
        </motion.View>
      </View>

      <View className="px-6 mt-2">
        <View className="bg-white rounded-2xl p-4 shadow-soft">
          <Text className="text-gray-600" style={{ fontFamily: 'Inter_400Regular' }} numberOfLines={2}>
            {currentFile.replace(FileSystem.documentDirectory || '', '')}
          </Text>
        </View>
      </View>

      <View className="px-6 mt-6">
        <View className="flex-row">
          <Pressable onPress={share} className="flex-1 bg-primary rounded-2xl p-4 items-center mr-2">
            <Text className="text-white" style={{ fontFamily: 'Inter_700Bold' }}>Share</Text>
          </Pressable>
          <Pressable onPress={open} className="flex-1 bg-text rounded-2xl p-4 items-center ml-2">
            <Text className="text-white" style={{ fontFamily: 'Inter_700Bold' }}>Open</Text>
          </Pressable>
        </View>
      </View>

      {Platform.OS === 'android' && (
        <View className="px-6 mt-3">
          <Pressable disabled={busy} onPress={saveToDownloads} className="bg-text rounded-2xl p-4 items-center">
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white" style={{ fontFamily: 'Inter_700Bold' }}>Save to Downloads</Text>
            )}
          </Pressable>
        </View>
      )}

      <View className="px-6 mt-3">
        {isHd ? (
          <View className="bg-emerald-50 rounded-2xl p-4 items-center">
            <Text className="text-accent" style={{ fontFamily: 'Inter_700Bold' }}>HD Enabled</Text>
          </View>
        ) : (
          <Pressable disabled={busy} onPress={upgradeToHD} className="bg-accent rounded-2xl p-4 items-center">
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white" style={{ fontFamily: 'Inter_700Bold' }}>Upgrade to HD (Ad)</Text>
            )}
          </Pressable>
        )}
      </View>

      <BannerAd adUnitId={ad.bannerUnitId} />
    </View>
  );
}

