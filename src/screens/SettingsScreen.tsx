import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, Linking, Alert, FlatList, Platform } from 'react-native';
import { getRecents, RecentPdf, removeRecent, clearRecents } from '../utils/recents';
import * as Sharing from 'expo-sharing';
import { openPdf, chooseAndSaveDownloadsDirAndroid, getSavedDownloadsDirAndroid, setSavedDownloadsDirAndroid } from '../utils/openUtils';
import { Ionicons } from "@expo/vector-icons";

export default function SettingsScreen() {
  const [recents, setRecents] = useState<RecentPdf[]>([]);
  const [downloadsDir, setDownloadsDir] = useState<string | null>(null);

  const load = useCallback(async () => {
    const list = await getRecents();
    setRecents(list);
  }, []);

  useEffect(() => {
    const unsub = setInterval(load, 1000); // simple auto-refresh while open
    load();
    if (Platform.OS === 'android') {
      getSavedDownloadsDirAndroid().then(setDownloadsDir);
    }
    return () => clearInterval(unsub as any);
  }, [load]);

  const openPrivacy = () => {
    const url = 'https://your-privacy-policy.example.com';
    Linking.openURL(url).catch(() => Alert.alert('Unable to open link'));
  };

  const onOpen = async (it: RecentPdf) => {
    const ok = await openPdf(it.fileUri);
    if (!ok) Alert.alert('Open failed', 'No app found to open PDF.');
  };

  const onShare = async (it: RecentPdf) => {
    const available = await Sharing.isAvailableAsync();
    if (!available) return Alert.alert('Share not available');
    await Sharing.shareAsync(it.fileUri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
  };

  const onRemove = async (it: RecentPdf) => {
    await removeRecent(it.fileUri);
    load();
  };

  const onClear = async () => {
    await clearRecents();
    load();
  };

  return (
    <View className="flex-1 bg-background px-6 pt-6">
      <View className="bg-surfaceElevated rounded-4xl p-8 mb-8 shadow-large border border-border-light">
        <View className="flex-row items-center mb-4">
          <View className="w-12 h-12 rounded-3xl bg-primary-100 items-center justify-center mr-4">
            <Ionicons name="information-circle" size={24} color="#0284C7" />
          </View>
          <Text className="text-text-primary text-2xl" style={{ fontFamily: 'Inter_700Bold' }}>About Photo2PDF</Text>
        </View>
        <Text className="text-text-secondary text-lg leading-7" style={{ fontFamily: 'Inter_400Regular' }}>
          Transform your images into beautiful PDF documents. Works completely offline and keeps your data secure and private.
        </Text>
      </View>

      <Pressable 
        onPress={openPrivacy} 
        className="bg-surfaceElevated rounded-4xl p-6 mb-6 shadow-large border border-border-light flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-3xl bg-slate-100 items-center justify-center mr-4">
            <Ionicons name="shield-checkmark-outline" size={24} color="#475569" />
          </View>
          <Text className="text-text-primary text-lg" style={{ fontFamily: 'Inter_500Medium' }}>Privacy Policy</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
      </Pressable>

      <View className="bg-surfaceElevated rounded-4xl p-6 mb-6 shadow-large border border-border-light">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-3xl bg-warning-50 items-center justify-center mr-4">
              <Ionicons name="star-outline" size={24} color="#F59E0B" />
            </View>
            <View>
              <Text className="text-text-primary text-lg" style={{ fontFamily: 'Inter_500Medium' }}>Remove Ads (Pro)</Text>
              <Text className="text-text-tertiary text-base mt-1" style={{ fontFamily: 'Inter_400Regular' }}>Coming soon</Text>
            </View>
          </View>
          <View className="bg-warning-100 px-4 py-2 rounded-xl shadow-soft">
            <Text className="text-warning-600 text-sm" style={{ fontFamily: 'Inter_700Bold' }}>Soon</Text>
          </View>
        </View>
      </View>

      {Platform.OS === 'android' && (
        <View className="bg-surfaceElevated rounded-4xl p-6 mb-6 shadow-large border border-border-light">
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 rounded-3xl bg-slate-100 items-center justify-center mr-4">
              <Ionicons name="folder-outline" size={24} color="#475569" />
            </View>
            <Text className="text-text-primary text-2xl" style={{ fontFamily: 'Inter_700Bold' }}>Save Location</Text>
          </View>
          <Text className="text-text-secondary mb-6 text-base leading-6" style={{ fontFamily: 'Inter_400Regular' }}>
            {downloadsDir ? decodeURIComponent(downloadsDir).replace('primary:', '') : 'Not set'}
          </Text>
          <View className="flex-row space-x-4">
            <Pressable 
              onPress={async () => { 
                const uri = await chooseAndSaveDownloadsDirAndroid(); 
                setDownloadsDir(uri); 
              }} 
              className="bg-primary-600 rounded-2xl px-6 py-4 flex-1 items-center shadow-medium"
            >
              <Text className="text-white text-base" style={{ fontFamily: 'Inter_700Bold' }}>{downloadsDir ? 'Change' : 'Choose'}</Text>
            </Pressable>
            {downloadsDir && (
              <Pressable 
                onPress={async () => { 
                  await setSavedDownloadsDirAndroid(null); 
                  setDownloadsDir(null); 
                }} 
                className="bg-error-50 rounded-2xl px-6 py-4 items-center shadow-soft"
              >
                <Text className="text-error-600 text-base" style={{ fontFamily: 'Inter_700Bold' }}>Clear</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      <View className="bg-surfaceElevated rounded-4xl p-6 mb-6 shadow-large border border-border-light">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-3xl bg-slate-100 items-center justify-center mr-4">
              <Ionicons name="document-text-outline" size={24} color="#475569" />
            </View>
            <Text className="text-text-primary text-2xl" style={{ fontFamily: 'Inter_700Bold' }}>Recent PDFs</Text>
          </View>
          <Pressable onPress={onClear} className="bg-error-50 px-4 py-2 rounded-xl shadow-soft">
            <Text className="text-error-600 text-sm" style={{ fontFamily: 'Inter_500Medium' }}>Clear All</Text>
          </Pressable>
        </View>
        {recents.length === 0 ? (
          <View className="items-center py-12">
            <View className="w-16 h-16 rounded-3xl bg-slate-100 items-center justify-center mb-4">
              <Ionicons name="document-outline" size={32} color="#94A3B8" />
            </View>
            <Text className="text-text-primary text-lg mb-2" style={{ fontFamily: 'Inter_500Medium' }}>No recent exports</Text>
            <Text className="text-text-tertiary text-base text-center" style={{ fontFamily: 'Inter_400Regular' }}>
              Your exported PDFs will appear here
            </Text>
          </View>
        ) : (
          <FlatList
            data={recents}
            keyExtractor={(it) => it.fileUri}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className="flex-row items-center py-4 border-b border-border-light last:border-b-0">
                <View className="w-12 h-12 rounded-2xl bg-primary-100 items-center justify-center mr-4">
                  <Ionicons name="document" size={20} color="#0284C7" />
                </View>
                <View className="flex-1 pr-4">
                  <Text className="text-text-primary text-lg" style={{ fontFamily: 'Inter_500Medium' }} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View className="flex-row items-center mt-1.5">
                    <Text className="text-text-tertiary text-sm" style={{ fontFamily: 'Inter_400Regular' }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                    {item.hd && (
                      <View className="bg-accent-100 px-3 py-1 rounded-lg ml-3">
                        <Text className="text-accent-700 text-xs" style={{ fontFamily: 'Inter_700Bold' }}>HD</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View className="flex-row space-x-3">
                  <Pressable 
                    onPress={() => onOpen(item)} 
                    className="w-10 h-10 bg-primary-100 rounded-2xl items-center justify-center shadow-soft"
                  >
                    <Ionicons name="open-outline" size={18} color="#0284C7" />
                  </Pressable>
                  <Pressable 
                    onPress={() => onShare(item)} 
                    className="w-10 h-10 bg-slate-100 rounded-2xl items-center justify-center shadow-soft"
                  >
                    <Ionicons name="share-outline" size={18} color="#475569" />
                  </Pressable>
                  <Pressable 
                    onPress={() => onRemove(item)} 
                    className="w-10 h-10 bg-error-50 rounded-2xl items-center justify-center shadow-soft"
                  >
                    <Ionicons name="trash-outline" size={18} color="#DC2626" />
                  </Pressable>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}
