import Link from 'next/link'

function ImgImpl({ href, ...rest}) {
    return (
        <img
            src={href}
            {...rest}/>
    );
}

export function Img({ src, ...rest}) {
    return (
        <Link href={src} passHref>
            <ImgImpl {...rest}/>
        </Link>
    )
}

function IFrameImpl({ href, ...rest}) {
    return (
        <iframe
            src={href}
            {...rest}/>
    );
}

export function IFrame({ src, ...rest}) {
    return (
        <Link href={src} passHref>
            <IFrameImpl {...rest}/>
        </Link>
    )
}

function ScriptImpl({ href, ...rest}) {
    return (
        <script
            src={href}
            {...rest}/>
    );
}

export function Script({ src, ...rest}) {
    return (
        <Link href={src} passHref>
            <ScriptImpl {...rest}/>
        </Link>
    )
}
