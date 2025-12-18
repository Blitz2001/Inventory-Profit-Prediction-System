-- 1. Enable Cascade Delete on Activity Logs for Capital Deletions
-- Ensure that when a Capital Investment is deleted, its related logs are also deleted.
ALTER TABLE activity_logs
DROP CONSTRAINT IF EXISTS activity_logs_capital_id_fkey,
ADD CONSTRAINT activity_logs_capital_id_fkey
    FOREIGN KEY (capital_id)
    REFERENCES capital_investments(id)
    ON DELETE CASCADE;

-- 2. Allow Deletion of Capital Investments
-- Create a policy to allow authenticated users to delete from capital_investments.
DROP POLICY IF EXISTS "Auth Delete Capital" ON capital_investments;
CREATE POLICY "Auth Delete Capital" ON capital_investments FOR DELETE USING (auth.role() = 'authenticated');
