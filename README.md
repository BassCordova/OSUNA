# OSUNA

**Plataforma interna de gestión de proyectos tipo Asana para Impressive Studio.**

OSUNA organiza el trabajo de la agencia en una jerarquía clara — **equipos → proyectos → secciones → tareas → subtareas** — y permite ver el mismo trabajo en múltiples formatos (lista, tablero, calendario, cronograma, dashboard), automatizar tareas repetitivas con reglas, y dar visibilidad a nivel de portafolio y objetivos a la dirección.

Construido a partir del PRD v1.0 de Impressive Studio.

## Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** para la UI
- **PostgreSQL** + **Prisma** como base de datos (backend en API Routes de Next.js)
- **Auth.js (NextAuth v5)** con email + contraseña (multi-cuenta, sesiones JWT)
- **Zustand** como store del "grafo de trabajo", **autoguardado** en el backend
- **@dnd-kit** para drag & drop en el tablero Kanban
- **lucide-react** para íconos

> Todo el trabajo (tareas, comentarios, notas, estados, objetivos, etc.) se guarda en el servidor: cada usuario tiene su **workspace** propio que se autoguarda con debounce ante cada cambio y se recarga al volver a entrar, desde cualquier dispositivo. El modelo de datos usa una relación **tarea↔proyecto muchos-a-muchos** (multi-homing).

## Backend y persistencia

- `prisma/schema.prisma`: tablas `User` y `Workspace` (un workspace por usuario; el grafo de trabajo se guarda en una columna `JSONB`).
- `src/app/api/register`: alta de cuenta (hash de contraseña con bcrypt) + siembra del workspace.
- `src/app/api/auth/[...nextauth]`: login/logout (Auth.js, credenciales).
- `src/app/api/workspace`: `GET` carga el grafo de trabajo del usuario autenticado; `PUT` lo guarda.
- `src/components/WorkspaceSync.tsx`: carga inicial + autoguardado (debounce 700 ms). El indicador "Guardando…/Guardado" vive en la barra superior.

## Configuración (variables de entorno)

Copia `.env.example` a `.env` y completa:

```bash
DATABASE_URL=postgresql://usuario:password@host/db?sslmode=require
AUTH_SECRET=   # genera uno con: openssl rand -base64 32
```

## Funcionalidades implementadas

**Fase 1 (MVP)**
- Jerarquía equipos → proyectos → secciones → tareas → subtareas
- Tareas con asignado, fechas, descripción, prioridad, comentarios, actividad, adjuntos
- Vistas **Lista** y **Tablero (Kanban)** con drag & drop
- **Mis tareas** (agrupadas por fecha: Hoy / Próximas / Más adelante, o por proyecto)
- **Bandeja de entrada** (notificaciones: asignaciones, menciones, comentarios, aprobaciones)
- Usuarios y roles (admin / miembro / invitado / solo lectura), consola de **Administración**
- **Búsqueda global** (⌘K) y campos personalizados (desplegable, número, texto, persona)

**Fase 2/3 (incluidas a nivel funcional)**
- Vistas **Calendario** y **Cronograma (Gantt)** con dependencias visuales
- **Multi-homing** de tareas (una tarea en varios proyectos)
- **Reglas de automatización** (disparador → acción) con motor determinístico
- **Formularios de intake** que generan tareas y disparan reglas
- **Dashboards** con gráficos (donut de avance, carga por sección/persona)
- **Status updates** (verde / amarillo / rojo + historial)
- **Portafolios** con progreso y salud agregados
- **Objetivos (Goals)** con sub-objetivos y proyectos vinculados
- **Carga de trabajo (Workload)** en Reportes

## Desarrollo local

```bash
npm install
# con DATABASE_URL ya configurada en .env, crea las tablas:
npm run db:push
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000), crea una cuenta en **/register** y empieza.

## Atajos de teclado

- `c` — crear tarea/proyecto rápido
- `⌘K` / `Ctrl+K` — búsqueda global

## Despliegue en Vercel

1. **Crea una base de datos PostgreSQL.** Lo más rápido:
   - En el dashboard de Vercel → pestaña **Storage** → **Create Database** → **Postgres** (o **Neon**). Vercel inyecta las variables automáticamente.
   - O usa [Neon](https://neon.tech) gratis y copia su connection string (la "pooled").
2. **Configura las variables de entorno** del proyecto en Vercel (Settings → Environment Variables):
   - `DATABASE_URL` → la cadena de conexión de tu Postgres.
     (Si usaste la integración de Vercel Postgres, crea `DATABASE_URL` apuntando al valor de `POSTGRES_PRISMA_URL`.)
   - `AUTH_SECRET` → resultado de `openssl rand -base64 32`.
3. **Vuelve a desplegar** (Redeploy). El build crea las tablas automáticamente (`prisma db push`) y publica la app.
4. Entra al link, ve a **/register**, crea tu cuenta y listo: todo queda guardado en la base de datos.

> El build no falla si aún no configuras `DATABASE_URL` (se omite la creación de tablas), pero la app necesita la base de datos para registrar/iniciar sesión y guardar. Configúrala antes de usarla.

Para restaurar los datos de demostración de tu workspace: **Administración → Restaurar demo**.

## Estructura

```
prisma/
  schema.prisma   # tablas User y Workspace (PostgreSQL)
scripts/
  db-setup.mjs    # crea/sincroniza tablas en el build de Vercel
src/
  app/
    (auth)/       # login y register (sin shell)
    (app)/        # app protegida: home, my-tasks, inbox, reports,
                  # portfolios, goals, admin, automations, project/[id]
    api/          # register, auth/[...nextauth], workspace (GET/PUT)
  components/     # AppShell, Sidebar, Topbar, WorkspaceSync, modales y vistas
    views/        # ListView, BoardView, CalendarView, TimelineView, DashboardView
  lib/
    types.ts      # modelo de datos (grafo de trabajo)
    seed.ts       # datos de demostración
    workspace.ts  # forma serializable del workspace (servidor + cliente)
    store.ts      # store Zustand + motor de reglas + sync
    db.ts         # cliente Prisma (singleton)
    auth.ts       # configuración de Auth.js (NextAuth)
    ui-store.ts   # estado de UI (modales)
    utils.ts      # helpers (fechas, prioridades, salud)
```

## Próximos pasos (roadmap del PRD)

- Backend real (NestJS/FastAPI + PostgreSQL) y websockets para colaboración en vivo
- Autenticación y RBAC avanzado
- Integraciones (Google Drive, Gmail, GoHighLevel, webhooks)
- IA / Smart Workflows
