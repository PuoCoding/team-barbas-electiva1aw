export function leerLocalStorage(key, fallback = null) {
  try {
    const valor = localStorage.getItem(key);
    return valor ? JSON.parse(valor) : fallback;
  } catch {
    return fallback;
  }
}
