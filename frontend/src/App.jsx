import { useState } from 'react';
import PanelAdmin from './pages/admin/PanelAdmin';
import PanelDocente from './pages/docente/PanelDocente';
import PanelPadre from './pages/padre/PanelPadre';
import './styles/responsive.css';

export default function App() {
  const [vista, setVista] = useState('admin');

  return (
    <div>
      {/* Etiqueta semántica header y nav (Visto en clase)[cite: 5] */}
      <header>
        <nav className="menu-principal" aria-label="Navegación principal Kids Zone">
          <strong>KIDS ZONE</strong>
          <button onClick={() => setVista('admin')}>Vista Administrador</button>
          <button onClick={() => setVista('docente')}>Vista Docente</button>
          <button onClick={() => setVista('padre')}>Vista Padre</button>
        </nav>
      </header>

      {/* Etiqueta semántica main para el contenido central[cite: 5] */}
      <main>
        {vista === 'admin' && <PanelAdmin />}
        {vista === 'docente' && <PanelDocente />}
        {vista === 'padre' && <PanelPadre />}
      </main>
    </div>
  );
}