import { Task } from "./debrief/task";
import { Group } from "./group";
import { Role } from "./role/role";
import { Rank, ServiceType } from "../consts";

export interface User{
    id: string;
    firstName: string;
    lastName: string;
    serviceType: ServiceType;
    rank: Rank;
    password: string;
    roles: Array<Role>;
    tasks: Array<Task>;
    group: Group;
}