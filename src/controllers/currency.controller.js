/**
 * Conversión de monedas usando floatrates.com (feed JSON diario, sin API key).
 * La API exchangerate.host pasó a exigir access_key; esta fuente cubre GTQ/USD/EUR.
 */
import Account from '../models/account.model.js';

/**
 * Convierte un monto entre dos monedas ISO (ej. GTQ → USD).
 * Multiplica por `rate` del archivo daily/{from}.json según documentación floatrates.
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

  const url = `https://www.floatrates.com/daily/${fromU.toLowerCase()}.json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('No se pudo obtener las tasas de cambio');
  }

  const data = await response.json();
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
    console.error('Error en convertMoney:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error al convertir moneda',
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
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
