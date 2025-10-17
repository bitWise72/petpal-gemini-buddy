import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceInterfaceProps {
  onTranscript: (text: string) => void;
  isListening: boolean;
  onToggleListening: () => void;
  assistantMessage?: string;
}

export const VoiceInterface = ({ 
  onTranscript, 
  isListening, 
  onToggleListening,
  assistantMessage 
}: VoiceInterfaceProps) => {
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        
        if (event.results[event.results.length - 1].isFinal) {
          onTranscript(transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Voice Error",
          description: "Could not access microphone. Please check permissions.",
          variant: "destructive"
        });
      };
    }

    // Initialize speech synthesis
    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.log('Recognition already started');
      }
    } else if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  useEffect(() => {
    if (assistantMessage && synthRef.current) {
      // Stop any ongoing speech
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(assistantMessage);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        // Stop listening when AI starts speaking
        if (recognitionRef.current && isListening) {
          try {
            recognitionRef.current.stop();
          } catch (e) {
            console.log('Recognition already stopped');
          }
        }
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        // Resume listening after AI finishes speaking
        if (recognitionRef.current && isListening) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.log('Recognition already started');
          }
        }
      };
      
      // Stop speaking if user starts talking
      if (isListening) {
        synthRef.current.cancel();
        setIsSpeaking(false);
      }
      
      synthRef.current.speak(utterance);
    }
  }, [assistantMessage, isListening]);

  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={onToggleListening}
        size="lg"
        variant={isListening ? "default" : "secondary"}
        className="rounded-full w-16 h-16 shadow-lg transition-all hover:scale-105"
      >
        {isListening ? (
          <Mic className="h-8 w-8 animate-pulse" />
        ) : (
          <MicOff className="h-8 w-8" />
        )}
      </Button>
      
      {isSpeaking && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Volume2 className="h-5 w-5 animate-pulse" />
          <span className="text-sm">Speaking...</span>
        </div>
      )}
    </div>
  );
};
