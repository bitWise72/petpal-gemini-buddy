import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { PetPhotoUpload } from '@/components/PetPhotoUpload';
import { ChatInterface } from '@/components/ChatInterface';
import { CheckoutPage } from '@/components/CheckoutPage';
import { Button } from '@/components/ui/button';
import pettryMascot from '@/assets/pettry-mascot.jpg';

type AppState = 'upload' | 'chat' | 'checkout';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [appState, setAppState] = useState<AppState>('upload');
  const [petAnalysis, setPetAnalysis] = useState('');
  const [petImageUrl, setPetImageUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session) {
        navigate('/auth');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleAnalysisComplete = (analysis: string, imageUrl: string) => {
    setPetAnalysis(analysis);
    setPetImageUrl(imageUrl);
    setAppState('chat');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <img src={pettryMascot} alt="Pettry" className="w-24 h-24 mx-auto rounded-full object-cover animate-pulse" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={pettryMascot} 
                alt="Pettry Mascot" 
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Pettry
                </h1>
                <p className="text-xs text-muted-foreground">AI Pet Solutions</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {appState === 'upload' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <img 
                src={pettryMascot} 
                alt="Pettry" 
                className="w-32 h-32 mx-auto rounded-full object-cover animate-fade-in"
              />
              <h2 className="text-4xl md:text-5xl font-bold">
                Hey! I'm{' '}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Pettry
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-lg mx-auto">
                Your AI friend who helps you find perfect products for your pet! Let's start by taking a photo 📸
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
            © 2024 Pettry - AI Pet Solutions. Powered by Gemini AI 🐧
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
