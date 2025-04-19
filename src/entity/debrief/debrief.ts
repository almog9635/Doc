import { ZonedDateTime } from '../../types/zoned-date-time';
import { ContentItem } from './content/content-item';
import { Lesson } from './lesson';
import { Task } from './task';

export interface Debrief{
    id: string;
    title: string;
    date: ZonedDateTime;
    labels: string;
    createdBy: string;
    updatedBy: string;
    contentItems: Array<ContentItem>;
    tasks: Array<Task>;
    lessons: Array<Lesson>;
}