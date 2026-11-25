import { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, Database, Lock } from 'lucide-react';

export default function AuthScreen({ auth, backendOnline }) {
  const [mode, setMode] = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', role: 'padre' });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (mode === 'login') await auth.login(form.email, form.password);
    else await auth.register(form);
  };

  const quickLogin = (email) => {
    setForm({ ...form, email, password: '123456' });
    auth.login(email, '123456');
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-100">
      <aside className="lg:col-span-5 bg-slate-900 text-slate-100 p-8 lg:p-12 flex flex-col justify-between border-r border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <span className="bg-blue-700 text-white font-bold px-2.5 py-1 rounded-sm text-sm tracking-wider">KZ</span>
            <div>
              <h1 className="font-bold text-lg tracking-tight">KIDS ZONE</h1>
              <p className="text-xs text-slate-400">Sistema Integral de Jardín Infantil</p>
            </div>
          </div>
          <h2 className="text-2xl font-semibold leading-snug text-white mb-4">
            Control académico, financiero y de bienestar infantil en un entorno unificado.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-8">
            La interfaz se adapta automáticamente a la identidad visual y permisos de cada perfil.
          </p>
          <div className="space-y-3 border-t border-slate-800 pt-6 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Cumplimiento Ley 1581: consentimientos de imagen y auditoría activa.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Fichas médicas cifradas con respaldo offline para emergencias.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Estado API :5000:{' '}
                <strong className={backendOnline ? 'text-emerald-400' : 'text-amber-300'}>
                  {backendOnline ? 'Conectada a MongoDB' : 'Modo Demo Local'}
                </strong>
              </span>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 mt-8">KIDS ZONE · Plataforma Web Institucional · 2026</p>
      </aside>

      <main className="lg:col-span-7 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md bg-white border border-slate-300 rounded-md p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-2 border-b border-slate-200 mb-6">
            <button type="button" onClick={() => setMode('login')} className={`pb-3 text-sm font-semibold border-b-2 transition ${mode === 'login' ? 'border-blue-700 text-slate-900' : 'border-transparent text-slate-500'}`}>
              Iniciar Sesión
            </button>
            <button type="button" onClick={() => setMode('register')} className={`pb-3 text-sm font-semibold border-b-2 transition ${mode === 'register' ? 'border-blue-700 text-slate-900' : 'border-transparent text-slate-500'}`}>
              Crear Cuenta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre completo</label>
                <input required value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} placeholder="Ej. Andrea Torres"
                  className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-blue-700" />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Correo electrónico</label>
              <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="usuario@kidszone.edu"
                className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-blue-700" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contraseña</label>
              <div className="relative">
                <input required type={showPass ? 'text' : 'password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="••••••••"
                  className="w-full border border-slate-300 rounded-sm px-3 py-2 pr-10 text-sm focus:outline-none focus:border-blue-700" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-800">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Perfil de usuario</label>
                <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm bg-white">
                  <option value="padre">Padre / Acudiente</option>
                  <option value="docente">Docente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            )}
            {auth.authError && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-sm font-medium">{auth.authError}</p>
            )}
            <button type="submit" disabled={auth.loading} className="w-full bg-slate-900 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-sm text-sm transition">
              {auth.loading ? 'Validando...' : mode === 'login' ? 'Ingresar a la Plataforma' : 'Registrar e Ingresar'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 mb-2.5">Acceso rápido por rol (clave: 123456)</p>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => quickLogin('admin@kidszone.edu')} className="border border-slate-300 hover:border-blue-700 hover:bg-blue-50 text-xs font-semibold py-2 rounded-sm text-slate-800">Admin</button>
              <button type="button" onClick={() => quickLogin('docente@kidszone.edu')} className="border border-slate-300 hover:border-teal-700 hover:bg-teal-50 text-xs font-semibold py-2 rounded-sm text-slate-800">Docente</button>
              <button type="button" onClick={() => quickLogin('padre@kidszone.edu')} className="border border-slate-300 hover:border-amber-700 hover:bg-amber-50 text-xs font-semibold py-2 rounded-sm text-slate-800">Padre</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
