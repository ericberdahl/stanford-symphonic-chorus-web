import { Composer, ComposerStaticProps } from './composer';
import { Piece, PieceStaticProps } from './piece';

export type ComposerRepertoireStaticProps = {
    composer :  ComposerStaticProps;
    pieces :    PieceStaticProps[];
}

export type GrandRepertoireStaticProps = ComposerRepertoireStaticProps[];

export class GrandRepertoire {
    private collection : Map<Composer, Set<Piece>>  = new Map<Composer, Set<Piece>>();

    constructor() {

    }

    get pieces() : Piece[] {
        // TODO : this may need to be sorted
        const result : Piece[] = [];
        this.collection.forEach((value) => {
            result.push(...value);
        });
        return result;
    }

    addPiece(piece : Piece) : void {
        if (!this.collection.has(piece.composer)) {
            this.collection.set(piece.composer, new Set<Piece>())
        }
        const subRepertoire = this.collection.get(piece.composer);
        subRepertoire.add(piece);
    }

    async getStaticProps() : Promise<GrandRepertoireStaticProps> {
        const linearizedCollection = Array.from(this.collection);
        linearizedCollection.sort((a, b) => a[0].compare(b[0]));

        return await Promise.all(linearizedCollection.map(async ([key, value]) => {
            const pieces = Array.from(value);
            pieces.sort((a, b) => a.compare(b));

            return {
                composer:   await key.getStaticProps(),
                pieces:     await Promise.all(pieces.map((p) => p.getStaticProps())),
            };
        }));
    }
}
