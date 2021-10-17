import { IPiece } from "./piece";

export interface ISupplement {
    readonly piece : IPiece;
    readonly title : string;
    readonly breadcrumb: string;
    readonly content : string;
}

export class Supplement implements ISupplement {
    readonly piece : IPiece;
    readonly title : string;
    readonly breadcrumb : string;
    readonly content : string;

    constructor(piece : IPiece, title : string, breadcrumb : string, content : string) {
        this.piece = piece;
        this.title = title;
        this.breadcrumb = breadcrumb;
        this.content = content;
    }
}
