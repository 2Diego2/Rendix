## OBJETIVO DEL PROYECTO:
Crear un sistema de gestión integral para un negocio de ropa (Rendix) que permita administrar ventas, gastos, liquidaciones de vendedoras, reportes y actividades. El sistema incluirá un dashboard con visualizaciones, autenticación de usuarios, y gestión completa de operaciones comerciales y de recursos humanos.

---

## SPRINT 1 (Completado)
* [TAREA-001]: Configurar el entorno de desarrollo y el repositorio (backend con Express, frontend con React + Vite).
* [TAREA-002]: Definir la arquitectura inicial del proyecto (carpetas backend: routes, controllers, services, repositories, middlewares, models, config, utils).
* [TAREA-003]: Conectar la base de datos PostgreSQL y configurar Prisma (configuración de conexión en db.js, schema Prisma básico).
* [TAREA-004]: Crear el esquema de base de datos completo (tablas: usuarios, vendedoras, ventas, venta_items, pagos_venta, gastos, asistencias, liquidaciones, auditoria, import_batches).
* [TAREA-005]: Implementar el frontend básico con React (estructura de componentes, routing interno, Sidebar, Header).
* [TAREA-006]: Configurar el sistema de temas (modo claro/oscuro) con persistencia en localStorage.
* [TAREA-007]: Crear el componente Dashboard con estructura básica y diseño responsive.
* [TAREA-008]: Implementar sistema de filtros por rango de días (Context API para estado global del filtro).

---

## SPRINT 2 (Completado)
* [TAREA-009]: Implementar el CRUD básico de Ventas usando archivos JSON temporales (GET /ventas/hoy, GET /ventas/rango, POST /ventas).
* [TAREA-010]: Implementar el CRUD básico de Gastos usando archivos JSON temporales (GET /gastos/hoy, GET /gastos/rango, POST /gastos, DELETE /gastos/reiniciar).
* [TAREA-011]: Crear los componentes frontend de Ventas (formulario de nueva venta, lista de ventas del día, totales).
* [TAREA-012]: Crear los componentes frontend de Gastos (formulario de gastos por categoría: Fijo, Variable, Adicional, tabla de registros).
* [TAREA-013]: Implementar el Dashboard con KPIs dinámicos (Ganancia Neta, Ventas Totales, Gastos Totales, Ticket Promedio).
* [TAREA-014]: Integrar gráficos en el Dashboard usando Recharts (gráfico de líneas para tendencia ventas/gastos, gráfico de donut para gastos por categoría).
* [TAREA-015]: Implementar visualización de datos históricos en el Dashboard (últimos gastos, tendencias por rango de días).
* [TAREA-016]: Crear componentes de UI base (Liquidaciones, Reportes, Actividades) con datos mock para estructura visual.

---

## SPRINT 3 (Pendiente - No Iniciado)
**ESTADO ACTUAL:** Las tareas del SPRINT 3 NO están implementadas. Solo existe la preparación inicial (dependencias instaladas, RFC creado, conexión a BD configurada pero no utilizada).

* **(TO DO)** ARCH-T1: Implementación de Autenticación Básica (Usuario Único) - Solo dependencias instaladas (bcrypt, jsonwebtoken) y RFC creado. NO hay código implementado.
* **(TO DO)** ARCH-T1.1: Crear el modelo de Usuario e implementar el endpoint de login para generar un token JWT - NO implementado.
* **(TO DO)** ARCH-T1.2: Implementar un middleware de Autenticación para verificar el token JWT en cada solicitud - NO implementado (carpeta middlewares vacía).
* **(TO DO)** ARCH-T1.3: Aplicar el middleware de autenticación a todas las rutas de la API (excepto /login) - NO implementado.
* **(TO DO)** MIG-001: Migrar el sistema de almacenamiento de Ventas de archivos JSON a PostgreSQL usando Prisma - NO implementado (ventas.js aún usa fs.readFileSync/fs.writeFileSync).
* **(TO DO)** MIG-002: Migrar el sistema de almacenamiento de Gastos de archivos JSON a PostgreSQL usando Prisma - NO implementado (gastos.js aún usa fs.readFileSync/fs.writeFileSync).
* **(TO DO)** ARCH-T2.1: Implementar la arquitectura en capas (controllers, services, repositories) para el módulo de Ventas - NO implementado (carpetas vacías, lógica directamente en routes/ventas.js).
* **(TO DO)** ARCH-T2.2: Implementar la arquitectura en capas (controllers, services, repositories) para el módulo de Gastos - NO implementado (carpetas vacías, lógica directamente en routes/gastos.js).
* **(TO DO)** ARCH-T3.1: Crear el modelo Prisma completo basado en el schema de Basededatos.txt - NO implementado (schema.prisma solo tiene configuración básica, sin modelos definidos).
* **(TO DO)** VEND-001: Implementar el CRUD completo de Vendedoras - NO implementado (no hay rutas ni código relacionado).
* **(TO DO)** LIQ-001: Implementar el módulo de Liquidaciones conectado al backend - NO implementado (componente frontend tiene datos mock hardcodeados, sin llamadas a API).
* **(TO DO)** REP-001: Implementar el módulo de Reportes con generación de reportes desde datos reales - NO implementado (componente frontend tiene datos mock hardcodeados, sin llamadas a API).
* **(TO DO)** ACT-001: Implementar el módulo de Actividades conectado al backend - NO implementado (componente frontend tiene datos mock hardcodeados, sin llamadas a API).
* **(DONE)** ARCH-T1.0: Crear el RFC de autenticación (RFC_ARCH-T1_Implementacion_Autenticacion_Basica.docx).
* **(DONE)** UI-001: Crear componentes de UI para Liquidaciones, Reportes y Actividades con estructura base (solo UI, sin conexión al backend).
* **(DONE)** DB-001: Configurar la conexión a PostgreSQL (db.js configurado, pero solo se usa en routes/usuarios.js para GET /usuarios, no para ventas/gastos).

---

## BACKLOG (Lo que falta - Sprints Futuros)
* [TAREA-100]: Implementar el sistema de importación de ventas masivas (import_batches, procesamiento de archivos CSV/Excel).
* [TAREA-101]: Crear endpoints para gestión de Vendedoras (CRUD completo, cálculo de comisiones por período).
* [TAREA-102]: Implementar el módulo de Asistencias (registro de asistencia de vendedoras, cálculo de presentismo).
* [TAREA-103]: Implementar el cálculo automático de Liquidaciones (sueldo base + comisiones - descuentos por presentismo + bonos).
* [TAREA-104]: Crear el sistema de Pagos de Ventas (registro de métodos de pago: efectivo, tarjeta, transferencia).
* [TAREA-105]: Implementar el sistema de Auditoría (registro de cambios en entidades críticas: ventas, gastos, liquidaciones).
* [TAREA-106]: Crear endpoints para Reportes avanzados (reportes de ventas por vendedora, reportes de gastos por categoría, reportes de rentabilidad).
* [TAREA-107]: Implementar exportación de reportes a PDF y Excel.
* [TAREA-108]: Crear el sistema de gestión de Actividades (registro de actividades de vendedoras, capacitaciones, evaluaciones).
* [TAREA-109]: Implementar validaciones de datos en el backend (validación de esquemas con Joi o Zod).
* [TAREA-110]: Crear pruebas unitarias y de integración para los módulos principales.
* [TAREA-111]: Implementar manejo de errores centralizado en el backend.
* [TAREA-112]: Crear sistema de logging para operaciones críticas.
* [TAREA-113]: Implementar paginación en endpoints de listado (ventas, gastos, liquidaciones).
* [TAREA-114]: Crear sistema de búsqueda y filtros avanzados en el frontend.
* [TAREA-115]: Implementar gráficos avanzados en el Dashboard (comparativas por período, análisis de tendencias).
* [TAREA-116]: Crear el módulo de configuración de la aplicación (ajustes de negocio, parámetros de cálculo).
* [TAREA-117]: Implementar sistema de notificaciones (alertas de gastos altos, recordatorios de liquidaciones).
* [TAREA-118]: Crear el módulo de gestión de usuarios y roles (si se extiende más allá de usuario único).
* [TAREA-119]: Implementar sistema de backup y restauración de datos.
* [TAREA-120]: Optimizar consultas a la base de datos (índices, consultas eficientes).
* [TAREA-121]: Implementar sistema de caché para consultas frecuentes.
* [TAREA-122]: Crear documentación de la API (Swagger/OpenAPI).
* [TAREA-123]: Implementar sistema de versionado de API.
* [TAREA-124]: Crear sistema de métricas y monitoreo de la aplicación.

