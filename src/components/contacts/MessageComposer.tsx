import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Copy, ImagePlus, X, Instagram, MessageCircle } from 'lucide-react';
import { Contact } from '@/hooks/useContacts';

interface MessageComposerProps {
  selectedContacts: Contact[];
  onOpenInstagramProfiles: () => void;
  onOpenIMessages: () => void;
}

export function MessageComposer({
  selectedContacts,
  onOpenInstagramProfiles,
  onOpenIMessages,
}: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    // Create a local URL for the image preview
    const localUrl = URL.createObjectURL(file);
    setImageUrl(localUrl);
    setIsUploading(false);

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopyMessage = async () => {
    if (!message.trim()) {
      toast({
        title: 'No message to copy',
        description: 'Write a message first',
        variant: 'destructive',
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(message);
      toast({ title: 'Message copied to clipboard!' });
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleCopyImage = async () => {
    if (!imageUrl) {
      toast({
        title: 'No image to copy',
        description: 'Upload an image first',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      toast({ title: 'Image copied to clipboard!' });
    } catch {
      toast({
        title: 'Failed to copy image',
        description: 'Your browser may not support copying images',
        variant: 'destructive',
      });
    }
  };

  const instagramContacts = selectedContacts.filter((c) => c.instagram_handle);
  const phoneContacts = selectedContacts.filter((c) => c.phone_number);

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Message Composer</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-4">
          {/* Message Text Area */}
          <Textarea
            placeholder="Draft your message here... e.g., 'Just got this Chrome Hearts pendant in, lmk if interested'"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 min-h-[150px] resize-none"
          />

          {/* Image Upload Area */}
          <div className="space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />

            {imageUrl ? (
              <div className="relative inline-block">
                <img
                  src={imageUrl}
                  alt="Upload preview"
                  className="max-h-48 rounded-lg border border-border"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={() => setImageUrl(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full h-24 border-dashed"
              >
                <ImagePlus className="h-6 w-6 mr-2" />
                {isUploading ? 'Uploading...' : 'Add Image'}
              </Button>
            )}
          </div>

          {/* Copy Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCopyMessage}
              className="flex-1"
              disabled={!message.trim()}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Message
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyImage}
              className="flex-1"
              disabled={!imageUrl}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Image
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedContacts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              Send to {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {instagramContacts.length > 0 && (
              <Button
                variant="secondary"
                onClick={onOpenInstagramProfiles}
                className="w-full justify-start"
              >
                <Instagram className="h-4 w-4 mr-2" />
                Open {instagramContacts.length} Instagram Profile{instagramContacts.length !== 1 ? 's' : ''}
              </Button>
            )}
            {phoneContacts.length > 0 && (
              <Button
                variant="secondary"
                onClick={onOpenIMessages}
                className="w-full justify-start"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Open {phoneContacts.length} iMessage{phoneContacts.length !== 1 ? 's' : ''}
              </Button>
            )}
            <p className="text-xs text-muted-foreground pt-2">
              Tip: Copy your message first, then open the profiles/messages to paste
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
