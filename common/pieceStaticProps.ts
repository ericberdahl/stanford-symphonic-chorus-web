import { fylpRefStaticProps, FYLPRefStaticProps } from "./fylpStaticProps";
import { PerformanceRefStaticProps, performanceRefStaticProps } from "./performanceStaticProps";
import { Composer, IPiece } from "./piece";
import { PieceSupplementStaticProps, pieceSupplementStaticProps } from "./pieceSupplementStaticProps";

export type ComposerStaticProps = {
    fullName : string;
    familyName : string;
};

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

export function composerStaticProps(composer : Composer) : ComposerStaticProps {
    return {
        fullName:   composer.fullName,
        familyName: composer.familyName
    };
}

export async function pieceStaticProps(piece : IPiece) : Promise<PieceStaticProps> {
    return {
        arranger:       piece.arranger,
        catalog:        piece.catalog,
        commonTitle:    piece.commonTitle,
        composer:       composerStaticProps(piece.composer),
        fylp:           fylpRefStaticProps(piece.fylp),
        movement:       piece.movement,
        performances:   piece.performances.map(performanceRefStaticProps),
        prefix:         piece.prefix,
        supplements:    await Promise.all(piece.supplements.map((s) => pieceSupplementStaticProps(s))),
        suffix:         piece.suffix,
        title:          piece.title,
        translation:    piece.translation,
    };
}
