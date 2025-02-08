import { Group } from "./group";
import { Role } from "./role";

export interface User{
    id: string;
    firstName: string;
    lastName: string;
    serviceType: string;
    rank: string;
    password: string;
    roles: Array<Role>;
    group: Group;
}