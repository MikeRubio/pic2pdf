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
    <View className="flex-1 bg-background px-6 pt-6">
      <View className="bg-white rounded-2xl p-4 mb-4 shadow-soft">
        <Text className="text-text text-lg mb-1" style={{ fontFamily: 'Inter_700Bold' }}>About</Text>
        <Text className="text-gray-600" style={{ fontFamily: 'Inter_400Regular' }}>
          Photo2PDF converts your images to a single PDF. Works offline and keeps your data local.
        </Text>
      </View>

      <Pressable onPress={openPrivacy} className="bg-white rounded-2xl p-4 mb-4 shadow-soft">
        <Text className="text-text" style={{ fontFamily: 'Inter_500Medium' }}>Privacy Policy</Text>
      </Pressable>

      <View className="bg-white rounded-2xl p-4 mb-4 shadow-soft">
        <Text className="text-text mb-2" style={{ fontFamily: 'Inter_500Medium' }}>Remove Ads (Pro)</Text>
        <Text className="text-gray-500" style={{ fontFamily: 'Inter_400Regular' }}>Coming soon</Text>
      </View>

      {Platform.OS === 'android' && (
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-soft">
          <Text className="text-text mb-2" style={{ fontFamily: 'Inter_700Bold' }}>Preferred Save Folder</Text>
          <Text className="text-gray-600 mb-3" style={{ fontFamily: 'Inter_400Regular' }}>
            {downloadsDir ? decodeURIComponent(downloadsDir).replace('primary:', '') : 'Not set'}
          </Text>
          <View className="flex-row">
            <Pressable onPress={async () => { const uri = await chooseAndSaveDownloadsDirAndroid(); setDownloadsDir(uri); }} className="bg-primary rounded-xl px-3 py-2 mr-2">
              <Text className="text-white" style={{ fontFamily: 'Inter_700Bold' }}>{downloadsDir ? 'Change' : 'Choose'}</Text>
            </Pressable>
            {downloadsDir && (
              <Pressable onPress={async () => { await setSavedDownloadsDirAndroid(null); setDownloadsDir(null); }} className="bg-red-50 rounded-xl px-3 py-2">
                <Text className="text-red-600" style={{ fontFamily: 'Inter_700Bold' }}>Clear</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      <View className="bg-white rounded-2xl p-4 mb-4 shadow-soft">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-text" style={{ fontFamily: 'Inter_700Bold' }}>Recent PDFs</Text>
          <Pressable onPress={onClear}>
            <Text className="text-red-600" style={{ fontFamily: 'Inter_500Medium' }}>Clear</Text>
          </Pressable>
        </View>
        {recents.length === 0 ? (
          <Text className="text-gray-500" style={{ fontFamily: 'Inter_400Regular' }}>No recent exports</Text>
        ) : (
          <FlatList
            data={recents}
            keyExtractor={(it) => it.fileUri}
            renderItem={({ item }) => (
              <View className="flex-row items-center py-2">
                <View className="flex-1 pr-2">
                  <Text className="text-text" style={{ fontFamily: 'Inter_500Medium' }} numberOfLines={1}>{item.name}</Text>
                  <Text className="text-gray-500" style={{ fontFamily: 'Inter_400Regular', fontSize: 12 }}>
                    {new Date(item.createdAt).toLocaleString()} {item.hd ? '• HD' : ''}
                  </Text>
                </View>
                <Pressable onPress={() => onOpen(item)} className="px-2 py-1 bg-primary rounded-xl mr-2">
                  <Text className="text-white" style={{ fontFamily: 'Inter_700Bold' }}>Open</Text>
                </Pressable>
                <Pressable onPress={() => onShare(item)} className="px-2 py-1 bg-text rounded-xl mr-2">
                  <Text className="text-white" style={{ fontFamily: 'Inter_700Bold' }}>Share</Text>
                </Pressable>
                <Pressable onPress={() => onRemove(item)} className="px-2 py-1 bg-red-50 rounded-xl">
                  <Text className="text-red-600" style={{ fontFamily: 'Inter_700Bold' }}>Delete</Text>
                </Pressable>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}
