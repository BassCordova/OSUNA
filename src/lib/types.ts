// Modelo de datos central — "grafo de trabajo" (ver PRD §3)
// La relación tarea↔proyecto es muchos-a-muchos para soportar multi-homing.

export type ID = string;

export type GlobalRole = "admin" | "member" | "guest" | "viewer";

export interface User {
  id: ID;
  name: string;
  email: string;
  avatarColor: string;
  initials: string;
  role: GlobalRole;
  jobTitle?: string;
  department?: string;
  active: boolean;
  timezone: string;
}

export type TeamPrivacy = "public" | "request" | "private";

export interface Team {
  id: ID;
  name: string;
  description?: string;
  memberIds: ID[];
  privacy: TeamPrivacy;
  color: string;
}

export type ProjectStatus = "active" | "archived" | "completed";
export type ProjectPrivacy = "public" | "request" | "private";
export type ProjectView = "list" | "board" | "calendar" | "timeline" | "dashboard";
export type HealthColor = "on_track" | "at_risk" | "off_track";

export interface StatusUpdate {
  id: ID;
  health: HealthColor;
  summary: string;
  authorId: ID;
  createdAt: string;
}

export interface Project {
  id: ID;
  name: string;
  description?: string;
  teamId: ID;
  color: string;
  icon: string;
  status: ProjectStatus;
  privacy: ProjectPrivacy;
  defaultView: ProjectView;
  startDate?: string;
  endDate?: string;
  ownerId: ID;
  memberIds: ID[];
  favorite?: boolean;
  customFieldIds: ID[];
  statusUpdates: StatusUpdate[];
}

export interface Section {
  id: ID;
  name: string;
  order: number;
  projectId: ID;
}

export type CustomFieldType =
  | "text"
  | "number"
  | "single_select"
  | "multi_select"
  | "date"
  | "person";

export interface CustomFieldOption {
  id: ID;
  label: string;
  color: string;
}

export interface CustomField {
  id: ID;
  name: string;
  type: CustomFieldType;
  options?: CustomFieldOption[];
}

export type Priority = "low" | "medium" | "high" | "urgent";

export interface Comment {
  id: ID;
  authorId: ID;
  body: string;
  createdAt: string;
}

export interface Attachment {
  id: ID;
  name: string;
  url: string;
  kind: "file" | "link";
}

export interface ActivityEntry {
  id: ID;
  actorId: ID;
  text: string;
  createdAt: string;
}

// Pertenencia de una tarea a un proyecto (tabla pivote → multi-homing)
export interface TaskMembership {
  projectId: ID;
  sectionId: ID;
}

export interface Task {
  id: ID;
  name: string;
  description?: string;
  assigneeId?: ID;
  followerIds: ID[];
  startDate?: string;
  dueDate?: string;
  completed: boolean;
  completedAt?: string;
  memberships: TaskMembership[]; // multi-homing
  parentId?: ID; // si es subtarea
  subtaskIds: ID[];
  priority?: Priority;
  tags: string[];
  isMilestone: boolean;
  isApproval: boolean;
  approvalStatus?: "pending" | "approved" | "changes" | "rejected";
  customFieldValues: Record<ID, string | string[] | number | null>;
  blockedByIds: ID[];
  blockingIds: ID[];
  comments: Comment[];
  attachments: Attachment[];
  activity: ActivityEntry[];
  createdAt: string;
  order: number;
}

export type NotificationKind =
  | "assigned"
  | "mention"
  | "comment"
  | "status_change"
  | "due_soon"
  | "approval";

export interface Notification {
  id: ID;
  kind: NotificationKind;
  userId: ID; // destinatario
  actorId: ID;
  taskId?: ID;
  projectId?: ID;
  text: string;
  createdAt: string;
  read: boolean;
  archived: boolean;
}

export interface Portfolio {
  id: ID;
  name: string;
  ownerId: ID;
  projectIds: ID[];
  parentId?: ID;
}

export type GoalLevel = "organization" | "team" | "individual";
export type GoalPeriod = string;

export interface Goal {
  id: ID;
  title: string;
  description?: string;
  level: GoalLevel;
  ownerId: ID;
  metricLabel: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  period: GoalPeriod;
  parentId?: ID;
  linkedProjectIds: ID[];
}

// Reglas de automatización (disparador → acción) — PRD §5.11
export type RuleTriggerType =
  | "task_created"
  | "moved_to_section"
  | "task_completed"
  | "field_changed";

export type RuleActionType =
  | "assign_to"
  | "move_to_section"
  | "set_field"
  | "add_comment"
  | "set_priority";

export interface Rule {
  id: ID;
  projectId: ID;
  name: string;
  enabled: boolean;
  trigger: { type: RuleTriggerType; sectionId?: ID; fieldId?: ID };
  actions: {
    type: RuleActionType;
    userId?: ID;
    sectionId?: ID;
    fieldId?: ID;
    value?: string;
    priority?: Priority;
  }[];
}

export interface FormField {
  id: ID;
  label: string;
  type: "text" | "textarea" | "select";
  required: boolean;
  options?: string[];
  mapsTo: "name" | "description" | "priority" | "custom";
  customFieldId?: ID;
}

export interface IntakeForm {
  id: ID;
  projectId: ID;
  title: string;
  description?: string;
  targetSectionId: ID;
  fields: FormField[];
}
