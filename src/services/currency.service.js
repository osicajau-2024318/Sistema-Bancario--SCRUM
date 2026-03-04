// Importa axios para hacer peticiones HTTP a la API de tipos de cambio
import axios from 'axios';

// URL base de la API pública de tipos de cambio
const BASE_URL = 'https://api.exchangerate.host';

// Servicio para convertir entre monedas usando una API externa
// from: moneda origen (ej: 'GTQ')
// to: moneda destino (ej: 'USD')
// amount: cantidad a convertir
export const convertCurrency = async (from, to, amount) => {
  // Construye la URL de la petición con los parámetros
  const url = `${BASE_URL}/convert?from=${from}&to=${to}&amount=${amount}`;

  // Hace la petición a la API de tipos de cambio
  const response = await axios.get(url);

  // Valida que la respuesta contenga el resultado
  if (!response.data || !response.data.result) {
    throw new Error('No se pudo convertir la moneda');
  }

  // Retorna los datos de la conversión
  return {
    from,                          // Moneda origen
    to,                            // Moneda destino
    amount,                        // Cantidad original
    result: response.data.result,  // Cantidad convertida
    rate: response.data.info.rate  // Tasa de cambio utilizada
  };
};