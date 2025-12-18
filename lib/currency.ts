export async function fetchUSDRate(): Promise<number | null> {
    try {
        // Using open.er-api.com which is free and doesn't require an API key
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();

        if (data && data.rates && data.rates.LKR) {
            return data.rates.LKR;
        }
        return null;
    } catch (error) {
        console.error("Failed to fetch USD rate:", error);
        return null;
    }
}
