export function Estado({ mensaje }) {
  return mensaje ? <p role="status">{mensaje}</p> : null;
}
