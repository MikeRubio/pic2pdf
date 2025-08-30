module.exports = {
  name: "Photo2PDF",
  slug: "photo2pdf",
  scheme: "photo2pdf",
  version: "1.0.0",
  orientation: "portrait",
  // Use Expo defaults unless assets are provided
  // icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    // Provide a clean brand color splash without an image for now
    resizeMode: "contain",
    backgroundColor: "#2563EB"
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.example.photo2pdf"
  },
  android: {
    package: "com.example.photo2pdf",
    adaptiveIcon: {
      // foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#F9FAFB"
    }
  },
  plugins: [
    [
      "expo-ads-admob",
      {
        androidAppId: "ca-app-pub-3940256099942544~3347511713",
        iosAppId: "ca-app-pub-3940256099942544~1458002511"
      }
    ]
  ],
  extra: {
    eas: {
      projectId: "00000000-0000-0000-0000-000000000000"
    }
  }
};
