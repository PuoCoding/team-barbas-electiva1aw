const ROLE_THEMES = {
  admin: {
    id: 'admin',
    label: 'Administrador',
    workspaceTitle: 'Consola Administrativa',
    canvasBg: 'bg-slate-100',
    sidebarBg: 'bg-slate-900 text-white',
    sidebarHover: 'hover:bg-slate-800',
    sidebarActive: 'bg-blue-700 text-white',
    headerAccent: 'bg-white border-b border-slate-300',
    brandBadge: 'bg-blue-700 text-white',
    primaryAccent: 'bg-blue-600 text-white',
    accentBorder: 'border-t-2 border-blue-600',
    softBadge: 'bg-blue-50 text-blue-700',
  },
  docente: {
    id: 'docente',
    label: 'Docente',
    workspaceTitle: 'Espacio Académico y Salud',
    canvasBg: 'bg-teal-50',
    sidebarBg: 'bg-teal-950 text-white',
    sidebarHover: 'hover:bg-teal-900',
    sidebarActive: 'bg-teal-700 text-white',
    headerAccent: 'bg-white border-b border-teal-200',
    brandBadge: 'bg-teal-700 text-white',
    primaryAccent: 'bg-teal-600 text-white',
    accentBorder: 'border-t-2 border-teal-600',
    softBadge: 'bg-teal-50 text-teal-700',
  },
  padre: {
    id: 'padre',
    label: 'Padre de Familia',
    workspaceTitle: 'Portal Familiar',
    canvasBg: 'bg-orange-50',
    sidebarBg: 'bg-amber-900 text-white',
    sidebarHover: 'hover:bg-amber-800',
    sidebarActive: 'bg-orange-600 text-white',
    headerAccent: 'bg-white border-b border-orange-200',
    brandBadge: 'bg-amber-700 text-white',
    primaryAccent: 'bg-orange-600 text-white',
    accentBorder: 'border-t-2 border-orange-600',
    softBadge: 'bg-orange-50 text-orange-800',
  },
};

export function useRoleTheme(role) {
  return ROLE_THEMES[role] || ROLE_THEMES.padre;
}
