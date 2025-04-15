import { Lesson } from "../../entity/debrief/lesson";
import { Task } from "../../entity/debrief/task";
import { ZonedDateTime } from "../../types/zoned-date-time";
import { ContentInput } from "./content/content-item";

export interface DebriefInput{
    id?: string;
    title: string;
    date: ZonedDateTime;
    createdBy?: string;
    updatedBy?: string;
    contentItems: ContentInput;
    tasks: Array<Task>;
    lessons: Array<Lesson>;
}