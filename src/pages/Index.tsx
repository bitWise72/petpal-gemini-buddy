import { useState, useEffect } from 'react';
import { FloatingChatWidget } from '@/components/FloatingChatWidget';

const Index = () => {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    // Check if embedded with config
    const params = new URLSearchParams(window.location.search);
    const configParam = params.get('config');
    if (configParam) {
      try {
        setConfig(JSON.parse(decodeURIComponent(configParam)));
      } catch (e) {
        console.error('Invalid config:', e);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-50">
      {/* Demo content - website would have their own content here */}
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Welcome to Pet Paradise
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Your one-stop shop for all things pets! 🐾
        </p>
        <p className="text-lg text-muted-foreground">
          Click the floating assistant to get personalized pet care advice!
        </p>
      </div>

      <FloatingChatWidget
        apiUrl={config?.apiUrl}
        primaryColor={config?.primaryColor}
        mascotImage={config?.mascotImage || '/pettry-mascot.jpg'}
        enableVoice={config?.enableVoice}
      />
    </div>
  );
};

export default Index;
