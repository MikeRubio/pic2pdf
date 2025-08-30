import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, Image, Alert, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import BannerAd from '../components/BannerAd';
import { useAdManager } from '../hooks/useAdManager';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MotiView } from 'moti';
import { getRecents, RecentPdf } from '../utils/recents';
import { useFocusEffect } from '@react-navigation/native';
import PrimaryButton from '../components/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

type Img = {
  uri: string;
  width?: number;
  height?: number;
  mimeType?: string;
  fileName?: string;
  key: string;
};

export default function HomeScreen({ navigation }: Props) {
  const [images, setImages] = useState<Img[]>([]);
  const ad = useAdManager();
  const [recents, setRecents] = useState<RecentPdf[]>([]);

  const loadRecents = useCallback(async () => {
    const list = await getRecents();
    setRecents(list.slice(0, 3));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecents();
      return () => {};
    }, [loadRecents])
  );

  const pickImages = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow photo access to continue.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        selectionLimit: 0,
        quality: 1,
      });
      if (result.canceled) return;
      const picked = result.assets.map((a) => ({
        uri: a.uri,
        width: a.width,
        height: a.height,
        mimeType: a.mimeType,
        fileName: a.fileName,
        key: `${a.uri}-${Date.now()}-${Math.random()}`,
      }));
      setImages((prev) => [...prev, ...picked]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      Alert.alert('Error', 'Failed to pick images.');
    }
  }, []);

  const takePhoto = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow camera access to continue.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 1,
      });
      if (result.canceled) return;
      const a = result.assets[0];
      setImages((prev) => [
        ...prev,
        {
          uri: a.uri,
          width: a.width,
          height: a.height,
          mimeType: a.mimeType,
          fileName: a.fileName,
          key: `${a.uri}-${Date.now()}-${Math.random()}`,
        },
      ]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      Alert.alert('Error', 'Failed to take photo.');
    }
  }, []);

  const removeAt = useCallback((key: string) => {
    setImages((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<Img>) => (
    <MotiView 
      from={{ opacity: 0, translateY: 8 }} 
      animate={{ opacity: 1, translateY: 0 }}
      style={{ opacity: isActive ? 0.8 : 1 }}
    >
      <Pressable
      onLongPress={drag}
        className="bg-surface rounded-3xl p-4 mb-3 flex-row items-center shadow-medium border border-border-light"
      >
        <View className="relative">
          <Image 
            source={{ uri: item.uri }} 
            style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: '#F5F5F5' }} 
          />
          <View className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary-600 items-center justify-center">
            <Ionicons name="image" size={12} color="#FFFFFF" />
          </View>
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-text-primary text-base" style={{ fontFamily: 'Inter_500Medium' }} numberOfLines={1}>
          {item.fileName || item.uri.split('/').pop()}
        </Text>
          <Text className="text-text-tertiary mt-1" style={{ fontFamily: 'Inter_400Regular', fontSize: 13 }}>
          {item.width}×{item.height}
        </Text>
      </View>
        <Pressable 
          onPress={() => removeAt(item.key)} 
          className="w-10 h-10 rounded-xl bg-error-50 items-center justify-center"
        >
          <Ionicons name="trash-outline" size={18} color="#DC2626" />
      </Pressable>
      </Pressable>
    </MotiView>
  ), [removeAt]);

  const goEdit = useCallback(() => {
    if (!images.length) {
      Alert.alert('No photos', 'Please add at least one photo.');
      return;
    }
    navigation.navigate('Edit', { images });
  }, [images, navigation]);

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-8 pb-6">
        <Animated.View entering={FadeInDown.duration(250)}>
          <Text className="text-3xl text-text-primary mb-3" style={{ fontFamily: 'Inter_700Bold' }}>
            Transform Photos to PDF
          </Text>
          <Text className="text-text-secondary text-lg leading-6" style={{ fontFamily: 'Inter_400Regular' }}>
            Select photos, arrange them, and export to a single PDF.
          </Text>
        </Animated.View>
        <View className="flex-row mt-8 space-x-3">
          <PrimaryButton 
            title="Pick Photos" 
            icon="images-outline" 
            onPress={pickImages} 
            size="lg"
            style={{ flex: 1 }} 
          />
          <PrimaryButton 
            title="Camera" 
            icon="camera-outline" 
            onPress={takePhoto} 
            variant="accent" 
            size="lg"
            style={{ flex: 1 }} 
          />
        </View>

        {recents.length > 0 && (
          <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }}>
            <Pressable onPress={() => navigation.navigate('Settings')} className="mt-8 bg-surface rounded-3xl p-5 shadow-medium border border-border-light">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-text-primary text-lg" style={{ fontFamily: 'Inter_700Bold' }}>Recent PDFs</Text>
                <View className="flex-row items-center">
                  <Text className="text-primary-600 mr-1" style={{ fontFamily: 'Inter_500Medium' }}>View All</Text>
                  <Ionicons name="chevron-forward" size={16} color="#2563EB" />
                </View>
              </View>
              {recents.map((r, index) => (
                <View key={r.fileUri} className={`flex-row items-center ${index < recents.length - 1 ? 'mb-2' : ''}`}>
                  <View className="w-2 h-2 rounded-full bg-primary-200 mr-3" />
                  <Text className="text-text-secondary flex-1" style={{ fontFamily: 'Inter_400Regular' }} numberOfLines={1}>
                    {r.name}
                  </Text>
                  {r.hd && (
                    <View className="bg-accent-100 px-2 py-1 rounded-lg">
                      <Text className="text-accent-700 text-xs" style={{ fontFamily: 'Inter_700Bold' }}>HD</Text>
                    </View>
                  )}
                </View>
              ))}
            </Pressable>
          </MotiView>
        )}
      </View>

      <View className="flex-1 px-6">
        <DraggableFlatList
          data={images}
          keyExtractor={(item) => item.key}
          onDragEnd={({ data }) => setImages(data)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 140 }}
          ListEmptyComponent={
            <View className="items-center mt-20">
              <View className="w-20 h-20 rounded-3xl bg-neutral-100 items-center justify-center mb-4">
                <Ionicons name="images-outline" size={32} color="#A3A3A3" />
              </View>
              <Text className="text-text-tertiary text-lg" style={{ fontFamily: 'Inter_500Medium' }}>No photos selected yet</Text>
              <Text className="text-text-tertiary mt-1 text-center px-8" style={{ fontFamily: 'Inter_400Regular' }}>
                Tap "Pick Photos" or "Camera" to get started
              </Text>
            </View>
          }
        />
      </View>

      <View className="px-6 pb-32">
        <PrimaryButton 
          title="Continue" 
          icon="arrow-forward" 
          onPress={goEdit} 
          variant="dark" 
          size="lg"
          disabled={!images.length} 
        />
      </View>

      <BannerAd adUnitId={ad.bannerUnitId} />
    </View>
  );
}
