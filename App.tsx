import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import HomeScreen from './src/screens/HomeScreen';
import EditScreen from './src/screens/EditScreen';
import ExportSuccessScreen from './src/screens/ExportSuccessScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { View, ActivityIndicator, Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type RootStackParamList = {
  Home: undefined;
  Edit: { images: Array<{ uri: string; width?: number; height?: number; fileName?: string; mimeType?: string }> } | undefined;
  ExportSuccess: { fileUri: string; hd: boolean };
  Settings: undefined;
  Onboarding: undefined;
  CropEditor: { uri: string; imageWidth?: number; imageHeight?: number; aspect?: number; onComplete?: (result: { uri: string; width: number; height: number }) => void };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });
  const [showOnboarding, setShowOnboarding] = React.useState<boolean | null>(null);

  useEffect(() => {
    // Android notification channel
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.DEFAULT,
      }).catch(() => {});
    }
    // AdMob test device config (optional; skip in Expo Go)
    if (Constants.appOwnership !== 'expo') {
      (async () => {
        try {
          const mod = await import('expo-ads-admob');
          // @ts-ignore
          await mod.setTestDeviceIDAsync('EMULATOR');
        } catch {}
      })();
    }
    (async () => {
      try {
        const v = await AsyncStorage.getItem('p2p:onboarded');
        setShowOnboarding(!v);
      } catch {
        setShowOnboarding(true);
      }
    })();
  }, []);

  if (!fontsLoaded || showOnboarding === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' }}>
        <ActivityIndicator />
      </View>
    );
  }

  const theme = {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: '#FAFBFC', text: '#0F172A' },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer theme={theme}>
          <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'default'} />
          <Stack.Navigator>
            {showOnboarding ? (
              <Stack.Screen name="Onboarding" options={{ headerShown: false }}>
                {() => <OnboardingScreen onDone={() => setShowOnboarding(false)} />}
              </Stack.Screen>
            ) : null}
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={({ navigation }) => ({
                title: 'Photo2PDF',
                headerTitleStyle: { 
                  fontFamily: 'Inter_700Bold', 
                  color: '#0F172A',
                  fontSize: 18
                },
                headerStyle: {
                  backgroundColor: '#FAFBFC',
                  shadowColor: 'transparent',
                  elevation: 0,
                },
                headerRight: () => (
                  <Pressable 
                    onPress={() => navigation.navigate('Settings')} 
                    className="w-10 h-10 rounded-xl bg-neutral-100 items-center justify-center"
                  >
                    <Ionicons name="settings-outline" size={20} color="#0F172A" />
                  </Pressable>
                ),
              })}
            />
            <Stack.Screen
              name="Edit"
              component={EditScreen}
              options={{ 
                title: 'Arrange & Export', 
                headerTitleStyle: { 
                  fontFamily: 'Inter_700Bold',
                  color: '#0F172A',
                  fontSize: 18
                },
                headerStyle: {
                  backgroundColor: '#FAFBFC',
                  shadowColor: 'transparent',
                  elevation: 0,
                }
              }}
            />
            <Stack.Screen
              name="ExportSuccess"
              component={ExportSuccessScreen}
              options={{ 
                title: 'Export Complete', 
                headerTitleStyle: { 
                  fontFamily: 'Inter_700Bold',
                  color: '#0F172A',
                  fontSize: 18
                },
                headerStyle: {
                  backgroundColor: '#FAFBFC',
                  shadowColor: 'transparent',
                  elevation: 0,
                }
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ 
                title: 'Settings', 
                headerTitleStyle: { 
                  fontFamily: 'Inter_700Bold',
                  color: '#0F172A',
                  fontSize: 18
                },
                headerStyle: {
                  backgroundColor: '#FAFBFC',
                  shadowColor: 'transparent',
                  elevation: 0,
                }
              }}
            />
            <Stack.Screen
              name="CropEditor"
              component={require('./src/screens/CropEditorScreen').default}
              options={{ 
                title: 'Crop Image', 
                headerTitleStyle: { 
                  fontFamily: 'Inter_700Bold',
                  color: '#0F172A',
                  fontSize: 18
                },
                headerStyle: {
                  backgroundColor: '#FAFBFC',
                  shadowColor: 'transparent',
                  elevation: 0,
                }
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
