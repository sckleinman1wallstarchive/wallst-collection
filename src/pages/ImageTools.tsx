import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { useRemoveBgUsage } from '@/hooks/useRemoveBgUsage';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Eraser, Download, RefreshCw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { BackgroundSelector, BackgroundOptions, ProcessorType } from '@/components/imagetools/BackgroundSelector';
import { UsageDisplay } from '@/components/imagetools/UsageDisplay';
import { ApiKeyManager } from '@/components/imagetools/ApiKeyManager';
import { InventoryImageSelector } from '@/components/imagetools/InventoryImageSelector';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  itemId?: string;
  imageIndex?: number;
}

export default function ImageTools() {
  const { inventory, isLoading, updateItem } = useSupabaseInventory();
  const { usage, isLoading: usageLoading, invalidate: invalidateUsage } = useRemoveBgUsage();
  
  // Map: itemId -> Set of selected image URLs
  const [selectedImages, setSelectedImages] = useState<Map<string, Set<string>>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalToProcess, setTotalToProcess] = useState(0);
  const [results, setResults] = useState<ProcessedImage[]>([]);
  const [backgroundOptions, setBackgroundOptions] = useState<BackgroundOptions>({ type: 'transparent' });
  const [processorType, setProcessorType] = useState<ProcessorType>('removebg');
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [pendingProcessCount, setPendingProcessCount] = useState(0);

  const getTotalSelectedCount = () => {
    let total = 0;
    selectedImages.forEach((urls) => {
      total += urls.size;
    });
    return total;
  };

  const processImages = async (limitToRemaining?: number) => {
    // Build list of images to process with their item context
    const imagesToProcess: { url: string; itemId: string; imageIndex: number }[] = [];
    
    selectedImages.forEach((urls, itemId) => {
      const item = inventory.find((i) => i.id === itemId);
      if (!item) return;
      
      urls.forEach((url) => {
        const imageIndex = item.imageUrls?.indexOf(url) ?? -1;
        if (imageIndex !== -1) {
          imagesToProcess.push({ url, itemId, imageIndex });
        }
      });
    });

    let toProcess = imagesToProcess;
    if (limitToRemaining !== undefined) {
      toProcess = imagesToProcess.slice(0, limitToRemaining);
    }

    if (toProcess.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    // Only check remove.bg limits when using remove.bg processor
    if (processorType === 'removebg' && usage && !limitToRemaining) {
      const wouldExceed = usage.totalUsed + toProcess.length > usage.totalLimit;
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
    setTotalToProcess(toProcess.length);
    setResults([]);

    try {
      // Build background payload
      const backgroundPayload = backgroundOptions.type === 'transparent' 
        ? { type: 'transparent' as const }
        : { type: 'solid' as const, color: backgroundOptions.color };

      // Choose endpoint based on processor type
      const functionName = processorType === 'removebg' ? 'remove-background' : 'ai-background-replace';

      // For AI processor, batch in groups of 3 to avoid CPU timeout
      const batchSize = processorType === 'lovable-ai' ? 3 : toProcess.length;
      const batches: typeof toProcess[] = [];
      for (let i = 0; i < toProcess.length; i += batchSize) {
        batches.push(toProcess.slice(i, i + batchSize));
      }

      let allResults: ProcessedImage[] = [];
      let processed = 0;

      for (const batch of batches) {
        const urlsToProcess = batch.map((img) => img.url);

        const { data, error } = await supabase.functions.invoke(functionName, {
          body: { 
            imageUrls: urlsToProcess,
            background: backgroundPayload,
          },
        });

        if (error) {
          throw error;
        }

        const apiResults = data.results || [];
        
        // Map results back with item context
        const enrichedResults: ProcessedImage[] = apiResults.map((result: ProcessedImage, idx: number) => ({
          ...result,
          itemId: batch[idx]?.itemId,
          imageIndex: batch[idx]?.imageIndex,
        }));

        allResults = [...allResults, ...enrichedResults];
        processed += batch.length;
        setProcessedCount(processed);
        setResults([...allResults]);
      }

      const enrichedResults = allResults;

      // Auto-save processed images back to inventory
      const successfulResults = enrichedResults.filter((r) => r.processedUrl);
      
      if (successfulResults.length > 0) {
        // Group by item
        const itemUpdates = new Map<string, { itemId: string; updates: { index: number; newUrl: string }[] }>();
        
        successfulResults.forEach((result) => {
          if (!result.itemId || result.imageIndex === undefined || !result.processedUrl) return;
          
          if (!itemUpdates.has(result.itemId)) {
            itemUpdates.set(result.itemId, { itemId: result.itemId, updates: [] });
          }
          itemUpdates.get(result.itemId)!.updates.push({
            index: result.imageIndex,
            newUrl: result.processedUrl,
          });
        });

        // Apply updates to each item
        for (const [itemId, { updates }] of itemUpdates) {
          const item = inventory.find((i) => i.id === itemId);
          if (!item) continue;

          const newImageUrls = [...(item.imageUrls || [])];
          updates.forEach(({ index, newUrl }) => {
            if (index >= 0 && index < newImageUrls.length) {
              newImageUrls[index] = newUrl;
            }
          });

          // Update the item in the database
          await updateItem(itemId, { 
            imageUrls: newImageUrls,
            imageUrl: newImageUrls[0] || null 
          });
        }

        toast.success(`Updated ${itemUpdates.size} item(s) with ${successfulResults.length} processed image(s)`);
      }
      
      // Refresh usage data only for remove.bg
      if (processorType === 'removebg') {
        invalidateUsage();
      }

      // Clear selection after successful processing
      setSelectedImages(new Map());
      
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
    const processorName = processorType === 'removebg' ? 'remove.bg' : 'Color Switcher';
    if (backgroundOptions.type === 'transparent') {
      return `Remove Backgrounds (${processorName})`;
    } else {
      return `Apply ${backgroundOptions.color || 'Color'} (${processorName})`;
    }
  };

  const isAtLimit = processorType === 'removebg' && usage?.warning === 'at_limit';

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

  const totalSelected = getTotalSelectedCount();

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
              Swap or remove backgrounds from your product photos — changes save automatically
            </p>
          </div>
          {processorType === 'removebg' && (
            <div className="w-80">
              <UsageDisplay usage={usage} isLoading={usageLoading} />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column: Image Selection + Background Options */}
          <div className="space-y-6">
            {/* Inventory Image Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Inventory Images</CardTitle>
                <CardDescription>
                  Choose images from your inventory items. Check the box to select all images, or click to expand and pick individual photos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InventoryImageSelector
                  inventory={inventory}
                  isLoading={isLoading}
                  selectedImages={selectedImages}
                  onSelectionChange={setSelectedImages}
                />
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
                  processorType={processorType}
                  onProcessorChange={setProcessorType}
                />
              </CardContent>
            </Card>

            {/* API Key Management */}
            <ApiKeyManager />

            {/* Process Button */}
            <div className="space-y-4">
              <Button
                onClick={() => processImages()}
                disabled={totalSelected === 0 || isProcessing || isAtLimit}
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
                    {getProcessButtonText()} ({totalSelected} images)
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
                Processed images are automatically saved to your inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {results.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
                    <Eraser className="h-12 w-12 mb-2 opacity-50" />
                    <p>Processed images will appear here</p>
                    <p className="text-xs mt-1">They're auto-saved to inventory</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.map((result, index) => {
                      const item = inventory.find((i) => i.id === result.itemId);
                      return (
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
                              {result.processedUrl ? 'Saved' : 'Failed'}
                            </span>
                            {item && (
                              <span className="text-xs text-muted-foreground truncate">
                                — {item.name}
                              </span>
                            )}
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
                      );
                    })}
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
              <p>You're about to process {totalSelected} images.</p>
              <p className="font-medium">
                Current usage: {usage?.totalUsed}/{usage?.totalLimit}
              </p>
              <p>
                After processing: {(usage?.totalUsed || 0) + totalSelected}/{usage?.totalLimit} ({totalSelected - pendingProcessCount} over limit)
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
