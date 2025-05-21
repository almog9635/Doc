import { User } from "./user";

export interface Group{
    id: string;
    commander: User | null;
    name: string;
    users: Array<User>;
}