import { Supplement } from './supplement'

import { serialize as mdxSerializeMarkdown } from 'next-mdx-remote/serialize'
import { MDXRemoteSerializeResult } from 'next-mdx-remote'

export type SupplementStaticProps = {
    title : string;
    breadcrumb : string;
    contentMDX : MDXRemoteSerializeResult;
}

export async function supplementStaticProps(supplement : Supplement) : Promise<SupplementStaticProps> {
    return {
        title:      supplement.title,
        breadcrumb: supplement.breadcrumb,
        contentMDX: await mdxSerializeMarkdown(supplement.content),
    }
}
