import React, { useCallback, useState } from "react";
import { View, Text, Pressable, Image, Alert, Modal } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import BannerAd from "../components/BannerAd";
import { useAdManager } from "../hooks/useAdManager";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import Animated, { FadeInDown } from "react-native-reanimated";
import { MotiView } from "moti";
import { getRecents, RecentPdf } from "../utils/recents";
import { useFocusEffect } from "@react-navigation/native";
import PrimaryButton from "../components/PrimaryButton";
import { Ionicons } from "@expo/vector-icons";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

type Img = {
  uri: string;
  width?: number;
  height?: number;
  mimeType?: string;
  fileName?: string;
  key: string;
};

export default function HomeScreen({ navigation }: Props) {
  const [imagesRef, setImages] = useState<Img[]>([]);
  const [addVisible, setAddVisible] = useState(false);

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

  const buildKey = (a: ImagePicker.ImagePickerAsset) => `${a.assetId ?? a.uri}`;

  const pickImages = useCallback(async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please allow photo access to continue."
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        selectionLimit: 0,
        quality: 1,
      });
      if (result.canceled) return;
      const picked: Img[] = result.assets.map((a) => ({
        uri: a.uri,
        width: a.width,
        height: a.height,
        mimeType: a.mimeType,
        fileName: a.fileName ?? undefined,
        key: buildKey(a),
      }));
      setImages((prev) => {
        // de-dupe by key just in case the same photo is picked twice
        const byKey = new Map(prev.map((p) => [p.key, p]));
        picked.forEach((p) => byKey.set(p.key, p));
        return Array.from(byKey.values());
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      Alert.alert("Error", "Failed to pick images.");
    }
  }, [setImages]);

  const takePhoto = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please allow camera access to continue."
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 1 });
      if (result.canceled) return;
      const a = result.assets[0];
      setImages((prev) => [
        ...prev,
        {
          uri: a.uri,
          width: a.width,
          height: a.height,
          mimeType: a.mimeType,
          fileName: a.fileName ?? undefined,
          key: buildKey(a),
        },
      ]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      Alert.alert("Error", "Failed to take photo.");
    }
  }, [setImages]);

  const removeAt = useCallback(
    (key: string) => {
      setImages((prev) => prev.filter((i) => i.key !== key));
    },
    [setImages]
  );

  const onItemPress = useCallback((img: Img) => {
    // Example action on tap: preview single image or toggle selected state.
    // Here we’ll just navigate to Edit with the whole list (unchanged behavior).
    // If you want single preview, replace with a preview route.
  }, []);

  const openAdd = useCallback(() => setAddVisible(true), []);
  const closeAdd = useCallback(() => setAddVisible(false), []);

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Img>) => (
      <MotiView
        from={{ opacity: 0, translateY: 12, scale: 0.95 }}
        animate={{ opacity: 1, translateY: 0, scale: 1 }}
        transition={{ type: "spring", damping: 15, stiffness: 150 }}
        style={{ opacity: isActive ? 0.8 : 1 }}
      >
        <Pressable
          onPress={() => onItemPress(item)} // tap to select/open
          onLongPress={drag} // hold to start drag
          delayLongPress={200} // clearer separation between tap vs drag
          className="bg-surfaceElevated rounded-4xl p-5 mb-4 flex-row items-center shadow-large border border-border-light"
          style={{ opacity: isActive ? 0.7 : 1 }}
        >
          <View className="relative">
            <Image
              source={{ uri: item.uri }}
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                backgroundColor: "#F8FAFC",
              }}
            />
            <View className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary-600 items-center justify-center shadow-medium">
              <Ionicons name="image" size={14} color="#FFFFFF" />
            </View>
          </View>

          <View className="ml-5 flex-1">
            <Text
              className="text-text-primary text-lg"
              style={{ fontFamily: "Inter_500Medium" }}
              numberOfLines={1}
            >
              {item.fileName || item.uri.split("/").pop()}
            </Text>
            <Text
              className="text-text-tertiary mt-1 text-sm"
              style={{ fontFamily: "Inter_400Regular" }}
            >
              {item.width}×{item.height} pixels
            </Text>
          </View>

          {/* Delete button: ensure it never initiates a drag */}
          <Pressable
            onPress={() => removeAt(item.key)}
            onLongPress={() => {
              /* swallow long-press so parent doesn’t drag */
            }}
            hitSlop={10}
            className="w-11 h-11 rounded-2xl bg-error-50 items-center justify-center shadow-soft"
          >
            <Ionicons name="trash-outline" size={20} color="#DC2626" />
          </Pressable>
        </Pressable>
      </MotiView>
    ),
    [onItemPress, removeAt]
  );

  const goEdit = useCallback(() => {
    if (!imagesRef.length) {
      Alert.alert("No photos", "Please add at least one photo.");
      return;
    }
    navigation.navigate("Edit", { images: imagesRef });
  }, [navigation, imagesRef]);

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-6 pb-8">
        <Animated.View entering={FadeInDown.duration(250)}>
          <Text
            className="text-4xl text-text-primary mb-4"
            style={{ fontFamily: "Inter_700Bold" }}
          >
            Transform Photos to PDF
          </Text>
          <Text
            className="text-text-secondary text-lg leading-7"
            style={{ fontFamily: "Inter_400Regular" }}
          >
            Select photos, arrange them perfectly, and export to a beautiful PDF
            document.
          </Text>
        </Animated.View>

        <View className="flex-row mt-8 space-x-4">
          <PrimaryButton
            title="Pick Photos"
            icon="images-outline"
            onPress={pickImages}
            size="xl"
            fullWidth
            style={{ flex: 1 }}
          />
          <PrimaryButton
            title="Camera"
            icon="camera-outline"
            onPress={takePhoto}
            variant="accent"
            size="xl"
            fullWidth
            style={{ flex: 1 }}
          />
        </View>

        {recents.length > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
          >
            <Pressable
              onPress={() => navigation.navigate("Settings")}
              className="mt-8 bg-surfaceElevated rounded-4xl p-6 shadow-large border border-border-light"
            >
              <View className="flex-row items-center justify-between mb-4">
                <Text
                  className="text-text-primary text-xl"
                  style={{ fontFamily: "Inter_700Bold" }}
                >
                  Recent PDFs
                </Text>
                <View className="flex-row items-center">
                  <Text
                    className="text-primary-600 mr-2 text-base"
                    style={{ fontFamily: "Inter_500Medium" }}
                  >
                    View All
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#0284C7" />
                </View>
              </View>
              <View className="space-y-3">
                {recents.map((r) => (
                  <View key={r.fileUri} className="flex-row items-center">
                    <View className="w-10 h-10 rounded-2xl bg-primary-50 items-center justify-center mr-4">
                      <Ionicons
                        name="document-text"
                        size={18}
                        color="#0284C7"
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-text-primary text-base"
                        style={{ fontFamily: "Inter_500Medium" }}
                        numberOfLines={1}
                      >
                        {r.name}
                      </Text>
                      <Text
                        className="text-text-tertiary text-sm mt-0.5"
                        style={{ fontFamily: "Inter_400Regular" }}
                      >
                        {new Date(r.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    {r.hd && (
                      <View className="bg-accent-100 px-3 py-1.5 rounded-xl">
                        <Text
                          className="text-accent-700 text-xs"
                          style={{ fontFamily: "Inter_700Bold" }}
                        >
                          HD
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </Pressable>
          </MotiView>
        )}
      </View>

      <View className="flex-1 px-6 pb-4">
        <DraggableFlatList
          data={imagesRef}
          keyExtractor={(item) => item.key}
          onDragEnd={({ data }) => setImages(data)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120 }}
          activationDistance={16} // require small move to begin drag
          autoscrollThreshold={80}
          autoscrollSpeed={50}
          dragItemOverflow
          ListEmptyComponent={
            <View className="items-center mt-16 px-8">
              <View className="w-24 h-24 rounded-4xl bg-slate-100 items-center justify-center mb-6 shadow-soft">
                <Ionicons name="images-outline" size={40} color="#94A3B8" />
              </View>
              <Text
                className="text-text-primary text-xl mb-3 text-center"
                style={{ fontFamily: "Inter_700Bold" }}
              >
                No photos selected yet
              </Text>
              <Text
                className="text-text-tertiary text-base text-center leading-6"
                style={{ fontFamily: "Inter_400Regular" }}
              >
                Choose photos from your gallery or take new ones with your
                camera to get started
              </Text>
              <View className="flex-row mt-8 space-x-4 w-full">
                <PrimaryButton title="Pick Photos" icon="images-outline" onPress={pickImages} fullWidth style={{ flex: 1 }} />
                <PrimaryButton title="Camera" icon="camera-outline" onPress={takePhoto} variant="accent" fullWidth style={{ flex: 1 }} />
              </View>
            </View>
          }
        />
      </View>

      <View className="px-6 pb-28">
        <PrimaryButton
          title="Continue"
          icon="arrow-forward"
          onPress={goEdit}
          variant="dark"
          size="xl"
          fullWidth
          disabled={!imagesRef.length}
        />
      </View>

      <BannerAd adUnitId={ad.bannerUnitId} />

      {/* Quick Add floating button */}
      <View style={{ position: 'absolute', right: 20, bottom: 110 }}>
        <Pressable onPress={openAdd} className="w-14 h-14 rounded-full bg-primary-600 items-center justify-center shadow-large">
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
      </View>

      <Modal visible={addVisible} transparent animationType="fade" onRequestClose={closeAdd}>
        <Pressable onPress={closeAdd} style={{ flex: 1 }} className="bg-black/40 justify-end">
          <View className="bg-surface rounded-t-3xl p-6">
            <Text className="text-text-primary text-xl mb-4" style={{ fontFamily: 'Inter_700Bold' }}>Add Photos</Text>
            <View className="flex-row space-x-4">
              <PrimaryButton title="Pick from Gallery" icon="images-outline" onPress={() => { closeAdd(); pickImages(); }} fullWidth style={{ flex: 1 }} />
              <PrimaryButton title="Open Camera" icon="camera-outline" onPress={() => { closeAdd(); takePhoto(); }} variant="accent" fullWidth style={{ flex: 1 }} />
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
