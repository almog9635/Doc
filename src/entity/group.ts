import { User } from "./user";

export interface Group{
    id: string;
    commander: User;
    name: string;
}