const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function peticionAPI(endpoint, opciones = {}) {
  const headers = new Headers({ 'Content-Type': 'application/json', ...opciones.headers });
  const token = localStorage.getItem('token');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const respuesta = await fetch(API_URL + endpoint, { ...opciones, headers });
  const texto = await respuesta.text();
  const datos = texto ? JSON.parse(texto) : null;
  if (!respuesta.ok) throw new Error(datos?.mensaje || datos?.message || 'Error en la petición');
  return datos;
}
