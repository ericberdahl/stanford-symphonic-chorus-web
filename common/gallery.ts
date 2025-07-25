import { GALLERY_ASSET_BASEPATH, GALLERY_URL_BASEPATH } from './constants'

import { imageSize } from 'image-size'

import fs from 'fs';
import fsPromises from 'fs/promises'
import path from 'path';

export type SerializedGalleryItem = {
    readonly image : string;
    readonly thumb : string;
    readonly caption? : string;
    readonly setting? : string;
}

export type SerializedGallery = {
    readonly id : string;
    readonly description? : string;
    readonly items : SerializedGalleryItem[];
    readonly name : string;
    readonly quarter : string;
    readonly title: string;
}

export type GalleryItemStaticProps = {
    readonly image : string;
    readonly thumb : string;
    readonly thumb_width: number;
    readonly thumb_height: number;
    readonly caption : string;
    readonly setting : string;
}

export type GalleryRefStaticProps = {
    readonly id : string;
    readonly name : string;
}
export type GalleryStaticProps = GalleryRefStaticProps & {
    readonly title: string;
    readonly description : string;
    readonly items : GalleryItemStaticProps[];
}
export class GalleryItem {
    image : string;
    thumb : string;
    caption : string;
    setting : string;

    constructor(basepath : string, image : string, thumb : string, caption : string, setting : string) {
        this.image = path.join(basepath, image);
        this.thumb = path.join(basepath, thumb);
        this.caption = caption || '';
        this.setting = setting || '';

        fs.accessSync(path.join(GALLERY_ASSET_BASEPATH, this.thumb), fs.constants.R_OK);
        fs.accessSync(path.join(GALLERY_ASSET_BASEPATH, this.image), fs.constants.R_OK);
    }

    static async deserialize(basepath : string, data : SerializedGalleryItem) : Promise<GalleryItem> {
        return new GalleryItem(basepath, data.image, data.thumb, data.caption, data.setting);
    }

    async getStaticProps() : Promise<GalleryItemStaticProps> {
        const thumbPath = path.join(GALLERY_ASSET_BASEPATH, this.thumb);
        const thumbBuffer = await fsPromises.readFile(thumbPath);
        const thumb_dimensions = await imageSize(thumbBuffer);

        return {
            image: this.image,
            thumb: this.thumb,
            thumb_width: thumb_dimensions.width,
            thumb_height: thumb_dimensions.height,
            caption: this.caption,
            setting: this.setting
        }

    }
}

export class Gallery {
    id : string             = '';
    name : string           = '';
    quarter : string        = '';
    title : string          = '';
    description : string    = '';
    items : GalleryItem[]   = [];

    constructor(id : string, name : string, title : string, description : string, quarter : string, items : GalleryItem[]) {
        this.id = id;
        this.name = name;
        this.quarter = quarter;
        this.title = title;
        this.description = description || '';
        
        this.items.push(...items);
    }

    static async deserialize(data : SerializedGallery) : Promise<Gallery> {
        const galleryBasePath = path.join(GALLERY_URL_BASEPATH, data.id);

        return new Gallery(data.id,
                           data.name,
                           data.title,
                           data.description,
                           data.quarter,
                           await Promise.all(data.items.map((i) => GalleryItem.deserialize(galleryBasePath, i))));
    }

    async getStaticProps() : Promise<GalleryStaticProps> {
        return {
            id : this.id,
            name : this.name,
            title: this.title,
            description : this.description,
            items : await Promise.all(this.items.map((i) => i.getStaticProps())),
        }
    }

    async getRefStaticProps() : Promise<GalleryRefStaticProps> {
        return {
            id : this.id,
            name : this.name,
        }
    }
}