import { IComposer } from "./piece";
import { ComposerStaticProps, composerStaticProps, PieceStaticProps, pieceStaticProps } from "./pieceStaticProps";
import { Repertoire } from "./repertoire";

type SubRepertoireStaticProps = {
    composer : ComposerStaticProps;
    pieces : PieceStaticProps[];
}

type RepertoireStaticProps = SubRepertoireStaticProps[];

export async function subRepertoireStaticProps(repertoire : Repertoire, composer : IComposer) : Promise<SubRepertoireStaticProps> {
    return {
        composer:   composerStaticProps(composer),
        pieces:     await Promise.all(repertoire.getPiecesByComposer(composer).map(pieceStaticProps))
    }
}

export async function repertoireStaticProps(repertoire : Repertoire) : Promise<RepertoireStaticProps> {
    const composers = repertoire.getAllComposers();

    return await Promise.all(composers.map((c) => subRepertoireStaticProps(repertoire, c)));
}
