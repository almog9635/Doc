import { Task } from "./task";

export interface Lesson {
    id: string;
    content: string;
    cluster: string;
    tasks: Array<Task>;
}