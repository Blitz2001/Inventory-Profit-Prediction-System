-- 1. Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create INVENTORY Table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    email TEXT, 
    gem_type TEXT NOT NULL,
    lot_type TEXT DEFAULT 'Lot',
    treatment TEXT DEFAULT 'Heated',
    cut_grade TEXT DEFAULT 'Calibrated',
    shape TEXT DEFAULT 'Oval',
    color TEXT,
    clarity TEXT DEFAULT 'VVS',
    number_of_pieces INT DEFAULT 1,
    weight_ct NUMERIC NOT NULL,
    predict_val_per_ct_lkr NUMERIC DEFAULT 0,
    predict_total_cost_lkr NUMERIC DEFAULT 0,  
    budget_per_ct_usd NUMERIC DEFAULT 0,      
    cost_per_ct_lkr NUMERIC DEFAULT 0,         
    status TEXT DEFAULT 'In Stock',         
    image_urls TEXT[] DEFAULT '{}'::TEXT[]   
);

-- 3. Create TRANSACTIONS Table (Payments Log)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    email TEXT,
    date DATE DEFAULT CURRENT_DATE,
    person TEXT NOT NULL,
    description TEXT,
    amount NUMERIC NOT NULL,
    type TEXT DEFAULT 'Expense'
);

-- 4. [NEW] Create ACTIVITY_LOGS Table (Audit Trail)
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Who did it
    user_id UUID REFERENCES auth.users(id),
    email TEXT,
    
    -- What changed
    gem_id UUID REFERENCES inventory(id),
    action_type TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'SOLD'
    
    -- Granular Tracking
    field_changed TEXT,        -- e.g. 'weight_ct', 'status'
    old_value TEXT,
    new_value TEXT,
    note TEXT                  -- User's comment: "Why this change?"
);


-- 5. Set RLS Policies (Security)
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Inventory" ON inventory FOR SELECT USING (true);
CREATE POLICY "Public Read Transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Public Read Logs" ON activity_logs FOR SELECT USING (true);

CREATE POLICY "Auth Insert Inventory" ON inventory FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth Update Inventory" ON inventory FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth Insert Transactions" ON transactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Auth Insert Logs" ON activity_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
