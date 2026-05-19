/**
 * Conversión de monedas usando floatrates.com como proveedor primario.
 *
 * Por qué este diseño:
 *  - floatrates es gratuito y sin API key, pero ocasionalmente devuelve HTML
 *    (rate limit / mantenimiento) y JSON.parse explota con
 *    "Unexpected token '<'". Verificamos content-type y validamos shape antes
 *    de parsear.
 *  - Cacheamos el feed por 15 min en memoria para evitar latencias > 10s y
 *    reducir presión sobre el upstream.
 *  - Si el upstream queda fuera y no hay cache, respondemos 502 con mensaje
 *    claro en lugar de explotar con 500.
 */
import Account from '../models/account.model.js';

const RATES_CACHE = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;
const FETCH_TIMEOUT_MS = 5000;

/** Hace fetch con timeout duro para no colgar el request más de N segundos. */
const fetchWithTimeout = async (url, timeoutMs = FETCH_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Descarga el feed de tasas (con cache). Devuelve el objeto JSON de floatrates
 * o `null` si no se pudo obtener ni de cache ni del upstream.
 */
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
 * Convierte un monto entre dos monedas ISO (ej. GTQ → USD).
 */
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

export const convertMoney = async (req, res) => {
  try {
    const { from, to, amount } = req.query;
    const convertedAmount = await convertCurrency(from.toUpperCase(), to.toUpperCase(), Number(amount));

    return res.status(200).json({
      success: true,
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      amount: Number(amount),
      convertedAmount,
    });
  } catch (error) {
    const status = error.upstreamUnavailable ? 502 : 500;
    console.error('Error en convertMoney:', error.message);
    return res.status(status).json({
      success: false,
      message: error.message || 'Error al convertir moneda',
    });
  }
};

/**
 * Devuelve el feed de tasas vigentes para una moneda base (default GTQ).
 * Útil para construir widgets de cotización. Endpoint: GET /currency/rates?base=GTQ
 */
export const getRates = async (req, res) => {
  try {
    const base = String(req.query.base || 'GTQ').toUpperCase();
    const data = await fetchRatesFeed(base);

    if (!data) {
      return res.status(502).json({
        success: false,
        message: 'No se pudo obtener las tasas de cambio del proveedor. Intenta de nuevo en unos segundos.',
      });
    }

    const rates = Object.values(data).map((entry) => ({
      code: String(entry.code || '').toUpperCase(),
      name: entry.name || '',
      rate: Number(entry.rate),
      date: entry.date || null,
    })).filter((entry) => Number.isFinite(entry.rate));

    return res.status(200).json({
      success: true,
      base,
      total: rates.length,
      rates,
      provider: 'floatrates.com',
      cached: !!RATES_CACHE.get(base.toLowerCase()),
    });
  } catch (error) {
    console.error('Error en getRates:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener tasas de cambio',
    });
  }
};

/**
 * Convierte moneda de una cuenta
 * Endpoint: GET /SistemaBancarioAdmin/v1/currency/:accountId?to=USD
 */
export const convertAccountCurrency = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { to } = req.query;

    if (!to) {
      return res.status(400).json({ success: false, message: 'Debe especificar la moneda destino con ?to=USD' });
    }

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Cuenta no encontrada' });
    }

    const convertedBalance = await convertCurrency(account.currency || 'GTQ', to, account.balance);

    return res.status(200).json({
      success: true,
      accountId,
      originalBalance: account.balance,
      originalCurrency: account.currency || 'GTQ',
      convertedBalance,
      convertedCurrency: to.toUpperCase(),
    });
  } catch (error) {
    const status = error.upstreamUnavailable ? 502 : 500;
    console.error(error);
    res.status(status).json({ success: false, message: error.message });
  }
};
