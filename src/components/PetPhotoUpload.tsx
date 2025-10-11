import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PetPhotoUploadProps {
  onAnalysisComplete: (analysis: string, imageUrl: string) => void;
}

export const PetPhotoUpload = ({ onAnalysisComplete }: PetPhotoUploadProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Analyze with Gemini
    setIsAnalyzing(true);
    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke('analyze-pet-photo', {
        body: { imageData: base64 }
      });

      if (error) throw error;

      toast({
        title: "Pet Analyzed! 🐾",
        description: "Let's find the perfect products for your pet!"
      });

      onAnalysisComplete(data.analysis, base64);
    } catch (error) {
      console.error('Error analyzing photo:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze your pet photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="p-8 text-center hover:shadow-lg transition-shadow">
      <div className="space-y-6">
        {preview ? (
          <img 
            src={preview} 
            alt="Pet preview" 
            className="w-full h-64 object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
            <Upload className="h-16 w-16 text-muted-foreground" />
          </div>
        )}

        <div>
          <h3 className="text-2xl font-bold mb-2">Upload Your Pet's Photo</h3>
          <p className="text-muted-foreground mb-4">
            Let our AI analyze your pet to provide personalized recommendations
          </p>

          <label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isAnalyzing}
            />
            <Button 
              variant="default" 
              size="lg"
              disabled={isAnalyzing}
              className="w-full"
              asChild
            >
              <span>
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Choose Photo
                  </>
                )}
              </span>
            </Button>
          </label>
        </div>
      </div>
    </Card>
  );
};
