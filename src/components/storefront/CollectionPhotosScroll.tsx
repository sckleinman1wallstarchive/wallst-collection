import { useRef, useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCollectionPhotos } from '@/hooks/useCollectionPhotos';

interface CollectionPhotosScrollProps {
  isEditMode: boolean;
}

export function CollectionPhotosScroll({ isEditMode }: CollectionPhotosScrollProps) {
  const { photos, isLoading, addPhoto, deletePhoto, isUploading } = useCollectionPhotos();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await addPhoto(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    deletePhoto(id);
    setDeletingId(null);
  };

  if (isLoading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/50" />
      </div>
    );
  }

  // Hide section if no photos and not in edit mode
  if (photos.length === 0 && !isEditMode) {
    return null;
  }

  return (
    <section className="py-12 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-light tracking-wide text-white mb-8 text-center">
          Collection
        </h2>

        <div className="relative">
          {/* Horizontal Scroll Container */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative flex-shrink-0 group"
              >
                <img
                  src={photo.image_url}
                  alt="Collection photo"
                  className="h-64 w-auto object-cover rounded-sm"
                />
                
                {/* Delete button in edit mode */}
                {isEditMode && (
                  <button
                    onClick={() => handleDelete(photo.id)}
                    disabled={deletingId === photo.id}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Delete photo"
                  >
                    {deletingId === photo.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            ))}

            {/* Add Photo Button (edit mode only) */}
            {isEditMode && (
              <div className="flex-shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="h-64 w-48 border-2 border-dashed border-white/30 rounded-sm flex flex-col items-center justify-center text-white/50 hover:text-white hover:border-white/50 transition-colors"
                >
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-8 w-8 mb-2" />
                      <span className="text-sm">Add Photo</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
