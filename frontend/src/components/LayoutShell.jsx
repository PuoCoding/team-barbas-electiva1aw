import { Bell, LogOut, Menu, X, Printer, Wifi, WifiOff } from 'lucide-react';

export function SidebarNav({ theme, items, activeSection, onSelectSection, mobileOpen, onCloseMobile }) {
  return (
    <aside className={`${theme.sidebarBg} w-64 shrink-0 flex flex-col justify-between no-print fixed inset-y-0 left-0 z-40 transform transition-transform lg:static lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div>
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={`${theme.brandBadge} font-bold px-2 py-0.5 rounded-sm text-xs`}>KZ</span>
            <div>
              <p className="font-bold text-sm leading-tight">KIDS ZONE</p>
              <p className="text-[11px] opacity-70">{theme.label}</p>
            </div>
          </div>
          <button onClick={onCloseMobile} className="lg:hidden opacity-75 hover:opacity-100"><X className="w-4 h-4" /></button>
        </div>
        <nav aria-label="Menú lateral de módulos" className="p-3 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button key={item.id} onClick={() => { onSelectSection(item.id); onCloseMobile(); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium rounded-sm transition text-left ${active ? theme.sidebarActive : theme.sidebarHover}`}>
                <Icon className="w-4 h-4 shrink-0" /><span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-white/10 text-[11px] opacity-75">
        <p className="font-semibold">Entorno: {theme.workspaceTitle}</p>
        <p>Protección Ley 1581 activa</p>
      </div>
    </aside>
  );
}

export function TopHeader({ user, theme, backendOnline, offlineSim, onToggleOfflineSim, onSwitchRole, onLogout, onOpenMobile, notificationsCount }) {
  return (
    <header className={`${theme.headerAccent} px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 no-print`}>
      <div className="flex items-center gap-3">
        <button onClick={onOpenMobile} className="lg:hidden p-1.5 border border-slate-300 rounded-sm"><Menu className="w-4 h-4" /></button>
        <div>
          <p className="text-sm font-bold text-slate-900">{theme.workspaceTitle}</p>
          <p className="text-xs text-slate-500">Sesión: {user.nombre} ({user.email})</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-sm ${backendOnline && !offlineSim ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-900 border border-amber-200'}`}>
          {backendOnline && !offlineSim ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          {backendOnline && !offlineSim ? 'MongoDB :5000' : 'Caché Local'}
        </span>
        <button onClick={onToggleOfflineSim} className="text-[11px] border border-slate-300 bg-white px-2.5 py-1 rounded-sm hover:bg-slate-50 font-medium">
          {offlineSim ? 'Restaurar Red' : 'Simular Offline'}
        </button>
        <select aria-label="Cambiar rol demo" value={user.role} onChange={(event) => onSwitchRole(event.target.value)} className="text-xs border border-slate-300 bg-white rounded-sm px-2 py-1 font-semibold">
          <option value="admin">Tema: Admin</option>
          <option value="docente">Tema: Docente</option>
          <option value="padre">Tema: Padre</option>
        </select>
        <div className="relative p-1.5 border border-slate-300 rounded-sm bg-white" title="Notificaciones pendientes">
          <Bell className="w-4 h-4 text-slate-700" />
          {notificationsCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold px-1 rounded-sm">{notificationsCount}</span>}
        </div>
        <button onClick={onLogout} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-slate-300 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-300 rounded-sm">
          <LogOut className="w-3.5 h-3.5" />Salir
        </button>
      </div>
    </header>
  );
}

export function ToastBanner({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-sm shadow-lg border-l-4 border-blue-500 flex items-center gap-3 no-print">
      <span>{message}</span>
      <button onClick={onClose} className="text-slate-400 hover:text-white font-bold">✕</button>
    </div>
  );
}

export function ReceiptModal({ payment, onClose }) {
  if (!payment) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-md max-w-md w-full p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-start border-b border-slate-200 pb-3">
          <div><h3 className="font-bold text-slate-900">KIDS ZONE · Recibo de Caja</h3><p className="text-xs text-slate-500">Comprobante #{payment._id || payment.id}</p></div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 no-print">✕</button>
        </div>
        <div className="text-sm space-y-1.5">
          <p><span className="text-slate-500">Estudiante:</span> <strong>{payment.estudiante}</strong></p>
          <p><span className="text-slate-500">Concepto:</span> {payment.concepto}</p>
          <p><span className="text-slate-500">Fecha:</span> {payment.fecha}</p>
          <p><span className="text-slate-500">Método / Estado:</span> {payment.metodo} · <strong>{payment.estado}</strong></p>
          <p className="text-lg font-bold text-slate-900 pt-2 border-t">Total: ${Number(payment.valor).toLocaleString('es-CO')} COP</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-sm">
          <svg viewBox="0 0 60 60" className="w-14 h-14 shrink-0">
            <rect width="60" height="60" fill="#fff" /><rect x="4" y="4" width="16" height="16" fill="#0f172a" /><rect x="8" y="8" width="8" height="8" fill="#fff" />
            <rect x="40" y="4" width="16" height="16" fill="#0f172a" /><rect x="44" y="8" width="8" height="8" fill="#fff" /><rect x="4" y="40" width="16" height="16" fill="#0f172a" />
            <rect x="8" y="44" width="8" height="8" fill="#fff" /><rect x="26" y="26" width="8" height="8" fill="#0f172a" /><rect x="38" y="38" width="14" height="6" fill="#0f172a" />
          </svg>
          <p className="text-xs text-slate-600">Código QR verificado para recaudo electrónico y soporte contable.</p>
        </div>
        <div className="flex justify-end gap-2 no-print">
          <button onClick={onClose} className="px-3 py-1.5 text-xs border border-slate-300 rounded-sm">Cerrar</button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-900 text-white rounded-sm font-semibold"><Printer className="w-3.5 h-3.5" />Imprimir PDF</button>
        </div>
      </div>
    </div>
  );
}
