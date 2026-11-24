const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function peticionAPI(endpoint, opciones = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: 'Bearer ' + token }),
    ...opciones.headers,
  };

  try {
    const respuesta = await fetch(API_URL + endpoint, {
      ...opciones,
      headers,
    });

    const contenido = await respuesta.text();
    const datos = contenido ? JSON.parse(contenido) : null;

    if (!respuesta.ok) {
      throw new Error(datos?.mensaje || 'Error en la petici?n al servidor');
    }

    return datos;
  } catch (error) {
    console.error('Error conectando con el backend:', error.message);
    throw error;
  }
}
