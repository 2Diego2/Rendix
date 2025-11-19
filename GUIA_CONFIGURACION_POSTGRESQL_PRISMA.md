# GUÍA: CONFIGURACIÓN DE POSTGRESQL Y PRISMA DESDE CERO

Esta guía te ayudará a configurar PostgreSQL y Prisma para el proyecto Rendix desde cero.

---

## PASO 1: INSTALAR Y CONFIGURAR POSTGRESQL

### 1.1 Instalar PostgreSQL

Si no tienes PostgreSQL instalado:

1. **Descargar PostgreSQL:**
   - Ve a: https://www.postgresql.org/download/windows/
   - Descarga el instalador para Windows
   - Ejecuta el instalador

2. **Durante la instalación:**
   - Elige un puerto (por defecto es 5432, déjalo así)
   - **IMPORTANTE:** Anota la contraseña que configures para el usuario `postgres` (la necesitarás después)
   - Completa la instalación

### 1.2 Verificar que PostgreSQL está corriendo

1. Abre **pgAdmin** (viene con PostgreSQL) o usa la línea de comandos
2. O verifica desde PowerShell:
   ```powershell
   # Verificar que el servicio está corriendo
   Get-Service -Name postgresql*
   ```

### 1.3 Crear la Base de Datos

Tienes dos opciones:

#### **Opción A: Usando pgAdmin (Interfaz Gráfica)**

1. Abre pgAdmin
2. Conéctate al servidor (usando la contraseña que configuraste)
3. Click derecho en "Databases" → "Create" → "Database"
4. Nombre: `Rendix`
5. Owner: `postgres` (o tu usuario)
6. Click "Save"

#### **Opción B: Usando línea de comandos (psql)**

1. Abre PowerShell o CMD
2. Navega a la carpeta de PostgreSQL (ej: `C:\Program Files\PostgreSQL\16\bin`)
3. Ejecuta:
   ```bash
   psql -U postgres
   ```
4. Ingresa tu contraseña cuando te la pida
5. Ejecuta:
   ```sql
   CREATE DATABASE Rendix;
   ```
6. Verifica que se creó:
   ```sql
   \l
   ```
7. Sal de psql:
   ```sql
   \q
   ```

---

## PASO 2: CREAR LAS TABLAS EN POSTGRESQL

Ya tienes las sentencias SQL en `documents/Basededatos.txt`. Tienes dos opciones:

### **Opción A: Ejecutar desde pgAdmin**

1. Abre pgAdmin
2. Conéctate a la base de datos `Rendix`
3. Click derecho en la base de datos `Rendix` → "Query Tool"
4. Copia y pega TODO el contenido de `documents/Basededatos.txt` (desde la línea 4 hasta el final)
5. Ejecuta el script (F5 o botón "Execute")
6. Verifica que las tablas se crearon:
   ```sql
   \dt
   ```

### **Opción B: Ejecutar desde línea de comandos**

1. Abre PowerShell
2. Navega a tu proyecto:
   ```powershell
   cd C:\Users\diego\OneDrive\Desktop\Rendix
   ```
3. Conéctate a PostgreSQL:
   ```bash
   psql -U postgres -d Rendix
   ```
4. Copia y pega las sentencias SQL de `Basededatos.txt`
5. Verifica:
   ```sql
   \dt
   ```

**IMPORTANTE:** Ejecuta TODAS las sentencias, incluyendo los índices al final.

---

## PASO 3: CONFIGURAR EL ARCHIVO .ENV

### 3.1 Crear el archivo .env

1. En la carpeta `backend`, crea un archivo llamado `.env` (sin extensión)
2. Agrega el siguiente contenido:

```env
# Base de datos PostgreSQL
DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA@localhost:5432/Rendix?schema=public"

# JWT Secret (genera uno aleatorio y seguro)
JWT_SECRET="tu_secret_key_super_segura_aqui_cambiala_por_algo_aleatorio"

# Puerto del servidor (opcional, ya está en app.js)
PORT=3001
```

### 3.2 Reemplazar valores:

- **`TU_CONTRASEÑA`**: La contraseña que configuraste para el usuario `postgres` durante la instalación
- **`JWT_SECRET`**: Genera una cadena aleatoria segura. Puedes usar:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

**Ejemplo de DATABASE_URL:**
```
DATABASE_URL="postgresql://postgres:kraken@localhost:5432/Rendix?schema=public"
```

### 3.3 Verificar que .env está en .gitignore

Asegúrate de que `.env` esté en `.gitignore` para no subir credenciales a Git.

---

## PASO 4: CREAR EL SCHEMA.PRISMA COMPLETO

Ya voy a crear el schema.prisma completo basado en tu `Basededatos.txt`. Este archivo define todos los modelos que Prisma usará.

---

## PASO 5: GENERAR EL CLIENTE DE PRISMA Y APLICAR MIGRACIONES

### 5.1 Instalar dependencias (si no lo has hecho)

```powershell
cd backend
npm install
```

### 5.2 Generar el cliente de Prisma

```powershell
npx prisma generate
```

Este comando lee el `schema.prisma` y genera el cliente de Prisma que usarás en tu código.

### 5.3 Verificar la conexión

```powershell
npx prisma db pull
```

Este comando sincroniza Prisma con tu base de datos existente (lee las tablas que ya creaste).

### 5.4 (Opcional) Abrir Prisma Studio

Para ver y editar datos visualmente:

```powershell
npx prisma studio
```

Esto abrirá una interfaz web en `http://localhost:5555`

---

## PASO 6: VERIFICAR QUE TODO FUNCIONA

### 6.1 Crear un script de prueba

Crea `backend/test-connection.js`:

```javascript
const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function test() {
  try {
    // Probar conexión
    await prisma.$connect();
    console.log('✅ Conectado a PostgreSQL');
    
    // Probar consulta simple
    const usuarios = await prisma.usuario.findMany();
    console.log('✅ Usuarios encontrados:', usuarios.length);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
```

### 6.2 Ejecutar la prueba

```powershell
node test-connection.js
```

Si ves "✅ Conectado a PostgreSQL", ¡todo está bien configurado!

---

## TROUBLESHOOTING (SOLUCIÓN DE PROBLEMAS)

### Error: "password authentication failed"
- Verifica que la contraseña en `.env` sea correcta
- Verifica que el usuario `postgres` exista

### Error: "database does not exist"
- Asegúrate de haber creado la base de datos `Rendix`
- Verifica el nombre en `DATABASE_URL`

### Error: "relation does not exist"
- Asegúrate de haber ejecutado TODAS las sentencias SQL de `Basededatos.txt`
- Verifica que las tablas existan con: `\dt` en psql

### Error al generar Prisma Client
- Verifica que el `schema.prisma` esté bien formateado
- Asegúrate de tener Prisma instalado: `npm install prisma --save-dev`

---

## PRÓXIMOS PASOS

Una vez que tengas todo configurado:

1. ✅ PostgreSQL instalado y corriendo
2. ✅ Base de datos `Rendix` creada
3. ✅ Tablas creadas (ejecutaste Basededatos.txt)
4. ✅ Archivo `.env` configurado
5. ✅ `schema.prisma` completo (lo voy a crear ahora)
6. ✅ Cliente de Prisma generado

Podrás empezar con la **TAREA-3.1.1** y las siguientes tareas del Sprint 3.

---

**¿Necesitas ayuda con algún paso?** Avísame y te ayudo a resolverlo.

