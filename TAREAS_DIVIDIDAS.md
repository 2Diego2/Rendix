

--diego
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

--diego

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

--fran 
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

--diego
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

--fran 
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

--fran 
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
