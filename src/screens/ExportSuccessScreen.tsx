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
      <View className="px-6 pt-16 pb-10 items-center">
        <Animated.View entering={FadeInDown.duration(250)}>
          <View className="w-28 h-28 rounded-full bg-accent-100 items-center justify-center mb-8 shadow-large">
            <Ionicons name="checkmark-circle" size={56} color="#10B981" />
          </View>
          <Text className="text-4xl text-text-primary text-center mb-4" style={{ fontFamily: 'Inter_700Bold' }}>
            Export Complete!
          </Text>
          <Text className="text-text-secondary text-center text-xl leading-7 px-4" style={{ fontFamily: 'Inter_400Regular' }}>
            Your PDF has been created successfully and is ready to share or save.
          </Text>
        </Animated.View>
      </View>

      <View className="px-6 mb-8">
        <View className="bg-surfaceElevated rounded-4xl p-6 shadow-large border border-border-light">
          <View className="flex-row items-center mb-3">
            <Ionicons name="document-text" size={20} color="#0284C7" />
            <Text className="text-text-primary text-lg ml-3" style={{ fontFamily: 'Inter_700Bold' }}>PDF Details</Text>
          </View>
          <Text className="text-text-tertiary text-sm mb-2" style={{ fontFamily: 'Inter_500Medium' }}>File Location</Text>
          <Text className="text-text-secondary text-base leading-6" style={{ fontFamily: 'Inter_400Regular' }} numberOfLines={3}>
            {currentFile.replace(FileSystem.documentDirectory || '', '')}
          </Text>
          {isHd && (
            <View className="flex-row items-center mt-4">
              <View className="bg-accent-100 px-4 py-2 rounded-xl shadow-soft">
                <Text className="text-accent-700 text-sm" style={{ fontFamily: 'Inter_700Bold' }}>HD Quality</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <View className="px-6 mb-6">
        <View className="flex-row space-x-4">
          <PrimaryButton 
            title="Share PDF" 
            icon="share-social-outline" 
            onPress={share} 
            size="xl"
            fullWidth
            style={{ flex: 1 }} 
          />
          <PrimaryButton 
            title="Open" 
            icon="open-outline" 
            onPress={open} 
            variant="secondary" 
            size="xl"
            fullWidth
            style={{ flex: 1 }} 
          />
        </View>
      </View>

      {Platform.OS === 'android' && (
        <View className="px-6 mb-6">
          {busy ? (
            <View className="bg-slate-800 rounded-3xl py-6 items-center shadow-large">
              <ActivityIndicator color="#fff" size="large" />
              <Text className="text-white mt-3 text-lg" style={{ fontFamily: 'Inter_500Medium' }}>Saving...</Text>
            </View>
          ) : (
            <PrimaryButton 
              title="Save to Downloads" 
              icon="download-outline" 
              onPress={saveToDownloads} 
              variant="dark" 
              size="xl"
              fullWidth
            />
          )}
        </View>
      )}

      <View className="px-6 mb-10">
        {isHd ? (
          <View className="bg-accent-50 rounded-3xl p-6 items-center border border-accent-200 shadow-soft">
            <View className="flex-row items-center">
              <Ionicons name="sparkles" size={22} color="#10B981" />
              <Text className="text-accent-700 ml-3 text-lg" style={{ fontFamily: 'Inter_700Bold' }}>HD Quality Enabled</Text>
            </View>
          </View>
        ) : (
          <Pressable 
            disabled={busy} 
            onPress={upgradeToHD} 
            className="bg-accent-600 rounded-3xl p-6 items-center shadow-large border border-accent-600"
          >
            {busy ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="#fff" size="large" />
                <Text className="text-white ml-3 text-lg" style={{ fontFamily: 'Inter_700Bold' }}>Loading...</Text>
              </View>
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="sparkles-outline" size={22} color="#FFFFFF" />
                <Text className="text-white ml-3 text-lg" style={{ fontFamily: 'Inter_700Bold' }}>Upgrade to HD Quality</Text>
              </View>
            )}
          </Pressable>
        )}
      </View>

      <BannerAd adUnitId={ad.bannerUnitId} />
    </View>
  );
}

