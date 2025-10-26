import { useState, useEffect } from 'react';
import { AIAssistantWidget } from '@/widget/AIAssistantWidget';

type AppState = 'upload' | 'chat' | 'checkout';

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
    <AIAssistantWidget
      apiUrl={config?.apiUrl}
      primaryColor={config?.primaryColor}
      mascotImage={config?.mascotImage}
      enableVoice={config?.enableVoice}
    />
  );
};

export default Index;
