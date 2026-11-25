export function guardarValor(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
