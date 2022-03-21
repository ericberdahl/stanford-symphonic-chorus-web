import { ComposerStaticProps } from './composer';
import { ImageRoutes } from "./fileRoutes";
import { Piece, SerializedPiece } from "./piece";

import { serialize as mdxSerializeMarkdown } from 'next-mdx-remote/serialize'

import { strict as assert } from 'assert';

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
            // TODO : move the '/assets/albums/' string literal into constants.ts
            this.image = new ImageRoutes('/assets/albums/', image, '');
        }
    }

    // TODO : Create type for AlbumStaticProps
    async getStaticProps() {
        return {
            director:       this.director,
            descriptionMDX: await mdxSerializeMarkdown(this.description),
            label:          this.label,
            image:          this.image ? await this.image.getStaticProps() : null,
            shopping:       this.shopping,
    
        };
    }

    static async deserialize(data : SerializedAlbum) : Promise<Album> {
        return new Album(data.director, data.description, data.label, data.image, data.shopping);
    }
}

export class FYLP {
    readonly piece : Piece;
    readonly description : string;
    readonly albums : Album[]  = [];

    constructor(piece : Piece, description : string, albums : Album[]) {
        this.piece = piece;
        this.description = (description || '');
        this.albums.push(...albums);

        assert.ok(!piece.fylp, `Piece already has an FYLP ${piece.composer.fullName}'s "${piece.title}"`)
        this.piece.fylp = this;
    }

    // TODO : create type for FYLPStaticProps
    async getStaticProps() {
        return {
            descriptionMDX: await mdxSerializeMarkdown(this.description),
            albums:         await Promise.all(this.albums.map((a) => a.getStaticProps())),
            piece:          await this.piece.getStaticProps()
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
        const result : FYLP = new FYLP(await Piece.deserialize(data.piece),
                                       data.description,
                                       await Promise.all(data.albums.map((a) => Album.deserialize(a))));
    
        return result;
    }    
}
