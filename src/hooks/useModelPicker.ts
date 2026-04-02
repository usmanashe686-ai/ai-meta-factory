import { useState } from 'react';
import { FilePicker } from '@capacitor-community/file-picker';

export const useModelPicker = () => {
  const [selectedFile, setSelectedFile] = useState<{ name: string; uri: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pickModel = async () => {
    try {
      const result = await FilePicker.pickFile({
        types: ['application/octet-stream', 'model/gguf'],
      });
      setSelectedFile({ name: result.name, uri: result.path });
      setError(null);
      return result;
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      return null;
    }
  };

  return { pickModel, selectedFile, error };
};
