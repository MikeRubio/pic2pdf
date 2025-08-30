import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

export type ImageAdjustments = {
  brightness: number; // -1 to 1
  contrast: number;   // -1 to 1
  saturation: number; // -1 to 1
};

export async function applyImageAdjustments(
  imageUri: string, 
  adjustments: ImageAdjustments
): Promise<string> {
  try {
    // Create a temporary directory for processed images
    const tempDir = `${FileSystem.documentDirectory}temp_adjustments/`;
    const dirInfo = await FileSystem.getInfoAsync(tempDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });
    }

    // Generate output filename
    const timestamp = Date.now();
    const outputUri = `${tempDir}adjusted_${timestamp}.jpg`;

    // Note: This is a simplified implementation using expo-image-manipulator
    // For true color adjustments, you would need react-native-image-filter-kit
    // or a similar library that supports pixel-level color manipulation
    
    // For demonstration, we'll apply a basic manipulation
    // In production, you'd use ImageFilter components from react-native-image-filter-kit
    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        // Placeholder: expo-image-manipulator doesn't support color adjustments
        // Real implementation would use react-native-image-filter-kit filters here
      ],
      {
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return result.uri;
  } catch (error) {
    console.error('Failed to apply image adjustments:', error);
    throw new Error('Failed to apply adjustments');
  }
}

// Helper function to check if adjustments are applied
export function hasAdjustments(adjustments: ImageAdjustments): boolean {
  return adjustments.brightness !== 0 || 
         adjustments.contrast !== 0 || 
         adjustments.saturation !== 0;
}