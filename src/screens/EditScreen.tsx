import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import BannerAd from '../components/BannerAd';
import { useAdManager } from '../hooks/useAdManager';
import * as Haptics from 'expo-haptics';
import { imagesToPdf, ImageInput } from '../utils/pdfUtils';
import { addRecent } from '../utils/recents';
import * as Notifications from 'expo-notifications';
import { motion } from 'framer-motion/native';

type Props = NativeStackScreenProps<RootStackParamList, 'Edit'>;

export default function EditScreen({ route, navigation }: Props) {
  const initial = (route.params?.images || []).map((x, idx) => ({ ...x, key: `${x.uri}-${idx}-${Date.now()}` }));
  const [items, setItems] = useState(initial);
  const [exporting, setExporting] = useState(false);
  const [hd, setHd] = useState(false);
  const ad = useAdManager();

  const removeAt = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<any>) => (
    <Pressable onLongPress={drag} className="bg-white rounded-2xl p-3 mb-3 flex-row items-center shadow-soft" style={{ opacity: isActive ? 0.85 : 1 }}>
      <Image source={{ uri: item.uri }} style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: '#eee' }} />
      <View className="ml-3 flex-1">
        <Text className="text-text" style={{ fontFamily: 'Inter_500Medium' }} numberOfLines={1}>
          {item.fileName || item.uri.split('/').pop()}
        </Text>
        <Text className="text-gray-500" style={{ fontFamily: 'Inter_400Regular', fontSize: 12 }}>
          {item.width}×{item.height}
        </Text>
      </View>
      <Pressable onPress={() => removeAt(item.key)} className="px-3 py-2 rounded-xl bg-red-50">
        <Text className="text-red-600" style={{ fontFamily: 'Inter_500Medium' }}>Delete</Text>
      </Pressable>
    </Pressable>
  ), [removeAt]);

  const imagesForPdf: ImageInput[] = useMemo(() => items.map(({ key, ...rest }) => rest), [items]);

  const unlockHD = useCallback(async () => {
    const ok = await ad.showRewardedForHD(() => setHd(true));
    if (ok) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('HD Unlocked', 'HD export enabled for this session.');
    } else {
      Alert.alert('Ad unavailable', 'Could not show rewarded ad at this time.');
    }
  }, [ad]);

  const doExport = useCallback(async () => {
    if (!items.length) {
      Alert.alert('No photos', 'Please add at least one photo.');
      return;
    }
    try {
      setExporting(true);
      // Interstitial with cooldown (non-blocking if unavailable)
      await ad.showInterstitialIfAllowed();
      const dpi = hd ? 300 : 150;
      const { fileUri, fileName } = await imagesToPdf(imagesForPdf, { dpi, title: 'Photo2PDF Export' });
      await addRecent({ fileUri, name: fileName, createdAt: Date.now(), hd });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Export complete', body: 'Your PDF is ready to share.' },
        trigger: null,
      });
      navigation.replace('ExportSuccess', { fileUri, hd });
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Export failed', 'Something went wrong while exporting.');
    } finally {
      setExporting(false);
    }
  }, [items.length, imagesForPdf, ad, hd, navigation]);

  return (
    <View className="flex-1 bg-background">
      <View className="px-5 pt-4 pb-2">
        <motion.View initial={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }}>
          <Text className="text-lg text-text" style={{ fontFamily: 'Inter_700Bold' }}>Reorder photos</Text>
          <Text className="text-gray-600 mt-1" style={{ fontFamily: 'Inter_400Regular' }}>Long-press and drag to reorder.</Text>
        </motion.View>
        <View className="flex-row mt-3 items-center">
          <View className="flex-row items-center bg-white rounded-2xl px-3 py-2 mr-2">
            <Text className="text-gray-600 mr-2" style={{ fontFamily: 'Inter_500Medium' }}>HD:</Text>
            {hd ? (
              <Text className="text-accent" style={{ fontFamily: 'Inter_700Bold' }}>Enabled</Text>
            ) : (
              <Pressable onPress={unlockHD} className="bg-accent rounded-xl px-3 py-1">
                <Text className="text-white" style={{ fontFamily: 'Inter_700Bold' }}>Unlock (Ad)</Text>
              </Pressable>
            )}
          </View>
          <View className="flex-1" />
        </View>
      </View>

      <View className="flex-1 px-5">
        <DraggableFlatList
          data={items}
          keyExtractor={(item) => item.key}
          onDragEnd={({ data }) => setItems(data)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 140 }}
        />
      </View>

      <View className="px-5 pb-28">
        <Pressable disabled={exporting} onPress={doExport} className="bg-primary rounded-2xl p-4 items-center">
          {exporting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white" style={{ fontFamily: 'Inter_700Bold' }}>Export to PDF</Text>
          )}
        </Pressable>
      </View>

      <BannerAd adUnitId={ad.bannerUnitId} />
    </View>
  );
}

