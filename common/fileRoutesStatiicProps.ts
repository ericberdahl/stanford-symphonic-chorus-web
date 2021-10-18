import { ImageRoutes } from "./fileRoutes";

export type ImageRoutesStaticProps = {
    pdf : string;
    jpg : string;
    caption : string;
    width : number;
    height : number;
}

export function imageRoutesStaticProps(imageRoutes : ImageRoutes) : ImageRoutesStaticProps {
    if (!imageRoutes) {
        return null;
    }

    const result = {
        pdf: imageRoutes?.pdf || null,
        jpg: imageRoutes?.jpg || null,
        caption: imageRoutes?.caption || null,
        width: imageRoutes.width,
        height: imageRoutes.height,
    };

    return result;
}
