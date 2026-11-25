const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

type RespuestaConMensaje = {
  mensaje?: unknown;
  message?: unknown;
};

function obtenerMensajeError(datos: unknown): string {
  if (typeof datos === 'object' && datos !== null) {
    const respuesta = datos as RespuestaConMensaje;
    if (typeof respuesta.mensaje === 'string') return respuesta.mensaje;
    if (typeof respuesta.message === 'string') return respuesta.message;
  }

  return 'Error en la petición al servidor';
}

export async function peticionAPI<T = unknown>(
  endpoint: string,
  opciones: RequestInit = {},
): Promise<T | null> {
  const token = localStorage.getItem('token');
  const headers = new Headers({ 'Content-Type': 'application/json' });

  if (token) headers.set('Authorization', `Bearer ${token}`);
  new Headers(opciones.headers).forEach((valor, nombre) => headers.set(nombre, valor));

  try {
    const respuesta = await fetch(API_URL + endpoint, {
      ...opciones,
      headers,
    });

    const contenido = await respuesta.text();
    const datos: unknown = contenido ? JSON.parse(contenido) : null;

    if (!respuesta.ok) {
      throw new Error(obtenerMensajeError(datos));
    }

    return datos as T | null;
  } catch (error: unknown) {
    console.error(
      'Error conectando con el backend:',
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  }
}
