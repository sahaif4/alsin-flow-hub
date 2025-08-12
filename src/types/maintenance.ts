import { Tool } from "./tool";
import { User } from "./user";

export enum MaintenanceStatus {
    OPEN = "open",
    IN_PROGRESS = "in_progress",
    RESOLVED = "resolved",
    CLOSED = "closed",
}

export interface MaintenanceReport {
    id: number;
    tool_id: number;
    reported_by_id: number;
    assigned_to_id: number | null;
    description: string;
    status: MaintenanceStatus;
    created_at: string;
    resolved_at: string | null;
    tool: Tool;
    reporter: User;
    assignee: User | null;
}
