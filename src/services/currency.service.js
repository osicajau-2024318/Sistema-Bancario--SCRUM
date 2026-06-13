const RATES_CACHE = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;
const FETCH_TIMEOUT_MS = 5000;
const FALLBACK_GTQ_PER_USD = 7.8;

const fetchWithTimeout = async (url, timeoutMs = FETCH_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const fetchRatesFeed = async (base) => {
  const key = base.toLowerCase();
  const cached = RATES_CACHE.get(key);
  const now = Date.now();
  if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const url = `https://www.floatrates.com/daily/${key}.json`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      if (cached) return cached.data;
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      if (cached) return cached.data;
      return null;
    }

    const data = await response.json();
    if (!data || typeof data !== 'object') {
      if (cached) return cached.data;
      return null;
    }

    RATES_CACHE.set(key, { cachedAt: now, data });
    return data;
  } catch (error) {
    console.warn(`[currency] fallo upstream para base=${base}:`, error.message);
    if (cached) return cached.data;
    return null;
  }
};

/**
 * Devuelve cuántos GTQ equivalen a 1 USD (tasa usada en transferencias y depósitos).
 */
export const getDynamicRate = async (from, to) => {
  const fromU = String(from).toUpperCase();
  const toU = String(to).toUpperCase();

  if (fromU === toU) return 1;

  const isSupported =
    (fromU === 'GTQ' && toU === 'USD') || (fromU === 'USD' && toU === 'GTQ');
  if (!isSupported) {
    throw new Error(`Par de monedas no soportado: ${fromU} → ${toU}`);
  }

  const data = await fetchRatesFeed('USD');
  const gtqEntry = data?.gtq;
  if (gtqEntry?.rate != null && Number.isFinite(Number(gtqEntry.rate))) {
    return parseFloat(Number(gtqEntry.rate).toFixed(4));
  }

  const cached = RATES_CACHE.get('usd');
  const cachedRate = cached?.data?.gtq?.rate;
  if (cachedRate != null && Number.isFinite(Number(cachedRate))) {
    return parseFloat(Number(cachedRate).toFixed(4));
  }

  return FALLBACK_GTQ_PER_USD;
};

export const convertCurrency = async (from, to, amount) => {
  const fromU = String(from).toUpperCase();
  const toU = String(to).toUpperCase();
  const n = Number(amount);

  if (!Number.isFinite(n)) {
    throw new Error('Monto inválido');
  }
  if (fromU === toU) {
    return parseFloat(n.toFixed(2));
  }

  const data = await fetchRatesFeed(fromU);
  if (!data) {
    const err = new Error('Proveedor de tasas no disponible. Intenta de nuevo en unos segundos.');
    err.upstreamUnavailable = true;
    throw err;
  }

  const entry = data[toU.toLowerCase()];
  if (!entry || entry.rate == null) {
    throw new Error(`Par de monedas no disponible: ${fromU} → ${toU}`);
  }

  return parseFloat((n * Number(entry.rate)).toFixed(2));
};
