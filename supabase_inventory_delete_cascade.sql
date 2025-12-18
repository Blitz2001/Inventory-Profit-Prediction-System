-- 1. Enable Cascade Delete on Activity Logs (so deleting a gem deletes its history)
-- We need to drop the existing constraint (likely named activity_logs_gem_id_fkey) and re-add it with ON DELETE CASCADE.
ALTER TABLE activity_logs
DROP CONSTRAINT IF EXISTS activity_logs_gem_id_fkey,
ADD CONSTRAINT activity_logs_gem_id_fkey
    FOREIGN KEY (gem_id)
    REFERENCES inventory(id)
    ON DELETE CASCADE;

-- 2. Allow Deletion of Inventory Items
-- Currently only Insert/Update policies exist. We need a DELETE policy.
-- This allows any authenticated user (who passes the App's admin check) to delete rows.
DROP POLICY IF EXISTS "Auth Delete Inventory" ON inventory;
CREATE POLICY "Auth Delete Inventory" ON inventory FOR DELETE USING (auth.role() = 'authenticated');

-- 3. (Optional) If you have any other tables referencing inventory, add them here.
-- Based on setup, 'transactions' does not key to inventory.
