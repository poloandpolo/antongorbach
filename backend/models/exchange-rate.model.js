const CACHE_DURATION_MS = 5 * 60 * 1000;

let cachedRate = null;
let cacheExpiresAt = 0;

async function getUsdToMxnRate() {
    if (cachedRate && Date.now() < cacheExpiresAt) {
        return cachedRate;
    }

    const response = await fetch(
        'https://api.frankfurter.dev/v2/rate/usd/mxn',
        {
            signal: AbortSignal.timeout(10000),
        }
    );

    const data = await response.json().catch(() => ({}));

    if (
        !response.ok ||
        !Number.isFinite(data.rate) ||
        data.rate <= 0
    ) {
        throw new Error(
            'No se pudo consultar el tipo de cambio USD/MXN.'
        );
    }

    cachedRate = {
        exchangeRate: data.rate,
        rateDate: data.date,
    };

    cacheExpiresAt = Date.now() + CACHE_DURATION_MS;

    return cachedRate;
}

export async function getPriorityPrice(amountUsdInput) {
    const configuredAmount =
        process.env.PRIORITY_APPOINTMENT_AMOUNT_USD || 70;

    const usdAmount = Number(
        amountUsdInput ?? configuredAmount
    );

    if (
        !Number.isFinite(usdAmount) ||
        usdAmount <= 0 ||
        usdAmount > 999999.99
    ) {
        throw new Error(
            'El importe USD debe ser un número positivo válido.'
        );
    }

    // USD se cobra con dos decimales.
    const usdCents = Math.round(usdAmount * 100);
    const normalizedUsdAmount = usdCents / 100;

    const { exchangeRate, rateDate } = await getUsdToMxnRate();

    // Stripe recibe MXN en centavos.
    const amountMinor = Math.round(
        normalizedUsdAmount * exchangeRate * 100
    );

    return {
        usdAmount: normalizedUsdAmount,
        exchangeRate,
        rateDate,
        currency: 'mxn',
        amountMinor,
        amountMxn: amountMinor / 100,
    };
}