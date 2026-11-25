import { useState } from 'react';
import { useMedicalCache } from '../hooks/useMedicalCache';
import { MedicalAlertBanner } from '../components/SharedWidgets';

export default function DocenteWorkspace({ store, theme, section, offlineSim, onNotify }) {
  const [selectedId, setSelectedId] = useState(store.students[0]?._id || store.students[0]?.id || '1');
  const student = store.students.find((item) => (item._id || item.id) === selectedId) || store.students[0];
  const { ficha, isOffline, isDecrypted, toggleDecrypt } = useMedicalCache(student, offlineSim, store.logAudit);
  const [agenda, setAgenda] = useState({ alimentacion: 'Comió todo', sueno: '1h sin novedad', esfinteres: 'Normal', actividad: '' });
  const [incidente, setIncidente] = useState({ tipo: 'Salud', descripcion: '', evidencia: 'Sin foto adjunta' });
  const [comentarioNota, setComentarioNota] = useState(student?.boletin?.comentario || '');

  const handleAgenda = async (masivo) => {
    if (!agenda.actividad.trim()) return;
    await store.addAgenda({ estudiante: student.nombre, grado: student.grado, ...agenda }, masivo);
    setAgenda({ ...agenda, actividad: '' });
    onNotify(masivo ? 'Agenda replicada a todo el grado.' : `Agenda enviada al acudiente de ${student.nombre}.`);
  };

  const handleIncident = async (event) => {
    event.preventDefault();
    await store.addIncident({ estudiante: student.nombre, ...incidente });
    setIncidente({ ...incidente, descripcion: '' });
    onNotify('Alerta de incidente registrada y enviada.');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-stone-200 rounded-md p-4">
        <div><h1 className="text-xl font-bold text-slate-900">Gestión de Aula — {student?.grado}</h1><p className="text-xs text-slate-600">Consulta ficha médica y registra novedades.</p></div>
        <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="border border-stone-300 bg-stone-50 rounded-sm px-3 py-2 text-sm font-semibold">
          {store.students.map((item) => <option key={item._id || item.id} value={item._id || item.id}>{item.nombre} ({item.grado})</option>)}
        </select>
      </div>
      <MedicalAlertBanner ficha={ficha} isOffline={isOffline} isDecrypted={isDecrypted} onToggleDecrypt={toggleDecrypt} />
      {(section === 'agenda' || section === 'resumen') && (
        <section className="bg-white border border-stone-200 rounded-md p-5 space-y-3">
          <h2 className="font-bold text-sm text-slate-900 border-b border-stone-200 pb-2">Agenda Diaria del Menor (HU08)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="text-xs font-semibold">Alimentación:
              <select value={agenda.alimentacion} onChange={(event) => setAgenda({ ...agenda, alimentacion: event.target.value })} className="mt-1 w-full border border-stone-300 rounded-sm px-2.5 py-2 text-sm bg-white"><option>Comió todo</option><option>Parcial</option><option>Nada</option></select>
            </label>
            <label className="text-xs font-semibold">Sueño / Siesta:<input value={agenda.sueno} onChange={(event) => setAgenda({ ...agenda, sueno: event.target.value })} className="mt-1 w-full border border-stone-300 rounded-sm px-2.5 py-2 text-sm" /></label>
            <label className="text-xs font-semibold">Control de esfínteres:<input value={agenda.esfinteres} onChange={(event) => setAgenda({ ...agenda, esfinteres: event.target.value })} className="mt-1 w-full border border-stone-300 rounded-sm px-2.5 py-2 text-sm" /></label>
          </div>
          <label className="block text-xs font-semibold">Comentario pedagógico ({agenda.actividad.length}/200):
            <textarea maxLength={200} rows={3} value={agenda.actividad} onChange={(event) => setAgenda({ ...agenda, actividad: event.target.value })} className="mt-1 w-full border border-stone-300 rounded-sm p-2.5 text-sm" />
          </label>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleAgenda(false)} className={`${theme.primaryAccent} px-4 py-2 rounded-sm text-xs font-semibold`}>Enviar al Acudiente</button>
            <button onClick={() => handleAgenda(true)} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-sm text-xs font-semibold">Envío Masivo al Grado</button>
          </div>
        </section>
      )}
      {(section === 'incidentes' || section === 'resumen') && (
        <section className="bg-white border border-stone-200 rounded-md p-5">
          <h2 className="font-bold text-sm text-slate-900 border-b border-stone-200 pb-2 mb-3">Reporte de Incidentes en Tiempo Real (HU11)</h2>
          <form onSubmit={handleIncident} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <select value={incidente.tipo} onChange={(event) => setIncidente({ ...incidente, tipo: event.target.value })} className="border border-stone-300 rounded-sm px-3 py-2 text-sm bg-white"><option>Salud</option><option>Conducta</option><option>Accidente leve</option></select>
            <input required placeholder="Descripción detallada..." value={incidente.descripcion} onChange={(event) => setIncidente({ ...incidente, descripcion: event.target.value })} className="border border-stone-300 rounded-sm px-3 py-2 text-sm sm:col-span-2" />
            <button type="submit" className="bg-red-700 hover:bg-red-800 text-white font-semibold rounded-sm px-4 py-2 text-sm">Emitir Alerta</button>
          </form>
        </section>
      )}
      {section === 'boletines' && student?.boletin && (
        <section className="bg-white border border-stone-200 rounded-md p-5 space-y-3">
          <h2 className="font-bold text-sm text-slate-900 border-b pb-2">Evaluación y Observación del Boletín (HU06)</h2>
          <textarea rows={3} value={comentarioNota} onChange={(event) => setComentarioNota(event.target.value)} className="w-full border border-stone-300 rounded-sm p-2.5 text-sm" />
          <button onClick={() => { store.updateGrades(student._id || student.id, { ...student.boletin, comentario: comentarioNota }); onNotify('Boletín actualizado en base de datos.'); }} className={`${theme.primaryAccent} px-4 py-2 rounded-sm text-xs font-semibold`}>Guardar Observación Cualitativa</button>
        </section>
      )}
    </div>
  );
}
