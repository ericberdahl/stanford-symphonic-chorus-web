import { Composer, IComposer, IPiece } from './piece';

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

        let result = this.pieces.find((p) => p.title == piece.title);
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
            
            this.subRepertoires.sort((a, b) => a.composer.familyName.localeCompare(b.composer.familyName) || a.composer.fullName.localeCompare(b.composer.fullName))
        }
        else {
            if (subRep.composer.fullName != composer.fullName) {
                console.warn(util.format('Composer fullName does not match "%s" != "%s"', subRep.composer.fullName, composer.fullName));
            }
            if (subRep.composer.familyName != composer.familyName) {
                console.warn(util.format('Composer familyName does not match "%s" != "%s"', subRep.composer.familyName, composer.familyName));
            }
        }

        return subRep.composer;
    }

    addPiece(piece : IPiece) : IPiece {
        return this.getSubRepertoire(piece.composer).addPiece(piece);
    }

    getAllComposers() : IComposer[] {
        return this.subRepertoires.map((r) => r.composer);
    }

    getPiecesByComposer(composer : IComposer) : IPiece[] {
        return this.getSubRepertoire(composer).pieces;
    }

    private findSubRepertoire(composer : IComposer) : SubRepertoire {
        return this.subRepertoires.find((r) => r.composer.fullName == composer.fullName);
    }

    private getSubRepertoire(composer : IComposer) : SubRepertoire {
        const subRep = this.findSubRepertoire(composer);
        if (!subRep) throw new Error(util.format('Composer "%s" is not yet validated', composer.fullName));
        return subRep;
    }
}
