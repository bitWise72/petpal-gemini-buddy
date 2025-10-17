-- Add user_id columns to tables and update RLS policies for proper authentication

-- Add user_id to cart_items
ALTER TABLE cart_items ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to conversations
ALTER TABLE conversations ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to orders
ALTER TABLE orders ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Cart items are manageable by session" ON cart_items;
DROP POLICY IF EXISTS "Conversations are viewable by session" ON conversations;
DROP POLICY IF EXISTS "Messages are viewable by session" ON messages;
DROP POLICY IF EXISTS "Orders are viewable by session" ON orders;

-- Create secure RLS policies for cart_items
CREATE POLICY "Users manage own cart items"
ON cart_items
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create secure RLS policies for conversations
CREATE POLICY "Users manage own conversations"
ON conversations
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create secure RLS policies for messages
CREATE POLICY "Users access own messages"
ON messages
FOR ALL
TO authenticated
USING (
  conversation_id IN (
    SELECT id FROM conversations WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  conversation_id IN (
    SELECT id FROM conversations WHERE user_id = auth.uid()
  )
);

-- Create secure RLS policies for orders
CREATE POLICY "Users view own orders"
ON orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users create own orders"
ON orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own orders"
ON orders
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);