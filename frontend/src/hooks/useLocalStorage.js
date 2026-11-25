import { useEffect, useState } from 'react';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // El valor permanece disponible en memoria si el almacenamiento está bloqueado.
    }
  }, [key, value]);

  return [value, setValue];
}

export const leerLocalStorage = (key, fallback = null) => {
  try {
    const valor = localStorage.getItem(key);
    return valor ? JSON.parse(valor) : fallback;
  } catch {
    return fallback;
  }
};
