import { ComposerStaticProps } from "./composer";
import { fylpRefStaticProps, FYLPRefStaticProps } from "./fylpStaticProps";
import { PerformanceRefStaticProps, performanceRefStaticProps } from "./performanceStaticProps";
import { IPiece } from "./piece";
import { PieceSupplementStaticProps, pieceSupplementStaticProps } from "./pieceSupplementStaticProps";

export type PieceStaticProps = {
    arranger : string;
    catalog : string;
    commonTitle : string;
    composer : ComposerStaticProps;
    fylp : FYLPRefStaticProps;
    movement : string;
    performances : PerformanceRefStaticProps[];
    prefix : string;
    supplements : PieceSupplementStaticProps[];
    suffix : string;
    title : string | string[];
    translation : string;
};

export async function pieceStaticProps(piece : IPiece) : Promise<PieceStaticProps> {
    return {
        arranger:       piece.arranger,
        catalog:        piece.catalog,
        commonTitle:    piece.commonTitle,
        composer:       await piece.composer.getStaticProps(),
        fylp:           await fylpRefStaticProps(piece.fylp),
        movement:       piece.movement,
        performances:   piece.performances.map(performanceRefStaticProps),
        prefix:         piece.prefix,
        supplements:    await Promise.all(piece.supplements.map((s) => pieceSupplementStaticProps(s))),
        suffix:         piece.suffix,
        title:          piece.title,
        translation:    piece.translation,
    };
}
