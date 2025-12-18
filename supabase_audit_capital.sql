-- Add capital_id to activity_logs for polymorphic logging
ALTER TABLE activity_logs
ADD COLUMN capital_id UUID REFERENCES capital_investments(id) ON DELETE SET NULL;

-- Ensure gem_id is nullable (it likely is, but good to be safe if strictly defined before)
ALTER TABLE activity_logs
ALTER COLUMN gem_id DROP NOT NULL;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_capital_id ON activity_logs(capital_id);
