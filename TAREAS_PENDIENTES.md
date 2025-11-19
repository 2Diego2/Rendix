# TAREAS PENDIENTES - PROYECTO RENDIX

Este documento detalla todas las tareas pendientes del proyecto Rendix, organizadas por sprints y priorizadas según los requerimientos del sistema.

---

## SPRINT 3: MIGRACIÓN A POSTGRESQL, AUTENTICACIÓN Y ARQUITECTURA EN CAPAS

**Estado:** Pendiente - No Iniciado  
**Prioridad:** Alta  
**Objetivo:** Migrar el sistema de archivos JSON a PostgreSQL, implementar autenticación básica y establecer arquitectura en capas para mejorar la mantenibilidad del código.

### 3.1 AUTENTICACIÓN BÁSICA

#### TAREA-3.1.1: Definir Modelo Prisma de Usuario
- Crear el modelo Usuario en el schema.prisma con los campos: id, nombre, email, password_hash, rol, creado_en
- Configurar las relaciones del modelo Usuario con otras entidades (gastos, liquidaciones, import_batches)
- Aplicar migración de Prisma para crear la tabla en PostgreSQL
- Generar el cliente de Prisma

#### TAREA-3.1.2: Implementar Endpoint de Login
- Crear ruta de autenticación en `routes/auth.js`
- Crear controlador de autenticación en `controllers/authController.js`
- Crear servicio de autenticación en `services/authService.js` que:
  - Busque el usuario por email
  - Valide la contraseña usando bcrypt
  - Genere un token JWT con expiración de 24 horas
  - Retorne el token y datos del usuario (sin password_hash)
- Crear repositorio de usuarios en `repositories/usuariosRepository.js` para acceso a datos
- Configurar variable de entorno JWT_SECRET

#### TAREA-3.1.3: Crear Middleware de Autenticación
- Crear middleware en `middlewares/authMiddleware.js` que:
  - Extraiga el token del header Authorization (formato Bearer TOKEN)
  - Verifique la validez del token usando JWT
  - Agregue la información del usuario al objeto req para uso en controladores
  - Retorne error 401 si no hay token o 403 si el token es inválido

#### TAREA-3.1.4: Aplicar Middleware a Rutas Protegidas
- Modificar `app.js` para aplicar el middleware de autenticación a todas las rutas excepto `/auth/login`
- Proteger rutas de ventas, gastos, usuarios, vendedoras y futuras rutas
- Mantener la ruta de login como pública

#### TAREA-3.1.5: Crear Usuario Inicial en Base de Datos
- Crear script o instrucciones para insertar un usuario inicial en la tabla usuarios
- Hashear la contraseña usando bcrypt antes de insertar
- Documentar las credenciales iniciales de forma segura

#### TAREA-3.1.6: Implementar Componente de Login en Frontend
- Crear componente Login.jsx en el frontend
- Implementar formulario con campos email y password
- Integrar con el endpoint `/auth/login` del backend
- Almacenar el token JWT en localStorage después de login exitoso
- Redirigir al dashboard después de login exitoso
- Mostrar mensajes de error apropiados para credenciales inválidas
- Modificar App.jsx para mostrar Login si no hay token almacenado

#### TAREA-3.1.7: Configurar Interceptor de Axios en Frontend
- Crear archivo `utils/api.js` con configuración de axios
- Configurar baseURL del API
- Implementar interceptor de request que agregue el token JWT al header Authorization
- Implementar interceptor de response que maneje errores 401 (token expirado) y redirija al login
- Actualizar todos los componentes del frontend para usar este cliente de API en lugar de fetch directo

### 3.2 DEFINIR MODELOS PRISMA COMPLETOS

#### TAREA-3.2.1: Crear Modelo de Vendedora
- Definir modelo Vendedora en schema.prisma con campos: id, nombre, codigo, sueldo_base, porcentaje_comision, creado_en
- Configurar relaciones con ventas, asistencias y liquidaciones
- Aplicar migración de Prisma

#### TAREA-3.2.2: Crear Modelos de Ventas
- Definir modelo Venta con campos: id, fecha, hora, vendedora_id, total, estado, ticket_num, saldo_pendiente, batch_id
- Definir modelo VentaItem con campos: id, venta_id, descripcion, cantidad, precio_unitario, descuento
- Definir modelo PagoVenta con campos: id, venta_id, metodo_pago, monto, referencia
- Configurar relaciones entre Venta, VentaItem, PagoVenta, Vendedora e ImportBatch
- Aplicar índices en campos clave (vendedora_id, venta_id)
- Aplicar migración de Prisma

#### TAREA-3.2.3: Crear Modelo de Gasto
- Definir modelo Gasto en schema.prisma con campos: id, fecha, monto, categoria, descripcion, comprobante_url, periodo, creado_por
- Configurar relación con Usuario
- Aplicar índice en campo periodo para optimizar consultas
- Aplicar migración de Prisma

#### TAREA-3.2.4: Crear Modelos de Liquidaciones y Asistencias
- Definir modelo Liquidacion con campos: id, vendedora_id, periodo, sueldo_base, comisiones, presentismo_descuento, bonos, total_pagar, estado, generado_por, creado_en
- Definir modelo Asistencia con campos: id, vendedora_id, fecha, presente, motivo
- Configurar relaciones con Vendedora y Usuario
- Aplicar índices en campos clave (periodo, fecha)
- Aplicar migración de Prisma

#### TAREA-3.2.5: Crear Modelos de Auditoría e Importación
- Definir modelo ImportBatch con campos: id, usuario_id, fecha, archivo_nombre, filas_totales, filas_importadas, filas_fallidas, estado
- Definir modelo Auditoria con campos: id, entidad, entidad_id, accion, usuario_id, timestamp, datos_antes, datos_despues
- Configurar relaciones apropiadas
- Aplicar migración de Prisma

### 3.3 MIGRACIÓN DE VENTAS A POSTGRESQL

#### TAREA-3.3.1: Crear Repositorio de Ventas
- Crear archivo `repositories/ventasRepository.js`
- Implementar método `findByDate(fecha)` para obtener ventas de un día específico
- Implementar método `findByDateRange(fechaInicio, fechaFin)` para obtener ventas en un rango de fechas
- Implementar método `create(ventaData)` para crear una nueva venta con sus items y pagos relacionados
- Implementar método `findById(id)` para obtener una venta específica con todas sus relaciones
- Usar Prisma Client para todas las operaciones de base de datos

#### TAREA-3.3.2: Crear Servicio de Ventas
- Crear archivo `services/ventasService.js`
- Implementar método `getVentasHoy()` que obtenga ventas del día actual y calcule totales
- Implementar método `getVentasPorRango(dias)` que obtenga ventas de los últimos N días
- Implementar método `createVenta(ventaData)` que:
  - Valide que existan productos en la venta
  - Valide que exista vendedora_id
  - Calcule el total de la venta
  - Transforme los datos del frontend al formato de base de datos
  - Llame al repositorio para crear la venta
- Manejar errores y validaciones de negocio

#### TAREA-3.3.3: Crear Controlador de Ventas
- Crear archivo `controllers/ventasController.js`
- Implementar método `getVentasHoy` que maneje la petición HTTP y llame al servicio
- Implementar método `getVentasPorRango` que extraiga el parámetro `dias` de la query y llame al servicio
- Implementar método `createVenta` que valide el body de la petición y llame al servicio
- Manejar errores HTTP apropiados (400, 500, etc.)
- Formatear respuestas en el formato esperado por el frontend

#### TAREA-3.3.4: Refactorizar Rutas de Ventas
- Modificar `routes/ventas.js` para usar el controlador en lugar de lógica directa
- Eliminar código de lectura/escritura de archivos JSON
- Mantener la misma estructura de endpoints (/hoy, /rango, POST /) para no romper el frontend
- Asegurar que las respuestas mantengan el mismo formato que antes

#### TAREA-3.3.5: Actualizar Frontend para Manejar Vendedoras
- Modificar componente Ventas.jsx para incluir selector de vendedora al crear una venta
- Obtener lista de vendedoras desde el backend (endpoint a crear en TAREA-3.4)
- Incluir vendedora_id en el payload al crear una venta
- Manejar casos donde no haya vendedoras disponibles

### 3.4 MIGRACIÓN DE GASTOS A POSTGRESQL

#### TAREA-3.4.1: Crear Repositorio de Gastos
- Crear archivo `repositories/gastosRepository.js`
- Implementar método `findByDate(fecha)` para obtener gastos de un día específico
- Implementar método `findByDateRange(fechaInicio, fechaFin)` para obtener gastos en un rango de fechas
- Implementar método `create(gastoData)` para crear un nuevo gasto
- Implementar método `createMany(gastosData)` para crear múltiples gastos en una transacción
- Implementar método `deleteByDate(fecha)` para eliminar todos los gastos de un día (equivalente a reiniciar)
- Usar Prisma Client para todas las operaciones

#### TAREA-3.4.2: Crear Servicio de Gastos
- Crear archivo `services/gastosService.js`
- Implementar método `getGastosHoy()` que obtenga gastos del día actual y calcule totales
- Implementar método `getGastosPorRango(dias)` que obtenga gastos de los últimos N días
- Implementar método `createGastos(gastosData, usuarioId)` que:
  - Valide que el array de gastos no esté vacío
  - Calcule el periodo (YYYY-MM) basado en la fecha
  - Asigne el usuario que creó los gastos (creado_por)
  - Llame al repositorio para crear los gastos
- Implementar método `reiniciarGastosHoy()` que elimine todos los gastos del día actual
- Manejar errores y validaciones de negocio

#### TAREA-3.4.3: Crear Controlador de Gastos
- Crear archivo `controllers/gastosController.js`
- Implementar método `getGastosHoy` que maneje la petición HTTP y llame al servicio
- Implementar método `getGastosPorRango` que extraiga el parámetro `dias` de la query y llame al servicio
- Implementar método `createGastos` que valide el body de la petición y llame al servicio
- Implementar método `reiniciarGastosHoy` que llame al servicio para eliminar gastos del día
- Obtener el usuarioId del token JWT (req.user) para pasarlo al servicio
- Manejar errores HTTP apropiados
- Formatear respuestas en el formato esperado por el frontend

#### TAREA-3.4.4: Refactorizar Rutas de Gastos
- Modificar `routes/gastos.js` para usar el controlador en lugar de lógica directa
- Eliminar código de lectura/escritura de archivos JSON
- Mantener la misma estructura de endpoints (/hoy, /rango, POST /, DELETE /reiniciar)
- Asegurar que las respuestas mantengan el mismo formato que antes

### 3.5 CRUD DE VENDEDORAS

#### TAREA-3.5.1: Crear Repositorio de Vendedoras
- Crear archivo `repositories/vendedorasRepository.js`
- Implementar método `findAll()` para obtener todas las vendedoras
- Implementar método `findById(id)` para obtener una vendedora específica
- Implementar método `create(vendedoraData)` para crear una nueva vendedora
- Implementar método `update(id, vendedoraData)` para actualizar una vendedora existente
- Implementar método `delete(id)` para eliminar una vendedora (con validación de que no tenga ventas asociadas)
- Usar Prisma Client para todas las operaciones

#### TAREA-3.5.2: Crear Servicio de Vendedoras
- Crear archivo `services/vendedorasService.js`
- Implementar método `getAllVendedoras()` que obtenga todas las vendedoras activas
- Implementar método `getVendedoraById(id)` que obtenga una vendedora específica
- Implementar método `createVendedora(vendedoraData)` que:
  - Valide que el nombre sea obligatorio
  - Valide que sueldo_base y porcentaje_comision sean números positivos
  - Genere un código único si no se proporciona
  - Llame al repositorio para crear la vendedora
- Implementar método `updateVendedora(id, vendedoraData)` que valide y actualice datos
- Implementar método `deleteVendedora(id)` que valide que no tenga ventas asociadas antes de eliminar
- Manejar errores y validaciones de negocio

#### TAREA-3.5.3: Crear Controlador de Vendedoras
- Crear archivo `controllers/vendedorasController.js`
- Implementar método `getAll` que maneje GET /vendedoras
- Implementar método `getById` que maneje GET /vendedoras/:id
- Implementar método `create` que maneje POST /vendedoras
- Implementar método `update` que maneje PUT /vendedoras/:id
- Implementar método `delete` que maneje DELETE /vendedoras/:id
- Manejar errores HTTP apropiados
- Formatear respuestas consistentes

#### TAREA-3.5.4: Crear Rutas de Vendedoras
- Crear archivo `routes/vendedoras.js`
- Definir rutas GET /, GET /:id, POST /, PUT /:id, DELETE /:id
- Conectar rutas con el controlador
- Aplicar middleware de autenticación
- Registrar rutas en app.js

#### TAREA-3.5.5: Crear Componente de Gestión de Vendedoras en Frontend
- Crear componente Vendedoras.jsx (o agregar sección en configuración)
- Implementar lista de vendedoras con tabla
- Implementar formulario para crear nueva vendedora
- Implementar formulario para editar vendedora existente
- Implementar confirmación antes de eliminar vendedora
- Integrar con los endpoints del backend
- Agregar validaciones en el frontend

### 3.6 MIGRACIÓN DE DATOS HISTÓRICOS (OPCIONAL)

#### TAREA-3.6.1: Crear Script de Migración de Ventas
- Crear script `scripts/migrateVentasToPostgres.js`
- Leer todos los archivos JSON de la carpeta ventas_data
- Parsear cada archivo y extraer las ventas
- Transformar el formato JSON al formato de base de datos
- Asignar vendedoras por defecto o crear vendedoras temporales
- Insertar ventas en PostgreSQL usando Prisma
- Manejar errores y registrar progreso
- Crear backup de los archivos JSON antes de migrar

#### TAREA-3.6.2: Crear Script de Migración de Gastos
- Crear script `scripts/migrateGastosToPostgres.js`
- Leer todos los archivos JSON de la carpeta gastos_data
- Parsear cada archivo y extraer los gastos
- Transformar el formato JSON al formato de base de datos
- Asignar usuario por defecto (creado_por)
- Calcular periodo (YYYY-MM) basado en la fecha
- Insertar gastos en PostgreSQL usando Prisma
- Manejar errores y registrar progreso
- Crear backup de los archivos JSON antes de migrar

#### TAREA-3.6.3: Validar Integridad de Datos Migrados
- Crear script de validación que compare totales entre JSON y PostgreSQL
- Verificar que todas las ventas se migraron correctamente
- Verificar que todos los gastos se migraron correctamente
- Generar reporte de migración con estadísticas
- Documentar cualquier discrepancia encontrada

---

## SPRINT 4: MÓDULOS DE LIQUIDACIONES, REPORTES Y ASISTENCIAS

**Estado:** Pendiente  
**Prioridad:** Alta  
**Objetivo:** Implementar los módulos principales del sistema: liquidaciones de vendedoras, reportes avanzados y gestión de asistencias.

### 4.1 MÓDULO DE ASISTENCIAS

#### TAREA-4.1.1: Crear Repositorio de Asistencias
- Crear archivo `repositories/asistenciasRepository.js`
- Implementar método `findByVendedoraAndPeriodo(vendedoraId, periodo)` para obtener asistencias de una vendedora en un período
- Implementar método `findByFecha(fecha)` para obtener todas las asistencias de un día
- Implementar método `create(asistenciaData)` para registrar una asistencia
- Implementar método `update(id, asistenciaData)` para actualizar una asistencia
- Implementar método `bulkCreate(asistenciasData)` para registrar múltiples asistencias (útil para importación)
- Calcular días presentes y ausentes para un período

#### TAREA-4.1.2: Crear Servicio de Asistencias
- Crear archivo `services/asistenciasService.js`
- Implementar método `registrarAsistencia(asistenciaData)` que valide y registre una asistencia
- Implementar método `obtenerAsistenciasPorPeriodo(vendedoraId, periodo)` que retorne asistencias con estadísticas
- Implementar método `calcularPresentismo(vendedoraId, periodo)` que calcule el porcentaje de presentismo
- Implementar método `registrarAsistenciasMasivas(asistenciasData)` para importar desde archivo
- Validar que la fecha no sea futura
- Validar que la vendedora exista

#### TAREA-4.1.3: Crear Controlador de Asistencias
- Crear archivo `controllers/asistenciasController.js`
- Implementar endpoints GET /asistencias, GET /asistencias/:vendedoraId/:periodo, POST /asistencias, PUT /asistencias/:id
- Manejar parámetros de query para filtros (fecha, vendedora, período)
- Formatear respuestas con estadísticas de presentismo

#### TAREA-4.1.4: Crear Rutas de Asistencias
- Crear archivo `routes/asistencias.js`
- Definir todas las rutas necesarias
- Aplicar middleware de autenticación
- Registrar rutas en app.js

#### TAREA-4.1.5: Implementar Componente de Asistencias en Frontend
- Modificar componente Actividades.jsx o crear componente Asistencias.jsx
- Implementar calendario o tabla para registrar asistencias por día
- Mostrar estadísticas de presentismo por vendedora
- Implementar vista mensual con indicadores visuales (presente/ausente)
- Permitir editar asistencias registradas
- Implementar filtros por vendedora y período
- Integrar con los endpoints del backend

### 4.2 MÓDULO DE LIQUIDACIONES

#### TAREA-4.2.1: Crear Repositorio de Liquidaciones
- Crear archivo `repositories/liquidacionesRepository.js`
- Implementar método `findByPeriodo(periodo)` para obtener todas las liquidaciones de un período
- Implementar método `findByVendedoraAndPeriodo(vendedoraId, periodo)` para obtener liquidación específica
- Implementar método `create(liquidacionData)` para crear una liquidación
- Implementar método `update(id, liquidacionData)` para actualizar estado (marcar como pagada)
- Implementar método `findByVendedora(vendedoraId)` para obtener historial de liquidaciones

#### TAREA-4.2.2: Crear Servicio de Liquidaciones
- Crear archivo `services/liquidacionesService.js`
- Implementar método `calcularLiquidacion(vendedoraId, periodo, usuarioId)` que:
  - Obtenga el sueldo_base de la vendedora
  - Calcule comisiones basadas en ventas del período
  - Calcule descuentos por presentismo basados en asistencias
  - Aplique bonos si existen
  - Calcule el total_pagar
  - Cree el registro de liquidación
- Implementar método `generarLiquidacionesPeriodo(periodo, usuarioId)` que genere liquidaciones para todas las vendedoras
- Implementar método `marcarComoPagada(id)` que actualice el estado de la liquidación
- Validar que no exista una liquidación duplicada para el mismo período y vendedora
- Manejar casos donde no haya ventas o asistencias en el período

#### TAREA-4.2.3: Integrar Cálculo de Comisiones
- Crear método en servicio de ventas que calcule comisiones por vendedora en un período
- Considerar el porcentaje_comision de cada vendedora
- Filtrar ventas por período (fecha entre inicio y fin del período)
- Sumar totales de ventas y aplicar porcentaje de comisión

#### TAREA-4.2.4: Integrar Cálculo de Presentismo
- Crear método en servicio de asistencias que calcule descuentos por presentismo
- Definir reglas de negocio (ej: menos del 80% de asistencia = descuento del X%)
- Calcular días trabajados vs días hábiles del período
- Aplicar descuentos proporcionales al sueldo_base

#### TAREA-4.2.4: Crear Controlador de Liquidaciones
- Crear archivo `controllers/liquidacionesController.js`
- Implementar endpoint GET /liquidaciones que liste liquidaciones con filtros
- Implementar endpoint GET /liquidaciones/:vendedoraId/:periodo para obtener liquidación específica
- Implementar endpoint POST /liquidaciones/generar que genere liquidaciones para un período
- Implementar endpoint PUT /liquidaciones/:id/pagar que marque como pagada
- Obtener usuarioId del token para registrar quién generó la liquidación
- Formatear respuestas con desglose detallado (sueldo, comisiones, descuentos, total)

#### TAREA-4.2.5: Crear Rutas de Liquidaciones
- Crear archivo `routes/liquidaciones.js`
- Definir todas las rutas necesarias
- Aplicar middleware de autenticación
- Registrar rutas en app.js

#### TAREA-4.2.6: Implementar Componente de Liquidaciones en Frontend
- Modificar componente Liquidaciones.jsx para conectarlo al backend
- Implementar vista de lista de liquidaciones con filtros por período y vendedora
- Mostrar desglose detallado de cada liquidación (sueldo base, comisiones, descuentos, bonos, total)
- Implementar botón para generar liquidaciones de un período
- Implementar botón para marcar liquidación como pagada
- Mostrar estado de liquidación (generada/pagada)
- Implementar vista de historial de liquidaciones por vendedora
- Integrar con los endpoints del backend

### 4.3 MÓDULO DE REPORTES

#### TAREA-4.3.1: Crear Servicio de Reportes
- Crear archivo `services/reportesService.js`
- Implementar método `reporteVentasPorVendedora(periodo)` que agrupe ventas por vendedora
- Implementar método `reporteGastosPorCategoria(periodo)` que agrupe gastos por categoría
- Implementar método `reporteRentabilidad(periodo)` que calcule ganancia neta (ventas - gastos)
- Implementar método `reporteComisiones(periodo)` que calcule comisiones pagadas por vendedora
- Implementar método `reporteTendencias(fechaInicio, fechaFin)` que analice tendencias de ventas y gastos
- Usar repositorios existentes para obtener datos

#### TAREA-4.3.2: Crear Controlador de Reportes
- Crear archivo `controllers/reportesController.js`
- Implementar endpoint GET /reportes/ventas-por-vendedora con parámetro periodo
- Implementar endpoint GET /reportes/gastos-por-categoria con parámetro periodo
- Implementar endpoint GET /reportes/rentabilidad con parámetro periodo
- Implementar endpoint GET /reportes/comisiones con parámetro periodo
- Implementar endpoint GET /reportes/tendencias con parámetros fechaInicio y fechaFin
- Formatear respuestas en formato adecuado para gráficos y tablas

#### TAREA-4.3.3: Crear Rutas de Reportes
- Crear archivo `routes/reportes.js`
- Definir todas las rutas de reportes
- Aplicar middleware de autenticación
- Registrar rutas en app.js

#### TAREA-4.3.4: Implementar Componente de Reportes en Frontend
- Modificar componente Reportes.jsx para conectarlo al backend
- Implementar selector de período (mes, trimestre, año, rango personalizado)
- Implementar vista de reporte de ventas por vendedora con gráfico de barras
- Implementar vista de reporte de gastos por categoría con gráfico de donut o barras
- Implementar vista de reporte de rentabilidad con KPIs y gráfico de líneas
- Implementar vista de reporte de comisiones con tabla detallada
- Implementar vista de tendencias con gráficos comparativos
- Agregar botón para exportar reportes (preparar para futura implementación de PDF/Excel)
- Integrar con los endpoints del backend

---

## SPRINT 5: FUNCIONALIDADES AVANZADAS Y MEJORAS

**Estado:** Pendiente  
**Prioridad:** Media  
**Objetivo:** Agregar funcionalidades avanzadas como importación masiva, pagos de ventas, auditoría y validaciones.

### 5.1 SISTEMA DE PAGOS DE VENTAS

#### TAREA-5.1.1: Extender Repositorio de Ventas para Pagos
- Agregar métodos en `repositories/ventasRepository.js` para manejar pagos
- Implementar método `agregarPago(ventaId, pagoData)` para registrar un pago
- Implementar método `obtenerPagosPorVenta(ventaId)` para obtener todos los pagos de una venta
- Implementar método `calcularSaldoPendiente(ventaId)` que calcule la diferencia entre total y pagos realizados
- Actualizar el campo saldo_pendiente en la venta cuando se agregue un pago

#### TAREA-5.1.2: Crear Servicio de Pagos
- Crear archivo `services/pagosService.js` o extender `services/ventasService.js`
- Implementar método `registrarPago(ventaId, pagoData)` que:
  - Valide que la venta exista
  - Valide que el método de pago sea válido (efectivo, tarjeta, transferencia)
  - Valide que el monto no exceda el saldo pendiente
  - Registre el pago
  - Actualice el saldo_pendiente de la venta
- Implementar método `obtenerPagosPorVenta(ventaId)` que retorne todos los pagos con detalles

#### TAREA-5.1.3: Crear Controlador de Pagos
- Crear archivo `controllers/pagosController.js` o extender `controllers/ventasController.js`
- Implementar endpoint POST /ventas/:id/pagos para registrar un pago
- Implementar endpoint GET /ventas/:id/pagos para obtener pagos de una venta
- Validar datos de entrada
- Manejar errores (venta no encontrada, monto excedido, etc.)

#### TAREA-5.1.4: Crear Rutas de Pagos
- Agregar rutas de pagos en `routes/ventas.js` o crear `routes/pagos.js`
- Aplicar middleware de autenticación
- Registrar rutas en app.js

#### TAREA-5.1.5: Implementar UI de Pagos en Frontend
- Modificar componente Ventas.jsx para mostrar pagos de cada venta
- Implementar formulario para agregar pago a una venta
- Mostrar saldo pendiente de cada venta
- Mostrar historial de pagos por venta
- Validar que el monto no exceda el saldo pendiente

### 5.2 SISTEMA DE IMPORTACIÓN MASIVA

#### TAREA-5.2.1: Crear Servicio de Importación
- Crear archivo `services/importacionService.js`
- Implementar método `procesarArchivoCSV(archivo, usuarioId)` que:
  - Lea el archivo CSV
  - Valide el formato (columnas esperadas)
  - Procese cada fila y valide datos
  - Cree registros de ventas en lote
  - Registre el batch de importación
  - Retorne estadísticas (filas totales, importadas, fallidas)
- Manejar errores de formato y datos inválidos
- Implementar validación de vendedoras (debe existir en BD)

#### TAREA-5.2.2: Crear Controlador de Importación
- Crear archivo `controllers/importacionController.js`
- Implementar endpoint POST /importaciones/ventas que reciba archivo CSV
- Usar middleware de upload de archivos (multer)
- Validar tipo de archivo (solo CSV)
- Llamar al servicio de importación
- Retornar resultado de la importación con estadísticas

#### TAREA-5.2.3: Crear Rutas de Importación
- Crear archivo `routes/importaciones.js`
- Configurar multer para manejar upload de archivos
- Definir ruta POST /importaciones/ventas
- Aplicar middleware de autenticación
- Registrar rutas en app.js

#### TAREA-5.2.4: Implementar UI de Importación en Frontend
- Crear componente Importaciones.jsx o agregar sección en Ventas
- Implementar formulario de carga de archivo CSV
- Mostrar plantilla de formato esperado
- Mostrar progreso de importación
- Mostrar resultados (filas importadas, errores)
- Mostrar historial de importaciones realizadas

### 5.3 SISTEMA DE AUDITORÍA

#### TAREA-5.3.1: Crear Servicio de Auditoría
- Crear archivo `services/auditoriaService.js`
- Implementar método `registrarAccion(entidad, entidadId, accion, usuarioId, datosAntes, datosDespues)` que:
  - Cree registro en tabla auditoria
  - Almacene datos antes y después en formato JSON
- Implementar método `obtenerAuditoriaPorEntidad(entidad, entidadId)` para obtener historial de cambios
- Implementar método `obtenerAuditoriaPorUsuario(usuarioId, fechaInicio, fechaFin)` para obtener acciones de un usuario

#### TAREA-5.3.2: Integrar Auditoría en Servicios Existentes
- Modificar servicios de ventas, gastos, liquidaciones para registrar cambios
- Registrar creación, actualización y eliminación de registros
- Capturar datos antes y después de actualizaciones
- Registrar usuario que realizó la acción desde el token JWT

#### TAREA-5.3.3: Crear Controlador de Auditoría
- Crear archivo `controllers/auditoriaController.js`
- Implementar endpoint GET /auditoria con filtros (entidad, entidadId, usuario, fecha)
- Formatear respuestas con información legible
- Aplicar paginación para grandes volúmenes de datos

#### TAREA-5.3.4: Crear Rutas de Auditoría
- Crear archivo `routes/auditoria.js`
- Definir ruta GET /auditoria con query parameters
- Aplicar middleware de autenticación
- Registrar rutas en app.js

#### TAREA-5.3.5: Implementar UI de Auditoría en Frontend
- Crear componente Auditoria.jsx o agregar sección en configuración
- Implementar tabla de registros de auditoría con filtros
- Mostrar cambios antes/después de forma legible
- Permitir filtrar por entidad, usuario, fecha
- Mostrar detalles de cada acción de auditoría

### 5.4 VALIDACIONES Y MANEJO DE ERRORES

#### TAREA-5.4.1: Implementar Validación de Esquemas
- Instalar librería de validación (Joi o Zod)
- Crear archivo `utils/validators.js` con esquemas de validación
- Definir esquemas para: venta, gasto, vendedora, liquidación, asistencia, pago
- Validar tipos de datos, rangos, formatos (email, fechas, etc.)

#### TAREA-5.4.2: Crear Middleware de Validación
- Crear middleware `middlewares/validationMiddleware.js`
- Aplicar validación automática a rutas usando esquemas
- Retornar errores de validación en formato consistente
- Integrar con controladores existentes

#### TAREA-5.4.3: Implementar Manejo Centralizado de Errores
- Crear archivo `middlewares/errorHandler.js`
- Implementar middleware de manejo de errores global
- Capturar errores de Prisma, validación, negocio
- Formatear respuestas de error consistentes
- Registrar errores en logs
- Aplicar middleware en app.js

#### TAREA-5.4.4: Mejorar Validaciones en Frontend
- Agregar validaciones en formularios del frontend
- Validar campos requeridos, formatos, rangos
- Mostrar mensajes de error claros al usuario
- Prevenir envío de formularios inválidos

---

## SPRINT 6: OPTIMIZACIÓN Y MEJORAS DE UX

**Estado:** Pendiente  
**Prioridad:** Media-Baja  
**Objetivo:** Mejorar la experiencia de usuario, performance y agregar funcionalidades de exportación.

### 6.1 EXPORTACIÓN DE REPORTES

#### TAREA-6.1.1: Implementar Exportación a PDF
- Instalar librería para generación de PDF (pdfkit, jsPDF, o puppeteer)
- Crear servicio `services/exportacionService.js`
- Implementar método `generarPDFReporteVentas(periodo)` que genere PDF con reporte de ventas
- Implementar método `generarPDFLiquidacion(liquidacionId)` que genere PDF de liquidación
- Formatear PDFs con diseño profesional (logo, encabezados, tablas, gráficos)

#### TAREA-6.1.2: Implementar Exportación a Excel
- Instalar librería para generación de Excel (exceljs, xlsx)
- Extender servicio de exportación
- Implementar método `generarExcelReporteVentas(periodo)` que genere archivo Excel
- Implementar método `generarExcelLiquidacion(liquidacionId)` que genere archivo Excel
- Incluir múltiples hojas si es necesario (resumen, detalle)

#### TAREA-6.1.3: Crear Endpoints de Exportación
- Agregar endpoints GET /reportes/exportar/pdf y GET /reportes/exportar/excel
- Agregar endpoint GET /liquidaciones/:id/exportar/pdf
- Retornar archivos como respuesta HTTP con headers apropiados
- Aplicar autenticación

#### TAREA-6.1.4: Agregar Botones de Exportación en Frontend
- Agregar botones de exportar PDF/Excel en componente Reportes
- Agregar botón de exportar PDF en componente Liquidaciones
- Implementar descarga de archivos desde el frontend
- Mostrar indicador de carga durante la generación

### 6.2 PAGINACIÓN Y FILTROS AVANZADOS

#### TAREA-6.2.1: Implementar Paginación en Backend
- Modificar repositorios para soportar paginación (skip, take)
- Agregar parámetros de paginación en controladores (page, limit)
- Retornar metadata de paginación (total, página actual, total páginas)
- Aplicar paginación a endpoints de listado (ventas, gastos, liquidaciones, reportes)

#### TAREA-6.2.2: Implementar Búsqueda y Filtros
- Agregar parámetros de búsqueda en repositorios (buscar por texto, fecha, vendedora, etc.)
- Implementar filtros avanzados en controladores
- Agregar ordenamiento (sortBy, order)
- Aplicar a endpoints principales

#### TAREA-6.2.3: Implementar Paginación en Frontend
- Agregar componentes de paginación en tablas
- Implementar búsqueda en tiempo real
- Agregar filtros avanzados con UI intuitiva
- Mostrar información de paginación (página X de Y, total registros)

### 6.3 MEJORAS DE DASHBOARD

#### TAREA-6.3.1: Agregar Más KPIs al Dashboard
- Implementar KPI de comisiones pagadas en el período
- Implementar KPI de promedio de ventas diarias
- Implementar KPI de gastos por categoría (top 3)
- Implementar KPI de vendedoras más productivas
- Conectar todos los KPIs con datos reales del backend

#### TAREA-6.3.2: Agregar Gráficos Avanzados
- Implementar gráfico comparativo de períodos (mes actual vs mes anterior)
- Implementar gráfico de tendencia de ganancia neta
- Implementar gráfico de distribución de ventas por vendedora
- Implementar gráfico de evolución de gastos por categoría
- Usar librería de gráficos (Recharts, Chart.js)

#### TAREA-6.3.3: Agregar Widgets Interactivos
- Implementar selector de período en dashboard
- Agregar filtros rápidos (hoy, semana, mes, año)
- Implementar actualización automática de datos (refresh cada X minutos)
- Agregar exportación rápida del dashboard a PDF

### 6.4 MEJORAS DE UX

#### TAREA-6.4.1: Implementar Notificaciones
- Instalar librería de notificaciones (react-toastify, sonner)
- Agregar notificaciones de éxito al crear/actualizar registros
- Agregar notificaciones de error con mensajes claros
- Agregar notificaciones de advertencia (ej: gastos altos, liquidaciones pendientes)

#### TAREA-6.4.2: Mejorar Feedback Visual
- Agregar estados de carga (spinners, skeletons) en componentes
- Agregar confirmaciones antes de acciones destructivas (eliminar, reiniciar)
- Mejorar mensajes de error para que sean más descriptivos
- Agregar tooltips informativos en campos de formulario

#### TAREA-6.4.3: Optimizar Rendimiento Frontend
- Implementar lazy loading de componentes pesados
- Optimizar re-renders innecesarios (useMemo, useCallback)
- Implementar virtualización en listas largas
- Optimizar imágenes y assets

---

## SPRINT 7: TESTING Y DOCUMENTACIÓN

**Estado:** Pendiente  
**Prioridad:** Media  
**Objetivo:** Asegurar calidad del código mediante testing y documentación completa.

### 7.1 TESTING BACKEND

#### TAREA-7.1.1: Configurar Entorno de Testing
- Instalar Jest y dependencias de testing
- Configurar base de datos de testing (PostgreSQL separada o SQLite en memoria)
- Configurar scripts de testing en package.json
- Crear helpers de testing (setup, teardown, factories)

#### TAREA-7.1.2: Crear Tests Unitarios de Servicios
- Crear tests para `services/ventasService.js`
- Crear tests para `services/gastosService.js`
- Crear tests para `services/liquidacionesService.js`
- Crear tests para `services/asistenciasService.js`
- Crear tests para `services/authService.js`
- Cubrir casos de éxito y casos de error

#### TAREA-7.1.3: Crear Tests de Repositorios
- Crear tests para `repositories/ventasRepository.js`
- Crear tests para `repositories/gastosRepository.js`
- Crear tests para otros repositorios
- Verificar operaciones CRUD básicas

#### TAREA-7.1.4: Crear Tests de Integración
- Crear tests de endpoints completos (routes → controllers → services → repositories)
- Testear flujo de autenticación completo
- Testear creación de venta con items y pagos
- Testear generación de liquidación completa
- Usar supertest para tests HTTP

#### TAREA-7.1.5: Crear Tests de Middleware
- Crear tests para `middlewares/authMiddleware.js`
- Verificar que rechace requests sin token
- Verificar que rechace tokens inválidos
- Verificar que permita requests con token válido

### 7.2 TESTING FRONTEND

#### TAREA-7.2.1: Configurar Entorno de Testing Frontend
- Instalar React Testing Library y Jest
- Configurar mocks de API
- Configurar scripts de testing

#### TAREA-7.2.2: Crear Tests de Componentes
- Crear tests para componentes principales (Ventas, Gastos, Dashboard)
- Testear interacciones de usuario (clic, input, submit)
- Testear renderizado condicional
- Testear manejo de estados (loading, error, success)

#### TAREA-7.2.3: Crear Tests de Integración Frontend
- Crear tests E2E básicos con Cypress o Playwright
- Testear flujo completo de crear venta
- Testear flujo completo de login
- Testear navegación entre páginas

### 7.3 DOCUMENTACIÓN

#### TAREA-7.3.1: Documentar API
- Instalar Swagger/OpenAPI
- Documentar todos los endpoints con ejemplos
- Documentar esquemas de datos
- Documentar códigos de error
- Generar documentación interactiva

#### TAREA-7.3.2: Documentar Código
- Agregar JSDoc a funciones y clases principales
- Documentar decisiones de arquitectura
- Crear guía de contribución
- Documentar variables de entorno necesarias

#### TAREA-7.3.3: Crear Documentación de Usuario
- Crear manual de usuario con capturas de pantalla
- Documentar procesos principales (crear venta, generar liquidación, etc.)
- Crear FAQ
- Documentar requisitos del sistema

---

## SPRINT 8: CONFIGURACIÓN Y MANTENIMIENTO

**Estado:** Pendiente  
**Prioridad:** Baja  
**Objetivo:** Agregar funcionalidades de configuración del sistema y preparar para producción.

### 8.1 MÓDULO DE CONFIGURACIÓN

#### TAREA-8.1.1: Crear Tabla de Configuración
- Crear modelo Prisma para configuración del sistema
- Campos: clave, valor, descripcion, tipo (string, number, boolean)
- Crear migración

#### TAREA-8.1.2: Crear Servicio de Configuración
- Crear `services/configuracionService.js`
- Implementar métodos para obtener y actualizar configuraciones
- Validar tipos de datos según el tipo de configuración
- Implementar valores por defecto

#### TAREA-8.1.3: Crear Endpoints de Configuración
- Crear `controllers/configuracionController.js`
- Implementar GET /configuracion y PUT /configuracion/:clave
- Aplicar autenticación (solo administradores si se implementan roles)

#### TAREA-8.1.4: Crear UI de Configuración
- Crear componente Configuracion.jsx
- Implementar formulario para editar configuraciones
- Agregar validaciones
- Mostrar descripciones de cada configuración

### 8.2 SISTEMA DE BACKUP Y RESTAURACIÓN

#### TAREA-8.2.1: Crear Script de Backup
- Crear script que exporte datos de PostgreSQL
- Incluir todas las tablas principales
- Generar archivo con timestamp
- Configurar ejecución automática (cron job)

#### TAREA-8.2.2: Crear Script de Restauración
- Crear script que restaure desde archivo de backup
- Validar integridad de datos
- Implementar confirmación antes de restaurar

#### TAREA-8.2.3: Implementar UI de Backup
- Agregar botón de generar backup manual
- Mostrar historial de backups
- Permitir descargar backups
- Agregar funcionalidad de restauración (con confirmación)

### 8.3 OPTIMIZACIÓN DE BASE DE DATOS

#### TAREA-8.3.1: Analizar Performance de Consultas
- Identificar consultas lentas usando EXPLAIN ANALYZE
- Revisar índices existentes
- Identificar consultas N+1

#### TAREA-8.3.2: Agregar Índices Adicionales
- Agregar índices en campos frecuentemente consultados
- Agregar índices compuestos donde sea necesario
- Crear migraciones de Prisma para nuevos índices

#### TAREA-8.3.3: Optimizar Consultas Prisma
- Revisar uso de include vs select
- Implementar paginación eficiente
- Optimizar consultas con agregaciones

### 8.4 PREPARACIÓN PARA PRODUCCIÓN

#### TAREA-8.4.1: Configurar Variables de Entorno
- Documentar todas las variables de entorno necesarias
- Crear archivo .env.example
- Configurar diferentes entornos (desarrollo, staging, producción)

#### TAREA-8.4.2: Implementar Logging
- Instalar librería de logging (winston, pino)
- Configurar niveles de log
- Registrar operaciones críticas (login, creación de ventas, liquidaciones)
- Configurar rotación de logs

#### TAREA-8.4.3: Implementar Monitoreo
- Configurar health check endpoint
- Agregar métricas básicas (tiempo de respuesta, errores)
- Configurar alertas para errores críticos

#### TAREA-8.4.4: Configurar HTTPS y Seguridad
- Configurar HTTPS en producción
- Implementar rate limiting en endpoints críticos
- Configurar CORS apropiadamente
- Revisar headers de seguridad

---

## BACKLOG ADICIONAL (Futuras Mejoras)

**Estado:** Pendiente  
**Prioridad:** Baja  
**Nota:** Estas tareas pueden implementarse según necesidades futuras del negocio.

### MEJORAS DE SEGURIDAD
- Implementar sistema de roles y permisos (más allá de usuario único)
- Implementar refresh tokens para JWT
- Implementar recuperación de contraseña
- Implementar autenticación de dos factores (2FA)
- Implementar rate limiting más sofisticado
- Agregar validación de CSRF tokens

### FUNCIONALIDADES ADICIONALES
- Implementar sistema de notificaciones push
- Implementar chat o sistema de mensajería interna
- Agregar funcionalidad de recordatorios automáticos
- Implementar sistema de metas y objetivos para vendedoras
- Agregar funcionalidad de inventario de productos
- Implementar sistema de clientes frecuentes

### MEJORAS TÉCNICAS
- Migrar frontend a TypeScript
- Implementar sistema de caché (Redis)
- Implementar cola de trabajos para procesos pesados
- Agregar soporte para múltiples idiomas (i18n)
- Implementar modo offline con sincronización
- Agregar soporte para aplicaciones móviles (React Native)

### INTEGRACIONES
- Integrar con sistemas de contabilidad externos
- Integrar con sistemas de pago (Mercado Pago, Stripe)
- Integrar con sistemas de email (envío de reportes automáticos)
- Integrar con sistemas de SMS para notificaciones

---

## NOTAS FINALES

- **Priorización:** Las tareas están organizadas por sprints según prioridad y dependencias. El Sprint 3 es crítico y debe completarse antes de avanzar a otros sprints.

- **Dependencias:** Muchas tareas del Sprint 4 dependen de la finalización del Sprint 3 (migración a PostgreSQL y autenticación).

- **Estimación:** Cada sprint está estimado para durar entre 2-4 semanas dependiendo de la complejidad y el equipo disponible.

- **Testing:** Se recomienda implementar testing desde el Sprint 5 en adelante, pero puede iniciarse antes si hay tiempo disponible.

- **Documentación:** La documentación puede desarrollarse en paralelo con el desarrollo, pero el Sprint 7 está dedicado exclusivamente a completarla.

---

**Última actualización:** 2025-01-28  
**Versión del documento:** 1.0

