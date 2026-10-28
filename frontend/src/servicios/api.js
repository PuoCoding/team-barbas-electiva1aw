const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function peticionAPI(endpoint, opciones = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: Bearer ${token} }),
    ...opciones.headers,
  };

  try {
    const respuesta = await fetch(${API_URL}${endpoint}, {
      ...opciones,
      headers,
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) {
      throw new Error(datos.mensaje || 'Error en la petición al servidor');
    }
    return datos;
  } catch (error) {
    console.error('Error conectando con el backend:', error.message);
    throw error;
  }
}