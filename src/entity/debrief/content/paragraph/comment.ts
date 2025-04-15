import { OrderedItem } from "../ordered-item.ts";

export interface Comment extends OrderedItem {
    bullet: string;
}