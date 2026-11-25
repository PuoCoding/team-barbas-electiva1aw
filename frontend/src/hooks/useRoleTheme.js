export function obtenerRol() {
  return localStorage.getItem('rol') || 'padre';
}
