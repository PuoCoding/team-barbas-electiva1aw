export function guardarFicha(id, ficha) {
  localStorage.setItem(`ficha_medica_${id}`, JSON.stringify(ficha));
}
