import { useState, useEffect } from 'react';
import { PetPhotoUpload } from '@/components/PetPhotoUpload';
import { ChatInterface } from '@/components/ChatInterface';
import { CheckoutPage } from '@/components/CheckoutPage';

interface AIAssistantWidgetProps {
  apiUrl?: string;
  primaryColor?: string;
  mascotImage?: string;
  enableVoice?: boolean;
}

type AppState = 'upload' | 'chat' | 'checkout';

export const AIAssistantWidget = ({ 
  apiUrl = import.meta.env.VITE_SUPABASE_URL,
  primaryColor = '#8B5CF6',
  mascotImage = '/pettry-mascot.jpg',
  enableVoice = true 
}: AIAssistantWidgetProps) => {
  const [appState, setAppState] = useState<AppState>('upload');
  const [petAnalysis, setPetAnalysis] = useState('');
  const [petImageUrl, setPetImageUrl] = useState('');

  // Store widget config in window for edge functions to access
  useEffect(() => {
    (window as any).__AI_ASSISTANT_CONFIG__ = {
      apiUrl,
      primaryColor,
      mascotImage,
      enableVoice
    };
  }, [apiUrl, primaryColor, mascotImage, enableVoice]);

  const handleAnalysisComplete = (analysis: string, imageUrl: string) => {
    setPetAnalysis(analysis);
    setPetImageUrl(imageUrl);
    setAppState('chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <style>{`
        :root {
          --primary: ${primaryColor};
        }
      `}</style>
      
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <img 
              src={mascotImage} 
              alt="Assistant" 
              className="w-12 h-12 rounded-full"
            />
            <h1 className="text-3xl font-bold text-primary">AI Pet Assistant</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {appState === 'upload' && (
          <PetPhotoUpload onAnalysisComplete={handleAnalysisComplete} />
        )}
        
        {appState === 'chat' && (
          <ChatInterface
            petAnalysis={petAnalysis}
            petImageUrl={petImageUrl}
            onCheckout={() => setAppState('checkout')}
            enableVoice={enableVoice}
          />
        )}
        
        {appState === 'checkout' && (
          <CheckoutPage onBack={() => setAppState('chat')} />
        )}
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600">
          <p>Powered by AI Pet Assistant Widget</p>
        </div>
      </footer>
    </div>
  );
};
