import slugify from 'slugify'

function array2slug(source : string[]) : string {
    return source.map((s) => slugify(s, { lower: true })).join('-');
}

export function makeSlug(source : string | string[]) : string {
    return (Array.isArray(source) ? array2slug(source) : array2slug([source]));
}
