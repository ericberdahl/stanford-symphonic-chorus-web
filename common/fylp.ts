import { ImageRoutes } from "./fileRoutes";
import { IPiece } from "./piece";

interface IAlbum {
    readonly director : string;
    readonly description : string;
    readonly label? : string;
    readonly image? : ImageRoutes;
    readonly shopping : string[];
}

class Album implements IAlbum {
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
}

export interface IFYLP {
    readonly piece : IPiece;
    readonly description : string;
    readonly albums : IAlbum[];
}

export class FYLP implements IFYLP {
    readonly piece : IPiece;
    readonly description : string;
    readonly albums : IAlbum[]  = [];

    constructor(piece : IPiece, description? : string) {
        this.piece = piece;
        this.description = (description || '');
    }

    addAlbum(director : string, description : string, label? : string, image? : string, shopping? : string[]) {
        this.albums.push(new Album(director, description, label, image, shopping));
    }
}
