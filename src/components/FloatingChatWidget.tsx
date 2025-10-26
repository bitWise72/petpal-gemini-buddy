import { useState } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { AIAssistantWidget } from '@/widget/AIAssistantWidget';

interface FloatingChatWidgetProps {
  apiUrl?: string;
  primaryColor?: string;
  mascotImage?: string;
  enableVoice?: boolean;
}

export const FloatingChatWidget = (props: FloatingChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 z-50 animate-fade-in group"
        style={{
          background: `linear-gradient(135deg, ${props.primaryColor || '#8B5CF6'}, ${props.primaryColor || '#8B5CF6'}dd)`,
        }}
        aria-label="Open chat assistant"
      >
        {props.mascotImage ? (
          <img 
            src={props.mascotImage} 
            alt="Chat Assistant" 
            className="w-full h-full rounded-full object-cover ring-4 ring-white/20 group-hover:ring-white/40 transition-all"
          />
        ) : (
          <MessageCircle className="w-8 h-8 text-white mx-auto" />
        )}
        
        {/* Pulse effect */}
        <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: props.primaryColor || '#8B5CF6' }} />
      </button>

      {/* Chat Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 animate-fade-in">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dialog */}
          <div className="absolute bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-[440px] h-[100dvh] md:h-[700px] md:max-h-[85vh] bg-background rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Widget Content */}
            <div className="h-full overflow-auto">
              <AIAssistantWidget {...props} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
