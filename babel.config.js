module.exports = function (api) {
  api.cache(true);
  return {
    // Use NativeWind as a preset (it returns a preset-like object)
    presets: ["babel-preset-expo", "nativewind/babel"],
    // Reanimated plugin is already included by nativewind/babel and placed last within that preset.
    // If you add other plugins, ensure reanimated remains the last plugin overall.
    plugins: []
  };
};
