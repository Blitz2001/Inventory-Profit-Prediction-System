-- Add detailed cost and weight tracking columns
ALTER TABLE inventory
ADD COLUMN weight_post_cut NUMERIC,
ADD COLUMN cost_cut NUMERIC DEFAULT 0,
ADD COLUMN cost_polish NUMERIC DEFAULT 0,
ADD COLUMN cost_burn NUMERIC DEFAULT 0,
ADD COLUMN extra_costs JSONB DEFAULT '[]'::JSONB;

-- Note: The existing 'predict_total_cost_lkr' will be repurposed as the SUM of these new fields in the frontend calculator,
-- or we can keep it as a cached total.
