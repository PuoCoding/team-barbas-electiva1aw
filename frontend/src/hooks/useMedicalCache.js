import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import { useLocalStorage } from './useLocalStorage';

export function useMedicalCache(student, offlineSim, onAuditLog) {
  const sid = student?._id || student?.id || '1';
  const [cached, setCached] = useLocalStorage(`kz_med_${sid}`, null);
  const [ficha, setFicha] = useState(cached);
  const [isOffline, setIsOffline] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(false);

  useEffect(() => {
    if (!student) return;
    let mounted = true;
    const fallback = {
      id: sid,
      nombre: student.nombre,
      tipoSangre: student.tipoSangre,
      eps: student.eps,
      alergias: student.alergias,
      vacunas: student.vacunas,
      medicacion: student.medicacion || 'Sin medicación permanente',
      contactoEmergencia: student.contacto,
      acudiente: student.acudiente,
    };

    async function load() {
      if (offlineSim) {
        if (mounted) {
          setIsOffline(true);
          setFicha(cached || fallback);
        }
        return;
      }
      try {
        const data = await apiRequest(`/estudiantes/${sid}/ficha-medica`);
        if (mounted) {
          setFicha(data);
          setCached(data);
          setIsOffline(false);
        }
      } catch {
        if (mounted) {
          setIsOffline(true);
          setFicha(cached || fallback);
        }
      }
    }

    load();
    return () => { mounted = false; };
  }, [sid, offlineSim, student, cached, setCached]);

  const toggleDecrypt = () => {
    const next = !isDecrypted;
    setIsDecrypted(next);
    if (next && onAuditLog && student) {
      onAuditLog('Docente', 'docente', `Descifró ficha médica AES-256 de ${student.nombre}`);
    }
  };

  return { ficha, isOffline, isDecrypted, toggleDecrypt };
}
