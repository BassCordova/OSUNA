// Forma serializable del "grafo de trabajo" que se guarda en el backend (JSONB)
// y que hidrata el store en el cliente. Server-safe (sin "use client").

import * as seed from "./seed";
import type {
  User, Team, Project, Section, Task, CustomField, Notification,
  Portfolio, Goal, Rule, IntakeForm, ID,
} from "./types";

export interface WorkspaceData {
  currentUserId: ID;
  users: User[];
  teams: Team[];
  projects: Project[];
  sections: Section[];
  tasks: Task[];
  customFields: CustomField[];
  notifications: Notification[];
  portfolios: Portfolio[];
  goals: Goal[];
  rules: Rule[];
  forms: IntakeForm[];
}

export const WORKSPACE_KEYS: (keyof WorkspaceData)[] = [
  "currentUserId", "users", "teams", "projects", "sections", "tasks",
  "customFields", "notifications", "portfolios", "goals", "rules", "forms",
];

export function defaultWorkspaceData(): WorkspaceData {
  // Copia profunda para evitar mutar la seed compartida
  return JSON.parse(JSON.stringify({
    currentUserId: seed.CURRENT_USER_ID,
    users: seed.users,
    teams: seed.teams,
    projects: seed.projects,
    sections: seed.sections,
    tasks: seed.tasks,
    customFields: seed.customFields,
    notifications: seed.notifications,
    portfolios: seed.portfolios,
    goals: seed.goals,
    rules: seed.rules,
    forms: seed.forms,
  }));
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Crea el workspace inicial de un usuario recién registrado: parte de la demo,
// pero reemplaza la identidad del usuario "u1" (admin/director) por la real.
export function seedWorkspaceForUser(name: string, email: string): WorkspaceData {
  const data = defaultWorkspaceData();
  const me = data.users.find((u) => u.id === "u1");
  if (me) {
    me.name = name;
    me.email = email;
    me.initials = initialsFrom(name);
  }
  return data;
}

// Extrae solo las claves de datos desde el estado del store o un objeto recibido
export function pickWorkspaceData(state: Partial<WorkspaceData>): WorkspaceData {
  return {
    currentUserId: state.currentUserId ?? defaultWorkspaceData().currentUserId,
    users: state.users ?? [],
    teams: state.teams ?? [],
    projects: state.projects ?? [],
    sections: state.sections ?? [],
    tasks: state.tasks ?? [],
    customFields: state.customFields ?? [],
    notifications: state.notifications ?? [],
    portfolios: state.portfolios ?? [],
    goals: state.goals ?? [],
    rules: state.rules ?? [],
    forms: state.forms ?? [],
  };
}
