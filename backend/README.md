# Zone Kids Backend - Blockchain Modular 🚀

Backend completo para el sistema de gestión del jardín infantil "Zone Kids", desarrollado en Node.js, Express y MongoDB, con una arquitectura modular y un sistema de cadena de bloques (Blockchain) integrado para garantizar la inmutabilidad y seguridad de los registros en los módulos de **Pagos**, **Certificados** e **Inscripciones**.

## 🛠️ Stack Tecnológico
- **Node.js** & **Express**
- **MongoDB** & **Mongoose**
- **crypto-js** (SHA256 para la cadena de bloques)
- **JWT** & **bcrypt** (Autenticación y Seguridad)
- **Jest** & **Supertest** (Pruebas unitarias e integración)

## 📂 Estructura del Proyecto
El proyecto está basado en una arquitectura modular por capas (Rutas -> Controladores -> Servicios -> Modelos). Cada módulo tiene su propia lógica de validación (Joi) y su propia cadena de bloques aislada.

```
backend/
├── src/
│   ├── config/ (Base de datos y variables de entorno)
│   ├── modules/
│   │   ├── blockchain/ (Core de lógica de minado y validación transversal)
│   │   ├── pagos/ (Controlador, Modelo, Rutas, Servicio, Validador)
│   │   ├── certificados/ 
│   │   ├── inscripciones/
│   │   └── usuarios/ (Autenticación y roles)
│   ├── middlewares/ (Manejo de errores, Rate limiting)
│   ├── utils/ (Logger, Respuesta estándar, Hashing)
│   └── routes/ (Índice de rutas)
├── tests/
├── seeds/
├── server.js (Punto de entrada)
└── package.json
```

## ⚙️ Instalación y Configuración

1. Clonar el repositorio y navegar a `backend/`:
   ```bash
   cd backend
   npm install
   ```

2. Configurar variables de entorno:
   Renombra `.env.example` a `.env` y ajusta los valores (MONGO_URI, JWT_SECRET, MINING_DIFFICULTY).

3. Iniciar el servidor:
   ```bash
   npm run dev    # Modo desarrollo (Nodemon)
   npm start      # Modo producción
   ```

4. Cargar datos de prueba (Seed) - *Opcional*:
   ```bash
   npm run seed
   ```

5. Ejecutar Pruebas:
   ```bash
   npm run test
   ```

## 🔗 Integración con el Frontend Actual

Para integrar este backend con tu frontend actual (JS Vanilla con `localStorage`), reemplaza las funciones donde manipulas `localStorage` por llamadas a la API usando `fetch()`. 

El backend expone un endpoint especial para **migrar la cadena actual del localStorage** directamente a la base de datos de forma validada:

### Migración Inicial (Sync)
Si tu frontend en `pagos.html` tiene un arreglo `zonaKidsChain`, envíalo así:
```javascript
async function migrarCadenaLocalStorage() {
  const cadenaLocal = JSON.parse(localStorage.getItem('zonaKidsChain') || '[]');
  if (cadenaLocal.length === 0) return;

  const res = await fetch('http://localhost:5000/api/blockchain/pagos/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chain: cadenaLocal })
  });
  
  const result = await res.json();
  console.log(result.message);
}
```

### 1. Obtener los Registros y Renderizar
En lugar de iterar `JSON.parse(localStorage.getItem(...))` haz un fetch:
```javascript
async function cargarRegistros() {
  const res = await fetch('http://localhost:5000/api/pagos');
  const result = await res.json();
  
  if (result.success) {
    const chain = result.data;
    // chain tiene exactamente la misma estructura que tu clase Block actual:
    // { index, date, hash, previousHash, nonce, data: { ... } }
    render(chain); 
  }
}
```

### 2. Crear un Registro (Backend se encarga del minado y encadenamiento)
El minado ocurre en el servidor usando la dificultad especificada.
```javascript
async function crearRegistro(datos) {
  const res = await fetch('http://localhost:5000/api/pagos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos) // ej: { estudiante: "Juan", concepto: "Matricula", valor: 5000, metodo: "Efectivo", mes: "Febrero" }
  });
  const result = await res.json();
  if (result.success) {
    cargarRegistros(); // Refrescar la tabla
  }
}
```

### 3. Editar un Registro (Backend remina automáticamente la cadena a partir del cambio)
```javascript
async function editarRegistro(id, nuevosDatos) {
  const res = await fetch(`http://localhost:5000/api/pagos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevosDatos)
  });
  const result = await res.json();
  if (result.success) cargarRegistros();
}
```

### 4. Eliminar un Registro (Backend reindexa y remina)
```javascript
async function eliminarRegistro(id) {
  const res = await fetch(`http://localhost:5000/api/pagos/${id}`, {
    method: 'DELETE'
  });
  const result = await res.json();
  if (result.success) cargarRegistros();
}
```

### 5. Validar la Integridad de la Cadena
El backend tiene un endpoint especializado para verificar la validación criptográfica de cualquier módulo:
```javascript
async function validarCadena(modulo) {
  // modulo puede ser 'pagos', 'certificados' o 'inscripciones'
  const res = await fetch(`http://localhost:5000/api/blockchain/${modulo}/validate`);
  const result = await res.json();
  if (result.success) {
    alert(`¿Cadena válida?: ${result.data.isValid}`);
  }
}
```
