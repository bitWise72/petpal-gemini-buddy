import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';
import pettryMascot from '@/assets/pettry-mascot.jpg';

interface CheckoutPageProps {
  onBack: () => void;
}

export const CheckoutPage = ({ onBack }: CheckoutPageProps) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button onClick={onBack} variant="ghost" className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Chat
      </Button>

      <Card className="p-8 text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <Sparkles className="absolute top-4 right-4 h-8 w-8 animate-pulse" />
          <Sparkles className="absolute bottom-4 left-4 h-6 w-6 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <Sparkles className="absolute top-1/2 left-1/4 h-5 w-5 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="flex justify-center animate-bounce">
          <img 
            src={pettryMascot} 
            alt="Pettry celebrating" 
            className="w-32 h-32 rounded-full object-cover"
          />
        </div>

        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <h2 className="text-3xl font-bold">Woohoo! All Set! 🎉</h2>
          </div>
          <p className="text-lg text-muted-foreground">
            Your order's confirmed! Your furry friend is going to love these! 
          </p>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 space-y-3 border-2 border-primary/20">
          <p className="text-sm text-muted-foreground font-medium">Your Order Number</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            #PETTRY{Math.floor(Math.random() * 10000)}
          </p>
          <p className="text-xs text-muted-foreground">
            Save this for tracking!
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <p className="flex items-center justify-center gap-2">
            <span className="text-2xl">📧</span>
            <span>Check your email for order details</span>
          </p>
          <p className="flex items-center justify-center gap-2">
            <span className="text-2xl">🚚</span>
            <span>We'll send tracking info soon</span>
          </p>
        </div>

        <div className="pt-4">
          <p className="text-sm text-muted-foreground mb-4">
            Thanks for letting me help you out! Your pet is lucky to have you! 🐧💙
          </p>
          <Button onClick={onBack} size="lg" className="w-full">
            Chat with Pettry Again
          </Button>
        </div>
      </Card>
    </div>
  );
};
