import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, Linking, Alert, FlatList, Platform } from 'react-native';
import { getRecents, RecentPdf, removeRecent, clearRecents } from '../utils/recents';
import * as Sharing from 'expo-sharing';
import { openPdf, chooseAndSaveDownloadsDirAndroid, getSavedDownloadsDirAndroid, setSavedDownloadsDirAndroid } from '../utils/openUtils';

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
    <View className="flex-1 bg-background px-6 pt-8">
      <View className="bg-surface rounded-3xl p-6 mb-6 shadow-medium border border-border-light">
        <Text className="text-text-primary text-xl mb-3" style={{ fontFamily: 'Inter_700Bold' }}>About Photo2PDF</Text>
        <Text className="text-text-secondary leading-6" style={{ fontFamily: 'Inter_400Regular' }}>
          Photo2PDF converts your images to a single PDF. Works offline and keeps your data local.
        </Text>
      </View>

      <Pressable 
        onPress={openPrivacy} 
        className="bg-surface rounded-3xl p-5 mb-6 shadow-medium border border-border-light flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-xl bg-neutral-100 items-center justify-center mr-3">
            <Ionicons name="shield-checkmark-outline" size={18} color="#0F172A" />
          </View>
          <Text className="text-text-primary" style={{ fontFamily: 'Inter_500Medium' }}>Privacy Policy</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
      </Pressable>

      <View className="bg-surface rounded-3xl p-5 mb-6 shadow-medium border border-border-light">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-warning-50 items-center justify-center mr-3">
              <Ionicons name="star-outline" size={18} color="#F59E0B" />
            </View>
            <View>
              <Text className="text-text-primary" style={{ fontFamily: 'Inter_500Medium' }}>Remove Ads (Pro)</Text>
              <Text className="text-text-tertiary" style={{ fontFamily: 'Inter_400Regular' }}>Coming soon</Text>
            </View>
          </View>
          <View className="bg-warning-100 px-3 py-1 rounded-lg">
            <Text className="text-warning-500" style={{ fontFamily: 'Inter_700Bold' }}>Soon</Text>
          </View>
        </View>
      </View>

      {Platform.OS === 'android' && (
        <View className="bg-surface rounded-3xl p-5 mb-6 shadow-medium border border-border-light">
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-xl bg-neutral-100 items-center justify-center mr-3">
              <Ionicons name="folder-outline" size={18} color="#0F172A" />
            </View>
            <Text className="text-text-primary text-lg" style={{ fontFamily: 'Inter_700Bold' }}>Save Location</Text>
          </View>
          <Text className="text-text-secondary mb-4 leading-5" style={{ fontFamily: 'Inter_400Regular' }}>
            {downloadsDir ? decodeURIComponent(downloadsDir).replace('primary:', '') : 'Not set'}
          </Text>
          <View className="flex-row space-x-3">
            <Pressable 
              onPress={async () => { 
                const uri = await chooseAndSaveDownloadsDirAndroid(); 
                setDownloadsDir(uri); 
              }} 
              className="bg-primary-600 rounded-xl px-4 py-2.5 flex-1 items-center"
            >
              <Text className="text-white" style={{ fontFamily: 'Inter_700Bold' }}>{downloadsDir ? 'Change' : 'Choose'}</Text>
            </Pressable>
            {downloadsDir && (
              <Pressable 
                onPress={async () => { 
                  await setSavedDownloadsDirAndroid(null); 
                  setDownloadsDir(null); 
                }} 
                className="bg-error-50 rounded-xl px-4 py-2.5 items-center"
              >
                <Text className="text-error-600" style={{ fontFamily: 'Inter_700Bold' }}>Clear</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      <View className="bg-surface rounded-3xl p-5 mb-6 shadow-medium border border-border-light">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-neutral-100 items-center justify-center mr-3">
              <Ionicons name="document-text-outline" size={18} color="#0F172A" />
            </View>
            <Text className="text-text-primary text-lg" style={{ fontFamily: 'Inter_700Bold' }}>Recent PDFs</Text>
          </View>
          <Pressable onPress={onClear} className="bg-error-50 px-3 py-1.5 rounded-lg">
            <Text className="text-error-600" style={{ fontFamily: 'Inter_500Medium' }}>Clear All</Text>
          </Pressable>
        </View>
        {recents.length === 0 ? (
          <View className="items-center py-8">
            <Ionicons name="document-outline" size={32} color="#D4D4D4" />
            <Text className="text-text-tertiary mt-2" style={{ fontFamily: 'Inter_400Regular' }}>No recent exports</Text>
          </View>
        ) : (
          <FlatList
            data={recents}
            keyExtractor={(it) => it.fileUri}
            renderItem={({ item }) => (
              <View className="flex-row items-center py-3 border-b border-border-light last:border-b-0">
                <View className="w-8 h-8 rounded-lg bg-primary-100 items-center justify-center mr-3">
                  <Ionicons name="document" size={14} color="#2563EB" />
                </View>
                <View className="flex-1 pr-3">
                  <Text className="text-text-primary" style={{ fontFamily: 'Inter_500Medium' }} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Text className="text-text-tertiary" style={{ fontFamily: 'Inter_400Regular', fontSize: 12 }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                    {item.hd && (
                      <View className="bg-accent-100 px-2 py-0.5 rounded ml-2">
                        <Text className="text-accent-700 text-xs" style={{ fontFamily: 'Inter_700Bold' }}>HD</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View className="flex-row space-x-2">
                  <Pressable 
                    onPress={() => onOpen(item)} 
                    className="w-8 h-8 bg-primary-100 rounded-lg items-center justify-center"
                  >
                    <Ionicons name="open-outline" size={14} color="#2563EB" />
                  </Pressable>
                  <Pressable 
                    onPress={() => onShare(item)} 
                    className="w-8 h-8 bg-neutral-100 rounded-lg items-center justify-center"
                  >
                    <Ionicons name="share-outline" size={14} color="#0F172A" />
                  </Pressable>
                  <Pressable 
                    onPress={() => onRemove(item)} 
                    className="w-8 h-8 bg-error-50 rounded-lg items-center justify-center"
                  >
                    <Ionicons name="trash-outline" size={14} color="#DC2626" />
                  </Text>
                </View>
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
