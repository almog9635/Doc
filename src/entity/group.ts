import { User } from "./user";

export interface Group{
    id: number;
    commander: User;
    name: string;
}