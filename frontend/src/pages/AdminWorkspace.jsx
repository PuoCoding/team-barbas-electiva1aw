import { useState } from 'react';
import { KpiStatCard, StudentRowCard } from '../components/SharedWidgets';

export default function AdminWorkspace({ store, theme, section, onNotify }) {
  const [form, setForm] = useState({
    nombre: '', edad: '', grado: 'Jardín', acudiente: '', parentesco: 'Acudiente',
    contacto: '', correo: '', alergias: 'Ninguna', consentimiento: 'Negado',
  });
  const [extra, setExtra] = useState({
    estudiante: store.students[0]?.nombre || 'Mateo Gómez',
    concepto: 'Uniforme Deportivo',
    valor: 85000,
  });

  const pendienteTotal = store.payments
    .filter((payment) => payment.estado === 'Pendiente')
    .reduce((total, payment) => total + Number(payment.valor), 0);

  const handleRegisterForm = async (event) => {
    event.preventDefault();
    const created = await store.addStudent(form);
    onNotify(`Estudiante ${created.nombre} matriculado (${created.id_familia}).`);
    setForm({ ...form, nombre: '', edad: '', acudiente: '', contacto: '', correo: '' });
  };

  const handleExtra = async (event) => {
    event.preventDefault();
    await store.addPayment({ ...extra, valor: Number(extra.valor) });
    onNotify(`Cargo "${extra.concepto}" sumado a facturación.`);
  };

  return (
    <div className="space-y-6">
      {(section === 'resumen' || section === 'matriculas') && (
        <>
          <div className="grid-adaptable">
            <KpiStatCard title="Estudiantes Activos" value={store.students.length} subtitle="Con ID Familiar único" theme={theme} />
            <KpiStatCard title="Cartera Pendiente" value={`$${pendienteTotal.toLocaleString('es-CO')}`} subtitle="COP por recaudar" theme={theme} />
            <KpiStatCard title="Eventos Auditados" value={store.auditLogs.length} subtitle="Trazabilidad Ley 1581" theme={theme} />
          </div>
          <section className="bg-white border border-slate-200 rounded-md p-5">
            <h2 className="font-bold text-sm text-slate-900 mb-3 border-b border-slate-200 pb-2">Registro de Matrícula y Vinculación Familiar (HU01)</h2>
            <form onSubmit={handleRegisterForm} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <input required placeholder="Nombre del menor" value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} className="border border-slate-300 rounded-sm px-3 py-2 text-sm" />
              <input required type="number" min="1" max="6" placeholder="Edad" value={form.edad} onChange={(event) => setForm({ ...form, edad: event.target.value })} className="border border-slate-300 rounded-sm px-3 py-2 text-sm" />
              <select value={form.grado} onChange={(event) => setForm({ ...form, grado: event.target.value })} className="border border-slate-300 rounded-sm px-3 py-2 text-sm bg-white">
                <option>Párvulos</option><option>Pre-Jardín</option><option>Jardín</option><option>Transición</option>
              </select>
              <input required placeholder="Acudiente legal" value={form.acudiente} onChange={(event) => setForm({ ...form, acudiente: event.target.value })} className="border border-slate-300 rounded-sm px-3 py-2 text-sm" />
              <input required type="tel" placeholder="Teléfono (10 dígitos)" value={form.contacto} onChange={(event) => setForm({ ...form, contacto: event.target.value })} className="border border-slate-300 rounded-sm px-3 py-2 text-sm" />
              <input required type="email" placeholder="Correo del acudiente" value={form.correo} onChange={(event) => setForm({ ...form, correo: event.target.value })} className="border border-slate-300 rounded-sm px-3 py-2 text-sm" />
              <input placeholder="Alergias / condiciones" value={form.alergias} onChange={(event) => setForm({ ...form, alergias: event.target.value })} className="border border-slate-300 rounded-sm px-3 py-2 text-sm" />
              <select value={form.consentimiento} onChange={(event) => setForm({ ...form, consentimiento: event.target.value })} className="border border-slate-300 rounded-sm px-3 py-2 text-sm bg-white">
                <option value="Negado">Imagen: Negado</option>
                <option value="Parcial">Imagen: Parcial</option>
                <option value="Aprobado">Imagen: Aprobado</option>
              </select>
              <button type="submit" className={`${theme.primaryAccent} font-semibold rounded-sm px-4 py-2 text-sm`}>Matricular y Generar ID</button>
            </form>
          </section>
          <section>
            <h2 className="font-bold text-sm text-slate-900 mb-3">Control Legal de Consentimientos (HU03)</h2>
            <div className="grid-adaptable">
              {store.students.map((student) => (
                <StudentRowCard key={student._id || student.id} student={student} onChangeConsent={store.updateConsent} />
              ))}
            </div>
          </section>
        </>
      )}

      {(section === 'resumen' || section === 'finanzas') && (
        <section className="bg-white border border-slate-200 rounded-md p-5 space-y-4">
          <h2 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">Gestión de Cobros Extra y Facturación (HU05)</h2>
          <form onSubmit={handleExtra} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <select value={extra.estudiante} onChange={(event) => setExtra({ ...extra, estudiante: event.target.value })} className="border border-slate-300 rounded-sm px-3 py-2 text-sm bg-white">
              {store.students.map((student) => <option key={student._id || student.id} value={student.nombre}>{student.nombre}</option>)}
            </select>
            <input required placeholder="Concepto" value={extra.concepto} onChange={(event) => setExtra({ ...extra, concepto: event.target.value })} className="border border-slate-300 rounded-sm px-3 py-2 text-sm" />
            <input required type="number" placeholder="Valor COP" value={extra.valor} onChange={(event) => setExtra({ ...extra, valor: event.target.value })} className="border border-slate-300 rounded-sm px-3 py-2 text-sm" />
            <button type="submit" className={`${theme.primaryAccent} font-semibold rounded-sm px-4 py-2 text-sm`}>Sumar a Factura</button>
          </form>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-slate-200">
              <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200">
                <tr><th className="p-2.5">Estudiante</th><th className="p-2.5">Concepto</th><th className="p-2.5">Valor</th><th className="p-2.5">Estado</th><th className="p-2.5">Acción</th></tr>
              </thead>
              <tbody>
                {store.payments.map((payment) => (
                  <tr key={payment._id || payment.id} className="border-b border-slate-100">
                    <td className="p-2.5 font-medium">{payment.estudiante}</td><td className="p-2.5">{payment.concepto}</td>
                    <td className="p-2.5 font-semibold">${Number(payment.valor).toLocaleString('es-CO')}</td><td className="p-2.5">{payment.estado}</td>
                    <td className="p-2.5"><button onClick={() => { store.deletePayment(payment._id || payment.id); onNotify('Cargo anulado.'); }} className="text-red-700 font-semibold hover:underline">Anular</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {(section === 'salidas' || section === 'auditoria') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="bg-white border border-slate-200 rounded-md p-5 space-y-3">
            <h2 className="font-bold text-sm text-slate-900 border-b pb-2">Salidas Pedagógicas (HU09)</h2>
            {store.outings.map((outing) => (
              <div key={outing._id || outing.id} className="border border-slate-200 rounded-sm p-3 flex justify-between items-center gap-2 text-xs">
                <div><p className="font-bold">{outing.titulo} ({outing.fecha})</p><p>{outing.estudiante} — <strong className={outing.autorizado ? 'text-emerald-700' : 'text-red-700'}>{outing.autorizado ? `Firmado (${outing.firma})` : 'Sin permiso'}</strong></p></div>
                <button disabled={outing.retornoNotificado} onClick={() => { store.notifyOutingReturn(outing._id || outing.id); onNotify('Retorno notificado a familias.'); }} className={`${theme.primaryAccent} px-3 py-1.5 rounded-sm font-semibold disabled:bg-emerald-700`}>
                  {outing.retornoNotificado ? 'Retorno OK' : 'Notificar Regreso'}
                </button>
              </div>
            ))}
          </section>
          <section className="bg-white border border-slate-200 rounded-md p-5 space-y-3">
            <h2 className="font-bold text-sm text-slate-900 border-b pb-2">Audit Log de Seguridad (HU12)</h2>
            <ul className="space-y-1.5 text-xs max-h-60 overflow-y-auto">
              {store.auditLogs.map((log) => (
                <li key={log._id || log.id} className="bg-slate-50 border border-slate-200 p-2 rounded-sm flex justify-between gap-2">
                  <span><strong>[{log.rol}]</strong> {log.accion}</span><span className="text-slate-400 shrink-0">{log.fecha}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
