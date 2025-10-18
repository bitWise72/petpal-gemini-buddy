import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PetPhotoUploadProps {
  onAnalysisComplete: (analysis: string, imageUrl: string) => void;
}

export const PetPhotoUpload = ({ onAnalysisComplete }: PetPhotoUploadProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to capture your pet's photo.",
        variant: "destructive"
      });
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg');
    
    // Stop camera
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
    setPreview(base64);

    // Analyze with Gemini
    await analyzePhoto(base64);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setPreview(base64);
      await analyzePhoto(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzePhoto = async (base64: string) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-pet-photo', {
        body: { imageData: base64 }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!data?.analysis) {
        throw new Error('No analysis data received');
      }

      toast({
        title: "Got it! 🐧",
        description: "Let me chat with you about your pet!"
      });

      onAnalysisComplete(data.analysis, base64);
    } catch (error) {
      console.error('Error analyzing photo:', error);
      toast({
        title: "Oops!",
        description: error instanceof Error ? error.message : "I couldn't analyze the photo. Mind trying again?",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="p-8 text-center hover:shadow-lg transition-shadow">
      <div className="space-y-6">
        {cameraActive ? (
          <div className="relative">
            <video 
              ref={videoRef}
              autoPlay 
              playsInline
              className="w-full h-64 object-cover rounded-lg"
            />
            <Button
              onClick={capturePhoto}
              size="lg"
              className="mt-4 w-full"
              disabled={isAnalyzing}
            >
              <Camera className="mr-2 h-5 w-5" />
              Capture Photo
            </Button>
          </div>
        ) : preview ? (
          <img 
            src={preview} 
            alt="Pet preview" 
            className="w-full h-64 object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
            <Camera className="h-16 w-16 text-muted-foreground" />
          </div>
        )}

        {!cameraActive && !preview && (
          <div>
            <h3 className="text-2xl font-bold mb-2">Let's See Your Pet!</h3>
            <p className="text-muted-foreground mb-4">
              Snap a quick photo or choose from your gallery
            </p>

            <div className="space-y-3">
              <Button 
                onClick={startCamera}
                variant="default" 
                size="lg"
                disabled={isAnalyzing}
                className="w-full"
              >
                <Camera className="mr-2 h-5 w-5" />
                Open Camera
              </Button>

              <label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isAnalyzing}
                />
                <Button 
                  variant="outline" 
                  size="lg"
                  disabled={isAnalyzing}
                  className="w-full"
                  asChild
                >
                  <span>
                    <Upload className="mr-2 h-5 w-5" />
                    Choose from Gallery
                  </span>
                </Button>
              </label>
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Analyzing your pet...</span>
          </div>
        )}
      </div>
    </Card>
  );
};
