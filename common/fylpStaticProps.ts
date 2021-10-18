import { IFYLP } from "./fylp";
import { composerStaticProps, ComposerStaticProps } from "./pieceStaticProps";

export type FYLPRefStaticProps = {
    piece : {
        composer : ComposerStaticProps;
        title : string | string[];
    }
}

export function fylpRefStaticProps(fylp : IFYLP) : FYLPRefStaticProps {
    if (!fylp) return null;

    return {
        piece: {
            composer:   composerStaticProps(fylp.piece.composer),
            title:      fylp.piece.title
        }
    }
}
