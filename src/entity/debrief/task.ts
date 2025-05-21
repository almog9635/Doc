import { ZonedDateTime } from "../../types/zoned-date-time.ts";
import { User } from "../user.ts";

export interface Task {
    id: string;
    content: string;
    startDate: ZonedDateTime;
    deadline: ZonedDateTime;
    completed: boolean;
    user: User;
}