# OSUNA

**Plataforma interna de gestión de proyectos tipo Asana para Impressive Studio.**

OSUNA organiza el trabajo de la agencia en una jerarquía clara — **equipos → proyectos → secciones → tareas → subtareas** — y permite ver el mismo trabajo en múltiples formatos (lista, tablero, calendario, cronograma, dashboard), automatizar tareas repetitivas con reglas, y dar visibilidad a nivel de portafolio y objetivos a la dirección.

Construido a partir del PRD v1.0 de Impressive Studio.

## Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** para la UI
- **Zustand** (con persistencia en `localStorage`) como store del "grafo de trabajo"
- **@dnd-kit** para drag & drop en el tablero Kanban
- **lucide-react** para íconos

> El MVP corre 100% en el cliente con datos sembrados (seed) y persistencia local, por lo que despliega en Vercel sin necesidad de backend ni base de datos. El modelo de datos ya usa una relación **tarea↔proyecto muchos-a-muchos** (multi-homing) para poder migrar a PostgreSQL sin rehacer el esquema.

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
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Atajos de teclado

- `c` — crear tarea/proyecto rápido
- `⌘K` / `Ctrl+K` — búsqueda global

## Despliegue en Vercel

1. Importa el repositorio en [vercel.com/new](https://vercel.com/new).
2. Framework: **Next.js** (detección automática). No se requieren variables de entorno.
3. Deploy.

Para restaurar los datos de demostración: **Administración → Restaurar demo**.

## Estructura

```
src/
  app/            # rutas (App Router): home, my-tasks, inbox, reports,
                  # portfolios, goals, admin, automations, project/[id]
  components/     # AppShell, Sidebar, Topbar, modales y vistas
    views/        # ListView, BoardView, CalendarView, TimelineView, DashboardView
  lib/
    types.ts      # modelo de datos (grafo de trabajo)
    seed.ts       # datos de demostración
    store.ts      # store Zustand + motor de reglas
    ui-store.ts   # estado de UI (modales)
    utils.ts      # helpers (fechas, prioridades, salud)
```

## Próximos pasos (roadmap del PRD)

- Backend real (NestJS/FastAPI + PostgreSQL) y websockets para colaboración en vivo
- Autenticación y RBAC avanzado
- Integraciones (Google Drive, Gmail, GoHighLevel, webhooks)
- IA / Smart Workflows
