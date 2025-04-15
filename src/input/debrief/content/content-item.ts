import { Paragraph } from "../../../entity/debrief/content/paragraph/paragraph.ts";
import { OrderedItem } from "../../../entity/debrief/content/ordered-item.ts";
import { Table } from "../../../entity/debrief/content/table/table.ts";

export interface ContentItemInput extends OrderedItem{
    name: string;
}

export interface ContentInput {
    paragraphs: Array<Paragraph>;
    tables: Array<Table>;
}