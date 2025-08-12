import { Tool } from "./tool";
import { User } from "./user";

export enum TransactionType {
    LENDING = "lending",
    RENTAL = "rental",
}

export enum TransactionStatus {
    PENDING_APPROVAL = "pending_approval",
    APPROVED = "approved",
    REJECTED = "rejected",
    RETURNED = "returned",
    OVERDUE = "overdue",
}

export interface Transaction {
    id: number;
    tool_id: number;
    user_id: number;
    start_date: string;
    end_date: string;
    status: TransactionStatus;
    transaction_type: TransactionType;
    created_at: string;
    tool: Tool;
    // The user object on a transaction is not needed on this page
    // as we are already in the context of the current user.
    // user: User;
}
