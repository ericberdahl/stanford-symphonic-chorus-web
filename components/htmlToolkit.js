import Link from 'next/link'

export function Area({ href, ...rest}) {
    const Implementation = ({ href, ...rest}) => {
        return (
            <area
                src={href}
                {...rest}/>
        );
    }
    
    return (
        <Link href={href} passHref>
            <Implementation {...rest}/>
        </Link>
    )
}

export function IFrame({ src, ...rest}) {
    const Implementation = ({ href, ...rest}) => {
        return (
            <iframe
                src={href}
                {...rest}/>
        );
    }
    
    return (
        <Link href={src} passHref>
            <Implementation {...rest}/>
        </Link>
    )
}

export function Img({ src, ...rest}) {
    const Implementation = ({ href, ...rest}) => {
        return (
            <img
                src={href}
                {...rest}/>
        );
    }
    
    return (
        <Link href={src} passHref>
            <Implementation {...rest}/>
        </Link>
    )
}

export function Script({ src, ...rest}) {
    const Implementation = ({ href, ...rest}) => {
        return (
            <script
                src={href}
                {...rest}/>
        );
    }
    
    return (
        <Link href={src} passHref>
            <Implementation {...rest}/>
        </Link>
    )
}
