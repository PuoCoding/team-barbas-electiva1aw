import { useState } from 'react';
import { useCameraSession } from '../hooks/useCameraSession';
import { ReceiptModal } from '../components/LayoutShell';

export default function PadreWorkspace({ store, theme, section, onNotify }) {
  const student = store.students[0];
  const camera = useCameraSession();
  const [receipt, setReceipt] = useState(null);
  const [firma, setFirma] = useState('');
  const [gpsStatus, setGpsStatus] = useState('Carrera 9 con Calle 5 — Llegada estimada: 6 min');
  const saldo = store.payments.filter((payment) => payment.estado === 'Pendiente').reduce((total, payment) => total + Number(payment.valor), 0);

  return (
    <div className="space-y-5">
      <div className="bg-white border border-amber-200 rounded-md p-4 flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-stone-900">{student?.nombre} · {student?.grado}</h1><p className="text-xs text-stone-600">Código Familiar: <strong>{student?.id_familia}</strong> · Acudiente: {student?.acudiente}</p></div>
        <span className={`${theme.softBadge} px-3 py-1.5 rounded-sm text-xs font-bold`}>Saldo Pendiente: ${saldo.toLocaleString('es-CO')} COP</span>
      </div>
      {(section === 'resumen' || section === 'pagos') && (
        <section className="bg-white border border-stone-200 rounded-md p-5 space-y-3">
          <h2 className="font-bold text-sm text-stone-900 border-b border-stone-200 pb-2">Estado de Cuenta y Pagos en Línea (HU04)</h2>
          <div className="grid-adaptable">
            {store.payments.map((payment) => (
              <article key={payment._id || payment.id} className="border border-stone-200 bg-[#faf7f2] rounded-sm p-4 flex flex-col justify-between gap-2">
                <div><p className="font-bold text-sm text-stone-900">{payment.concepto}</p><p className="text-xs text-stone-500">{payment.fecha} · Método: {payment.metodo}</p><p className="text-lg font-bold text-stone-900 mt-1">${Number(payment.valor).toLocaleString('es-CO')} COP</p></div>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-200">
                  {payment.estado === 'Pendiente' ? (
                    <>
                      <button onClick={() => { store.payInvoice(payment._id || payment.id, 'PSE'); onNotify('Pago PSE acreditado.'); }} className={`${theme.primaryAccent} px-3 py-1.5 rounded-sm text-xs font-semibold`}>Pagar PSE</button>
                      <button onClick={() => { store.payInvoice(payment._id || payment.id, 'Nequi'); onNotify('Pago Nequi acreditado.'); }} className="bg-stone-800 text-white px-3 py-1.5 rounded-sm text-xs font-semibold">Nequi</button>
                    </>
                  ) : <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-sm">Pagado</span>}
                  <button onClick={() => setReceipt(payment)} className="border border-stone-300 bg-white px-3 py-1.5 rounded-sm text-xs font-semibold">Recibo PDF</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
      {(section === 'camaras' || section === 'resumen') && (
        <section className="bg-white border border-stone-200 rounded-md p-5 space-y-3">
          <div className="flex flex-wrap justify-between items-center gap-2 border-b border-stone-200 pb-2">
            <h2 className="font-bold text-sm text-stone-900">Monitoreo CCTV del Salón (HU07)</h2>
            <label className="text-xs flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={camera.demoMode} onChange={(event) => camera.setDemoMode(event.target.checked)} />Modo Demo (ignorar horario 7:00–17:00)</label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={camera.startCamera} className={`${theme.primaryAccent} px-4 py-2 rounded-sm text-xs font-semibold`}>Conectar Salón {student?.grado}</button>
            <button disabled className="bg-stone-100 border border-stone-200 text-stone-400 px-3 py-2 rounded-sm text-xs cursor-not-allowed">Salón Párvulos (Bloqueado)</button>
            {camera.active && (
              <>
                <select value={camera.quality} onChange={(event) => camera.setQuality(event.target.value)} className="border border-stone-300 rounded-sm px-2 py-1.5 text-xs bg-white"><option>1080p</option><option>720p</option><option>480p</option></select>
                <button onClick={camera.stopCamera} className="bg-red-700 text-white px-3 py-1.5 rounded-sm text-xs font-semibold">Desconectar ({camera.formattedTime})</button>
              </>
            )}
          </div>
          {camera.errorMsg && <p className="text-xs text-red-700 font-semibold">{camera.errorMsg}</p>}
          {camera.active && <div className="bg-stone-950 text-stone-200 rounded-sm p-6 border-l-4 border-emerald-500"><div className="flex justify-between text-xs font-mono text-emerald-400 mb-4"><span>● EN VIVO · CAM-{student?.grado?.toUpperCase()}</span><span>{camera.quality} · Restante: {camera.formattedTime}</span></div><p className="text-center py-8 text-sm text-stone-400">Señal HLS segura del aula asignada a {student?.nombre}.</p></div>}
        </section>
      )}
      {(section === 'boletin' || section === 'servicios') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {student?.boletin && (
            <section className="bg-white border border-stone-200 rounded-md p-5 space-y-3">
              <div className="flex justify-between items-center border-b pb-2"><h2 className="font-bold text-sm">Boletín Comparativo (HU06)</h2><button onClick={() => window.print()} className="border border-stone-300 px-2.5 py-1 rounded-sm text-xs font-semibold no-print">Imprimir</button></div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {['cognitiva', 'motriz', 'socioafectiva'].map((area) => <div key={area} className="bg-[#faf7f2] border border-stone-200 p-2.5 rounded-sm"><p className="capitalize font-bold">{area}</p><p className="text-stone-500">P1: {student.boletin.periodo1[area]}</p><p className="font-bold text-emerald-800">P2: {student.boletin.periodo2[area]}</p></div>)}
              </div>
              <p className="text-xs bg-orange-50 border border-amber-200 p-3 rounded-sm">{student.boletin.comentario}</p>
            </section>
          )}
          <section className="bg-white border border-stone-200 rounded-md p-5 space-y-3 text-xs">
            <h2 className="font-bold text-sm border-b pb-2">Salidas (HU09), Incidentes (HU11) y Ruta (HU10)</h2>
            {store.outings.map((outing) => (
              <div key={outing._id || outing.id} className="border border-stone-200 p-2.5 rounded-sm space-y-2">
                <p className="font-bold">{outing.titulo} ({outing.fecha})</p>
                {outing.autorizado ? <p className="text-emerald-800 font-semibold">Autorizado por: {outing.firma}</p> : <div className="flex gap-2"><input placeholder="Tu nombre para firmar" value={firma} onChange={(event) => setFirma(event.target.value)} className="flex-1 border border-stone-300 rounded-sm px-2 py-1" /><button onClick={() => { if (firma) { store.signOuting(outing._id || outing.id, firma); onNotify('Permiso firmado digitalmente.'); } }} className={`${theme.primaryAccent} px-3 py-1 rounded-sm font-semibold`}>Firmar</button></div>}
              </div>
            ))}
            {store.incidents.map((incident) => <div key={incident._id || incident.id} className="bg-red-50 border border-red-200 p-2.5 rounded-sm flex justify-between items-center gap-2"><span><strong>{incident.tipo}:</strong> {incident.descripcion}</span><button disabled={incident.leido} onClick={() => store.confirmIncident(incident._id || incident.id)} className="bg-red-700 text-white px-2.5 py-1 rounded-sm font-semibold disabled:bg-emerald-700 shrink-0">{incident.leido ? 'Leído' : 'Enterado'}</button></div>)}
            <div className="bg-[#faf7f2] border border-stone-200 p-3 rounded-sm space-y-1">
              <p className="font-bold">Ruta Escolar · Placa WMK-482 (Monitora: Andrea López)</p>
              <p className="font-mono text-stone-700">GPS: {gpsStatus}</p>
              <button onClick={() => setGpsStatus(`Actualizado ${new Date().toLocaleTimeString('es-CO')} — Ingresando a portería`)} className={`${theme.primaryAccent} px-2.5 py-1 rounded-sm font-semibold mt-1`}>Actualizar GPS</button>
            </div>
          </section>
        </div>
      )}
      <ReceiptModal payment={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
}
