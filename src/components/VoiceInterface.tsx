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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const vadIntervalRef = useRef<number | null>(null);

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
        if (event.error !== 'no-speech') {
          toast({
            title: "Voice Error",
            description: "Could not access microphone. Please check permissions.",
            variant: "destructive"
          });
        }
      };
    }

    // Initialize audio context for VAD
    const initAudioContext = async () => {
      try {
        const ctx = new AudioContext();
        setAudioContext(ctx);
      } catch (error) {
        console.error('Error initializing audio context:', error);
      }
    };
    initAudioContext();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
      if (vadIntervalRef.current) {
        clearInterval(vadIntervalRef.current);
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
    const playTTS = () => {
      if (!assistantMessage) return;

      try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        setIsSpeaking(true);
        
        const utterance = new SpeechSynthesisUtterance(assistantMessage);
        
        // Select a natural-sounding voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => 
          v.name.includes('Samantha') || 
          v.name.includes('Google US English') ||
          v.name.includes('Microsoft Zira')
        ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        utterance.rate = 1.1;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        utterance.onend = () => {
          setIsSpeaking(false);
          // Auto-enable listening after AI finishes speaking
          if (!isListening) {
            onToggleListening();
          }
        };

        utterance.onerror = () => {
          setIsSpeaking(false);
          toast({
            title: "Speech Error",
            description: "Failed to play audio response",
            variant: "destructive"
          });
        };

        window.speechSynthesis.speak(utterance);
        
        // Start VAD to detect user interruption
        startVAD();
      } catch (error) {
        console.error('TTS error:', error);
        setIsSpeaking(false);
        toast({
          title: "Speech Error",
          description: "Failed to generate speech",
          variant: "destructive"
        });
      }
    };

    // Load voices if not already loaded
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        playTTS();
      };
    } else {
      playTTS();
    }
  }, [assistantMessage]);

  const startVAD = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const analyser = audioContext!.createAnalyser();
      const microphone = audioContext!.createMediaStreamSource(stream);
      microphone.connect(analyser);
      analyser.fftSize = 512;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      vadIntervalRef.current = window.setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        
        // If user starts speaking (volume threshold)
        if (average > 30 && isSpeaking) {
          // Stop AI speech and start listening
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
          if (!isListening) {
            onToggleListening();
          }
          // Clean up VAD
          if (vadIntervalRef.current) {
            clearInterval(vadIntervalRef.current);
            vadIntervalRef.current = null;
          }
          stream.getTracks().forEach(track => track.stop());
        }
      }, 100);
    } catch (error) {
      console.error('VAD error:', error);
    }
  };

  // Interrupt AI speech when user manually starts talking
  useEffect(() => {
    if (isListening && isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      if (vadIntervalRef.current) {
        clearInterval(vadIntervalRef.current);
        vadIntervalRef.current = null;
      }
    }
  }, [isListening]);

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
