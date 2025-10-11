import { useState } from 'react';
import { PetPhotoUpload } from '@/components/PetPhotoUpload';
import { ChatInterface } from '@/components/ChatInterface';
import { CheckoutPage } from '@/components/CheckoutPage';
import { PawPrint } from 'lucide-react';

type AppState = 'upload' | 'chat' | 'checkout';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('upload');
  const [petAnalysis, setPetAnalysis] = useState('');
  const [petImageUrl, setPetImageUrl] = useState('');

  const handleAnalysisComplete = (analysis: string, imageUrl: string) => {
    setPetAnalysis(analysis);
    setPetImageUrl(imageUrl);
    setAppState('chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-full p-2">
                <PawPrint className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  PawPal Pet Store
                </h1>
                <p className="text-xs text-muted-foreground">AI-Powered Pet Shopping</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {appState === 'upload' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">
                Welcome to{' '}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  PawPal
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-lg mx-auto">
                Your AI shopping assistant that finds the perfect products for your furry friend
              </p>
            </div>
            
            <PetPhotoUpload onAnalysisComplete={handleAnalysisComplete} />
          </div>
        )}

        {appState === 'chat' && (
          <ChatInterface
            petAnalysis={petAnalysis}
            petImageUrl={petImageUrl}
            onCheckout={() => setAppState('checkout')}
          />
        )}

        {appState === 'checkout' && (
          <CheckoutPage onBack={() => setAppState('chat')} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-20">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2024 PawPal Pet Store. Powered by Gemini AI 🐾
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
