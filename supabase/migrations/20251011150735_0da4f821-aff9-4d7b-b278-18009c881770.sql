-- Create products table for pet store items
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  pet_type TEXT, -- dog, cat, bird, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create conversations table to store chat history
CREATE TABLE public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  pet_image_url TEXT,
  pet_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create messages table for chat messages
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create cart_items table
CREATE TABLE public.cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  conversation_id UUID REFERENCES public.conversations(id),
  total_amount DECIMAL(10, 2) NOT NULL,
  items JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public read for products, session-based for others)
CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Conversations are viewable by session"
  ON public.conversations FOR ALL
  USING (true);

CREATE POLICY "Messages are viewable by session"
  ON public.messages FOR ALL
  USING (true);

CREATE POLICY "Cart items are manageable by session"
  ON public.cart_items FOR ALL
  USING (true);

CREATE POLICY "Orders are viewable by session"
  ON public.orders FOR ALL
  USING (true);

-- Insert sample pet products
INSERT INTO public.products (name, description, category, price, pet_type, stock, image_url) VALUES
('Premium Dog Food - Chicken & Rice', 'High-quality protein for adult dogs', 'Food', 49.99, 'dog', 100, 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400'),
('Cat Scratching Post', 'Multi-level scratching tower with toys', 'Toys', 89.99, 'cat', 50, 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400'),
('Dog Leash & Collar Set', 'Durable nylon leash with matching collar', 'Accessories', 29.99, 'dog', 75, 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400'),
('Cat Litter Box', 'Self-cleaning automatic litter box', 'Hygiene', 159.99, 'cat', 30, 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400'),
('Dog Chew Toys Set', 'Durable rubber toys for aggressive chewers', 'Toys', 24.99, 'dog', 120, 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=400'),
('Cat Wet Food Variety Pack', 'Grain-free pate in assorted flavors', 'Food', 34.99, 'cat', 80, 'https://images.unsplash.com/photo-1569591159212-b02ea8a9f239?w=400'),
('Pet Grooming Kit', 'Complete grooming tools for dogs and cats', 'Grooming', 44.99, 'both', 60, 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400'),
('Dog Bed - Orthopedic', 'Memory foam bed for joint support', 'Furniture', 79.99, 'dog', 40, 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=400'),
('Cat Interactive Toy', 'Electronic mouse with unpredictable movements', 'Toys', 19.99, 'cat', 90, 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400'),
('Pet Water Fountain', 'Filtered water dispenser with LED light', 'Accessories', 39.99, 'both', 55, 'https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?w=400');