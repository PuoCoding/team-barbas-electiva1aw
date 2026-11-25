import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, CreditCard, ShieldAlert, ClipboardList, Video, FileText, Compass } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useRoleTheme } from './hooks/useRoleTheme';
import { useKidsZoneStore } from './hooks/useKidsZoneStore';
import AuthScreen from './components/AuthScreen';
import { SidebarNav, TopHeader, ToastBanner } from './components/LayoutShell';
import AdminWorkspace from './pages/AdminWorkspace';
import DocenteWorkspace from './pages/DocenteWorkspace';
import PadreWorkspace from './pages/PadreWorkspace';

const MENU_BY_ROLE = {
  admin: [
    { id: 'resumen', label: 'Resumen General', icon: LayoutDashboard },
    { id: 'matriculas', label: 'Matrículas y Ley 1581', icon: Users },
    { id: 'finanzas', label: 'Facturación y Extras', icon: CreditCard },
    { id: 'salidas', label: 'Salidas y Auditoría', icon: ShieldAlert },
  ],
  docente: [
    { id: 'resumen', label: 'Panel del Aula', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda Diaria', icon: ClipboardList },
    { id: 'incidentes', label: 'Reporte Incidentes', icon: ShieldAlert },
    { id: 'boletines', label: 'Boletines', icon: FileText },
  ],
  padre: [
    { id: 'resumen', label: 'Inicio Familiar', icon: LayoutDashboard },
    { id: 'pagos', label: 'Pagos y Recibos', icon: CreditCard },
    { id: 'camaras', label: 'Cámaras CCTV', icon: Video },
    { id: 'servicios', label: 'Boletín, Salidas y Ruta', icon: Compass },
  ],
};

export default function App() {
  const auth = useAuth();
  const store = useKidsZoneStore();
  const [section, setSection] = useState('resumen');
  const [offlineSim, setOfflineSim] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState('');
  const role = auth.user?.role || 'admin';
  const theme = useRoleTheme(role);

  useEffect(() => {
    setSection('resumen');
  }, [role]);

  const notify = (message) => {
    setToast(message);
    window.clearTimeout(notify.timeout);
    notify.timeout = window.setTimeout(() => setToast(''), 3500);
  };

  if (!auth.user) return <AuthScreen auth={auth} backendOnline={store.backendOnline} />;

  const unreadIncidents = store.incidents.filter((incident) => !incident.leido).length;

  return (
    <div className={`min-h-screen flex ${theme.canvasBg}`}>
      <SidebarNav theme={theme} items={MENU_BY_ROLE[role] || MENU_BY_ROLE.admin}
        activeSection={section} onSelectSection={setSection} mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader user={auth.user} theme={theme} backendOnline={store.backendOnline}
          offlineSim={offlineSim} onToggleOfflineSim={() => setOfflineSim((previous) => !previous)}
          onSwitchRole={auth.switchDemoRole} onLogout={auth.logout}
          onOpenMobile={() => setMobileOpen(true)} notificationsCount={unreadIncidents} />
        <main className="p-4 sm:p-6 max-w-6xl w-full mx-auto flex-1">
          {role === 'admin' && <AdminWorkspace store={store} theme={theme} section={section} onNotify={notify} />}
          {role === 'docente' && <DocenteWorkspace store={store} theme={theme} section={section} offlineSim={offlineSim} onNotify={notify} />}
          {role === 'padre' && <PadreWorkspace store={store} theme={theme} section={section} onNotify={notify} />}
        </main>
      </div>
      <ToastBanner message={toast} onClose={() => setToast('')} />
    </div>
  );
}
