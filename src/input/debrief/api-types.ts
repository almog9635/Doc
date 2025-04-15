import { Column } from '../../entity/debrief/content/table/column';
import { Row } from '../../entity/debrief/content/table/row';
import { Comment } from '../../entity/debrief/content/paragraph/comment';
import { Task } from '../../entity/debrief/task';

// API-specific types for sending data
export interface ApiTask extends Omit<Task, 'id'> {
  id: null;
}

export interface ApiLesson {
  id: null;
  content: string;
  tasks: ApiTask[];
}

export interface ApiParagraph {
  id: null;
  name: string;
  index: number;
  comments: Comment[];
}

export interface ApiTable {
  id: null;
  name: string;
  index: number;
  columns: Column[];
  rows: Row[];
}

export interface ApiContentInput {
  paragraphs: ApiParagraph[];
  tables: ApiTable[];
}

export interface ApiDebriefInput {
  id: string;
  title: string;
  date: string;
  contentItems: ApiContentInput;
  tasks: ApiTask[];
  lessons: ApiLesson[];
}
