import { ComposerStaticProps } from './composer';
import { ImageRoutes } from "./fileRoutes";
import { imageRoutesStaticProps } from './fileRoutes';
import { IPiece, Piece, SerializedPiece, pieceStaticProps } from "./piece";

import { serialize as mdxSerializeMarkdown } from 'next-mdx-remote/serialize'

type SerializedAlbum = {
    director : string;
    description : string;
    label? : string;
    image? : string;
    shopping? : string[];
}

type SerializedFYLP = {
    piece : SerializedPiece;
    description? : string;
    albums : SerializedAlbum[];
}

export type FYLPRefStaticProps = {
    piece : {
        composer : ComposerStaticProps;
        title : string | string[];
    }
}

class Album {
    readonly director : string;
    readonly description : string;
    readonly label : string;
    readonly image : ImageRoutes;
    readonly shopping : string[]    = [];

    constructor(director : string, description : string, label? : string, image? : string, shopping? : string[]) {
        this.director = director;
        this.description = description;
        this.label = (label || '');
        this.shopping.push(...(shopping || []));

        if (image) {
            this.image = new ImageRoutes('/assets/albums/', image, '');
        }
    }

    // TODO : Create type for AlbumStaticProps
    async getStaticProps() {
        return {
            director:       this.director,
            descriptionMDX: await mdxSerializeMarkdown(this.description),
            label:          this.label,
            image:          imageRoutesStaticProps(this.image),
            shopping:       this.shopping,
    
        };
    }
}

export class FYLP {
    _piece : IPiece;
    readonly description : string;
    readonly albums : Album[]  = [];

    constructor(piece : IPiece, description? : string) {
        this.piece = piece;
        this.description = (description || '');
    }

    get piece() : IPiece { return this._piece; }
    set piece(p : IPiece) {
        if (this._piece) {
            this._piece.fylp = null;
        }

        this._piece = p;

        if (this._piece) {
            this._piece.fylp = this;
        }
    }

    addAlbum(director : string, description : string, label? : string, image? : string, shopping? : string[]) {
        this.albums.push(new Album(director, description, label, image, shopping));
    }

    // TODO : create type for FYLPStaticProps
    async getStaticProps() {
        return {
            descriptionMDX: await mdxSerializeMarkdown(this.description),
            albums:         await Promise.all(this.albums.map((a) => a.getStaticProps())),
            piece:          await pieceStaticProps(this.piece)
        };
    
    }

    async getRefStaticProps() : Promise<FYLPRefStaticProps> {
        return {
            piece: {
                composer:   await this.piece.composer.getStaticProps(),
                title:      this.piece.title
            }
        }
    }
    
    static async deserialize(data : SerializedFYLP) : Promise<FYLP> {
        const result : FYLP = new FYLP(await Piece.deserialize(data.piece), data.description);
        data.albums.forEach((a) => result.addAlbum(a.director, a.description, a.label, a.image, a.shopping));
    
        return result;
    }    
}
