import { useEffect } from 'react';
import { apiRequest } from '../services/api';
import { useLocalStorage } from './useLocalStorage';

const DEFAULT_STUDENTS = [{
  _id: '1', id_familia: 'FAM-1001', nombre: 'Mateo Gómez', edad: 4, grado: 'Jardín',
  acudiente: 'Laura Gómez', parentesco: 'Madre', contacto: '3001234567',
  correo: 'padre@kidszone.edu', consentimiento: 'Negado', tipoSangre: 'O+',
  eps: 'Sura', alergias: 'Maní y Penicilina', vacunas: 'Esquema PAI completo',
  medicacion: 'Inhalador Salbutamol si presenta fatiga',
  boletin: {
    periodo1: { cognitiva: 4.2, motriz: 4.4, socioafectiva: 4.1 },
    periodo2: { cognitiva: 4.7, motriz: 4.8, socioafectiva: 4.6 },
    comentario: 'Excelente progreso en trazos y trabajo en equipo.',
  },
}];

const DEFAULT_PAYMENTS = [
  { _id: 'p1', id_familia: 'FAM-1001', estudiante: 'Mateo Gómez', concepto: 'Mensualidad Noviembre', valor: 450000, fecha: '2026-11-05', metodo: 'Pendiente', estado: 'Pendiente' },
  { _id: 'p2', id_familia: 'FAM-1001', estudiante: 'Mateo Gómez', concepto: 'Extra: Uniforme Deportivo', valor: 85000, fecha: '2026-11-10', metodo: 'PSE', estado: 'Pagado' },
];

export function useKidsZoneStore() {
  const [students, setStudents] = useLocalStorage('kz_v2_students', DEFAULT_STUDENTS);
  const [payments, setPayments] = useLocalStorage('kz_v2_payments', DEFAULT_PAYMENTS);
  const [agendas, setAgendas] = useLocalStorage('kz_v2_agendas', []);
  const [incidents, setIncidents] = useLocalStorage('kz_v2_incidents', []);
  const [outings, setOutings] = useLocalStorage('kz_v2_outings', []);
  const [auditLogs, setAuditLogs] = useLocalStorage('kz_v2_audit', []);
  const [backendOnline, setBackendOnline] = useLocalStorage('kz_backend_online', false);

  useEffect(() => {
    async function sync() {
      try {
        const [st, pg, ag, inc, sal, aud] = await Promise.all([
          apiRequest('/estudiantes'), apiRequest('/pagos'), apiRequest('/agenda'),
          apiRequest('/incidentes'), apiRequest('/salidas'), apiRequest('/auditoria'),
        ]);
        setStudents(st); setPayments(pg); setAgendas(ag); setIncidents(inc);
        setOutings(sal); setAuditLogs(aud); setBackendOnline(true);
      } catch {
        setBackendOnline(false);
      }
    }
    sync();
  }, [setAgendas, setAuditLogs, setBackendOnline, setIncidents, setOutings, setPayments, setStudents]);

  const getId = (item) => item._id || item.id;

  const logAudit = async (usuario, rol, accion) => {
    const entry = { _id: String(Date.now()), usuario, rol, accion, fecha: new Date().toLocaleString('es-CO') };
    setAuditLogs((prev) => [entry, ...prev]);
    try {
      await apiRequest('/auditoria', { method: 'POST', body: JSON.stringify({ usuario, rol, accion }) });
    } catch {
      // La entrada local conserva la auditoría si MongoDB no está disponible.
    }
  };

  const addStudent = async (form) => {
    try {
      const created = await apiRequest('/estudiantes', { method: 'POST', body: JSON.stringify(form) });
      setStudents((prev) => [created, ...prev]);
      return created;
    } catch {
      const local = { _id: String(Date.now()), id_familia: `FAM-${Math.floor(1000 + Math.random() * 9000)}`, ...form };
      setStudents((prev) => [local, ...prev]);
      return local;
    }
  };

  const updateConsent = async (id, consentimiento) => {
    setStudents((prev) => prev.map((student) => (getId(student) === id ? { ...student, consentimiento } : student)));
    try {
      await apiRequest(`/estudiantes/${id}/consentimiento`, { method: 'PATCH', body: JSON.stringify({ consentimiento }) });
    } catch {
      // El estado local ya fue actualizado.
    }
  };

  const updateGrades = async (id, boletin) => {
    setStudents((prev) => prev.map((student) => (getId(student) === id ? { ...student, boletin } : student)));
    try {
      await apiRequest(`/estudiantes/${id}/boletin`, { method: 'PATCH', body: JSON.stringify({ boletin }) });
    } catch {
      // El estado local ya fue actualizado.
    }
  };

  const addPayment = async (cargo) => {
    try {
      const created = await apiRequest('/pagos', { method: 'POST', body: JSON.stringify(cargo) });
      setPayments((prev) => [created, ...prev]);
    } catch {
      setPayments((prev) => [{ _id: String(Date.now()), fecha: new Date().toISOString().slice(0, 10), metodo: 'Pendiente', estado: 'Pendiente', ...cargo }, ...prev]);
    }
  };

  const payInvoice = async (id, metodo) => {
    setPayments((prev) => prev.map((payment) => (getId(payment) === id ? { ...payment, estado: 'Pagado', metodo } : payment)));
    try {
      await apiRequest(`/pagos/${id}/pagar`, { method: 'PATCH', body: JSON.stringify({ metodo }) });
    } catch {
      // El estado local ya fue actualizado.
    }
  };

  const deletePayment = async (id) => {
    setPayments((prev) => prev.filter((payment) => getId(payment) !== id));
    try {
      await apiRequest(`/pagos/${id}`, { method: 'DELETE' });
    } catch {
      // El estado local ya fue actualizado.
    }
  };

  const addAgenda = async (entry, masivo = false) => {
    const items = masivo ? students.map((student) => ({ ...entry, estudiante: student.nombre, grado: student.grado })) : [entry];
    for (const item of items) {
      try {
        const created = await apiRequest('/agenda', { method: 'POST', body: JSON.stringify(item) });
        setAgendas((prev) => [created, ...prev]);
      } catch {
        setAgendas((prev) => [{ _id: String(Date.now() + Math.random()), fecha: new Date().toLocaleString('es-CO'), ...item }, ...prev]);
      }
    }
  };

  const addIncident = async (incident) => {
    try {
      const created = await apiRequest('/incidentes', { method: 'POST', body: JSON.stringify(incident) });
      setIncidents((prev) => [created, ...prev]);
    } catch {
      setIncidents((prev) => [{ _id: String(Date.now()), fecha: new Date().toLocaleString('es-CO'), leido: false, ...incident }, ...prev]);
    }
  };

  const confirmIncident = async (id) => {
    setIncidents((prev) => prev.map((incident) => (getId(incident) === id ? { ...incident, leido: true } : incident)));
    try {
      await apiRequest(`/incidentes/${id}/confirmar`, { method: 'PATCH' });
    } catch {
      // El estado local ya fue actualizado.
    }
  };

  const signOuting = async (id, firma) => {
    setOutings((prev) => prev.map((outing) => (getId(outing) === id ? { ...outing, autorizado: true, firma } : outing)));
    try {
      await apiRequest(`/salidas/${id}/firmar`, { method: 'PATCH', body: JSON.stringify({ firma }) });
    } catch {
      // El estado local ya fue actualizado.
    }
  };

  const notifyOutingReturn = async (id) => {
    setOutings((prev) => prev.map((outing) => (getId(outing) === id ? { ...outing, retornoNotificado: true } : outing)));
    try {
      await apiRequest(`/salidas/${id}/retorno`, { method: 'PATCH' });
    } catch {
      // El estado local ya fue actualizado.
    }
  };

  return {
    students, payments, agendas, incidents, outings, auditLogs, backendOnline,
    logAudit, addStudent, updateConsent, updateGrades, addPayment, payInvoice, deletePayment,
    addAgenda, addIncident, confirmIncident, signOuting, notifyOutingReturn,
  };
}
