import type {
  User, Team, Project, Section, Task, CustomField, Notification,
  Portfolio, Goal, Rule, IntakeForm,
} from "./types";

// Fechas relativas a hoy para que la demo siempre se vea viva
const day = 86400000;
const now = Date.now();
const iso = (offsetDays: number) => new Date(now + offsetDays * day).toISOString();
const date = (offsetDays: number) =>
  new Date(now + offsetDays * day).toISOString().slice(0, 10);

export const users: User[] = [
  { id: "u1", name: "Bastián Córdova", email: "basti@impressive.studio", initials: "BC", avatarColor: "#6b46e5", role: "admin", jobTitle: "Director", department: "Dirección", active: true, timezone: "America/Santiago" },
  { id: "u2", name: "Valentina Rojas", email: "vale@impressive.studio", initials: "VR", avatarColor: "#e5466b", role: "member", jobTitle: "Project Manager", department: "Operaciones", active: true, timezone: "America/Santiago" },
  { id: "u3", name: "Matías Fuentes", email: "matias@impressive.studio", initials: "MF", avatarColor: "#46a5e5", role: "member", jobTitle: "Editor de Video", department: "Producción", active: true, timezone: "America/Santiago" },
  { id: "u4", name: "Camila Soto", email: "camila@impressive.studio", initials: "CS", avatarColor: "#2bb673", role: "member", jobTitle: "Diseñadora", department: "Creativo", active: true, timezone: "America/Santiago" },
  { id: "u5", name: "Tomás Herrera", email: "tomas@impressive.studio", initials: "TH", avatarColor: "#f59e0b", role: "member", jobTitle: "Desarrollador", department: "Tecnología", active: true, timezone: "America/Santiago" },
  { id: "u6", name: "Javiera Núñez", email: "javi@impressive.studio", initials: "JN", avatarColor: "#8b5cf6", role: "member", jobTitle: "Ads Manager", department: "Marketing", active: true, timezone: "America/Santiago" },
  { id: "u7", name: "Cliente — Aurora Café", email: "contacto@auroracafe.cl", initials: "AC", avatarColor: "#64748b", role: "guest", jobTitle: "Cliente", active: true, timezone: "America/Santiago" },
];

export const CURRENT_USER_ID = "u1";

export const teams: Team[] = [
  { id: "t1", name: "Producción Audiovisual", description: "Video, fotografía y postproducción", memberIds: ["u1", "u2", "u3", "u4"], privacy: "public", color: "#6b46e5" },
  { id: "t2", name: "Marketing & Ads", description: "Performance, Meta Ads y contenido", memberIds: ["u1", "u2", "u6"], privacy: "public", color: "#e5466b" },
  { id: "t3", name: "Desarrollo Web", description: "Sitios, landings y agentes IA", memberIds: ["u1", "u5"], privacy: "public", color: "#46a5e5" },
];

export const customFields: CustomField[] = [
  {
    id: "cf1", name: "Etapa de producción", type: "single_select",
    options: [
      { id: "cf1o1", label: "Preproducción", color: "#94a3b8" },
      { id: "cf1o2", label: "Rodaje", color: "#f59e0b" },
      { id: "cf1o3", label: "Edición", color: "#46a5e5" },
      { id: "cf1o4", label: "Revisión cliente", color: "#8b5cf6" },
      { id: "cf1o5", label: "Entregado", color: "#2bb673" },
    ],
  },
  {
    id: "cf2", name: "Tipo de entregable", type: "single_select",
    options: [
      { id: "cf2o1", label: "Reel", color: "#e5466b" },
      { id: "cf2o2", label: "Video largo", color: "#6b46e5" },
      { id: "cf2o3", label: "Foto", color: "#46a5e5" },
      { id: "cf2o4", label: "Diseño", color: "#2bb673" },
    ],
  },
  { id: "cf3", name: "Cliente", type: "text" },
  { id: "cf4", name: "Horas estimadas", type: "number" },
];

export const projects: Project[] = [
  {
    id: "p1", name: "Campaña Aurora Café — Lanzamiento", description: "Producción de contenido para el lanzamiento de la nueva línea de café de especialidad.",
    teamId: "t1", color: "#6b46e5", icon: "Clapperboard", status: "active", privacy: "public",
    defaultView: "board", startDate: date(-10), endDate: date(20), ownerId: "u2",
    memberIds: ["u1", "u2", "u3", "u4", "u7"], favorite: true, customFieldIds: ["cf1", "cf2", "cf3", "cf4"],
    statusUpdates: [
      { id: "su1", health: "at_risk", summary: "Rodaje completado, edición en curso. Posible retraso por feedback del cliente.", authorId: "u2", createdAt: iso(-2) },
    ],
  },
  {
    id: "p2", name: "Meta Ads — Q3 Performance", description: "Gestión y optimización de campañas de Meta Ads para clientes del trimestre.",
    teamId: "t2", color: "#e5466b", icon: "Megaphone", status: "active", privacy: "public",
    defaultView: "list", startDate: date(-20), endDate: date(40), ownerId: "u6",
    memberIds: ["u1", "u2", "u6"], favorite: true, customFieldIds: ["cf3", "cf4"],
    statusUpdates: [
      { id: "su2", health: "on_track", summary: "ROAS por encima del objetivo en 3 de 4 cuentas.", authorId: "u6", createdAt: iso(-1) },
    ],
  },
  {
    id: "p3", name: "Sitio Web — Estudio 2026", description: "Rediseño del sitio corporativo con portafolio interactivo.",
    teamId: "t3", color: "#46a5e5", icon: "Globe", status: "active", privacy: "private",
    defaultView: "board", startDate: date(-5), endDate: date(45), ownerId: "u5",
    memberIds: ["u1", "u5"], favorite: false, customFieldIds: ["cf4"],
    statusUpdates: [],
  },
];

export const sections: Section[] = [
  { id: "s1", name: "Backlog", order: 0, projectId: "p1" },
  { id: "s2", name: "En progreso", order: 1, projectId: "p1" },
  { id: "s3", name: "Revisión", order: 2, projectId: "p1" },
  { id: "s4", name: "Completado", order: 3, projectId: "p1" },
  { id: "s5", name: "Por hacer", order: 0, projectId: "p2" },
  { id: "s6", name: "Optimizando", order: 1, projectId: "p2" },
  { id: "s7", name: "Listo", order: 2, projectId: "p2" },
  { id: "s8", name: "Diseño", order: 0, projectId: "p3" },
  { id: "s9", name: "Desarrollo", order: 1, projectId: "p3" },
  { id: "s10", name: "QA", order: 2, projectId: "p3" },
];

let taskCounter = 0;
const mkTask = (t: Partial<Task> & { name: string; memberships: Task["memberships"] }): Task => ({
  id: `task${++taskCounter}`,
  name: t.name,
  description: t.description ?? "",
  assigneeId: t.assigneeId,
  followerIds: t.followerIds ?? [],
  startDate: t.startDate,
  dueDate: t.dueDate,
  completed: t.completed ?? false,
  completedAt: t.completedAt,
  memberships: t.memberships,
  parentId: t.parentId,
  subtaskIds: t.subtaskIds ?? [],
  priority: t.priority,
  tags: t.tags ?? [],
  isMilestone: t.isMilestone ?? false,
  isApproval: t.isApproval ?? false,
  approvalStatus: t.approvalStatus,
  customFieldValues: t.customFieldValues ?? {},
  blockedByIds: t.blockedByIds ?? [],
  blockingIds: t.blockingIds ?? [],
  comments: t.comments ?? [],
  attachments: t.attachments ?? [],
  activity: t.activity ?? [],
  createdAt: t.createdAt ?? iso(-3),
  order: t.order ?? 0,
});

export const tasks: Task[] = [
  mkTask({ name: "Guion y storyboard del reel principal", assigneeId: "u2", dueDate: date(-1), priority: "high",
    memberships: [{ projectId: "p1", sectionId: "s4" }], completed: true, completedAt: iso(-2),
    customFieldValues: { cf1: "cf1o1", cf2: "cf2o1", cf3: "Aurora Café", cf4: 6 }, order: 0,
    comments: [{ id: "c1", authorId: "u3", body: "Aprobado, listo para rodaje 👍", createdAt: iso(-2) }] }),
  mkTask({ name: "Rodaje en locación — cafetería centro", assigneeId: "u3", dueDate: date(0), priority: "urgent",
    memberships: [{ projectId: "p1", sectionId: "s2" }], followerIds: ["u1", "u2"],
    customFieldValues: { cf1: "cf1o2", cf2: "cf2o1", cf3: "Aurora Café", cf4: 8 }, order: 0,
    tags: ["rodaje"],
    subtaskIds: ["task20", "task21"],
    comments: [{ id: "c2", authorId: "u2", body: "@Matías Fuentes confirmar permisos de locación", createdAt: iso(-1) }] }),
  mkTask({ name: "Edición del reel — corte v1", assigneeId: "u3", dueDate: date(2), priority: "high",
    memberships: [{ projectId: "p1", sectionId: "s2" }], blockedByIds: ["task2"],
    customFieldValues: { cf1: "cf1o3", cf2: "cf2o1", cf3: "Aurora Café", cf4: 10 }, order: 1 }),
  mkTask({ name: "Diseño de placas y lower-thirds", assigneeId: "u4", dueDate: date(3), priority: "medium",
    memberships: [{ projectId: "p1", sectionId: "s2" }],
    customFieldValues: { cf1: "cf1o3", cf2: "cf2o4", cf3: "Aurora Café", cf4: 4 }, order: 2 }),
  mkTask({ name: "Aprobación del cliente — corte final", assigneeId: "u7", dueDate: date(5), priority: "high",
    memberships: [{ projectId: "p1", sectionId: "s3" }], isApproval: true, approvalStatus: "pending",
    customFieldValues: { cf1: "cf1o4", cf2: "cf2o1", cf3: "Aurora Café" }, order: 0 }),
  mkTask({ name: "Entrega final y archivo de proyecto", assigneeId: "u2", dueDate: date(8), priority: "medium",
    memberships: [{ projectId: "p1", sectionId: "s1" }], isMilestone: true,
    customFieldValues: { cf1: "cf1o5", cf3: "Aurora Café" }, order: 0 }),
  mkTask({ name: "Sesión de fotos de producto", assigneeId: "u3", dueDate: date(4), priority: "medium",
    memberships: [{ projectId: "p1", sectionId: "s1" }],
    customFieldValues: { cf2: "cf2o3", cf3: "Aurora Café", cf4: 5 }, order: 1 }),

  // p2 — Meta Ads
  mkTask({ name: "Auditoría de cuentas publicitarias", assigneeId: "u6", dueDate: date(-2), priority: "high",
    memberships: [{ projectId: "p2", sectionId: "s7" }], completed: true, completedAt: iso(-3),
    customFieldValues: { cf3: "Varios", cf4: 4 }, order: 0 }),
  mkTask({ name: "Crear públicos personalizados (lookalike)", assigneeId: "u6", dueDate: date(1), priority: "high",
    memberships: [{ projectId: "p2", sectionId: "s6" }],
    customFieldValues: { cf3: "Aurora Café", cf4: 3 }, order: 0 }),
  mkTask({ name: "Diseñar creatividades para A/B testing", assigneeId: "u4", dueDate: date(2), priority: "medium",
    memberships: [{ projectId: "p2", sectionId: "s6" }, { projectId: "p1", sectionId: "s1" }], // multi-homing
    customFieldValues: { cf3: "Aurora Café", cf4: 6 }, order: 1 }),
  mkTask({ name: "Configurar campaña de conversión", assigneeId: "u6", dueDate: date(3), priority: "urgent",
    memberships: [{ projectId: "p2", sectionId: "s5" }],
    customFieldValues: { cf3: "Aurora Café", cf4: 2 }, order: 0 }),
  mkTask({ name: "Reporte semanal de performance", assigneeId: "u6", dueDate: date(6), priority: "low",
    memberships: [{ projectId: "p2", sectionId: "s5" }], isMilestone: true, order: 1 }),

  // p3 — Web
  mkTask({ name: "Wireframes de home y portafolio", assigneeId: "u4", dueDate: date(1), priority: "high",
    memberships: [{ projectId: "p3", sectionId: "s8" }],
    customFieldValues: { cf4: 8 }, order: 0 }),
  mkTask({ name: "Diseño UI en Figma", assigneeId: "u4", dueDate: date(5), priority: "medium",
    memberships: [{ projectId: "p3", sectionId: "s8" }], blockedByIds: ["task13"],
    customFieldValues: { cf4: 16 }, order: 1 }),
  mkTask({ name: "Setup Next.js + Tailwind", assigneeId: "u5", dueDate: date(2), priority: "high",
    memberships: [{ projectId: "p3", sectionId: "s9" }],
    customFieldValues: { cf4: 4 }, order: 0 }),
  mkTask({ name: "Integrar CMS para portafolio", assigneeId: "u5", dueDate: date(10), priority: "medium",
    memberships: [{ projectId: "p3", sectionId: "s9" }],
    customFieldValues: { cf4: 12 }, order: 1 }),
  mkTask({ name: "Pruebas responsive y cross-browser", assigneeId: "u5", dueDate: date(15), priority: "low",
    memberships: [{ projectId: "p3", sectionId: "s10" }], order: 0 }),
  mkTask({ name: "Lanzamiento sitio web", assigneeId: "u1", dueDate: date(20), priority: "high",
    memberships: [{ projectId: "p3", sectionId: "s10" }], isMilestone: true, order: 1 }),

  // Tarea asignada al usuario actual (para My Tasks)
  mkTask({ name: "Revisar presupuesto trimestral del estudio", assigneeId: "u1", dueDate: date(0), priority: "high",
    memberships: [{ projectId: "p2", sectionId: "s5" }], order: 2, tags: ["dirección"] }),
  mkTask({ name: "Reunión con cliente Aurora Café", assigneeId: "u1", dueDate: date(1), priority: "medium",
    memberships: [{ projectId: "p1", sectionId: "s1" }], order: 2, tags: ["reunión"] }),

  // Subtareas de "Rodaje en locación" (task2)
  mkTask({ name: "Confirmar permisos de locación", assigneeId: "u2", dueDate: date(-1), priority: "high",
    memberships: [{ projectId: "p1", sectionId: "s2" }], parentId: "task2", order: 0 }),
  mkTask({ name: "Preparar equipo de iluminación", assigneeId: "u3", dueDate: date(0), priority: "medium",
    memberships: [{ projectId: "p1", sectionId: "s2" }], parentId: "task2", order: 1 }),
];

export const notifications: Notification[] = [
  { id: "n1", kind: "assigned", userId: "u1", actorId: "u2", taskId: "task18", projectId: "p2", text: "te asignó «Revisar presupuesto trimestral del estudio»", createdAt: iso(-0.2), read: false, archived: false },
  { id: "n2", kind: "mention", userId: "u1", actorId: "u2", taskId: "task2", projectId: "p1", text: "te mencionó en «Rodaje en locación — cafetería centro»", createdAt: iso(-0.5), read: false, archived: false },
  { id: "n3", kind: "approval", userId: "u1", actorId: "u2", taskId: "task5", projectId: "p1", text: "solicita tu aprobación en «Aprobación del cliente — corte final»", createdAt: iso(-1), read: false, archived: false },
  { id: "n4", kind: "comment", userId: "u1", actorId: "u3", taskId: "task1", projectId: "p1", text: "comentó en «Guion y storyboard del reel principal»", createdAt: iso(-2), read: true, archived: false },
  { id: "n5", kind: "status_change", userId: "u1", actorId: "u6", projectId: "p2", text: "publicó una actualización de estado en «Meta Ads — Q3 Performance»", createdAt: iso(-1), read: true, archived: false },
];

export const portfolios: Portfolio[] = [
  { id: "pf1", name: "Clientes activos 2026", ownerId: "u1", projectIds: ["p1", "p2"] },
  { id: "pf2", name: "Proyectos internos", ownerId: "u1", projectIds: ["p3"] },
];

export const goals: Goal[] = [
  { id: "g1", title: "Crecer ingresos del estudio 30% en 2026", description: "Objetivo anual de la dirección", level: "organization", ownerId: "u1", metricLabel: "Ingresos anuales", targetValue: 130, currentValue: 78, unit: "M CLP", period: "2026", linkedProjectIds: ["p1", "p2"] },
  { id: "g2", title: "Entregar 50 producciones audiovisuales", level: "team", ownerId: "u2", metricLabel: "Producciones entregadas", targetValue: 50, currentValue: 31, unit: "videos", period: "2026", parentId: "g1", linkedProjectIds: ["p1"] },
  { id: "g3", title: "ROAS promedio 4x en campañas de clientes", level: "team", ownerId: "u6", metricLabel: "ROAS promedio", targetValue: 4, currentValue: 4.3, unit: "x", period: "Q3 2026", parentId: "g1", linkedProjectIds: ["p2"] },
];

export const rules: Rule[] = [
  {
    id: "r1", projectId: "p1", name: "Asignar revisiones a la PM", enabled: true,
    trigger: { type: "moved_to_section", sectionId: "s3" },
    actions: [
      { type: "assign_to", userId: "u2" },
      { type: "set_priority", priority: "high" },
    ],
  },
  {
    id: "r2", projectId: "p2", name: "Nuevas tareas → prioridad media", enabled: true,
    trigger: { type: "task_created" },
    actions: [{ type: "set_priority", priority: "medium" }],
  },
];

export const forms: IntakeForm[] = [
  {
    id: "f1", projectId: "p1", title: "Brief de nueva producción", targetSectionId: "s1",
    description: "Solicita una nueva producción audiovisual. El equipo lo revisará en 24h.",
    fields: [
      { id: "ff1", label: "Nombre del proyecto / pedido", type: "text", required: true, mapsTo: "name" },
      { id: "ff2", label: "Describe lo que necesitas", type: "textarea", required: true, mapsTo: "description" },
      { id: "ff3", label: "Prioridad", type: "select", required: false, options: ["low", "medium", "high", "urgent"], mapsTo: "priority" },
    ],
  },
];
