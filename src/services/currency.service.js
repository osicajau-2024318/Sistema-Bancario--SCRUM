import axios from 'axios';

const BASE_URL = 'https://api.exchangerate.host';

export const convertCurrency = async (from, to, amount) => {
  const url = `${BASE_URL}/convert?from=${from}&to=${to}&amount=${amount}`;

  const response = await axios.get(url);

  if (!response.data || !response.data.result) {
    throw new Error('No se pudo convertir la moneda');
  }

  return {
    from,
    to,
    amount,
    result: response.data.result,
    rate: response.data.info.rate
  };
};