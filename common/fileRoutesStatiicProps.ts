import { FileRoutes, ImageRoutes } from "./fileRoutes";

export type ImageRoutesStaticProps = {
    pdf : string;
    jpg : string;
    caption : string;
    width : number;
    height : number;
}

export type FileRouteStaticProp = {
    variant : string;
    route : string;
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

export function fileRoutesStaticProps(fileRoutes : FileRoutes) : FileRouteStaticProp[] {
    if (!fileRoutes) return null;
    
    return fileRoutes.variants.map((v) => ({
        variant: v.toUpperCase(),
        route: fileRoutes.getRoute(v)
    }));
}
