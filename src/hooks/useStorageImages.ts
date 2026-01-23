import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StorageImage {
  name: string;
  url: string;
  path: string;
  createdAt: string;
}

export function useStorageImages(bucketName: string = 'inventory-images', folderPath: string = 'items') {
  const [images, setImages] = useState<StorageImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: files, error: listError } = await supabase.storage
        .from(bucketName)
        .list(folderPath, {
          limit: 500,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (listError) {
        throw listError;
      }

      // Filter only image files and get public URLs
      const imageFiles = (files || [])
        .filter(file => {
          const ext = file.name.toLowerCase().split('.').pop();
          return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '');
        })
        .map(file => {
          const path = `${folderPath}/${file.name}`;
          const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(path);

          return {
            name: file.name,
            url: publicUrl,
            path,
            createdAt: file.created_at || '',
          };
        });

      setImages(imageFiles);
    } catch (err) {
      console.error('Error fetching storage images:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch images');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [bucketName, folderPath]);

  return {
    images,
    isLoading,
    error,
    refetch: fetchImages,
  };
}
