import axios from 'axios';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5025/api/v1';

console.log('🔗 AUTH_SERVICE_URL configurada:', AUTH_SERVICE_URL);

// Servicio para comunicarse con .NET Auth API
export const verifyUserExists = async (userId) => {
  try {
    // Este endpoint debe existir en .NET para verificar que el usuario existe
    const response = await axios.get(`${AUTH_SERVICE_URL}/users/${userId}/exists`);
    return response.data.exists;
  } catch (error) {
    console.error('Error verificando usuario:', error.message);
    return false;
  }
};

export const getUserProfile = async (userId, token) => {
  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/users/${userId}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo perfil:', error.message);
    return null;
  }
};

export const verifyMonthlyIncome = async (userId, token) => {
  try {
    const profile = await getUserProfile(userId, token);
    return profile?.monthlyIncome || 0;
  } catch (error) {
    return 0;
  }
};

// Crear cliente en .NET (llamado desde Node.js cuando se crea una cuenta)
export const createClientInAuthService = async (clientData, token) => {
  try {
    const url = `${AUTH_SERVICE_URL}/admin/create-client`;
    console.log('📡 POST Request a:', url);
    
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
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data; // Retorna { success: true, data: { userId, ... } }
  } catch (error) {
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
