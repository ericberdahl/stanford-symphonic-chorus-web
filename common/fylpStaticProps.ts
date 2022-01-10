import { imageRoutesStaticProps } from './fileRoutesStatiicProps';
import { IFYLP } from "./fylp";
import { composerStaticProps, ComposerStaticProps, pieceStaticProps } from "./pieceStaticProps";

import { serialize as mdxSerializeMarkdown } from 'next-mdx-remote/serialize'

export type FYLPRefStaticProps = {
    piece : {
        composer : ComposerStaticProps;
        title : string | string[];
    }
}

async function albumStaticProps(album) {
    return {
        director:       album.director,
        descriptionMDX: await mdxSerializeMarkdown(album.description),
        label:          album.label,
        image:          imageRoutesStaticProps(album.image),
        shopping:       album.shopping,

    };
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

export async function fylpStaticProps(fylp) {
    return {
        descriptionMDX: await mdxSerializeMarkdown(fylp.description),
        albums:         await Promise.all(fylp.albums.map(albumStaticProps)),
        piece:          await pieceStaticProps(fylp.piece)
    };

}
