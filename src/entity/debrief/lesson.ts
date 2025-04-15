import { Task } from "./task";

export interface Lesson {
    id: string;
    content: string;
    tasks: Array<Task>;
}