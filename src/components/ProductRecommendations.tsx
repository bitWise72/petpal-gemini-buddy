import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
}

interface ProductRecommendationsProps {
  products: Product[];
}

export const ProductRecommendations = ({ products }: ProductRecommendationsProps) => {
  const { toast } = useToast();

  const addToCart = async (product: Product) => {
    try {
      const sessionId = localStorage.getItem('sessionId') || crypto.randomUUID();
      localStorage.setItem('sessionId', sessionId);

      const { error } = await supabase
        .from('cart_items')
        .insert({
          session_id: sessionId,
          product_id: product.id,
          quantity: 1
        });

      if (error) throw error;

      toast({
        title: "Added to Cart! 🛒",
        description: `${product.name} has been added to your cart.`
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-6 w-6 text-primary" />
        <h3 className="text-2xl font-bold">Recommended for Your Pet</h3>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all">
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 space-y-3">
              <div>
                <h4 className="font-bold text-lg">{product.name}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">
                  ${product.price}
                </span>
                <Button 
                  onClick={() => addToCart(product)}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
