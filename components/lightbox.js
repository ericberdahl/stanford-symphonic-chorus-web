import { IFrame, Img, Script } from './htmlToolkit'

import Head from 'next/head'

import styles from '../styles/lightbox.module.scss'

let lightboxCount = 0;

function ImgLightbox({ label, caption, image, thumb, thumb_width, thumb_height }) {
    return (
        <a
            data-fslightbox={label}
            data-caption={caption}
            href={image}>
            <Img
                src={thumb}
                width={thumb_width}
                height={thumb_height}
                alt={caption}
                loading="lazy"/>
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
                <Img
                    src={thumb}
                    width={thumb_width}
                    height={thumb_height}
                    alt={caption} />
            </a>
            <div className={styles.customContent}>
                <IFrame
                    id={label}
                    src={image}
                    width={image_width}
                    height={image_height}
                    loading="lazy" />
            </div>
        </>
    );
}

export default function Lightbox({ gallery, display, image, img_width, img_height, width, height, caption }) {
    gallery = gallery || ("" + lightboxCount++ + "-image");
    display = display || image;
    img_height = img_height || Math.round((height * img_width) / width);

    const imageIsPdf = image.toLowerCase().endsWith(".pdf");
    const LightboxRenderer = (imageIsPdf ? PdfLightbox : ImgLightbox);

    // TODO: explore getting pro license for fslightbox, to allow captions and thumbs

    return (
        <div className={styles.lightbox}>
            <Head>
                <Script
                    defer
                    src="https://cdnjs.cloudflare.com/ajax/libs/fslightbox/3.3.1/index.min.js"
                    integrity="sha512-EqNNJuepkw5P9vxCml8eBk7C4Ld+4kAnvzOD/jG21rkxWPILGoQa5EvD62UieiJF0u3xoQrcVnce4i83VnYj/Q=="
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer" />
            </Head>
            <LightboxRenderer
                label={gallery}
                caption={caption}
                image={image}
                thumb={display}
                thumb_width={img_width}
                thumb_height={img_height}
                image_width={width}
                image_height={height} />
        </div>
    );
}
