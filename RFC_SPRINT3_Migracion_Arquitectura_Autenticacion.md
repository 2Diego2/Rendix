# RFC: Migración a PostgreSQL, Arquitectura en Capas y Autenticación Básica

## 1. Información General

**Título de la RFC:** Migración de almacenamiento JSON a PostgreSQL, implementación de arquitectura en capas y sistema de autenticación básica con JWT.

**Autor(es):** Equipo de Desarrollo Rendix

**Fecha de creación:** 2025-01-28

**Última actualización:** 2025-01-28

**Estado:** Propuesta

**Product Owner / Scrum Master involucrado:** [Nombre del PO/SM]

**Sprint previsto:** Sprint 3

---

## 2. Resumen Ejecutivo

Este RFC propone migrar el sistema de almacenamiento temporal de archivos JSON a PostgreSQL usando Prisma ORM, implementar una arquitectura en capas (controllers, services, repositories) para mejorar la mantenibilidad y escalabilidad del código, y agregar autenticación básica con JWT para proteger las rutas de la API. El objetivo es establecer una base sólida para el crecimiento futuro del sistema Rendix, mejorando la integridad de datos, la seguridad y la organización del código.

---

## 3. Antecedentes y Motivación

### Estado Actual del Sistema

Actualmente, el sistema Rendix funciona con las siguientes limitaciones:

1. **Almacenamiento en archivos JSON:** 
   - Las ventas se guardan en `ventas_data/ventas_YYYY-MM-DD.json`
   - Los gastos se guardan en `gastos_data/gastos_YYYY-MM-DD.json`
   - No hay integridad referencial, transacciones ni consultas complejas
   - Los datos están fragmentados en múltiples archivos

```javascript
// Ejemplo actual en routes/ventas.js
const archivoHoy = path.join(rutaVentas, `ventas_${obtenerFechaHoy()}.json`);
let ventasHoy = [];
if (fs.existsSync(archivoHoy)) {
  ventasHoy = JSON.parse(fs.readFileSync(archivoHoy));
}
```

2. **Arquitectura monolítica:**
   - Toda la lógica está en los archivos de rutas (`routes/ventas.js`, `routes/gastos.js`)
   - No hay separación de responsabilidades
   - Las carpetas `controllers/`, `services/`, `repositories/` están vacías

3. **Sin autenticación:**
   - Las rutas están completamente abiertas
   - No hay control de acceso
   - Las dependencias `bcrypt` y `jsonwebtoken` están instaladas pero no se usan

4. **Prisma sin modelos:**
   - El `schema.prisma` solo tiene configuración básica
   - Las tablas existen en PostgreSQL pero no se usan desde el código
   - Solo `routes/usuarios.js` hace una consulta directa con `pg`

### Factores Desencadenantes

- **Necesidad de relaciones de datos:** El sistema requiere vincular ventas con vendedoras, gastos con usuarios, liquidaciones con períodos, etc.
- **Escalabilidad:** Los archivos JSON no escalan para grandes volúmenes de datos
- **Seguridad:** Es crítico proteger los datos financieros del negocio
- **Mantenibilidad:** El código actual es difícil de mantener y testear

### Valor Aportado

- **Integridad de datos:** PostgreSQL garantiza transacciones ACID y relaciones referenciales
- **Consultas eficientes:** Posibilidad de hacer consultas complejas, filtros y agregaciones
- **Seguridad:** Autenticación protege los endpoints críticos
- **Código limpio:** Arquitectura en capas facilita el mantenimiento y testing
- **Preparación para el futuro:** Base sólida para módulos de Liquidaciones, Reportes, Asistencias

### Métricas que Mejorarán

- Tiempo de respuesta de consultas (especialmente con rangos de fechas)
- Integridad de datos (reducción de inconsistencias)
- Tasa de errores en operaciones críticas
- Tiempo de desarrollo de nuevas funcionalidades
- Cobertura de pruebas (facilitada por la arquitectura en capas)

### Fuera de Alcance

- Implementación de roles y permisos avanzados (solo autenticación básica)
- Migración de datos históricos de JSON a PostgreSQL (se puede hacer después)
- Optimizaciones avanzadas de base de datos (índices adicionales, particionamiento)
- Sistema de caché
- Documentación de API con Swagger (queda para sprints futuros)

---

## 4. Objetivos y No-Objetivos

### Objetivos

1. **Migrar Ventas y Gastos a PostgreSQL:**
   - Reemplazar `fs.readFileSync`/`fs.writeFileSync` por Prisma
   - Mantener la misma interfaz de API para el frontend (sin breaking changes)
   - Implementar modelos Prisma para todas las entidades principales

2. **Implementar Arquitectura en Capas:**
   - Separar lógica de negocio en `services/`
   - Separar acceso a datos en `repositories/`
   - Mantener `routes/` solo para manejo de HTTP
   - Crear `controllers/` para validación y formato de respuestas

3. **Implementar Autenticación Básica:**
   - Endpoint de login (`POST /auth/login`)
   - Middleware de autenticación JWT
   - Proteger todas las rutas excepto `/auth/login`
   - Hash de contraseñas con bcrypt

4. **Completar Modelos Prisma:**
   - Definir todos los modelos según `Basededatos.txt`
   - Configurar relaciones entre modelos
   - Aplicar migraciones a la base de datos

5. **Implementar CRUD de Vendedoras:**
   - Endpoints para crear, listar, actualizar y eliminar vendedoras
   - Validaciones básicas

### No-Objetivos

- Migración automática de datos históricos desde JSON
- Sistema de roles y permisos (solo usuario único autenticado)
- Refresh tokens (solo JWT simple)
- Recuperación de contraseña
- Registro de usuarios (se creará manualmente en BD)
- Optimizaciones de performance avanzadas
- Pruebas E2E automatizadas
- Documentación de API completa

---

## 5. Diseño/Propuesta de Solución

### 5.1 Arquitectura en Capas

La nueva arquitectura seguirá el patrón de capas:

```
routes/          → Manejo de HTTP (req, res)
  ↓
controllers/     → Validación, formato de respuestas
  ↓
services/        → Lógica de negocio
  ↓
repositories/    → Acceso a datos (Prisma)
  ↓
Prisma Models    → Base de datos
```

**Ejemplo de flujo para crear una venta:**

```javascript
// routes/ventas.js
const ventasController = require('../controllers/ventasController');

router.post('/', ventasController.createVenta);

// controllers/ventasController.js
const ventasService = require('../services/ventasService');

exports.createVenta = async (req, res) => {
  try {
    const ventaData = req.body;
    const venta = await ventasService.createVenta(ventaData);
    res.status(201).json(venta);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// services/ventasService.js
const ventasRepository = require('../repositories/ventasRepository');

exports.createVenta = async (ventaData) => {
  // Validar datos
  if (!ventaData.productos || ventaData.productos.length === 0) {
    throw new Error('Debe incluir productos');
  }
  
  // Calcular total
  const total = ventaData.productos.reduce(
    (sum, p) => sum + p.cantidad * p.precio, 
    0
  );
  
  // Guardar en BD
  return await ventasRepository.create({
    ...ventaData,
    total,
    fecha: new Date(),
  });
};

// repositories/ventasRepository.js
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

exports.create = async (ventaData) => {
  return await prisma.venta.create({
    data: {
      fecha: ventaData.fecha,
      hora: ventaData.hora,
      vendedora_id: ventaData.vendedora_id,
      total: ventaData.total,
      estado: 'finalizada',
      items: {
        create: ventaData.productos.map(p => ({
          descripcion: p.nombre,
          cantidad: p.cantidad,
          precio_unitario: p.precio,
        }))
      }
    },
    include: { items: true }
  });
};
```

### 5.2 Modelos Prisma

El `schema.prisma` completo incluirá:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Usuario {
  id            Int       @id @default(autoincrement())
  nombre        String    @db.VarChar(100)
  email         String    @unique @db.VarChar(150)
  password_hash String    @db.Text
  rol           String    @db.VarChar(50)
  creado_en     DateTime  @default(now()) @map("creado_en")
  
  gastos        Gasto[]
  liquidaciones Liquidacion[]
  import_batches ImportBatch[]
  
  @@map("usuarios")
}

model Vendedora {
  id                Int       @id @default(autoincrement())
  nombre            String    @db.VarChar(100)
  codigo            String?   @db.VarChar(50)
  sueldo_base       Decimal   @db.Decimal(12, 2)
  porcentaje_comision Decimal @db.Decimal(5, 2)
  creado_en         DateTime  @default(now()) @map("creado_en")
  
  ventas            Venta[]
  asistencias       Asistencia[]
  liquidaciones     Liquidacion[]
  
  @@map("vendedoras")
}

model Venta {
  id              Int       @id @default(autoincrement())
  fecha           DateTime  @db.Date
  hora            DateTime? @db.Time
  vendedora_id    Int
  total           Decimal   @db.Decimal(12, 2)
  estado          String    @db.VarChar(20) // 'finalizada' | 'devolucion'
  ticket_num      String?   @unique @db.VarChar(50)
  saldo_pendiente Decimal   @default(0) @db.Decimal(12, 2)
  batch_id        Int?
  
  vendedora       Vendedora @relation(fields: [vendedora_id], references: [id], onDelete: Cascade)
  items           VentaItem[]
  pagos           PagoVenta[]
  import_batch    ImportBatch? @relation(fields: [batch_id], references: [id])
  
  @@index([vendedora_id])
  @@map("ventas")
}

model VentaItem {
  id             Int     @id @default(autoincrement())
  venta_id       Int
  descripcion    String  @db.Text
  cantidad       Int
  precio_unitario Decimal @db.Decimal(12, 2)
  descuento      Decimal @default(0) @db.Decimal(12, 2)
  
  venta          Venta   @relation(fields: [venta_id], references: [id], onDelete: Cascade)
  
  @@index([venta_id])
  @@map("venta_items")
}

model PagoVenta {
  id          Int     @id @default(autoincrement())
  venta_id    Int
  metodo_pago String  @db.VarChar(20) // 'efectivo' | 'tarjeta' | 'transferencia'
  monto       Decimal @db.Decimal(12, 2)
  referencia  String? @db.VarChar(100)
  
  venta       Venta   @relation(fields: [venta_id], references: [id], onDelete: Cascade)
  
  @@index([venta_id])
  @@map("pagos_venta")
}

model Gasto {
  id             Int      @id @default(autoincrement())
  fecha          DateTime @db.Date
  monto          Decimal  @db.Decimal(12, 2)
  categoria      String   @db.VarChar(100)
  descripcion    String   @db.Text
  comprobante_url String? @db.Text
  periodo        String   @db.VarChar(7) // YYYY-MM
  creado_por     Int
  
  usuario        Usuario  @relation(fields: [creado_por], references: [id])
  
  @@index([periodo])
  @@map("gastos")
}

model Asistencia {
  id          Int      @id @default(autoincrement())
  vendedora_id Int
  fecha       DateTime @db.Date
  presente    Boolean
  motivo      String?  @db.Text
  
  vendedora   Vendedora @relation(fields: [vendedora_id], references: [id], onDelete: Cascade)
  
  @@index([fecha])
  @@map("asistencias")
}

model Liquidacion {
  id                  Int      @id @default(autoincrement())
  vendedora_id        Int
  periodo             String   @db.VarChar(7) // YYYY-MM
  sueldo_base         Decimal  @db.Decimal(12, 2)
  comisiones          Decimal  @db.Decimal(12, 2)
  presentismo_descuento Decimal @default(0) @db.Decimal(12, 2)
  bonos               Decimal  @default(0) @db.Decimal(12, 2)
  total_pagar         Decimal  @db.Decimal(12, 2)
  estado              String   @db.VarChar(20) // 'generada' | 'pagada'
  generado_por        Int
  creado_en           DateTime @default(now()) @map("creado_en")
  
  vendedora           Vendedora @relation(fields: [vendedora_id], references: [id])
  usuario             Usuario   @relation(fields: [generado_por], references: [id])
  
  @@index([periodo])
  @@map("liquidaciones")
}

model ImportBatch {
  id              Int      @id @default(autoincrement())
  usuario_id      Int
  fecha           DateTime @default(now())
  archivo_nombre  String   @db.VarChar(255)
  filas_totales   Int
  filas_importadas Int
  filas_fallidas  Int
  estado          String   @db.VarChar(20)
  
  usuario         Usuario  @relation(fields: [usuario_id], references: [id])
  ventas          Venta[]
  
  @@map("import_batches")
}

model Auditoria {
  id            Int      @id @default(autoincrement())
  entidad       String   @db.VarChar(100)
  entidad_id    Int
  accion        String   @db.VarChar(10) // 'create' | 'update' | 'delete'
  usuario_id    Int?
  timestamp     DateTime @default(now())
  datos_antes   Json?
  datos_despues Json?
  
  usuario       Usuario? @relation(fields: [usuario_id], references: [id])
  
  @@map("auditoria")
}
```

### 5.3 Sistema de Autenticación

**Endpoint de Login:**

```javascript
// routes/auth.js
const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/login', authController.login);

module.exports = router;

// controllers/authController.js
const authService = require('../services/authService');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, usuario } = await authService.login(email, password);
    res.json({ token, usuario });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// services/authService.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuariosRepository = require('../repositories/usuariosRepository');

exports.login = async (email, password) => {
  const usuario = await usuariosRepository.findByEmail(email);
  if (!usuario) {
    throw new Error('Credenciales inválidas');
  }
  
  const isValid = await bcrypt.compare(password, usuario.password_hash);
  if (!isValid) {
    throw new Error('Credenciales inválidas');
  }
  
  const token = jwt.sign(
    { id: usuario.id, email: usuario.email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  return { token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email } };
};
```

**Middleware de Autenticación:**

```javascript
// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};
```

**Aplicación del Middleware:**

```javascript
// app.js
const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/auth");
const ventasRouter = require("./routes/ventas");
const gastosRouter = require("./routes/gastos");
const { authenticateToken } = require("./middlewares/authMiddleware");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Rutas públicas
app.use("/auth", authRouter);

// Rutas protegidas
app.use("/ventas", authenticateToken, ventasRouter);
app.use("/gastos", authenticateToken, gastosRouter);
app.use("/usuarios", authenticateToken, usuariosRouter);
app.use("/vendedoras", authenticateToken, vendedorasRouter);

app.listen(3001, () => console.log("Servidor corriendo en puerto 3001"));
```

### 5.4 Migración de Datos (Opcional)

Para migrar datos existentes de JSON a PostgreSQL, se creará un script de migración:

```javascript
// scripts/migrateJsonToPostgres.js
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function migrateVentas() {
  const ventasDir = path.join(process.cwd(), 'ventas_data');
  const files = fs.readdirSync(ventasDir);
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      const ventas = JSON.parse(fs.readFileSync(path.join(ventasDir, file)));
      // Lógica de migración...
    }
  }
}
```

### 5.5 Estructura de Carpetas Final

```
backend/src/
├── app.js
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── ventasController.js
│   ├── gastosController.js
│   ├── vendedorasController.js
│   └── usuariosController.js
├── services/
│   ├── authService.js
│   ├── ventasService.js
│   ├── gastosService.js
│   └── vendedorasService.js
├── repositories/
│   ├── usuariosRepository.js
│   ├── ventasRepository.js
│   ├── gastosRepository.js
│   └── vendedorasRepository.js
├── middlewares/
│   └── authMiddleware.js
├── routes/
│   ├── auth.js
│   ├── ventas.js
│   ├── gastos.js
│   ├── vendedoras.js
│   └── usuarios.js
├── utils/
│   └── validators.js
└── generated/
    └── prisma/ (generado por Prisma)
```

### 5.6 Impacto en el Frontend

El frontend necesitará cambios mínimos:

1. **Agregar interceptor de axios para el token:**

```javascript
// frontend/src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

2. **Crear componente de Login:**

```javascript
// frontend/src/components/Login.jsx
import { useState } from 'react';
import api from '../utils/api';

export function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      onLogin(data.usuario);
    } catch (error) {
      alert('Credenciales inválidas');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}
```

### 5.7 Historias de Usuario y Tareas

**US-001: Autenticación de Usuario**
- Tarea 1.1: Crear modelo Prisma de Usuario
- Tarea 1.2: Implementar endpoint de login
- Tarea 1.3: Crear middleware de autenticación
- Tarea 1.4: Aplicar middleware a rutas protegidas
- Tarea 1.5: Crear componente de login en frontend

**US-002: Migración de Ventas a PostgreSQL**
- Tarea 2.1: Crear modelos Prisma (Venta, VentaItem, PagoVenta)
- Tarea 2.2: Crear repository de ventas
- Tarea 2.3: Crear service de ventas
- Tarea 2.4: Crear controller de ventas
- Tarea 2.5: Actualizar rutas de ventas
- Tarea 2.6: Probar endpoints de ventas

**US-003: Migración de Gastos a PostgreSQL**
- Tarea 3.1: Crear modelo Prisma de Gasto
- Tarea 3.2: Crear repository de gastos
- Tarea 3.3: Crear service de gastos
- Tarea 3.4: Crear controller de gastos
- Tarea 3.5: Actualizar rutas de gastos
- Tarea 3.6: Probar endpoints de gastos

**US-004: CRUD de Vendedoras**
- Tarea 4.1: Crear modelo Prisma de Vendedora
- Tarea 4.2: Crear repository de vendedoras
- Tarea 4.3: Crear service de vendedoras
- Tarea 4.4: Crear controller de vendedoras
- Tarea 4.5: Crear rutas de vendedoras
- Tarea 4.6: Probar CRUD completo

**US-005: Arquitectura en Capas**
- Tarea 5.1: Refactorizar módulo de ventas
- Tarea 5.2: Refactorizar módulo de gastos
- Tarea 5.3: Documentar arquitectura
- Tarea 5.4: Crear tests unitarios básicos

---

## 6. Dependencias

### Dependencias Técnicas

1. **PostgreSQL:** Debe estar instalado y corriendo (ya configurado)
2. **Prisma:** Ya instalado como devDependency, necesita generación de cliente
3. **bcrypt:** Ya instalado
4. **jsonwebtoken:** Ya instalado
5. **dotenv:** Ya instalado (necesario para variables de entorno)

### Dependencias de Desarrollo

1. **Scripts de migración:** Se necesitarán scripts para generar el cliente de Prisma
2. **Variables de entorno:** Archivo `.env` con `DATABASE_URL` y `JWT_SECRET`

### Requisitos Previos

1. Base de datos PostgreSQL creada y accesible
2. Tablas creadas según `Basededatos.txt` (ya existe)
3. Usuario inicial creado en la tabla `usuarios` (se hará manualmente)
4. Variable de entorno `JWT_SECRET` configurada

### Dependencias Bajo Control del Equipo

- ✅ Configuración de Prisma
- ✅ Implementación de código
- ✅ Estructura de carpetas
- ✅ Scripts de migración

### Dependencias Fuera de Control

- ⚠️ PostgreSQL debe estar disponible (infraestructura)
- ⚠️ Usuario inicial debe crearse manualmente (operaciones)

---

## 7. Alternativas Consideradas

### Alternativa 1: Mantener JSON y agregar autenticación

**Pros:**
- Cambios mínimos
- Implementación rápida

**Contras:**
- No resuelve problemas de integridad de datos
- No permite relaciones entre entidades
- No escala para grandes volúmenes
- Consultas complejas siguen siendo difíciles

**Decisión:** Rechazada. No resuelve los problemas fundamentales del sistema.

### Alternativa 2: Usar TypeORM en lugar de Prisma

**Pros:**
- Más maduro y establecido
- Soporte para TypeScript nativo

**Contras:**
- Más verboso
- Curva de aprendizaje más pronunciada
- Configuración más compleja

**Decisión:** Rechazada. Prisma es más simple y el equipo ya lo tiene instalado.

### Alternativa 3: Usar MongoDB en lugar de PostgreSQL

**Pros:**
- Más flexible para esquemas cambiantes
- Facilita migración desde JSON

**Contras:**
- No hay integridad referencial nativa
- Las relaciones son más complejas
- El schema ya está definido en PostgreSQL

**Decisión:** Rechazada. PostgreSQL ya está configurado y ofrece mejor integridad para datos financieros.

### Alternativa 4: Autenticación con sesiones en lugar de JWT

**Pros:**
- Más fácil de invalidar tokens
- Menos complejidad en el frontend

**Contras:**
- Requiere almacenamiento de sesiones (Redis o BD)
- Menos escalable para APIs stateless
- Más complejo para SPA

**Decisión:** Rechazada. JWT es más adecuado para APIs REST y SPA.

---

## 8. Impactos y Riesgos

### Impacto en el Equipo

**Capacidad:**
- Estimación: 3-4 semanas de desarrollo
- Requiere conocimiento de Prisma y JWT (nivel intermedio)

**Tiempo:**
- Desarrollo: 2-3 semanas
- Testing: 1 semana
- Migración de datos (opcional): 2-3 días

**Especialización:**
- Backend: Conocimiento de Prisma, JWT, arquitectura en capas
- Frontend: Manejo de tokens, interceptores de axios

### Impacto en el Producto

**Calidad:**
- ✅ Mejor integridad de datos
- ✅ Código más mantenible
- ✅ Mejor seguridad

**Funcionalidad:**
- ✅ Sin breaking changes para el frontend (misma API)
- ✅ Nuevas funcionalidades (CRUD vendedoras)

**Performance:**
- ⚠️ Consultas a BD pueden ser más lentas inicialmente (necesita optimización)
- ✅ Mejor performance en consultas complejas

**Seguridad:**
- ✅ Autenticación protege endpoints
- ✅ Contraseñas hasheadas
- ⚠️ Necesita configuración de HTTPS en producción

### Riesgos Identificados

1. **Riesgo: Migración de datos históricos**
   - **Probabilidad:** Media
   - **Impacto:** Alto
   - **Mitigación:** Crear script de migración y probarlo en ambiente de desarrollo primero

2. **Riesgo: Breaking changes no detectados**
   - **Probabilidad:** Baja
   - **Impacto:** Medio
   - **Mitigación:** Mantener misma interfaz de API, testing exhaustivo

3. **Riesgo: Performance de consultas**
   - **Probabilidad:** Media
   - **Impacto:** Medio
   - **Mitigación:** Usar índices existentes, optimizar consultas Prisma

4. **Riesgo: Token JWT comprometido**
   - **Probabilidad:** Baja
   - **Impacto:** Alto
   - **Mitigación:** Usar HTTPS, tokens con expiración corta, almacenar en localStorage de forma segura

5. **Riesgo: Falta de experiencia con Prisma**
   - **Probabilidad:** Media
   - **Impacto:** Bajo
   - **Mitigación:** Documentación de Prisma, pruebas en desarrollo

### Impacto en Roadmap y Backlog

**Roadmap:**
- Sprint 3: Enfocado en migración y autenticación
- Sprint 4: Módulos de Liquidaciones, Reportes, Asistencias (ahora factibles)

**Backlog:**
- Tareas de optimización de BD pueden agregarse después
- Sistema de roles puede agregarse en sprints futuros

---

## 9. Cronograma Aproximado

### Fase 1: Preparación (3-5 días)
- Definir modelos Prisma completos
- Generar cliente de Prisma
- Configurar variables de entorno
- Crear usuario inicial en BD

### Fase 2: Autenticación (3-5 días)
- Implementar endpoint de login
- Crear middleware de autenticación
- Proteger rutas existentes
- Crear componente de login en frontend
- Testing de autenticación

### Fase 3: Migración de Ventas (5-7 días)
- Crear repository de ventas
- Crear service de ventas
- Crear controller de ventas
- Refactorizar rutas de ventas
- Testing de endpoints de ventas
- Migración de datos (opcional)

### Fase 4: Migración de Gastos (3-5 días)
- Crear repository de gastos
- Crear service de gastos
- Crear controller de gastos
- Refactorizar rutas de gastos
- Testing de endpoints de gastos
- Migración de datos (opcional)

### Fase 5: CRUD de Vendedoras (3-5 días)
- Crear repository de vendedoras
- Crear service de vendedoras
- Crear controller de vendedoras
- Crear rutas de vendedoras
- Testing de CRUD completo

### Fase 6: Testing y Ajustes (3-5 días)
- Testing integral
- Ajustes de performance
- Documentación de código
- Revisión de código

**Total estimado: 20-32 días (4-6 semanas)**

**Sprint previsto: Sprint 3 (3-4 semanas)**

### Hitos Importantes

1. **Hito 1:** Autenticación funcionando (Semana 1)
2. **Hito 2:** Ventas migradas a PostgreSQL (Semana 2)
3. **Hito 3:** Gastos migrados a PostgreSQL (Semana 3)
4. **Hito 4:** CRUD de Vendedoras completo (Semana 3)
5. **Hito 5:** Testing completo y aprobación (Semana 4)

---

## 10. Operaciones, Mantenimiento y Soporte

### Operación

**Responsable:** Equipo de Desarrollo

**Tareas de Operación:**
- Monitoreo de conexiones a PostgreSQL
- Monitoreo de tokens JWT (tiempo de expiración)
- Backup de base de datos (configurar en producción)
- Logs de autenticación (fallos de login)

### Mantenimiento

**Tareas de Mantenimiento:**
- Actualización de dependencias (Prisma, bcrypt, jsonwebtoken)
- Optimización de consultas según uso
- Revisión de seguridad (rotación de JWT_SECRET)
- Limpieza de tokens expirados (si se implementa almacenamiento)

### Escalabilidad

**Consideraciones:**
- PostgreSQL puede escalar verticalmente y horizontalmente
- JWT es stateless, no requiere almacenamiento de sesiones
- Arquitectura en capas facilita escalamiento horizontal

### Despliegue

**Proceso:**
1. Migrar modelos Prisma a producción
2. Ejecutar migraciones de BD
3. Configurar variables de entorno
4. Desplegar backend
5. Verificar conectividad
6. Probar autenticación
7. Monitorear logs

### Rollback

**Plan de Rollback:**
- Mantener código anterior en rama separada
- Si hay problemas críticos, revertir a versión con JSON
- Restaurar backup de BD si es necesario
- Comunicar cambios al equipo

---

## 11. Seguridad / Cumplimiento / Cumplimiento Legal

### Seguridad

**Aspectos de Seguridad:**
- ✅ Contraseñas hasheadas con bcrypt (salt rounds: 10)
- ✅ Tokens JWT con expiración (24 horas)
- ✅ HTTPS en producción (requerido)
- ✅ Validación de inputs (prevenir SQL injection)
- ✅ Prisma previene SQL injection automáticamente

**Mejoras Futuras:**
- Rate limiting en endpoint de login
- Refresh tokens
- Rotación de JWT_SECRET
- Auditoría de accesos

### Cumplimiento

**Privacidad de Datos:**
- Datos financieros protegidos con autenticación
- Contraseñas nunca se almacenan en texto plano
- Tokens no contienen información sensible

**Auditoría:**
- Tabla de auditoría existe pero no se usará en este sprint
- Se puede implementar en sprints futuros

### Requisitos de Pruebas de Seguridad

- Pruebas de autenticación (token válido, inválido, expirado)
- Pruebas de autorización (acceso sin token)
- Pruebas de inyección SQL (Prisma lo previene)
- Pruebas de validación de inputs

---

## 12. Pruebas y Validación

### Estrategia de Testing

**Pruebas Unitarias:**
- Services: Lógica de negocio
- Repositories: Acceso a datos
- Middleware: Autenticación

**Pruebas de Integración:**
- Endpoints completos (routes → controllers → services → repositories)
- Autenticación + endpoints protegidos
- Transacciones de base de datos

**Pruebas Manuales:**
- Flujo completo de login
- Crear venta
- Crear gasto
- CRUD de vendedoras
- Consultas con rangos de fechas

### Criterios de Éxito

1. ✅ Todas las rutas protegidas requieren autenticación
2. ✅ Login funciona correctamente
3. ✅ Ventas se guardan en PostgreSQL
4. ✅ Gastos se guardan en PostgreSQL
5. ✅ CRUD de vendedoras funciona
6. ✅ Frontend puede autenticarse y usar la API
7. ✅ No hay breaking changes en la API (misma estructura de respuestas)
8. ✅ Performance aceptable (< 500ms para consultas simples)

### Métricas / KPIs

**Métricas Técnicas:**
- Tiempo de respuesta de endpoints (< 500ms p95)
- Tasa de errores (< 1%)
- Cobertura de código (> 60%)

**Métricas de Negocio:**
- Integridad de datos (0 inconsistencias)
- Disponibilidad de sistema (> 99%)
- Tiempo de desarrollo de nuevas funcionalidades (reducido en 30%)

---

## 13. Seguimiento Post-Implementación

### Medición de Impacto

**Métricas a Monitorear:**
- Tiempo de respuesta de consultas
- Tasa de errores
- Uso de autenticación (intentos de login, tokens generados)
- Performance de base de datos

**Período de Monitoreo:** 2 semanas post-implementación

### Acciones si no se Alcanzan Objetivos

**Si hay problemas de performance:**
- Revisar consultas Prisma
- Agregar índices adicionales
- Optimizar queries

**Si hay problemas de seguridad:**
- Revisar logs de autenticación
- Rotar JWT_SECRET
- Implementar rate limiting

**Si hay problemas de integridad:**
- Revisar transacciones
- Validar constraints de BD
- Revisar lógica de servicios

### Lecciones Aprendidas

**Documentar:**
- Problemas encontrados durante la migración
- Decisiones técnicas tomadas
- Mejoras sugeridas para futuros sprints
- Tiempo real vs. estimado

---

## 14. Historial de Revisiones

**Versión 1.0 — 2025-01-28 —** Versión inicial del RFC

---

## 15. Referencias / Anexos

### Referencias

- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de JWT](https://jwt.io/)
- [Documentación de bcrypt](https://www.npmjs.com/package/bcrypt)
- [RFC de Autenticación Básica](RFC_ARCH-T1_Implementacion_Autenticacion_Basica.docx)
- [Esquema de Base de Datos](documents/Basededatos.txt)
- [Informe de Progreso](INFORME_PROGRESO.md)

### Diagramas

**Arquitectura en Capas:**

```
┌─────────────┐
│   Frontend  │
│   (React)   │
└──────┬──────┘
       │ HTTP Request
       │ (Bearer Token)
       ▼
┌─────────────┐
│   Routes    │  ← Manejo de HTTP
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Controllers │  ← Validación, formato
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Services   │  ← Lógica de negocio
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Repositories │  ← Acceso a datos
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Prisma    │  ← ORM
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ PostgreSQL  │  ← Base de datos
└─────────────┘
```

### Variables de Entorno Necesarias

```env
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/Rendix"
JWT_SECRET="tu_secret_key_super_segura_aqui"
```

### Scripts de Package.json

```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

---

## Anexo: Ejemplo de Implementación Completa

### Estructura de un Módulo Completo (Ventas)

```javascript
// repositories/ventasRepository.js
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

class VentasRepository {
  async findByDate(fecha) {
    return await prisma.venta.findMany({
      where: { fecha: new Date(fecha) },
      include: { items: true, vendedora: true }
    });
  }
  
  async findByDateRange(fechaInicio, fechaFin) {
    return await prisma.venta.findMany({
      where: {
        fecha: {
          gte: new Date(fechaInicio),
          lte: new Date(fechaFin)
        }
      },
      include: { items: true, vendedora: true }
    });
  }
  
  async create(ventaData) {
    return await prisma.venta.create({
      data: {
        fecha: ventaData.fecha,
        hora: ventaData.hora,
        vendedora_id: ventaData.vendedora_id,
        total: ventaData.total,
        estado: ventaData.estado || 'finalizada',
        items: {
          create: ventaData.items.map(item => ({
            descripcion: item.descripcion,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            descuento: item.descuento || 0
          }))
        }
      },
      include: { items: true, vendedora: true }
    });
  }
}

module.exports = new VentasRepository();
```

```javascript
// services/ventasService.js
const ventasRepository = require('../repositories/ventasRepository');

class VentasService {
  async getVentasHoy() {
    const hoy = new Date().toISOString().split('T')[0];
    const ventas = await ventasRepository.findByDate(hoy);
    const total = ventas.reduce((sum, v) => sum + Number(v.total), 0);
    return {
      ventasHoy: ventas,
      totalHoy: total,
      cantidadHoy: ventas.length
    };
  }
  
  async getVentasPorRango(dias) {
    const fechaFin = new Date();
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - dias);
    
    const ventas = await ventasRepository.findByDateRange(
      fechaInicio.toISOString().split('T')[0],
      fechaFin.toISOString().split('T')[0]
    );
    
    const total = ventas.reduce((sum, v) => sum + Number(v.total), 0);
    return {
      ventasHoy: ventas,
      totalHoy: total,
      cantidadHoy: ventas.length
    };
  }
  
  async createVenta(ventaData) {
    // Validar datos
    if (!ventaData.productos || ventaData.productos.length === 0) {
      throw new Error('Debe incluir productos');
    }
    
    if (!ventaData.vendedora_id) {
      throw new Error('Debe especificar una vendedora');
    }
    
    // Calcular total
    const total = ventaData.productos.reduce(
      (sum, p) => sum + p.cantidad * p.precio,
      0
    );
    
    // Preparar datos para BD
    const ventaDB = {
      fecha: new Date(),
      hora: new Date(),
      vendedora_id: ventaData.vendedora_id,
      total: total,
      estado: 'finalizada',
      items: ventaData.productos.map(p => ({
        descripcion: p.nombre,
        cantidad: p.cantidad,
        precio_unitario: p.precio,
        descuento: 0
      }))
    };
    
    return await ventasRepository.create(ventaDB);
  }
}

module.exports = new VentasService();
```

```javascript
// controllers/ventasController.js
const ventasService = require('../services/ventasService');

class VentasController {
  async getVentasHoy(req, res) {
    try {
      const result = await ventasService.getVentasHoy();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  async getVentasPorRango(req, res) {
    try {
      const dias = parseInt(req.query.dias) || 30;
      const result = await ventasService.getVentasPorRango(dias);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  async createVenta(req, res) {
    try {
      const venta = await ventasService.createVenta(req.body);
      const result = await ventasService.getVentasHoy();
      res.status(201).json({
        mensaje: 'Venta registrada con éxito',
        ...result
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new VentasController();
```

```javascript
// routes/ventas.js
const express = require('express');
const ventasController = require('../controllers/ventasController');
const router = express.Router();

router.get('/hoy', ventasController.getVentasHoy.bind(ventasController));
router.get('/rango', ventasController.getVentasPorRango.bind(ventasController));
router.post('/', ventasController.createVenta.bind(ventasController));

module.exports = router;
```

---

**Fin del RFC**

