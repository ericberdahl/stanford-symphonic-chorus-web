import { IComposer, IPiece, comparePieces, compareComposers } from './piece';

import util from 'util';

class SubRepertoire {
    readonly composer : IComposer;
    readonly pieces : IPiece[]  = [];

    constructor(composer : IComposer) {
        this.composer = composer;
    }

    addPiece(piece : IPiece) : IPiece {
        if (piece.composer.fullName != this.composer.fullName) {
            throw new Error(util.format('Piece with composer "%s" cannot be added to sub-repertoire for composer "%s"', piece.composer.fullName, this.composer.fullName));
        }

        let result = this.pieces.find((p) => 0 == comparePieces(p, piece));
        if (!result) {
            result = piece;
            this.pieces.push(piece);

            this.pieces.sort((a, b) => {
                const aTitle = (Array.isArray(a.title) ? a.title[0] : <string>a.title);
                const bTitle = (Array.isArray(b.title) ? b.title[0] : <string>b.title);
                return aTitle.localeCompare(bTitle)
            });
        }

        return result;
    }
}

export class Repertoire {
    private subRepertoires : SubRepertoire[]    = [];

    constructor() {

    }

    validateComposer(composer : IComposer) : IComposer {
        let subRep = this.findSubRepertoire(composer);

        if (!subRep) {
            subRep = new SubRepertoire(composer);
            this.subRepertoires.push(subRep);
            
            this.subRepertoires.sort((a, b) => compareComposers(a.composer, b.composer))
        }

        return subRep.composer;
    }

    get composers() : IComposer[] {
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

    getAllComposers() : IComposer[] {
        return this.composers;
    }

    getPiecesByComposer(composer : IComposer) : IPiece[] {
        return this.getSubRepertoire(composer).pieces;
    }

    private findSubRepertoire(composer : IComposer) : SubRepertoire {
        return this.subRepertoires.find((r) => 0 == compareComposers(r.composer, composer));
    }

    private getSubRepertoire(composer : IComposer) : SubRepertoire {
        const subRep = this.findSubRepertoire(composer);
        if (!subRep) throw new Error(util.format('Composer "%s" is not yet validated', composer.fullName));
        return subRep;
    }
}
