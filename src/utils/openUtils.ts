import * as FileSystem from 'expo-file-system';
import { Platform, Linking } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_DOWNLOADS_DIR_KEY = 'p2p:android_downloads_dir_v1';

export async function openPdf(fileUri: string): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      const cUri = await FileSystem.getContentUriAsync(fileUri);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: cUri,
        flags: 1,
        type: 'application/pdf',
      });
      return true;
    } else {
      await Linking.openURL(fileUri);
      return true;
    }
  } catch {
    return false;
  }
}

export async function saveToDownloadsAndroid(fileUri: string, suggestedName?: string): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  try {
    const { StorageAccessFramework } = FileSystem as any;
    const name = (suggestedName || fileUri.split('/').pop() || `Photo2PDF_${Date.now()}`).replace(/[^a-zA-Z0-9_.-]/g, '_');
    const b64 = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });

    // Try saved directory first
    const saved = await AsyncStorage.getItem(SAVED_DOWNLOADS_DIR_KEY);
    if (saved) {
      try {
        const newUri = await StorageAccessFramework.createFileAsync(saved, name, 'application/pdf');
        await StorageAccessFramework.writeAsStringAsync(newUri, b64, { encoding: FileSystem.EncodingType.Base64 });
        return true;
      } catch {
        // fallthrough to re-request permission
      }
    }

    // Request directory permission and persist it
    const perm = await StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!perm.granted) return false;
    const dirUri = perm.directoryUri as string;
    await AsyncStorage.setItem(SAVED_DOWNLOADS_DIR_KEY, dirUri);
    const newUri = await StorageAccessFramework.createFileAsync(dirUri, name, 'application/pdf');
    await StorageAccessFramework.writeAsStringAsync(newUri, b64, { encoding: FileSystem.EncodingType.Base64 });
    return true;
  } catch {
    return false;
  }
}

export async function getSavedDownloadsDirAndroid(): Promise<string | null> {
  if (Platform.OS !== 'android') return null;
  try {
    return (await AsyncStorage.getItem(SAVED_DOWNLOADS_DIR_KEY)) || null;
  } catch {
    return null;
  }
}

export async function setSavedDownloadsDirAndroid(uri: string | null): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    if (!uri) await AsyncStorage.removeItem(SAVED_DOWNLOADS_DIR_KEY);
    else await AsyncStorage.setItem(SAVED_DOWNLOADS_DIR_KEY, uri);
  } catch {}
}

export async function chooseAndSaveDownloadsDirAndroid(): Promise<string | null> {
  if (Platform.OS !== 'android') return null;
  try {
    const { StorageAccessFramework } = FileSystem as any;
    const perm = await StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!perm.granted) return null;
    const dirUri = perm.directoryUri as string;
    await AsyncStorage.setItem(SAVED_DOWNLOADS_DIR_KEY, dirUri);
    return dirUri;
  } catch {
    return null;
  }
}
