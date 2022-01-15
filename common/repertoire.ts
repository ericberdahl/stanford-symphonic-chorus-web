import { Composer } from './composer';
import { IPiece, comparePieces } from './piece';

import util from 'util';

class SubRepertoire {
    readonly composer : Composer;
    readonly pieces : IPiece[]  = [];

    constructor(composer : Composer) {
        this.composer = composer;
    }

    addPiece(piece : IPiece) : IPiece {
        if (piece.composer.fullName != this.composer.fullName) {
            throw new Error(util.format('Piece with composer "%s" cannot be added to sub-repertoire for composer "%s"', piece.composer.fullName, this.composer.fullName));
        }

        let result = this.findPiece(piece);
        if (!result) {
            result = piece;
            this.pieces.push(piece);

            this.pieces.sort((a, b) => comparePieces(a, b));
        }

        return result;
    }

    findPiece(piece : IPiece) : IPiece {
        return this.pieces.find((p) => 0 == comparePieces(p, piece));
    }
}

export class Repertoire {
    private subRepertoires : SubRepertoire[]    = [];

    constructor() {

    }

    validateComposer(composer : Composer) : Composer {
        let subRep = this.findSubRepertoire(composer);

        if (!subRep) {
            subRep = new SubRepertoire(composer);
            this.subRepertoires.push(subRep);
            
            this.subRepertoires.sort((a, b) => a.composer.compare(b.composer))
        }

        return subRep.composer;
    }

    get composers() : Composer[] {
        return this.subRepertoires.map((r) => r.composer);
    }

    get pieces() : IPiece[] {
        return this.composers.map((c) => this.getPiecesByComposer(c)).reduce((previous, current) => {
            previous.push(...current);
            return previous;
        }, []);
    }

    addPiece(piece : IPiece) : IPiece {
        this.validateComposer(piece.composer);
        return this.getSubRepertoire(piece.composer).addPiece(piece);
    }

    findPiece(piece : IPiece) : IPiece {
        return this.findSubRepertoire(piece.composer)?.findPiece(piece);;
    }

    getAllComposers() : Composer[] {
        // TODO : deprecate getAllComposers
        return this.composers;
    }

    getPiecesByComposer(composer : Composer) : IPiece[] {
        return this.getSubRepertoire(composer).pieces;
    }

    private findSubRepertoire(composer : Composer) : SubRepertoire {
        return this.subRepertoires.find((r) => 0 == r.composer.compare(composer));
    }

    private getSubRepertoire(composer : Composer) : SubRepertoire {
        const subRep = this.findSubRepertoire(composer);
        if (!subRep) throw new Error(util.format('Composer "%s" is not yet validated', composer.fullName));
        return subRep;
    }
}
