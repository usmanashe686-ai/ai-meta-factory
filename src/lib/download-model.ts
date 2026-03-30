import { Filesystem, Directory } from '@capacitor/filesystem';

export const downloadGGUF = async (url: string, fileName: string) => {
  try {
    // Ensure the models directory exists in the app's data folder
    await Filesystem.mkdir({
      path: 'models',
      directory: Directory.Data,
      recursive: true
    }).catch(() => {});

    // Using Directory.Data is safer for your 5.12GB of free space
    const result = await Filesystem.downloadFile({
      url: url,
      path: `models/${fileName}`,
      directory: Directory.Data,
    });

    console.log('Download complete:', result.path);
    return result.path;
  } catch (error) {
    console.error("Native Download Error:", error);
    throw error;
  }
};
