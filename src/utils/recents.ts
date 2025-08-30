import AsyncStorage from '@react-native-async-storage/async-storage';

export type RecentPdf = {
  fileUri: string;
  name: string;
  createdAt: number;
  hd: boolean;
};

const RECENTS_KEY = 'p2p:recents_v1';
const MAX_RECENTS = 20;

export async function addRecent(item: RecentPdf): Promise<void> {
  try {
    const list = await getRecents();
    const filtered = list.filter(x => x.fileUri !== item.fileUri);
    const next = [item, ...filtered].slice(0, MAX_RECENTS);
    await AsyncStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {}
}

export async function getRecents(): Promise<RecentPdf[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENTS_KEY);
    return raw ? JSON.parse(raw) as RecentPdf[] : [];
  } catch {
    return [];
  }
}

export async function removeRecent(fileUri: string): Promise<void> {
  try {
    const list = await getRecents();
    const next = list.filter(x => x.fileUri !== fileUri);
    await AsyncStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {}
}

export async function clearRecents(): Promise<void> {
  try {
    await AsyncStorage.removeItem(RECENTS_KEY);
  } catch {}
}

