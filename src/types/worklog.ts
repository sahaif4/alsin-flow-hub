import { User } from "./user";

export interface WorkLog {
    id: number;
    user_id: number;
    log_date: string;
    notes: string;
    target_description: string | null;
    created_at: string;
    user: User;
}
