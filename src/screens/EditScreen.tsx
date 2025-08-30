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
import { setHandler } from '../utils/navBus';
import ImageAdjustmentsSheet, { ImageAdjustments } from '../components/ImageAdjustmentsSheet';
import { hasAdjustments } from '../utils/imageAdjustments';
import FilteredImage from '../components/FilteredImage';
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
  const [adjustmentsVisible, setAdjustmentsVisible] = useState(false);
  const [imageAdjustments, setImageAdjustments] = useState<Record<string, ImageAdjustments>>({});
  const ad = useAdManager();

  const removeAt = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
    // Clean up adjustments for removed item
    setImageAdjustments(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const applyAdjustments = useCallback(async (key: string, adjustments: ImageAdjustments) => {
    // Store the adjustments - the FilteredImage component will handle the visual application
    setImageAdjustments(prev => ({ ...prev, [key]: adjustments }));
  }, [items]);

  const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<any>) => (
    <MotiView 
      from={{ opacity: 0, translateY: 12, scale: 0.95 }} 
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 15, stiffness: 150 }}
    >
      <Pressable 
        onLongPress={drag} 
        className="bg-surfaceElevated rounded-4xl p-5 mb-4 flex-row items-center shadow-large border border-border-light" 
        style={{ opacity: isActive ? 0.7 : 1 }}
      >
        <View className="relative">
          <FilteredImage 
            source={{ uri: item.uri }} 
            style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: '#F8FAFC' }} 
            adjustments={imageAdjustments[item.key]}
          />
          <View className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-slate-600 items-center justify-center shadow-medium">
            <Ionicons name="reorder-two" size={14} color="#FFFFFF" />
          </View>
        </View>
        <View className="ml-5 flex-1">
          <Text className="text-text-primary text-lg" style={{ fontFamily: 'Inter_500Medium' }} numberOfLines={1}>
            {item.fileName || item.uri.split('/').pop()}
          </Text>
          <Text className="text-text-tertiary mt-1 text-sm" style={{ fontFamily: 'Inter_400Regular' }}>
            {item.width}×{item.height} pixels
          </Text>
        </View>
        <View className="flex-row space-x-3">
          <Pressable 
            onPress={() => {
              setEditorKey(item.key);
              const handlerId = `${item.key}-${Date.now()}`;
              setHandler(handlerId, (res: any) => {
                setItems(prev => prev.map(it => it.key === item.key ? { ...it, uri: res.uri, width: res.width, height: res.height } : it));
              });
              navigation.navigate('CropEditor', { uri: item.uri, imageWidth: item.width, imageHeight: item.height, handlerId });
            }} 
            className="w-11 h-11 rounded-2xl bg-slate-100 items-center justify-center shadow-soft"
          >
            <Ionicons name="create-outline" size={18} color="#475569" />
          </Pressable>
          <Pressable 
            onPress={() => { 
              setEditorKey(item.key); 
              setAdjustmentsVisible(true); 
            }} 
            className={`w-11 h-11 rounded-2xl items-center justify-center shadow-soft ${
              hasAdjustments(imageAdjustments[item.key] || { brightness: 0, contrast: 0, saturation: 0 })
                ? 'bg-accent-100' 
                : 'bg-slate-100'
            }`}
          >
            <Ionicons 
              name="color-filter-outline" 
              size={18} 
              color={hasAdjustments(imageAdjustments[item.key] || { brightness: 0, contrast: 0, saturation: 0 }) ? "#10B981" : "#475569"} 
            />
          </Pressable>
          <Pressable 
            onPress={() => { setEditorKey(item.key); setCropVisible(true); }} 
            className="w-11 h-11 rounded-2xl bg-slate-100 items-center justify-center shadow-soft"
          >
            <Ionicons name="crop-outline" size={18} color="#475569" />
          </Pressable>
          <Pressable 
            onPress={async () => {
              try {
                const res = await ImageManipulator.manipulateAsync(item.uri, [{ rotate: 90 }], { compress: 1, format: ImageManipulator.SaveFormat.JPEG });
                setItems(prev => prev.map(it => it.key === item.key ? { ...it, uri: res.uri } : it));
              } catch {}
            }} 
            className="w-11 h-11 rounded-2xl bg-slate-100 items-center justify-center shadow-soft"
          >
            <Ionicons name="return-down-forward-outline" size={18} color="#475569" />
          </Pressable>
          <Pressable 
            onPress={() => removeAt(item.key)} 
            className="w-11 h-11 rounded-2xl bg-error-50 items-center justify-center shadow-soft"
          >
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
      <View className="px-6 pt-6 pb-6">
        <Animated.View entering={FadeInDown.duration(250)}>
          <Text className="text-3xl text-text-primary mb-3" style={{ fontFamily: 'Inter_700Bold' }}>
            Arrange Your Photos
          </Text>
          <Text className="text-text-secondary text-lg leading-7" style={{ fontFamily: 'Inter_400Regular' }}>
            Long-press and drag to reorder. Use the tools to edit, crop, or rotate each image.
          </Text>
        </Animated.View>
        
        <View className="flex-row mt-8 items-center space-x-4">
          <View className="flex-row items-center bg-surfaceElevated rounded-3xl px-5 py-4 shadow-medium border border-border-light flex-1">
            <Ionicons name="sparkles-outline" size={20} color="#10B981" />
            <Text className="text-text-secondary mx-3 text-base" style={{ fontFamily: 'Inter_500Medium' }}>HD Quality</Text>
            {hd ? (
              <View className="bg-accent-100 px-4 py-2 rounded-xl">
                <Text className="text-accent-700 text-sm" style={{ fontFamily: 'Inter_700Bold' }}>Enabled</Text>
              </View>
            ) : (
              <Pressable onPress={unlockHD} className="bg-accent-600 rounded-xl px-4 py-2 shadow-soft">
                <Text className="text-white text-sm" style={{ fontFamily: 'Inter_700Bold' }}>Unlock</Text>
              </Pressable>
            )}
          </View>
          <Pressable 
            onPress={() => setOptsVisible(true)} 
            className="flex-row items-center bg-surfaceElevated rounded-3xl px-5 py-4 shadow-medium border border-border-light"
          >
            <Ionicons name="options-outline" size={20} color="#475569" />
            <Text className="text-text-primary ml-3 text-base" style={{ fontFamily: 'Inter_500Medium' }}>Options</Text>
          </Pressable>
        </View>
      </View>

      <View className="flex-1 px-6 pb-4">
        <DraggableFlatList
          data={items}
          keyExtractor={(item) => item.key}
          onDragEnd={({ data }) => setItems(data)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      </View>

      <View className="px-6 pb-28">
        {exporting ? (
          <View className="bg-primary-600 rounded-3xl py-6 items-center shadow-large">
            <ActivityIndicator color="#fff" size="large" />
            <Text className="text-white mt-3 text-lg" style={{ fontFamily: 'Inter_500Medium' }}>Creating PDF...</Text>
          </View>
        ) : (
          <PrimaryButton 
            title="Export to PDF" 
            icon="download-outline" 
            onPress={doExport} 
            size="xl"
            fullWidth
          />
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
            const handlerId = `${editorKey}-${Date.now()}`;
            setHandler(handlerId, (res: any) => {
              setItems(prev => prev.map(x => x.key === editorKey ? { ...x, uri: res.uri, width: res.width, height: res.height } : x));
            });
            navigation.navigate('CropEditor', { uri: it.uri, imageWidth: it.width, imageHeight: it.height, aspect: ratio, handlerId });
          }}
      />
      <ImageAdjustmentsSheet
        visible={adjustmentsVisible}
        onClose={() => setAdjustmentsVisible(false)}
        onApply={(adjustments) => {
          if (editorKey) {
            applyAdjustments(editorKey, adjustments);
          }
        }}
        initialValues={editorKey ? imageAdjustments[editorKey] : undefined}
      />
    </View>
  );
}










