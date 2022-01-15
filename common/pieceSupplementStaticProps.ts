import { PieceSupplement } from './pieceSupplement'

import { serialize as mdxSerializeMarkdown } from 'next-mdx-remote/serialize'
import { MDXRemoteSerializeResult } from 'next-mdx-remote'

export type PieceSupplementStaticProps = {
    title : string;
    breadcrumb : string;
    contentMDX : MDXRemoteSerializeResult;
}

export async function pieceSupplementStaticProps(supplement : PieceSupplement) : Promise<PieceSupplementStaticProps> {
    return {
        title:      supplement.title,
        breadcrumb: supplement.breadcrumb,
        contentMDX: await mdxSerializeMarkdown(supplement.content),
    }
}
