import Head from 'next/head'
import Link from 'next/link'

const styles = {
    leadin: {
        anchorClass: "photo pgraph",
        displayClass: ""
    },

    banner: {
        anchorClass: "photo",
        displayClass: "image_banner"
    },

    plain: {
        anchorClass: "photo",
        displayClass: "framed"
    }
};

// TODO do proper styles

export default function Lightbox(props) {
    const style = (styles.hasOwnProperty(props.style) ? styles[props.style] : styles['plain']);
    const display = (props.display ? props.display : props.image);

    const img_width = props.img_width;
    const img_height = ( props.img_height ? props.img_height : Math.round((props.height * img_width) / props.width) );

    const rel = "mediabox[" + props.width + " " + props.height + "]";

    return (
        <>
            <Head>
                <link href="/css/slimbox.css"  type="text/css" rel="stylesheet" key="slimbox.css" />
                <script src="/scripts/mediabox.js" type="text/javascript" key="mediabox.js"></script>
            </Head>
            <Link href={props.image} src={display}>
                <a className={style.anchorClass} title={props.caption} rel={rel}>
                    <img
                        className={style.displayClass}
                        src={display}
                        width={img_width}
                        height={img_height}
                        alt={props.caption}/>
                </a>
            </Link>
        </>
    );
}
