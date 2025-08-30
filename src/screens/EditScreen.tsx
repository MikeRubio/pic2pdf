import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import BannerAd from '../components/BannerAd';
import { useAdManager } from '../hooks/useAdManager';
import * as Haptics from 'expo-haptics';
import { imagesToPdf, ImageInput, FitMode, PaperPreset, Orientation } from '../utils/pdfUtils';
import { addRecent } from '../utils/recents';
import * as Notifications from 'expo-notifications';
import Animated, { FadeInDown } from 'react-native-reanimated';
import PrimaryButton from '../components/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import PdfOptionsSheet from '../components/PdfOptionsSheet';
import * as ImageManipulator from 'expo-image-manipulator';
import CropRatioSheet from '../components/CropRatioSheet';
import { MotiView } from 'moti';

type Props = NativeStackScreenProps<RootStackParamList, 'Edit'>;

export default function EditScreen({ route, navigation }: Props) {
  const initial = (route.params?.images || []).map((x, idx) => ({ ...x, key: `${x.uri}-${idx}-${Date.now()}` }));
  const [items, setItems] = useState(initial);
  const [exporting, setExporting] = useState(false);
  const [hd, setHd] = useState(false);
  const [optsVisible, setOptsVisible] = useState(false);
  const [pdfUi, setPdfUi] = useState<{ paper: PaperPreset; orientation: Orientation; margins: 'none'|'small'|'medium'|'large'; fit: FitMode }>({
    paper: 'auto',
    orientation: 'auto',
    margins: 'small',
    fit: 'contain',
  });
  const [cropVisible, setCropVisible] = useState(false);
  const [editorKey, setEditorKey] = useState<string | null>(null);
  const ad = useAdManager();

  const removeAt = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<any>) => (
    <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }}>
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
      <View className="flex-row">
        <Pressable onPress={() => { setEditorKey(item.key); navigation.navigate('CropEditor', { uri: item.uri, imageWidth: item.width, imageHeight: item.height, onComplete: (res) => { if (editorKey) { setItems(prev => prev.map(it => it.key === editorKey ? { ...it, uri: res.uri, width: res.width, height: res.height } : it)); } } }); }} className="px-3 py-2 rounded-xl bg-gray-100 mr-2">
          <Ionicons name="create-outline" size={18} color="#111827" />
        </Pressable>
        <Pressable onPress={() => { setEditorKey(item.key); setCropVisible(true); }} className="px-3 py-2 rounded-xl bg-gray-100 mr-2">
          <Ionicons name="crop-outline" size={18} color="#111827" />
        </Pressable>
        <Pressable onPress={async () => {
          try {
            const res = await ImageManipulator.manipulateAsync(item.uri, [{ rotate: 90 }], { compress: 1, format: ImageManipulator.SaveFormat.JPEG });
            setItems(prev => prev.map(it => it.key === item.key ? { ...it, uri: res.uri } : it));
          } catch {}
        }} className="px-3 py-2 rounded-xl bg-gray-100 mr-2">
          <Ionicons name="return-down-forward-outline" size={18} color="#111827" />
        </Pressable>
        <Pressable onPress={() => removeAt(item.key)} className="px-3 py-2 rounded-xl bg-red-50">
          <Ionicons name="trash-outline" size={18} color="#DC2626" />
        </Pressable>
      </View>
    </Pressable>
    </MotiView>
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
      const marginsMap = { none: 0, small: 8, medium: 15, large: 25 } as const;
      const { fileUri, fileName } = await imagesToPdf(imagesForPdf, {
        dpi,
        title: 'Photo2PDF Export',
        paper: pdfUi.paper,
        orientation: pdfUi.orientation,
        marginsMm: marginsMap[pdfUi.margins],
        fit: pdfUi.fit,
      });
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
        <Animated.View entering={FadeInDown.duration(250)}>
          <Text className="text-lg text-text" style={{ fontFamily: 'Inter_700Bold' }}>Reorder photos</Text>
          <Text className="text-gray-600 mt-1" style={{ fontFamily: 'Inter_400Regular' }}>Long-press and drag to reorder.</Text>
        </Animated.View>
        <View className="flex-row mt-3 items-center">
          <View className="flex-row items-center bg-white rounded-2xl px-3 py-2 mr-2">
            <Ionicons name="sparkles-outline" size={18} color="#10B981" />
            <Text className="text-gray-600 mx-2" style={{ fontFamily: 'Inter_500Medium' }}>HD</Text>
            {hd ? (
              <Text className="text-accent" style={{ fontFamily: 'Inter_700Bold' }}>Enabled</Text>
            ) : (
              <Pressable onPress={unlockHD} className="bg-accent rounded-xl px-3 py-1">
                <Text className="text-white" style={{ fontFamily: 'Inter_700Bold' }}>Unlock</Text>
              </Pressable>
            )}
          </View>
          <Pressable onPress={() => setOptsVisible(true)} className="flex-row items-center bg-white rounded-2xl px-3 py-2">
            <Ionicons name="options-outline" size={18} color="#111827" />
            <Text className="text-text ml-2" style={{ fontFamily: 'Inter_500Medium' }}>PDF Options</Text>
          </Pressable>
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
        {exporting ? (
          <View className="bg-primary rounded-2xl p-4 items-center"><ActivityIndicator color="#fff" /></View>
        ) : (
          <PrimaryButton title="Export to PDF" icon="download-outline" onPress={doExport} />
        )}
      </View>

      <BannerAd adUnitId={ad.bannerUnitId} />
      <PdfOptionsSheet
        visible={optsVisible}
        onClose={() => setOptsVisible(false)}
        value={pdfUi}
        onChange={setPdfUi}
      />
      <CropRatioSheet
        visible={cropVisible}
        onClose={() => setCropVisible(false)}
        onSelect={(key, ratio) => {
          setCropVisible(false);
          if (!editorKey) return;
          const it = items.find(x => x.key === editorKey);
          if (!it) return;
          navigation.navigate('CropEditor', { uri: it.uri, imageWidth: it.width, imageHeight: it.height, aspect: ratio, onComplete: (res) => { setItems(prev => prev.map(x => x.key === editorKey ? { ...x, uri: res.uri, width: res.width, height: res.height } : x)); } });
        }}
      />
    </View>
  );
}




