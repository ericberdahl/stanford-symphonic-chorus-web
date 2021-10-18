import { fylpRefStaticProps, FYLPRefStaticProps } from "./fylpStaticProps";
import { IComposer, IPiece } from "./piece";

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
    prefix : string;
    suffix : string;
    title : string | string[];
    translation : string;
};

export function composerStaticProps(composer : IComposer) : ComposerStaticProps {
    return {
        fullName:   composer.fullName,
        familyName: composer.familyName
    };
}

export function pieceStaticProps(piece : IPiece) : PieceStaticProps {
    return {
        arranger:       piece.arranger,
        catalog:        piece.catalog,
        commonTitle:    piece.commonTitle,
        composer:       composerStaticProps(piece.composer),
        fylp:           fylpRefStaticProps(piece.fylp),
        movement:       piece.movement,
        prefix:         piece.prefix,
        suffix:         piece.suffix,
        title:          piece.title,
        translation:    piece.translation,
        // TODO : performances
    };
}
