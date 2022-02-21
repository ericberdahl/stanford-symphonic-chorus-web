import { Piece, PieceStaticProps, SerializedPiece } from './piece'

export type SerializedPerformancePiece = SerializedPiece & {
    performanceNote? : string;
}

export type PerformancePieceStaticProps = PieceStaticProps & {
    note : string;
}

export class PerformancePiece {
    readonly piece : Piece;
    readonly note : string;

    constructor(piece : Piece, note : string) {
        this.piece = piece;
        this.note = note;
    }

    async getStaticProps() : Promise<PerformancePieceStaticProps> {
        const base = await this.piece.getStaticProps();
    
        return {
            arranger:       base.arranger,
            catalog:        base.catalog,
            commonTitle:    base.commonTitle,
            composer:       base.composer,
            fylp:           base.fylp,
            movement:       base.movement,
            performances:   base.performances,
            prefix:         base.prefix,
            supplements:    base.supplements,
            suffix:         base.suffix,
            title:          base.title,
            translation:    base.translation,

            note:           this.note || null
        };
    }

    static async deserialize(serializedPiece : SerializedPerformancePiece) : Promise<PerformancePiece> {    
        return new PerformancePiece(await Piece.deserialize(serializedPiece), serializedPiece.performanceNote);
    }
}