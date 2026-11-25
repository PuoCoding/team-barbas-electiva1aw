import { AlertTriangle, Phone, Lock, Unlock } from 'lucide-react';

export function KpiStatCard({ title, value, subtitle, theme }) {
  return (
    <article className={`bg-white border border-slate-200 ${theme.accentBorder} rounded-md p-4 shadow-sm`}>
      <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{title}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </article>
  );
}

export function MedicalAlertBanner({ ficha, isOffline, isDecrypted, onToggleDecrypt }) {
  if (!ficha) return null;
  return (
    <div role="alert" className="bg-red-50 border border-red-300 border-l-4 border-l-red-700 rounded-sm p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 bg-red-700 text-white text-[11px] font-bold px-2 py-0.5 rounded-sm">
              <AlertTriangle className="w-3 h-3" /> ALERTA MÉDICA (HU02)
            </span>
            {isOffline && (
              <span className="bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-semibold px-2 py-0.5 rounded-sm">
                Caché Offline Activa (&lt;1s)
              </span>
            )}
          </div>
          <p className="text-sm font-bold text-red-950">
            {ficha.nombre} — Alergias: {isDecrypted ? ficha.alergias : '•••••••• (Cifrado AES-256)'}
          </p>
          <p className="text-xs text-red-900">
            RH: <strong>{ficha.tipoSangre}</strong> · EPS: {isDecrypted ? ficha.eps : '••••'} · Medicación:{' '}
            {isDecrypted ? ficha.medicacion : '••••••••'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={onToggleDecrypt} className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-red-300 text-red-900 rounded-sm text-xs font-semibold hover:bg-red-100">
            {isDecrypted ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            {isDecrypted ? 'Ocultar' : 'Descifrar Ficha'}
          </button>
          <a href={`tel:${ficha.contactoEmergencia}`} className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-700 hover:bg-red-800 text-white rounded-sm text-xs font-bold">
            <Phone className="w-3.5 h-3.5" /> Urgencia ({ficha.contactoEmergencia})
          </a>
        </div>
      </div>
    </div>
  );
}

export function StudentRowCard({ student, onChangeConsent }) {
  const sid = student._id || student.id;
  const isDenied = student.consentimiento === 'Negado';
  const isPartial = student.consentimiento === 'Parcial';
  return (
    <article className="bg-white border border-slate-200 rounded-md p-4 flex flex-col justify-between gap-3">
      <div>
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold text-sm text-slate-900">{student.nombre}</h3>
          <span className="font-mono text-[11px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-sm font-semibold">
            {student.id_familia}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">{student.grado} · {student.edad} años</p>
        <p className="text-xs text-slate-700 mt-1">Acudiente: <strong>{student.acudiente}</strong> ({student.contacto})</p>
      </div>
      <div className="border-t border-slate-200 pt-3 space-y-2">
        <label className="block text-[11px] font-semibold text-slate-700">
          Consentimiento de imagen (HU03):
          <select value={student.consentimiento} onChange={(event) => onChangeConsent(sid, event.target.value)}
            className="mt-1 w-full border border-slate-300 rounded-sm px-2 py-1.5 text-xs bg-white">
            <option value="Aprobado">Aprobado (Institucional y redes)</option>
            <option value="Parcial">Parcial (Uso interno con marca de agua)</option>
            <option value="Negado">Negado (Carga bloqueada)</option>
          </select>
        </label>
        <input type="file" accept="image/*" disabled={isDenied}
          className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded-sm file:border file:border-slate-300 file:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed" />
        {isDenied && <p className="text-[11px] text-red-700 font-semibold">Carga bloqueada físicamente: permiso Negado.</p>}
        {isPartial && <p className="text-[11px] text-amber-800 font-semibold">Marca de agua automática: &quot;NO PUBLICAR&quot;.</p>}
      </div>
    </article>
  );
}
