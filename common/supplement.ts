import { IPiece } from "./piece";

export interface ISupplement {
    piece : IPiece;
    readonly title : string;
    readonly breadcrumb: string;
    readonly content : string;
}
// TODO: make ISupplement.piece readonly

export class Supplement implements ISupplement {
    piece : IPiece;
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
