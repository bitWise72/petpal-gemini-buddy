import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CheckoutPageProps {
  onBack: () => void;
}

export const CheckoutPage = ({ onBack }: CheckoutPageProps) => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (*)
        `)
        .eq('session_id', sessionId);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const total = cartItems.reduce((sum, item) => 
    sum + (item.products.price * item.quantity), 0
  );

  const handleCheckout = async () => {
    toast({
      title: "Order Placed! 🎉",
      description: "Your pet products are on the way!"
    });

    // Clear cart after successful checkout
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('session_id', sessionId);
    }
    
    onBack();
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading cart...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 space-y-4">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <Button onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Chat
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button onClick={onBack} variant="ghost">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Chat
      </Button>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Cart</h2>
          {cartItems.map((item) => (
            <Card key={item.id} className="p-4 flex gap-4">
              <img 
                src={item.products.image_url} 
                alt={item.products.name}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <h4 className="font-semibold">{item.products.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Qty: {item.quantity}
                </p>
                <p className="font-bold text-primary mt-1">
                  ${(item.products.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </Card>
          ))}

          <Card className="p-4 bg-muted">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Shipping Details</h2>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCheckout(); }}>
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" required />
              </div>
              <div>
                <Label htmlFor="zip">ZIP Code</Label>
                <Input id="zip" required />
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full">
              Complete Purchase
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
