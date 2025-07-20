import { STATIC_ASSET_DIR } from './constants';

import { imageSize } from 'image-size'

import fs from 'fs';
import path from 'path';
import util from 'util';

function composeExistingRoute(directoryRoute : string, name : string, extension : string) : string {
    const route = path.normalize(path.format({
        dir: directoryRoute,
        name: name,
        ext: extension.toLowerCase()
    }));

    return (fs.existsSync(path.join(STATIC_ASSET_DIR, route)) ? route : null);
}

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

export function fileRoutesStaticProps(fileRoutes : FileRoutes) : FileRouteStaticProp[] {
    if (!fileRoutes) return null;
    
    return fileRoutes.variants.map((v) => ({
        variant: v.toUpperCase(),
        route: fileRoutes.getRoute(v)
    }));
}

export class FileRoutes {
    readonly routes : string[];

    constructor(directoryRoute : string, name : string, variants : string[]) {
        this.routes = variants.map((v) => composeExistingRoute(directoryRoute, name, '.' + v)).filter((s) => s != null);
    }

    get variants() : string[] {
        return this.routes.map((r) => path.extname(r).slice(1));
    }

    getRoute(variant : string) : string {
        return this.routes.find((r) => variant == path.extname(r).slice(1));
    }
}

export class ImageRoutes extends FileRoutes {
    readonly caption : string;
    readonly width : number     = 0;
    readonly height : number    = 0;

    constructor(directoryRoute : string, name : string, caption : string) {
        super(directoryRoute, name, ['pdf', 'jpg']);

        if (!this.pdf && !this.jpg) {
            throw new Error(util.format('No image variants found for "%s"', name));
        }

        if (this.jpg) {
            const imagePath = path.join(STATIC_ASSET_DIR, this.jpg);
            const imageBuffer = fs.readFileSync(imagePath);
            ({ width: this.width, height: this.height } = imageSize(imageBuffer));
        }
    
        this.caption = caption;
    }

    get pdf() : string { return this.getRoute('pdf'); }
    get jpg() : string { return this.getRoute('jpg'); }

    async getStaticProps() : Promise<ImageRoutesStaticProps> {    
        return {
            pdf:        this.pdf || null,
            jpg:        this.jpg || null,
            caption:    this.caption || null,
            width:      this.width,
            height:     this.height,
        };
    }
    
}
