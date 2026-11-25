import { useState } from 'react';
import AdminWorkspace from './pages/AdminWorkspace';
import DocenteWorkspace from './pages/DocenteWorkspace';
import PadreWorkspace from './pages/PadreWorkspace';

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
        {vista === 'admin' && <AdminWorkspace />}
        {vista === 'docente' && <DocenteWorkspace />}
        {vista === 'padre' && <PadreWorkspace />}
      </main>
    </>
  );
}
