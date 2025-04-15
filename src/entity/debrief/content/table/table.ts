import { ContentItem } from "../content-item.ts";
import { Column } from "./column.ts";
import { Row } from "./row.ts";

export interface Table extends ContentItem {
    columns: Array<Column>;
    rows: Array<Row>;
}