-- MASTER FIX: Enable Cascade Delete for EVERYTHING
-- Run this script to fix the "Foreign Key Constraint" errors when deleting.

-- 1. FIX INVENTORY DELETION (Cascades to Logs)
ALTER TABLE activity_logs
DROP CONSTRAINT IF EXISTS activity_logs_gem_id_fkey;

ALTER TABLE activity_logs
ADD CONSTRAINT activity_logs_gem_id_fkey
    FOREIGN KEY (gem_id)
    REFERENCES inventory(id)
    ON DELETE CASCADE;

-- 2. FIX CAPITAL DELETION (Cascades to Logs)
ALTER TABLE activity_logs
DROP CONSTRAINT IF EXISTS activity_logs_capital_id_fkey;

ALTER TABLE activity_logs
ADD CONSTRAINT activity_logs_capital_id_fkey
    FOREIGN KEY (capital_id)
    REFERENCES capital_investments(id)
    ON DELETE CASCADE;

-- 3. ENSURE DELETE POLICIES EXIST
DROP POLICY IF EXISTS "Auth Delete Inventory" ON inventory;
CREATE POLICY "Auth Delete Inventory" ON inventory FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth Delete Capital" ON capital_investments;
CREATE POLICY "Auth Delete Capital" ON capital_investments FOR DELETE USING (auth.role() = 'authenticated');
