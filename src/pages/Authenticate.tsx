import { useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Upload,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  X,
  Loader2,
  ImagePlus,
} from 'lucide-react';

interface AuthenticationResult {
  score: number;
  verdict: 'likely_authentic' | 'likely_fake' | 'inconclusive';
  reasoning: {
    positiveIndicators: string[];
    concernIndicators: string[];
    summary: string;
  };
  references: {
    url: string;
    platform: string;
    description: string;
  }[];
  analyzedDetails: {
    stitching: string;
    labels: string;
    materials: string;
    hardware: string;
    construction: string;
  };
}

export default function Authenticate() {
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [brand, setBrand] = useState('');
  const [itemName, setItemName] = useState('');
  const [size, setSize] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AuthenticationResult | null>(null);
  const [analysisStep, setAnalysisStep] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addImages(files);
  };

  const addImages = (files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    const newImages = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages(prev => [...prev, ...newImages].slice(0, 10)); // Max 10 images
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    addImages(files);
  };

  const checkAuthenticity = async () => {
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }
    if (!brand.trim()) {
      toast.error('Please enter a brand name');
      return;
    }
    if (!itemName.trim()) {
      toast.error('Please enter an item name');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      // Step 1: Convert images to base64
      setAnalysisStep('Preparing images...');
      const imagePromises = images.map(async ({ file }) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });
      const base64Images = await Promise.all(imagePromises);

      // Step 2: Search for references
      setAnalysisStep('Searching for authentic references...');
      
      // Step 3: Analyze with AI
      setAnalysisStep('Analyzing authenticity markers...');
      
      const { data, error } = await supabase.functions.invoke('authenticate-item', {
        body: {
          images: base64Images,
          brand: brand.trim(),
          itemName: itemName.trim(),
          size: size.trim() || undefined,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to authenticate item');
      }

      if (!data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      setResult(data.result);
      toast.success('Authentication analysis complete');
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to authenticate item');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'likely_authentic':
        return <ShieldCheck className="h-8 w-8 text-green-500" />;
      case 'likely_fake':
        return <ShieldAlert className="h-8 w-8 text-red-500" />;
      default:
        return <ShieldQuestion className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'likely_authentic':
        return 'bg-green-500';
      case 'likely_fake':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getVerdictLabel = (verdict: string) => {
    switch (verdict) {
      case 'likely_authentic':
        return 'LIKELY AUTHENTIC';
      case 'likely_fake':
        return 'LIKELY FAKE';
      default:
        return 'INCONCLUSIVE';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Authenticate</h1>
          <p className="text-muted-foreground">
            AI-powered authenticity verification with web reference comparison
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Upload and Details */}
          <div className="space-y-6">
            {/* Upload Zone */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Photos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Drop photos here or click to upload
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Upload multiple angles: front, back, tag, label, stitching details
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {images.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {images.length} photo{images.length !== 1 ? 's' : ''} selected
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                      {images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img.preview}
                            alt={`Upload ${index + 1}`}
                            className="w-full aspect-square object-cover rounded-md"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(index);
                            }}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Item Details */}
            <Card>
              <CardHeader>
                <CardTitle>Item Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand *</Label>
                  <Input
                    id="brand"
                    placeholder="e.g., Nike, Louis Vuitton, Supreme"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="itemName">Item Name *</Label>
                  <Input
                    id="itemName"
                    placeholder="e.g., Air Jordan 1 Retro High OG"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Size (Optional)</Label>
                  <Input
                    id="size"
                    placeholder="e.g., 10.5, M, Large"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={checkAuthenticity}
                  disabled={isAnalyzing || images.length === 0}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {analysisStep || 'Analyzing...'}
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Check Authenticity
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Results */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Authentication Result</CardTitle>
            </CardHeader>
            <CardContent>
              {!result && !isAnalyzing && (
                <div className="text-center py-12 text-muted-foreground">
                  <ShieldQuestion className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Upload photos and enter item details to check authenticity</p>
                </div>
              )}

              {isAnalyzing && (
                <div className="text-center py-12">
                  <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin text-primary" />
                  <p className="text-muted-foreground">{analysisStep}</p>
                </div>
              )}

              {result && (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-6">
                    {/* Score and Verdict */}
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        {getVerdictIcon(result.verdict)}
                      </div>
                      <div className="space-y-2">
                        <div className="text-4xl font-bold">{result.score}%</div>
                        <Progress
                          value={result.score}
                          className={`h-3 ${getVerdictColor(result.verdict)}`}
                        />
                        <Badge
                          variant={result.verdict === 'likely_authentic' ? 'default' : result.verdict === 'likely_fake' ? 'destructive' : 'secondary'}
                          className="text-sm"
                        >
                          {getVerdictLabel(result.verdict)}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    {/* Summary */}
                    <div>
                      <h4 className="font-semibold mb-2">Summary</h4>
                      <p className="text-sm text-muted-foreground">
                        {result.reasoning.summary}
                      </p>
                    </div>

                    <Separator />

                    {/* Indicators */}
                    <div className="space-y-4">
                      {result.reasoning.positiveIndicators.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Positive Indicators
                          </h4>
                          <ul className="space-y-1">
                            {result.reasoning.positiveIndicators.map((indicator, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                {indicator}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.reasoning.concernIndicators.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            Concerns
                          </h4>
                          <ul className="space-y-1">
                            {result.reasoning.concernIndicators.map((indicator, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-yellow-500 mt-1">⚠</span>
                                {indicator}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Analysis Details */}
                    <div>
                      <h4 className="font-semibold mb-3">Analysis Details</h4>
                      <div className="grid gap-3">
                        {Object.entries(result.analyzedDetails).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="capitalize font-medium">{key}</span>
                            <span className="text-muted-foreground text-right max-w-[60%]">
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {result.references.length > 0 && (
                      <>
                        <Separator />

                        {/* Reference Sources */}
                        <div>
                          <h4 className="font-semibold mb-3">Reference Sources</h4>
                          <div className="space-y-3">
                            {result.references.map((ref, i) => (
                              <Card key={i} className="p-3">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                    <Badge variant="outline" className="text-xs">
                                      {ref.platform}
                                    </Badge>
                                    <p className="text-sm text-muted-foreground">
                                      {ref.description}
                                    </p>
                                  </div>
                                  <a
                                    href={ref.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-primary/80"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Disclaimer */}
                    <div className="bg-muted/50 rounded-lg p-4 text-xs text-muted-foreground">
                      <p className="font-medium mb-1">⚠️ Disclaimer</p>
                      <p>
                        This AI-powered analysis is a helper tool and should not be
                        considered definitive proof of authenticity. High-quality
                        replicas may fool the system. For valuable items, always
                        consult professional authentication services.
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
