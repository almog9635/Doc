import { OrderedItem } from "../ordered-item.ts";
import { Cell } from "./cell.ts";

export interface Row extends OrderedItem {
    cells: Array<Cell>;
}
