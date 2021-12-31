import Head from 'next/head'

import styles from '../styles/lightbox.module.scss'

let lightboxCount = 0;

function ImgLightbox({ label, caption, image, thumb, thumb_width, thumb_height }) {
    return (
        <a
            data-fslightbox={label}
            data-caption={caption}
            href={image}>
            <img
                src={thumb}
                width={thumb_width}
                height={thumb_height}
                alt={caption}/>
        </a>
    );
}

function PdfLightbox({ label, caption, image, thumb, thumb_width, thumb_height, image_width, image_height }) {
    return (
        <>
            <a
                data-fslightbox={label}
                data-caption={caption}
                href={"#" + label}>
                <img
                    src={thumb}
                    width={thumb_width}
                    height={thumb_height}
                    alt={caption} />
            </a>
            <div className={styles.customContent}>
                <iframe
                    id={label}
                    src={image}
                    width={image_width}
                    height={image_height} />
            </div>
        </>
    );
}

export default function Lightbox(props) {
    const display = (props.display ? props.display : props.image);

    const img_width = props.img_width;
    const img_height = ( props.img_height ? props.img_height : Math.round((props.height * img_width) / props.width) );

    const rel = "mediabox[" + props.width + " " + props.height + "]";

    const galleryLabel = "" + lightboxCount++ + "-image";

    const imageIsPdf = props.image.toLowerCase().endsWith(".pdf");
    const LightboxRenderer = (imageIsPdf ? PdfLightbox : ImgLightbox);

    // TODO: explore getting pro license for fslightbox, to allow captions and thumbs

    return (
        <div className={styles.lightbox}>
            <Head>
                <script
                    defer
                    src="https://cdnjs.cloudflare.com/ajax/libs/fslightbox/3.3.1/index.min.js"
                    integrity="sha512-EqNNJuepkw5P9vxCml8eBk7C4Ld+4kAnvzOD/jG21rkxWPILGoQa5EvD62UieiJF0u3xoQrcVnce4i83VnYj/Q=="
                    crossorigin="anonymous"
                    referrerpolicy="no-referrer" />
            </Head>
            <LightboxRenderer
                label={galleryLabel}
                caption={props.caption}
                image={props.image}
                thumb={display}
                thumb_width={img_width}
                thumb_height={img_height}
                image_width={props.width}
                image_height={props.height} />
        </div>
    );
}
