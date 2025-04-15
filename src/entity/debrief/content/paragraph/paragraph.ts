import { ContentItem } from "../content-item.ts";
import { Comment } from "./comment.ts";

export interface Paragraph extends ContentItem {
    comments: Array<Comment>;
}