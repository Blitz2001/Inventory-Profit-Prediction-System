export type InventoryItem = {
    id?: string;
    created_at?: string;
    user_id?: string;
    email?: string;

    // Core Characteristics
    lot_number?: number;
    gem_type: string;
    lot_type?: string;
    treatment?: string;
    cut_grade?: string;
    clarity?: string;
    color?: string;
    shape?: string;
    number_of_pieces?: number;
    weight_ct: number;

    // Financials
    status: 'In Stock' | 'Sold' | 'Memo' | 'Cutting';

    // Excel / Prediction Fields
    budget_per_ct_usd?: number; // From Excel "Buject per CT"
    usd_rate?: number;          // To calculate LKR equivalents

    cost_per_ct_lkr?: number;   // Deprecated? Keeping for backward compatibility or actuals

    // NEW: Profit Formula Fields
    buying_price?: number;           // Actual cost of rough
    predict_val_per_ct_lkr?: number; // "Predicted value of a ct"
    predict_total_cost_lkr?: number; // "Processing Expenses" (Cut + Burn)

    // Helpers (Optional, can be computed)
    image_urls?: string[];
};

export type Transaction = {
    id?: string;
    created_at?: string;
    person: string;
    description: string;
    amount: number;
    type: 'Expense' | 'Income' | 'Investment';
};

export type Profile = {
    id: string; // matches auth.users id
    role: 'admin' | 'viewer';
    full_name?: string;
    created_at?: string;
};

export type CapitalInvestment = {
    id: string;
    investor_id: string; // Profile ID
    amount: number;
    investment_date: string; // ISO Date
    note?: string;
    created_at?: string;

    // Joined data (optional)
    profiles?: Profile;
};
