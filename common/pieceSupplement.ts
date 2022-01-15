import { Piece, SerializedPiece } from "./piece";

import { serialize as mdxSerializeMarkdown } from 'next-mdx-remote/serialize'
import { MDXRemoteSerializeResult } from 'next-mdx-remote'

export type SerializedPieceSupplement = {
    piece : SerializedPiece;
    title : string;
    breadcrumb : string;
    content : string;
}

export type PieceSupplementStaticProps = {
    title : string;
    breadcrumb : string;
    contentMDX : MDXRemoteSerializeResult;
}

export class PieceSupplement {
    piece : Piece;
    readonly title : string;
    readonly breadcrumb : string;
    readonly content : string;

    constructor(piece : Piece, title : string, breadcrumb : string, content : string) {
        this.piece = piece;
        this.title = title;
        this.breadcrumb = breadcrumb;
        this.content = content;
    }

    async getStaticProps() : Promise<PieceSupplementStaticProps> {
        return {
            title:      this.title,
            breadcrumb: this.breadcrumb,
            contentMDX: await mdxSerializeMarkdown(this.content),
        }
    }
    
    static async deserialize(data : SerializedPieceSupplement) : Promise<PieceSupplement> {
        return new PieceSupplement(await Piece.deserialize(data.piece),
                                   data.title,
                                   data.breadcrumb,
                                   data.content);
    }    
}
