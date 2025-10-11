import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ShoppingCart } from 'lucide-react';
import { VoiceInterface } from './VoiceInterface';
import { ProductRecommendations } from './ProductRecommendations';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  petAnalysis: string;
  petImageUrl: string;
  onCheckout: () => void;
}

export const ChatInterface = ({ petAnalysis, onCheckout }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initial greeting
    const greeting = `Hello! I've analyzed your pet. ${petAnalysis}\n\nLet me ask you a few questions to find the perfect products! What's your pet's name, and are there any specific needs or concerns you have?`;
    setMessages([{ role: 'assistant', content: greeting }]);
  }, [petAnalysis]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: {
          messages: [...messages, userMessage],
          petAnalysis,
        }
      });

      if (error) throw error;

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.reply 
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      if (data.recommendedProducts?.length > 0) {
        setRecommendedProducts(data.recommendedProducts);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscript = (text: string) => {
    sendMessage(text);
    setIsListening(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-6 bg-card/50 backdrop-blur">
        <div className="h-[500px] overflow-y-auto mb-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2 items-center">
          <VoiceInterface
            onTranscript={handleVoiceTranscript}
            isListening={isListening}
            onToggleListening={() => setIsListening(!isListening)}
            assistantMessage={messages[messages.length - 1]?.role === 'assistant' ? messages[messages.length - 1].content : undefined}
          />
          
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          
          <Button 
            onClick={() => sendMessage(inputText)} 
            disabled={isLoading || !inputText.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {recommendedProducts.length > 0 && (
        <>
          <ProductRecommendations products={recommendedProducts} />
          
          <div className="flex justify-center">
            <Button 
              onClick={onCheckout} 
              size="lg"
              className="gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              Proceed to Checkout
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
