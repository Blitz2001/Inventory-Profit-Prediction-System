-- ==========================================
-- 1. Schema Updates (New Columns)
-- ==========================================

-- Add 'User Tracking' and 'Excel Parity' columns to Inventory
ALTER TABLE inventory 
ADD COLUMN IF NOT EXISTS user_id uuid references auth.users(id),
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS number_of_pieces int default 1,
ADD COLUMN IF NOT EXISTS budget_per_ct_usd numeric;

-- Add 'User Tracking' to Transactions
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS user_id uuid references auth.users(id),
ADD COLUMN IF NOT EXISTS email text;

-- ==========================================
-- 2. Row Level Security (RLS) Policies
-- ==========================================

-- Enable RLS (if not already)
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Note: We previously allowed ALL access. 
-- Now we want to restrict writes to logged-in users, but maybe still allow public read 
-- (or restrict read to group members only later).

-- POLICY: Read Access (Everyone with the Anon key can read for now)
CREATE POLICY "Public Read Access" 
ON inventory FOR SELECT 
USING (true);

-- POLICY: Write Access (Authenticated Users Only)
-- Users can insert rows, and the user_id will be auto-set by the application logic
CREATE POLICY "Authenticated Insert Access" 
ON inventory FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- POLICY: Update/Delete (Only your own rows? Or Group admin?)
-- For now, let's allow authenticated users to update anything (Collaborative Group Mode)
CREATE POLICY "Authenticated Update Access" 
ON inventory FOR UPDATE 
TO authenticated 
USING (true);

-- Repeat for Transactions
CREATE POLICY "Public Read Tx" ON transactions FOR SELECT USING (true);
CREATE POLICY "Auth Insert Tx" ON transactions FOR INSERT TO authenticated WITH CHECK (true);
