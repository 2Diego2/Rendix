# 🚀 PASOS RÁPIDOS PARA EMPEZAR

## ✅ CHECKLIST DE CONFIGURACIÓN

Sigue estos pasos en orden:

### 1️⃣ INSTALAR POSTGRESQL (si no lo tienes)
- Descarga desde: https://www.postgresql.org/download/windows/
- Durante la instalación, **anota la contraseña** del usuario `postgres`
- Completa la instalación

### 2️⃣ CREAR LA BASE DE DATOS
Abre **pgAdmin** o **psql** y ejecuta:
```sql
CREATE DATABASE Rendix;
```

### 3️⃣ CREAR LAS TABLAS
Ejecuta TODAS las sentencias SQL de `documents/Basededatos.txt` en la base de datos `Rendix`.

**Desde pgAdmin:**
1. Click derecho en base de datos `Rendix` → Query Tool
2. Pega todo el contenido de `Basededatos.txt` (desde línea 4)
3. Ejecuta (F5)

**Desde psql:**
```bash
psql -U postgres -d Rendix
```
Luego pega las sentencias SQL.

### 4️⃣ CREAR ARCHIVO .ENV
En la carpeta `backend`, crea un archivo `.env` con:

```env
DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA@localhost:5432/Rendix?schema=public"
JWT_SECRET="genera_un_secreto_aleatorio_aqui"
PORT=3001
```

**Reemplaza:**
- `TU_CONTRASEÑA` → La contraseña de PostgreSQL que configuraste
- `JWT_SECRET` → Genera uno con: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 5️⃣ GENERAR CLIENTE DE PRISMA
```powershell
cd backend
npx prisma generate
```

### 6️⃣ VERIFICAR CONEXIÓN
```powershell
node test-connection.js
```

Si ves "✅ Conectado a PostgreSQL exitosamente", ¡todo está bien!

---

## 📝 NOTAS IMPORTANTES

- **La base de datos está bien diseñada** según `Basededatos.txt` ✅
- **El schema.prisma ya está creado** y coincide con tu BD ✅
- **No necesitas cambiar nada en PostgreSQL** si ya ejecutaste las sentencias SQL ✅

---

## 🎯 PRÓXIMO PASO

Una vez que todo esté configurado, puedes empezar con:
- **TAREA-3.1.1**: Ya está hecha (schema.prisma creado)
- **TAREA-3.1.2**: Implementar endpoint de login

---

## ❓ ¿PROBLEMAS?

Revisa `GUIA_CONFIGURACION_POSTGRESQL_PRISMA.md` para más detalles y troubleshooting.

