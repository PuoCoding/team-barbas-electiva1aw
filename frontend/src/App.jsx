import { useState } from 'react';
import PanelAdmin from './pages/admin/PanelAdmin.jsx';
import PanelDocente from './pages/docente/PanelDocente.jsx';
import PanelPadre from './pages/padre/PanelPadre.jsx';

export default function App() {
  const [vista, setVista] = useState('admin');
  return (
    <>
      <header>
        <nav className="menu-principal">
          <strong>KIDS ZONE</strong>
          <button onClick={() => setVista('admin')}>Administrador</button>
          <button onClick={() => setVista('docente')}>Docente</button>
          <button onClick={() => setVista('padre')}>Padre</button>
        </nav>
      </header>
      <main>
        {vista === 'admin' && <PanelAdmin />}
        {vista === 'docente' && <PanelDocente />}
        {vista === 'padre' && <PanelPadre />}
      </main>
    </>
  );
}
