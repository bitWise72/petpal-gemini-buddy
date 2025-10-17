import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import pettryMascot from '@/assets/pettry-mascot.jpg';

interface CheckoutPageProps {
  onBack: () => void;
}

export const CheckoutPage = ({ onBack }: CheckoutPageProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsProcessing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to complete checkout');
        return;
      }

      // Get cart items
      const { data: cartItems, error: cartError } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', user.id);

      if (cartError) throw cartError;

      if (!cartItems || cartItems.length === 0) {
        toast.error('Your cart is empty');
        return;
      }

      // Calculate total
      const totalAmount = cartItems.reduce((sum: number, item: any) => {
        return sum + (item.products?.price || 0) * item.quantity;
      }, 0);

      // Create order
      const { error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            session_id: user.id, // Using user_id as session_id for compatibility
            total_amount: totalAmount,
            items: cartItems,
            status: 'completed',
          },
        ]);

      if (orderError) throw orderError;

      // Clear cart
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      const orderNum = `PETTRY${Math.floor(Math.random() * 10000)}`;
      setOrderNumber(orderNum);
      toast.success('Order confirmed! 🎉');
    } catch (error) {
      console.error('Error processing order:', error);
      toast.error('Failed to process order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderNumber) {
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
              #{orderNumber}
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
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button onClick={onBack} variant="ghost" className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Chat
      </Button>

      <Card className="p-8 text-center space-y-6">
        <img 
          src={pettryMascot} 
          alt="Pettry" 
          className="w-24 h-24 mx-auto rounded-full object-cover"
        />
        <div>
          <h2 className="text-2xl font-bold mb-2">Ready to checkout?</h2>
          <p className="text-muted-foreground">
            Let's complete your order for your pet!
          </p>
        </div>
        
        <Button 
          onClick={handleConfirm} 
          size="lg" 
          className="w-full"
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Confirm Order'}
        </Button>
      </Card>
    </div>
  );
};
