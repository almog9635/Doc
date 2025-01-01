import { Group } from "./group";
import { Role } from "./role";

export interface User{
    id: number;
    firstName: string;
    lastName: string;
    serviceType: string;
    password: string;
    roles: Array<Role>;
    group: Group;
}