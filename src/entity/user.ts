import { Group } from "./group";
import { Role } from "./role";

export interface User{
    id: number;
    name: string;
    firstName: string;
    lastName: string;
    serviceType: string;
    password: string;
    roles: Set<Role>;
    group: Group;
}