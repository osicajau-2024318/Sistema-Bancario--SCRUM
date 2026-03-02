import axios from 'axios';

export const getExchangeRate = async () => {
  try {
    const response = await axios.get('https://api.exchangerate.host/latest?base=USD&symbols=GTQ');
    return response.data.rates.GTQ;
  } catch (error) {
    throw new Error('No se pudo obtener el tipo de cambio');
  }
};