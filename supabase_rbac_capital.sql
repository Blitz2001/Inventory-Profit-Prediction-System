-- 1. Create PROFILES table (Extensions of Auth Users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create CAPITAL_INVESTMENTS table
CREATE TABLE IF NOT EXISTS capital_investments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    investor_id UUID REFERENCES profiles(id) NOT NULL, -- Who invested
    amount NUMERIC NOT NULL,
    investment_date DATE DEFAULT CURRENT_DATE,
    note TEXT,
    
    created_by UUID REFERENCES auth.users(id) -- Admin who entered it
);

-- 3. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE capital_investments ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- PROFILES: Everyone can read names/roles. Only Admins can update roles.
CREATE POLICY "Public Read Profiles" ON profiles FOR SELECT USING (true);

-- Allow users to update their own profile (e.g. name), BUT NOT their role.
-- We'll just allow basic update for now, maybe restrict role column down the line or via trigger.
-- For simplicity: TRUSTED ADMINS ONLY modify profiles table via SQL/Dashboard mostly.
-- Let's allow users to read their own profile specifically (redundant with public read but good practice)
-- Actually, let's keep it simple: READ = ALL. UPDATE = ADMIN ONLY.
CREATE POLICY "Admin Update Profiles" ON profiles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- CAPITAL_INVESTMENTS: Everyone read. Admin insert/update.
CREATE POLICY "Public Read Capital" ON capital_investments FOR SELECT USING (true);

CREATE POLICY "Admin Insert Capital" ON capital_investments FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin Update Capital" ON capital_investments FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin Delete Capital" ON capital_investments FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. UPDATE EXISTING TABLES (Inventory & Transactions) SECURITY
-- Drop old lax policies (Re-runnable: drop if exists)
DROP POLICY IF EXISTS "Auth Insert Inventory" ON inventory;
DROP POLICY IF EXISTS "Auth Update Inventory" ON inventory;
DROP POLICY IF EXISTS "Authenticated Insert Access" ON inventory;
DROP POLICY IF EXISTS "Authenticated Update Access" ON inventory;

DROP POLICY IF EXISTS "Auth Insert Transactions" ON transactions;
DROP POLICY IF EXISTS "Auth Insert Tx" ON transactions;

-- NEW TIGHTER POLICIES

-- Inventory: Insert/Update/Delete = ADMIN ONLY
CREATE POLICY "Admin Insert Inventory" ON inventory FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin Update Inventory" ON inventory FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin Delete Inventory" ON inventory FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Transactions: Insert = ADMIN ONLY
CREATE POLICY "Admin Insert Transactions" ON transactions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 6. TRIGGER to auto-create profile on signup (Optional, but good)
-- For now, let's just do a backfill script block
-- RUN THIS ONCE MANUALLY IF NEEDED, or users will be created on their first login if we add a trigger.
-- Let's Insert profiles for existing users manually in this script.

INSERT INTO profiles (id, role, full_name)
SELECT id, 'viewer', email
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 7. MAKE FIRST USER ADMIN (Customize this ID or run manually!)
-- UPDATE profiles SET role = 'admin' WHERE email = 'your_email@example.com';
