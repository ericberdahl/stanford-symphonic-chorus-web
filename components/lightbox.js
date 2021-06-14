import Head from 'next/head'
import Link from 'next/link'

import styles from '../styles/lightbox.module.scss'

export default function Lightbox(props) {
    const display = (props.display ? props.display : props.image);

    const img_width = props.img_width;
    const img_height = ( props.img_height ? props.img_height : Math.round((props.height * img_width) / props.width) );

    const rel = "mediabox[" + props.width + " " + props.height + "]";

    return (
        <div className={styles.lightbox}>
            <Head>
                <link href="/css/slimbox.css"  type="text/css" rel="stylesheet" key="slimbox.css" />
                <script src="/scripts/mediabox.js" type="text/javascript" key="mediabox.js"></script>
            </Head>
            <Link href={props.image} src={display}>
                <a title={props.caption} rel={rel}>
                    <img
                        src={display}
                        width={img_width}
                        height={img_height}
                        alt={props.caption}/>
                </a>
            </Link>
        </div>
    );
}
