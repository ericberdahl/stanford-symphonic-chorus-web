import { Composer, ComposerStaticProps } from "./composer";
import { PieceStaticProps } from "./piece";
import { Repertoire } from "./repertoire";

type SubRepertoireStaticProps = {
    composer : ComposerStaticProps;
    pieces : PieceStaticProps[];
}

type RepertoireStaticProps = SubRepertoireStaticProps[];

export async function subRepertoireStaticProps(repertoire : Repertoire, composer : Composer) : Promise<SubRepertoireStaticProps> {
    return {
        composer:   await composer.getStaticProps(),
        pieces:     await Promise.all(repertoire.getPiecesByComposer(composer).map(async (p) => p.getStaticProps()))
    }
}

export async function repertoireStaticProps(repertoire : Repertoire) : Promise<RepertoireStaticProps> {
    const composers = repertoire.getAllComposers();

    return await Promise.all(composers.map((c) => subRepertoireStaticProps(repertoire, c)));
}
