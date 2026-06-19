"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import type {
  User, Team, Project, Section, Task, CustomField, Notification,
  Portfolio, Goal, Rule, IntakeForm, ID, Comment, TaskMembership, Priority,
  StatusUpdate, HealthColor, GlobalRole, GoalLevel,
} from "./types";
import * as seed from "./seed";
import { defaultWorkspaceData, pickWorkspaceData, type WorkspaceData } from "./workspace";

interface State {
  hydrated: boolean;
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

  // selectors
  currentUser: () => User;
  userById: (id?: ID) => User | undefined;
  projectById: (id: ID) => Project | undefined;
  sectionsOf: (projectId: ID) => Section[];
  tasksOf: (projectId: ID) => Task[];
  tasksInSection: (sectionId: ID) => Task[];
  myTasks: () => Task[];
  subtasksOf: (taskId: ID) => Task[];

  // task actions
  createTask: (input: Partial<Task> & { name: string; projectId: ID; sectionId: ID }) => Task;
  updateTask: (id: ID, patch: Partial<Task>) => void;
  toggleComplete: (id: ID) => void;
  deleteTask: (id: ID) => void;
  moveTask: (taskId: ID, toSectionId: ID, toIndex?: number) => void;
  addToProject: (taskId: ID, projectId: ID, sectionId: ID) => void;
  addComment: (taskId: ID, body: string) => void;
  addSubtask: (parentId: ID, name: string) => void;

  // project / section actions
  createProject: (input: { name: string; teamId: ID; color?: string; description?: string }) => Project;
  updateProject: (id: ID, patch: Partial<Project>) => void;
  archiveProject: (id: ID) => void;
  deleteProject: (id: ID) => void;
  addSection: (projectId: ID, name: string) => Section;
  renameSection: (sectionId: ID, name: string) => void;
  deleteSection: (sectionId: ID) => void;
  toggleFavorite: (projectId: ID) => void;
  publishStatusUpdate: (projectId: ID, health: HealthColor, summary: string) => void;

  // campos personalizados (biblioteca + asignación a proyecto)
  createCustomField: (input: { name: string; type: CustomField["type"]; options?: string[] }) => CustomField;
  updateCustomField: (id: ID, patch: Partial<CustomField>) => void;
  deleteCustomField: (id: ID) => void;
  setProjectFields: (projectId: ID, fieldIds: ID[]) => void;

  // dependencias entre tareas
  addDependency: (taskId: ID, blockedById: ID) => void;
  removeDependency: (taskId: ID, blockedById: ID) => void;

  // portfolios
  createPortfolio: (input: { name: string; projectIds?: ID[] }) => Portfolio;
  updatePortfolio: (id: ID, patch: Partial<Portfolio>) => void;
  deletePortfolio: (id: ID) => void;
  addProjectToPortfolio: (portfolioId: ID, projectId: ID) => void;
  removeProjectFromPortfolio: (portfolioId: ID, projectId: ID) => void;

  // users / equipo
  addUser: (input: { name: string; email: string; role?: GlobalRole; jobTitle?: string; department?: string }) => User;
  updateUser: (id: ID, patch: Partial<User>) => void;
  deleteUser: (id: ID) => void;

  // teams
  createTeam: (input: { name: string; description?: string; color?: string }) => Team;
  updateTeam: (id: ID, patch: Partial<Team>) => void;
  deleteTeam: (id: ID) => void;
  addTeamMember: (teamId: ID, userId: ID) => void;
  removeTeamMember: (teamId: ID, userId: ID) => void;

  // goals
  createGoal: (input: { title: string; level: GoalLevel; metricLabel?: string; targetValue?: number; unit?: string; period?: string }) => Goal;
  updateGoal: (id: ID, patch: Partial<Goal>) => void;
  deleteGoal: (id: ID) => void;

  // notifications
  markNotificationRead: (id: ID) => void;
  markAllRead: () => void;
  archiveNotification: (id: ID) => void;

  // goals
  updateGoalProgress: (goalId: ID, currentValue: number) => void;

  // rules
  toggleRule: (ruleId: ID) => void;
  createRule: (rule: Omit<Rule, "id">) => void;

  // forms
  submitForm: (formId: ID, values: Record<string, string>) => void;

  resetDemo: () => void;

  // sincronización con el backend
  applyServerState: (data: WorkspaceData) => void;
  snapshot: () => WorkspaceData;
}

const seedState = () => ({
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
});

const nowISO = () => new Date().toISOString();

export const useStore = create<State>()(
    (set, get) => ({
      hydrated: false,
      ...seedState(),

      currentUser: () => {
        const s = get();
        return s.users.find((u) => u.id === s.currentUserId) || s.users[0];
      },
      userById: (id) => get().users.find((u) => u.id === id),
      projectById: (id) => get().projects.find((p) => p.id === id),
      sectionsOf: (projectId) =>
        get().sections.filter((s) => s.projectId === projectId).sort((a, b) => a.order - b.order),
      tasksOf: (projectId) =>
        get().tasks.filter((t) => !t.parentId && t.memberships.some((m) => m.projectId === projectId)),
      tasksInSection: (sectionId) =>
        get().tasks
          .filter((t) => !t.parentId && t.memberships.some((m) => m.sectionId === sectionId))
          .sort((a, b) => a.order - b.order),
      myTasks: () => {
        const s = get();
        return s.tasks.filter((t) => !t.parentId && t.assigneeId === s.currentUserId);
      },
      subtasksOf: (taskId) =>
        get().tasks.filter((t) => t.parentId === taskId).sort((a, b) => a.order - b.order),

      createTask: (input) => {
        const { projectId, sectionId, ...rest } = input;
        const order = get().tasksInSection(sectionId).length;
        const task: Task = {
          id: `task_${nanoid(8)}`,
          name: input.name,
          description: rest.description ?? "",
          assigneeId: rest.assigneeId,
          followerIds: rest.followerIds ?? [],
          startDate: rest.startDate,
          dueDate: rest.dueDate,
          completed: false,
          memberships: [{ projectId, sectionId }],
          subtaskIds: [],
          priority: rest.priority,
          tags: rest.tags ?? [],
          isMilestone: rest.isMilestone ?? false,
          isApproval: rest.isApproval ?? false,
          customFieldValues: rest.customFieldValues ?? {},
          blockedByIds: [],
          blockingIds: [],
          comments: [],
          attachments: [],
          activity: [{ id: nanoid(6), actorId: get().currentUserId, text: "creó la tarea", createdAt: nowISO() }],
          createdAt: nowISO(),
          order,
        };
        set((s) => ({ tasks: [...s.tasks, task] }));
        runRules(get, set, task.id, { type: "task_created", projectId });
        if (task.assigneeId && task.assigneeId !== get().currentUserId) {
          pushNotification(set, get, {
            kind: "assigned", userId: task.assigneeId, taskId: task.id, projectId,
            text: `te asignó «${task.name}»`,
          });
        }
        return task;
      },

      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      toggleComplete: (id) => {
        const t = get().tasks.find((x) => x.id === id);
        if (!t) return;
        const completed = !t.completed;
        set((s) => ({
          tasks: s.tasks.map((x) =>
            x.id === id
              ? {
                  ...x,
                  completed,
                  completedAt: completed ? nowISO() : undefined,
                  activity: [
                    ...x.activity,
                    { id: nanoid(6), actorId: s.currentUserId, text: completed ? "completó la tarea" : "reabrió la tarea", createdAt: nowISO() },
                  ],
                }
              : x
          ),
        }));
        if (completed) {
          runRules(get, set, id, { type: "task_completed" });
          // liberar dependencias bloqueadas
          const blocking = get().tasks.find((x) => x.id === id)?.blockingIds ?? [];
          blocking.forEach((bid) => {
            const bt = get().tasks.find((x) => x.id === bid);
            if (bt?.assigneeId) {
              pushNotification(set, get, {
                kind: "status_change", userId: bt.assigneeId, taskId: bid,
                text: `desbloqueó «${bt.name}» (se completó una dependencia)`,
              });
            }
          });
        }
      },

      deleteTask: (id) =>
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id && t.parentId !== id),
        })),

      moveTask: (taskId, toSectionId, toIndex) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task) return;
        const toSection = get().sections.find((s) => s.id === toSectionId);
        if (!toSection) return;
        const fromMembership = task.memberships.find((m) =>
          get().sections.find((s) => s.id === m.sectionId)?.projectId === toSection.projectId
        );
        const newMemberships: TaskMembership[] = task.memberships.map((m) =>
          m === fromMembership ? { ...m, sectionId: toSectionId } : m
        );
        if (!fromMembership) newMemberships.push({ projectId: toSection.projectId, sectionId: toSectionId });

        // reordenar dentro de la sección destino
        const siblings = get()
          .tasksInSection(toSectionId)
          .filter((t) => t.id !== taskId);
        const idx = toIndex ?? siblings.length;
        siblings.splice(idx, 0, { ...task, memberships: newMemberships });

        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id === taskId) return { ...t, memberships: newMemberships };
            return t;
          }),
        }));
        set((s) => ({
          tasks: s.tasks.map((t) => {
            const pos = siblings.findIndex((x) => x.id === t.id);
            return pos >= 0 ? { ...t, order: pos } : t;
          }),
        }));
        runRules(get, set, taskId, { type: "moved_to_section", sectionId: toSectionId });
      },

      addToProject: (taskId, projectId, sectionId) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId && !t.memberships.some((m) => m.projectId === projectId)
              ? { ...t, memberships: [...t.memberships, { projectId, sectionId }] }
              : t
          ),
        })),

      addComment: (taskId, body) => {
        const comment: Comment = { id: nanoid(8), authorId: get().currentUserId, body, createdAt: nowISO() };
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t
          ),
        }));
        // @menciones → notificación
        const task = get().tasks.find((t) => t.id === taskId);
        get().users.forEach((u) => {
          if (body.includes(`@${u.name}`) && u.id !== get().currentUserId) {
            pushNotification(set, get, {
              kind: "mention", userId: u.id, taskId,
              text: `te mencionó en «${task?.name}»`,
            });
          }
        });
      },

      addSubtask: (parentId, name) => {
        const parent = get().tasks.find((t) => t.id === parentId);
        if (!parent) return;
        const membership = parent.memberships[0];
        const sub: Task = {
          id: `task_${nanoid(8)}`, name, followerIds: [], completed: false,
          memberships: membership ? [membership] : [], parentId, subtaskIds: [],
          tags: [], isMilestone: false, isApproval: false, customFieldValues: {},
          blockedByIds: [], blockingIds: [], comments: [], attachments: [],
          activity: [], createdAt: nowISO(), order: get().subtasksOf(parentId).length,
        };
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === parentId ? { ...t, subtaskIds: [...t.subtaskIds, sub.id] } : t
          ).concat(sub),
        }));
      },

      createProject: (input) => {
        const id = `p_${nanoid(8)}`;
        const project: Project = {
          id, name: input.name, teamId: input.teamId, description: input.description,
          color: input.color ?? "#6b46e5", icon: "Folder", status: "active",
          privacy: "public", defaultView: "board", ownerId: get().currentUserId,
          memberIds: [get().currentUserId], customFieldIds: [], statusUpdates: [],
        };
        const baseSections: Section[] = ["Por hacer", "En progreso", "Completado"].map((name, i) => ({
          id: `s_${nanoid(8)}`, name, order: i, projectId: id,
        }));
        set((s) => ({ projects: [...s.projects, project], sections: [...s.sections, ...baseSections] }));
        return project;
      },

      updateProject: (id, patch) =>
        set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),

      archiveProject: (id) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, status: p.status === "archived" ? "active" : "archived" } : p)),
        })),

      deleteProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          sections: s.sections.filter((sec) => sec.projectId !== id),
          // quitar la pertenencia de tareas a este proyecto; eliminar tareas que queden sin proyecto
          tasks: s.tasks
            .map((t) => ({ ...t, memberships: t.memberships.filter((m) => m.projectId !== id) }))
            .filter((t) => t.memberships.length > 0 || !!t.parentId),
          portfolios: s.portfolios.map((pf) => ({ ...pf, projectIds: pf.projectIds.filter((pid) => pid !== id) })),
        })),

      createPortfolio: (input) => {
        const portfolio: Portfolio = {
          id: `pf_${nanoid(8)}`, name: input.name, ownerId: get().currentUserId,
          projectIds: input.projectIds ?? [],
        };
        set((s) => ({ portfolios: [...s.portfolios, portfolio] }));
        return portfolio;
      },

      updatePortfolio: (id, patch) =>
        set((s) => ({ portfolios: s.portfolios.map((pf) => (pf.id === id ? { ...pf, ...patch } : pf)) })),

      deletePortfolio: (id) =>
        set((s) => ({ portfolios: s.portfolios.filter((pf) => pf.id !== id) })),

      addProjectToPortfolio: (portfolioId, projectId) =>
        set((s) => ({
          portfolios: s.portfolios.map((pf) =>
            pf.id === portfolioId && !pf.projectIds.includes(projectId)
              ? { ...pf, projectIds: [...pf.projectIds, projectId] }
              : pf
          ),
        })),

      removeProjectFromPortfolio: (portfolioId, projectId) =>
        set((s) => ({
          portfolios: s.portfolios.map((pf) =>
            pf.id === portfolioId ? { ...pf, projectIds: pf.projectIds.filter((id) => id !== projectId) } : pf
          ),
        })),

      addUser: (input) => {
        const initials = input.name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
        const palette = ["#6b46e5", "#e5466b", "#46a5e5", "#2bb673", "#f59e0b", "#8b5cf6", "#0ea5e9", "#ec4899"];
        const user: User = {
          id: `u_${nanoid(8)}`, name: input.name, email: input.email,
          initials, avatarColor: palette[get().users.length % palette.length],
          role: input.role ?? "member", jobTitle: input.jobTitle, department: input.department,
          active: true, timezone: "America/Santiago",
        };
        set((s) => ({ users: [...s.users, user] }));
        return user;
      },

      updateUser: (id, patch) =>
        set((s) => ({
          users: s.users.map((u) => {
            if (u.id !== id) return u;
            const next = { ...u, ...patch };
            if (patch.name) {
              next.initials = patch.name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || u.initials;
            }
            return next;
          }),
        })),

      deleteUser: (id) => {
        if (id === get().currentUserId) return; // no eliminar tu propia identidad
        set((s) => ({
          users: s.users.filter((u) => u.id !== id),
          // desasignar tareas y quitar de seguidores
          tasks: s.tasks.map((t) => ({
            ...t,
            assigneeId: t.assigneeId === id ? undefined : t.assigneeId,
            followerIds: t.followerIds.filter((fid) => fid !== id),
          })),
          teams: s.teams.map((t) => ({ ...t, memberIds: t.memberIds.filter((mid) => mid !== id) })),
          projects: s.projects.map((p) => ({ ...p, memberIds: p.memberIds.filter((mid) => mid !== id) })),
        }));
      },

      createTeam: (input) => {
        const palette = ["#6b46e5", "#e5466b", "#46a5e5", "#2bb673", "#f59e0b"];
        const team: Team = {
          id: `t_${nanoid(8)}`, name: input.name, description: input.description,
          memberIds: [get().currentUserId], privacy: "public",
          color: input.color ?? palette[get().teams.length % palette.length],
        };
        set((s) => ({ teams: [...s.teams, team] }));
        return team;
      },

      updateTeam: (id, patch) =>
        set((s) => ({ teams: s.teams.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),

      deleteTeam: (id) => {
        const teams = get().teams;
        if (teams.length <= 1) return; // siempre debe quedar al menos un equipo
        const fallback = teams.find((t) => t.id !== id);
        if (!fallback) return;
        set((s) => ({
          teams: s.teams.filter((t) => t.id !== id),
          // los proyectos del equipo eliminado pasan al primer equipo restante
          projects: s.projects.map((p) => (p.teamId === id ? { ...p, teamId: fallback.id } : p)),
        }));
      },

      addTeamMember: (teamId, userId) =>
        set((s) => ({
          teams: s.teams.map((t) =>
            t.id === teamId && !t.memberIds.includes(userId) ? { ...t, memberIds: [...t.memberIds, userId] } : t
          ),
        })),

      removeTeamMember: (teamId, userId) =>
        set((s) => ({
          teams: s.teams.map((t) =>
            t.id === teamId ? { ...t, memberIds: t.memberIds.filter((id) => id !== userId) } : t
          ),
        })),

      createGoal: (input) => {
        const goal: Goal = {
          id: `g_${nanoid(8)}`, title: input.title, level: input.level,
          ownerId: get().currentUserId, metricLabel: input.metricLabel ?? "Progreso",
          targetValue: input.targetValue ?? 100, currentValue: 0, unit: input.unit ?? "%",
          period: input.period ?? String(new Date().getFullYear()), linkedProjectIds: [],
        };
        set((s) => ({ goals: [...s.goals, goal] }));
        return goal;
      },

      updateGoal: (id, patch) =>
        set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),

      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id && g.parentId !== id) })),

      addSection: (projectId, name) => {
        const section: Section = {
          id: `s_${nanoid(8)}`, name, projectId,
          order: get().sectionsOf(projectId).length,
        };
        set((s) => ({ sections: [...s.sections, section] }));
        return section;
      },

      renameSection: (sectionId, name) =>
        set((s) => ({ sections: s.sections.map((x) => (x.id === sectionId ? { ...x, name } : x)) })),

      deleteSection: (sectionId) =>
        set((s) => ({
          sections: s.sections.filter((x) => x.id !== sectionId),
          tasks: s.tasks.map((t) => ({
            ...t,
            memberships: t.memberships.filter((m) => m.sectionId !== sectionId),
          })).filter((t) => t.memberships.length > 0 || !!t.parentId),
        })),

      toggleFavorite: (projectId) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === projectId ? { ...p, favorite: !p.favorite } : p)),
        })),

      createCustomField: (input) => {
        const palette = ["#94a3b8", "#f59e0b", "#46a5e5", "#8b5cf6", "#2bb673", "#e5466b", "#0ea5e9"];
        const field: CustomField = {
          id: `cf_${nanoid(8)}`, name: input.name, type: input.type,
          options: (input.type === "single_select" || input.type === "multi_select")
            ? (input.options ?? []).filter(Boolean).map((label, i) => ({ id: `o_${nanoid(6)}`, label, color: palette[i % palette.length] }))
            : undefined,
        };
        set((s) => ({ customFields: [...s.customFields, field] }));
        return field;
      },

      updateCustomField: (id, patch) =>
        set((s) => ({ customFields: s.customFields.map((cf) => (cf.id === id ? { ...cf, ...patch } : cf)) })),

      deleteCustomField: (id) =>
        set((s) => ({
          customFields: s.customFields.filter((cf) => cf.id !== id),
          projects: s.projects.map((p) => ({ ...p, customFieldIds: p.customFieldIds.filter((fid) => fid !== id) })),
        })),

      setProjectFields: (projectId, fieldIds) =>
        set((s) => ({ projects: s.projects.map((p) => (p.id === projectId ? { ...p, customFieldIds: fieldIds } : p)) })),

      addDependency: (taskId, blockedById) => {
        if (taskId === blockedById) return;
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id === taskId && !t.blockedByIds.includes(blockedById)) return { ...t, blockedByIds: [...t.blockedByIds, blockedById] };
            if (t.id === blockedById && !t.blockingIds.includes(taskId)) return { ...t, blockingIds: [...t.blockingIds, taskId] };
            return t;
          }),
        }));
      },

      removeDependency: (taskId, blockedById) =>
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id === taskId) return { ...t, blockedByIds: t.blockedByIds.filter((id) => id !== blockedById) };
            if (t.id === blockedById) return { ...t, blockingIds: t.blockingIds.filter((id) => id !== taskId) };
            return t;
          }),
        })),

      publishStatusUpdate: (projectId, health, summary) => {
        const update: StatusUpdate = {
          id: nanoid(8), health, summary, authorId: get().currentUserId, createdAt: nowISO(),
        };
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId ? { ...p, statusUpdates: [update, ...p.statusUpdates] } : p
          ),
        }));
      },

      markNotificationRead: (id) =>
        set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      archiveNotification: (id) =>
        set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, archived: true, read: true } : n)) })),

      updateGoalProgress: (goalId, currentValue) =>
        set((s) => ({ goals: s.goals.map((g) => (g.id === goalId ? { ...g, currentValue } : g)) })),

      toggleRule: (ruleId) =>
        set((s) => ({ rules: s.rules.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r)) })),
      createRule: (rule) =>
        set((s) => ({ rules: [...s.rules, { ...rule, id: `r_${nanoid(8)}` }] })),

      submitForm: (formId, values) => {
        const form = get().forms.find((f) => f.id === formId);
        if (!form) return;
        const section = get().sections.find((s) => s.id === form.targetSectionId);
        if (!section) return;
        let name = "Solicitud sin título";
        let description = "";
        let priority: Priority | undefined;
        form.fields.forEach((f) => {
          const v = values[f.id];
          if (!v) return;
          if (f.mapsTo === "name") name = v;
          if (f.mapsTo === "description") description = v;
          if (f.mapsTo === "priority") priority = v as Priority;
        });
        get().createTask({ name, description, priority, projectId: section.projectId, sectionId: section.id });
      },

      resetDemo: () => set({ ...defaultWorkspaceData() } as Partial<State>),

      applyServerState: (data) => set({ ...data, hydrated: true } as Partial<State>),

      snapshot: () => pickWorkspaceData(get()),
    })
);

// ----- Motor de reglas (disparador → acción) -----
function runRules(
  get: () => State,
  set: (partial: Partial<State> | ((s: State) => Partial<State>)) => void,
  taskId: ID,
  event: { type: Rule["trigger"]["type"]; sectionId?: ID; projectId?: ID }
) {
  const task = get().tasks.find((t) => t.id === taskId);
  if (!task) return;
  const projectIds = task.memberships.map((m) => m.projectId);
  const rules = get().rules.filter(
    (r) => r.enabled && projectIds.includes(r.projectId) && r.trigger.type === event.type
  );
  rules.forEach((rule) => {
    if (rule.trigger.type === "moved_to_section" && rule.trigger.sectionId !== event.sectionId) return;
    rule.actions.forEach((action) => {
      set((s) => ({
        tasks: s.tasks.map((t) => {
          if (t.id !== taskId) return t;
          switch (action.type) {
            case "assign_to":
              return { ...t, assigneeId: action.userId };
            case "set_priority":
              return { ...t, priority: action.priority };
            case "set_field":
              return action.fieldId
                ? { ...t, customFieldValues: { ...t.customFieldValues, [action.fieldId]: action.value ?? "" } }
                : t;
            case "add_comment":
              return {
                ...t,
                comments: [
                  ...t.comments,
                  { id: nanoid(8), authorId: "system", body: action.value ?? "", createdAt: nowISO() },
                ],
              };
            default:
              return t;
          }
        }),
      }));
      if (action.type === "move_to_section" && action.sectionId) {
        // evitar recursión infinita: mover sin re-disparar moved_to_section
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  memberships: t.memberships.map((m) =>
                    m.projectId === rule.projectId ? { ...m, sectionId: action.sectionId! } : m
                  ),
                }
              : t
          ),
        }));
      }
    });
  });
}

function pushNotification(
  set: (partial: Partial<State> | ((s: State) => Partial<State>)) => void,
  get: () => State,
  input: { kind: Notification["kind"]; userId: ID; taskId?: ID; projectId?: ID; text: string }
) {
  const notif: Notification = {
    id: nanoid(8),
    actorId: get().currentUserId,
    createdAt: nowISO(),
    read: false,
    archived: false,
    ...input,
  };
  set((s) => ({ notifications: [notif, ...s.notifications] }));
}
