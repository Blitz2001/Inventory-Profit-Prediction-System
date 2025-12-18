import { supabase } from "@/lib/supabase"

/**
 * Logs changes between an old state and a new state.
 * If multiple fields change, it creates multiple log entries (one for each field).
 */
export async function logChanges(
    user: any,
    entityId: string,
    oldData: any,
    newData: any,
    note: string = '',
    entityType: 'GEM' | 'CAPITAL' = 'GEM'
) {
    if (!user || !entityId) return

    const entriesToInsert = []

    // 1. Identify which fields are different
    // (We only check specific interesting fields to avoid noise)
    const fieldsTracked = [
        'gem_type', 'weight_ct', 'status',
        'predict_val_per_ct_lkr', 'predict_total_cost_lkr', 'buying_price',
        'budget_per_ct_usd', 'lot_type', 'treatment', 'shape',
        'weight_post_cut', 'cost_cut', 'cost_polish', 'cost_burn', 'extra_costs',
        'amount', 'nickname' // Capital fields
    ]

    // Case A: Creation (No oldData)
    if (!oldData) {
        entriesToInsert.push({
            user_id: user.id,
            email: user.email,
            gem_id: entityType === 'GEM' ? entityId : null,
            capital_id: entityType === 'CAPITAL' ? entityId : null,
            action_type: 'CREATE',
            field_changed: 'ALL',
            old_value: null,
            new_value: 'Created new gem',
            note: note || 'Initial Entry'
        })
    }
    // Case B: Update (Compare Old vs New)
    else {
        fieldsTracked.forEach(field => {
            const oldVal = normalize(oldData[field])
            const newVal = normalize(newData[field])

            if (oldVal !== newVal) {
                entriesToInsert.push({
                    user_id: user.id,
                    email: user.email,
                    gem_id: entityType === 'GEM' ? entityId : null,
                    capital_id: entityType === 'CAPITAL' ? entityId : null,
                    action_type: 'UPDATE',
                    field_changed: field,
                    old_value: String(oldVal),
                    new_value: String(newVal),
                    note: note // The same note applies to this "batch" of edits
                })
            }
        })
    }

    if (entriesToInsert.length > 0) {
        const { error } = await supabase.from('activity_logs').insert(entriesToInsert)
        if (error) console.error("Log Error:", error)
    }
}

// Helper to handle string/number comparison safely
function normalize(val: any) {
    if (val === null || val === undefined) return ''
    return String(val).trim()
}
