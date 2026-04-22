// Importa axios para hacer peticiones HTTP al servicio de autenticación .NET
import axios from 'axios';

// URL base del servicio de autenticación .NET
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5025/api/v1';

console.log(' AUTH_SERVICE_URL configurada:', AUTH_SERVICE_URL);

// Servicio para comunicarse con .NET Auth API y verificar que un usuario existe
export const verifyUserExists = async (userId) => {
  try {
    // Llama al endpoint de .NET para verificar existencia del usuario
    const response = await axios.get(`${AUTH_SERVICE_URL}/users/${userId}/exists`);
    return response.data.exists; // Retorna true o false
  } catch (error) {
    console.error('Error verificando usuario:', error.message);
    return false;
  }
};

// Obtiene el perfil completo de un usuario desde el servicio .NET
export const getUserProfile = async (userId, token) => {
  try {
    // Llama al endpoint de .NET con autenticación
    const response = await axios.get(`${AUTH_SERVICE_URL}/users/${userId}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data; // Retorna datos del usuario
  } catch (error) {
    console.error('Error obteniendo perfil:', error.message);
    return null;
  }
};

// Verifica los ingresos mensuales de un usuario
export const verifyMonthlyIncome = async (userId, token) => {
  try {
    const profile = await getUserProfile(userId, token);
    return profile?.monthlyIncome || 0; // Retorna ingresos mensuales o 0
  } catch (error) {
    return 0;
  }
};

// Crear cliente en el servicio .NET (llamado desde Node.js cuando se crea una cuenta)
export const createClientInAuthService = async (clientData, token) => {
  try {
    const url = `${AUTH_SERVICE_URL}/admin/create-client`;
    console.log('📡 POST Request a:', url);
    
    // Envía petición POST al servicio .NET para crear el cliente
    const response = await axios.post(
      url,
      {
        name: clientData.name,
        surname: clientData.surname,
        username: clientData.username,
        email: clientData.email,
        password: clientData.password,
        phone: clientData.phone,
        dpi: clientData.dpi || '',
        address: clientData.address || '',
        workName: clientData.workName || '',
        monthlyIncome: clientData.monthlyIncome || 0
      },
      {
        headers: { 
          Authorization: `Bearer ${token}`, // Token del admin que crea el cliente
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data; // Retorna { success: true, data: { userId, ... } }
  } catch (error) {
    // Manejo detallado de errores
    console.error('❌ Error creando cliente en .NET:');
    console.error('URL intentada:', `${AUTH_SERVICE_URL}/admin/create-client`);
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};
