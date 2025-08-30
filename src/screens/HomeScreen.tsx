import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, Image, Alert, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import BannerAd from '../components/BannerAd';
import { useAdManager } from '../hooks/useAdManager';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { motion } from 'framer-motion/native';
import { getRecents, RecentPdf } from '../utils/recents';
import { useFocusEffect } from '@react-navigation/native';

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
    <Pressable
      onLongPress={drag}
      className="bg-white rounded-2xl p-3 mb-3 flex-row items-center shadow-soft"
      style={{ opacity: isActive ? 0.8 : 1 }}
    >
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

  const goEdit = useCallback(() => {
    if (!images.length) {
      Alert.alert('No photos', 'Please add at least one photo.');
      return;
    }
    navigation.navigate('Edit', { images });
  }, [images, navigation]);

  return (
    <View className="flex-1 bg-background">
      <View className="px-5 pt-6 pb-3">
        <motion.View initial={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }}>
          <Text className="text-2xl text-text mb-2" style={{ fontFamily: 'Inter_700Bold' }}>Photo2PDF</Text>
          <Text className="text-gray-600" style={{ fontFamily: 'Inter_400Regular' }}>
            Select photos, arrange them, and export to a single PDF.
          </Text>
        </motion.View>
        <View className="flex-row mt-5">
          <Pressable onPress={pickImages} className="flex-1 mr-2 bg-primary rounded-2xl p-4 items-center">
            <Text className="text-white" style={{ fontFamily: 'Inter_700Bold' }}>Pick Photos</Text>
          </Pressable>
          <Pressable onPress={takePhoto} className="flex-1 ml-2 bg-accent rounded-2xl p-4 items-center">
            <Text className="text-white" style={{ fontFamily: 'Inter_700Bold' }}>Camera</Text>
          </Pressable>
        </View>

        {recents.length > 0 && (
          <Pressable onPress={() => navigation.navigate('Settings')} className="mt-5 bg-white rounded-2xl p-4 shadow-soft">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-text" style={{ fontFamily: 'Inter_700Bold' }}>Recent PDFs</Text>
              <Text className="text-primary" style={{ fontFamily: 'Inter_500Medium' }}>View All</Text>
            </View>
            {recents.map((r) => (
              <Text key={r.fileUri} className="text-gray-600" style={{ fontFamily: 'Inter_400Regular' }} numberOfLines={1}>
                • {r.name}
              </Text>
            ))}
          </Pressable>
        )}
      </View>

      <View className="flex-1 px-5">
        <DraggableFlatList
          data={images}
          keyExtractor={(item) => item.key}
          onDragEnd={({ data }) => setImages(data)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={
            <View className="items-center mt-16">
              <Text className="text-gray-500" style={{ fontFamily: 'Inter_400Regular' }}>No photos selected yet.</Text>
            </View>
          }
        />
      </View>

      <View className="px-5 pb-28">
        <Pressable onPress={goEdit} className="bg-text rounded-2xl p-4 items-center">
          <Text className="text-white" style={{ fontFamily: 'Inter_700Bold' }}>Continue</Text>
        </Pressable>
      </View>

      <BannerAd adUnitId={ad.bannerUnitId} />
    </View>
  );
}
