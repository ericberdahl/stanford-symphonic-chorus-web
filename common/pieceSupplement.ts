import { IPiece } from "./piece";

export interface IPieceSupplement {
    piece : IPiece;
    readonly title : string;
    readonly breadcrumb: string;
    readonly content : string;
}
// TODO: make ISupplement.piece readonly

export class PieceSupplement implements IPieceSupplement {
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
