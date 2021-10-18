import { IComposer } from "./piece";
import { ComposerStaticProps, composerStaticProps, PieceStaticProps, pieceStaticProps } from "./pieceStaticProps";
import { Repertoire } from "./repertoire";

type SubRepertoireStaticProps = {
    composer : ComposerStaticProps;
    pieces : PieceStaticProps[];
}

type RepertoireStaticProps = SubRepertoireStaticProps[];

export function subRepertoireStaticProps(repertoire : Repertoire, composer : IComposer) : SubRepertoireStaticProps {
    return {
        composer:   composerStaticProps(composer),
        pieces:     repertoire.getPiecesByComposer(composer).map(pieceStaticProps)
    }
}

export function repertoireStaticProps(repertoire : Repertoire) : RepertoireStaticProps {
    const composers = repertoire.getAllComposers();

    return composers.map((c) => subRepertoireStaticProps(repertoire, c));
}
