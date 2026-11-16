const CACHE_DURATION_MS = 5 * 60 * 1000;

let cachedQuote = null;
let cacheExpiresAt = 0;

export async function getPriorityPrice() {
    if (cachedQuote && Date.now() < cacheExpiresAt) {
        return cachedQuote;
    }

    const usdAmount = Number(
        process.env.PRIORITY_APPOINTMENT_AMOUNT_USD || 70
    );

    if (!Number.isFinite(usdAmount) || usdAmount <= 0) {
        throw new Error(
            'PRIORITY_APPOINTMENT_AMOUNT_USD debe ser un número positivo.'
        );
    }

    const response = await fetch(
        'https://api.frankfurter.dev/v2/rate/usd/mxn',
        { signal: AbortSignal.timeout(10000) }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !Number.isFinite(data.rate) || data.rate <= 0) {
        throw new Error(
            'No se pudo consultar el tipo de cambio USD/MXN.'
        );
    }

    // MXN usa dos decimales: amountMinor representa centavos.
    const amountMinor = Math.round(usdAmount * data.rate * 100);

    cachedQuote = {
        usdAmount,
        exchangeRate: data.rate,
        rateDate: data.date,
        currency: 'mxn',
        amountMinor,
        amountMxn: amountMinor / 100,
    };

    cacheExpiresAt = Date.now() + CACHE_DURATION_MS;

    return cachedQuote;
}