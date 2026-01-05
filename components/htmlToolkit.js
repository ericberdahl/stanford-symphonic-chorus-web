import Link from 'next/link'

export function IFrame({ src, ...rest}) {
    const Implementation = ({ href, ...rest}) => {
        return (
            <iframe
                src={href}
                {...rest}/>
        );
    }
    
    return (
        <Link href={src} passHref legacyBehavior>
            <Implementation {...rest}/>
        </Link>
    )
}
