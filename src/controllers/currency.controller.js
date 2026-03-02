/**
 * Convierte un monto de una moneda a otra usando exchangerate.host
 * @param {string} from - Código de moneda de origen (ej. 'GTQ')
 * @param {string} to - Código de moneda destino (ej. 'USD')
 * @param {number} amount - Monto a convertir
 * @returns {Promise<number>} - Monto convertido
 */
export const convertCurrency = async (from, to, amount) => {
  try {
    const response = await fetch(`https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`);
    const data = await response.json();

    if (!data || data.result == null) {
      throw new Error('No se pudo obtener la conversión');
    }

    return parseFloat(data.result.toFixed(2));
  } catch (error) {
    console.error('Error al convertir divisas:', error.message);
    throw new Error('Error al convertir divisas');
  }
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
      convertedAmount
    });
  } catch (error) {
    console.error('Error en convertMoney:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error al convertir moneda'
    });
  }
};

/**
 * Controlador para convertir moneda de una cuenta
 * Endpoint: GET /api/v1/currency/:accountId?to=USD
 */
import Account from '../models/account.model.js';

export const convertAccountCurrency = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { to } = req.query; // moneda destino

    if (!to) {
      return res.status(400).json({ success: false, message: 'Debe especificar la moneda destino con ?to=USD' });
    }

    // Obtener cuenta
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Cuenta no encontrada' });
    }

    // Convertir saldo
    const convertedBalance = await convertCurrency(account.currency || 'GTQ', to, account.balance);

    return res.status(200).json({
      success: true,
      accountId,
      originalBalance: account.balance,
      originalCurrency: account.currency || 'GTQ',
      convertedBalance,
      convertedCurrency: to.toUpperCase()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};