import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useStorageImages } from '@/hooks/useStorageImages';
import { useRemoveBgUsage } from '@/hooks/useRemoveBgUsage';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Eraser, Download, RefreshCw, CheckCircle2, XCircle, Upload, ImageOff, AlertTriangle } from 'lucide-react';
import { BackgroundSelector, BackgroundOptions } from '@/components/imagetools/BackgroundSelector';
import { UsageDisplay } from '@/components/imagetools/UsageDisplay';
import { ApiKeyManager } from '@/components/imagetools/ApiKeyManager';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ProcessedImage {
  originalUrl: string;
  processedUrl: string | null;
  error?: string;
}

export default function ImageTools() {
  const { images, isLoading, refetch } = useStorageImages('inventory-images', 'items');
  const { usage, isLoading: usageLoading, invalidate: invalidateUsage } = useRemoveBgUsage();
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalToProcess, setTotalToProcess] = useState(0);
  const [results, setResults] = useState<ProcessedImage[]>([]);
  const [uploadedImages, setUploadedImages] = useState<{ url: string; file: File }[]>([]);
  const [backgroundOptions, setBackgroundOptions] = useState<BackgroundOptions>({ type: 'transparent' });
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [pendingProcessCount, setPendingProcessCount] = useState(0);

  const toggleImageSelection = (url: string) => {
    setSelectedImages(prev => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  };

  const selectAll = () => {
    const allUrls = [...images.map(i => i.url), ...uploadedImages.map(i => i.url)];
    setSelectedImages(new Set(allUrls));
  };

  const clearSelection = () => {
    setSelectedImages(new Set());
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: { url: string; file: File }[] = [];
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        newImages.push({ url, file });
      }
    }
    setUploadedImages(prev => [...prev, ...newImages]);
  };

  const processImages = async (limitToRemaining?: number) => {
    let urlsToProcess = Array.from(selectedImages);
    
    if (limitToRemaining !== undefined) {
      urlsToProcess = urlsToProcess.slice(0, limitToRemaining);
    }

    if (urlsToProcess.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    // Check if we'll exceed the limit
    if (usage && !limitToRemaining) {
      const wouldExceed = usage.totalUsed + urlsToProcess.length > usage.totalLimit;
      if (wouldExceed && usage.totalRemaining > 0) {
        setPendingProcessCount(usage.totalRemaining);
        setShowLimitWarning(true);
        return;
      }
      if (usage.totalRemaining === 0) {
        toast.error(`All keys exhausted. Resets ${usage.resetDate}`);
        return;
      }
    }

    setIsProcessing(true);
    setProcessedCount(0);
    setTotalToProcess(urlsToProcess.length);
    setResults([]);

    try {
      // For uploaded files that are blob URLs, we need to upload them first
      const processableUrls: string[] = [];
      
      for (const url of urlsToProcess) {
        if (url.startsWith('blob:')) {
          const uploadedImg = uploadedImages.find(i => i.url === url);
          if (uploadedImg) {
            const fileName = `temp-${Date.now()}-${uploadedImg.file.name}`;
            const { data, error } = await supabase.storage
              .from('inventory-images')
              .upload(`temp/${fileName}`, uploadedImg.file);
            
            if (error) {
              console.error('Upload error:', error);
              continue;
            }
            
            const { data: { publicUrl } } = supabase.storage
              .from('inventory-images')
              .getPublicUrl(`temp/${fileName}`);
            
            processableUrls.push(publicUrl);
          }
        } else {
          processableUrls.push(url);
        }
      }

      // Build background payload
      const backgroundPayload = backgroundOptions.type === 'transparent' 
        ? { type: 'transparent' as const }
        : { type: 'solid' as const, color: backgroundOptions.color };

      const { data, error } = await supabase.functions.invoke('remove-background', {
        body: { 
          imageUrls: processableUrls,
          background: backgroundPayload,
        },
      });

      if (error) {
        throw error;
      }

      setResults(data.results || []);
      setProcessedCount(processableUrls.length);

      const successCount = (data.results || []).filter((r: ProcessedImage) => r.processedUrl).length;
      
      // Show skipped message if any
      if (data.skipped) {
        toast.warning(data.skipped);
      }
      
      toast.success(`Processed ${successCount} of ${processableUrls.length} images`);
      
      // Refresh usage data
      invalidateUsage();
    } catch (error: any) {
      console.error('Processing error:', error);
      if (error.message?.includes('Monthly limit reached')) {
        toast.error('Monthly limit reached. Please wait until next month.');
      } else {
        toast.error('Failed to process images');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  const downloadAll = async () => {
    const successfulResults = results.filter(r => r.processedUrl);
    for (let i = 0; i < successfulResults.length; i++) {
      const result = successfulResults[i];
      if (result.processedUrl) {
        await downloadImage(result.processedUrl, `processed-${i + 1}.png`);
        await new Promise(r => setTimeout(r, 500));
      }
    }
    toast.success(`Downloaded ${successfulResults.length} images`);
  };

  const getProcessButtonText = () => {
    if (backgroundOptions.type === 'transparent') {
      return 'Remove Backgrounds';
    } else {
      return `Apply ${backgroundOptions.color || 'Color'} Background`;
    }
  };

  const getResultBackground = () => {
    if (backgroundOptions.type === 'solid' && backgroundOptions.color) {
      return { backgroundColor: backgroundOptions.color };
    }
    // Transparent checkerboard
    return {
      backgroundImage: 'linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%), linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)',
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
    };
  };

  const allImages = [...images.map(i => ({ url: i.url, name: i.name })), ...uploadedImages.map(i => ({ url: i.url, name: i.file.name }))];

  const isAtLimit = usage?.warning === 'at_limit';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Eraser className="h-8 w-8" />
              Image Tools
            </h1>
            <p className="text-muted-foreground mt-1">
              Swap or remove backgrounds from your product photos in batch
            </p>
          </div>
          <div className="w-80">
            <UsageDisplay usage={usage} isLoading={usageLoading} />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column: Image Selection + Background Options */}
          <div className="space-y-6">
            {/* Image Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Select Images</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAll}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearSelection}>
                      Clear
                    </Button>
                    <Button variant="outline" size="sm" onClick={refetch}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Choose images from your inventory or upload new ones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload Zone */}
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-muted-foreground/50 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </span>
                  </label>
                </div>

                {/* Image Grid */}
                <ScrollArea className="h-[250px]">
                  {isLoading ? (
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-square rounded-md" />
                      ))}
                    </div>
                  ) : allImages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <ImageOff className="h-12 w-12 mb-2" />
                      <p>No images found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {allImages.map((image) => (
                        <div
                          key={image.url}
                          className={`relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all ${
                            selectedImages.has(image.url)
                              ? 'border-primary ring-2 ring-primary/20'
                              : 'border-transparent hover:border-muted-foreground/50'
                          }`}
                          onClick={() => toggleImageSelection(image.url)}
                        >
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1 right-1">
                            <Checkbox
                              checked={selectedImages.has(image.url)}
                              className="bg-background/80"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                <div className="text-sm text-muted-foreground text-center">
                  {selectedImages.size} images selected
                </div>
              </CardContent>
            </Card>

            {/* Background Options */}
            <Card>
              <CardHeader>
                <CardTitle>Background</CardTitle>
                <CardDescription>
                  Choose what to replace the background with
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BackgroundSelector 
                  value={backgroundOptions} 
                  onChange={setBackgroundOptions} 
                />
              </CardContent>
            </Card>

            {/* API Key Management */}
            <ApiKeyManager />
            {/* Process Button */}
            <div className="space-y-4">
              <Button
                onClick={() => processImages()}
                disabled={selectedImages.size === 0 || isProcessing || isAtLimit}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : isAtLimit ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Monthly Limit Reached
                  </>
                ) : (
                  <>
                    <Eraser className="h-4 w-4 mr-2" />
                    {getProcessButtonText()}
                  </>
                )}
              </Button>

              {/* Progress Bar */}
              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={(processedCount / totalToProcess) * 100} />
                  <p className="text-sm text-center text-muted-foreground">
                    Processing {processedCount} of {totalToProcess}...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Results</span>
                {results.filter(r => r.processedUrl).length > 0 && (
                  <Button variant="outline" size="sm" onClick={downloadAll}>
                    <Download className="h-4 w-4 mr-2" />
                    Download All ({results.filter(r => r.processedUrl).length})
                  </Button>
                )}
              </CardTitle>
              <CardDescription>
                Preview and download your processed images
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {results.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
                    <Eraser className="h-12 w-12 mb-2 opacity-50" />
                    <p>Processed images will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.map((result, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-3 space-y-3"
                      >
                        <div className="flex items-center gap-2">
                          {result.processedUrl ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive" />
                          )}
                          <span className="text-sm font-medium">
                            {result.processedUrl ? 'Success' : 'Failed'}
                          </span>
                          {result.error && (
                            <span className="text-xs text-destructive">
                              {result.error}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {/* Original */}
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Original</p>
                            <div className="aspect-square rounded-md overflow-hidden bg-muted">
                              <img
                                src={result.originalUrl}
                                alt="Original"
                                className="w-full h-full object-contain"
                              />
                            </div>
                          </div>

                          {/* Processed */}
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Processed</p>
                            <div 
                              className="aspect-square rounded-md overflow-hidden"
                              style={getResultBackground()}
                            >
                              {result.processedUrl ? (
                                <img
                                  src={result.processedUrl}
                                  alt="Processed"
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted/50">
                                  <XCircle className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {result.processedUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => downloadImage(result.processedUrl!, `processed-${index + 1}.png`)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Credit Warning Dialog */}
      <AlertDialog open={showLimitWarning} onOpenChange={setShowLimitWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Credit Warning
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>You're about to process {selectedImages.size} images.</p>
              <p className="font-medium">
                Current usage: {usage?.totalUsed}/{usage?.totalLimit}
              </p>
              <p>
                After processing: {(usage?.totalUsed || 0) + selectedImages.size}/{usage?.totalLimit} ({selectedImages.size - pendingProcessCount} over limit)
              </p>
              <p className="text-sm">
                Only the first {pendingProcessCount} images will be processed.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowLimitWarning(false);
              processImages(pendingProcessCount);
            }}>
              Process {pendingProcessCount} Images
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
