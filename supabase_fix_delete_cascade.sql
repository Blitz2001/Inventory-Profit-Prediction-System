-- FIX: Allow deleting users by cascading the delete to all linked tables.

-- 1. Alter Inventory Table
-- Try to drop the constraint if it uses the default name. 
-- If your constraint has a custom name, you might need to find it in the Table Editor.
ALTER TABLE inventory
DROP CONSTRAINT IF EXISTS inventory_user_id_fkey,
ADD CONSTRAINT inventory_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- 2. Alter Transactions Table
ALTER TABLE transactions
DROP CONSTRAINT IF EXISTS transactions_user_id_fkey,
ADD CONSTRAINT transactions_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- 3. Alter Capital Investments (Linked to Profiles)
-- Deleting User -> Deletes Profile (already cascading) -> Deletes Investment (needs this fix)
ALTER TABLE capital_investments
DROP CONSTRAINT IF EXISTS capital_investments_investor_id_fkey,
ADD CONSTRAINT capital_investments_investor_id_fkey
    FOREIGN KEY (investor_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE;

-- 4. Alter Activity Logs
ALTER TABLE activity_logs
DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey,
ADD CONSTRAINT activity_logs_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- 5. Profiles table
-- Ensure profiles references auth.users with cascade (Usually done, but re-forcing it)
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey,
ADD CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;
