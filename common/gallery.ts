import imageSize from 'image-size'

import fs from 'fs';
import path from 'path';
import process from 'process';

const GALLERY_URL_BASEPATH = '/galleries';
const GALLERY_ASSET_BASEPATH = path.join(process.cwd(), 'public');

export type SerializedGalleryItem = {
    image : string;
    thumb : string;
    caption : string;
    setting : string;
}

export type SerializedGallery = {
    id : string;
    name : string;
    title: string;
    description : string;
    items : SerializedGalleryItem[];
}

export type GalleryItemStaticProps = {
    image : string;
    thumb : string;
    thumb_width: number;
    thumb_height: number;
    caption : string;
    setting : string;
}

export type GalleryStaticProps = {
    id : string;
    name : string;
    title: string;
    description : string;
    items : GalleryItemStaticProps[];
}

export class GalleryItem {
    readonly image : string;
    readonly thumb : string;
    readonly caption : string;
    readonly setting : string;

    constructor(image : string, thumb : string, caption : string, setting : string) {
        fs.accessSync(path.join(GALLERY_ASSET_BASEPATH, thumb), fs.constants.R_OK);
        fs.accessSync(path.join(GALLERY_ASSET_BASEPATH, image), fs.constants.R_OK);

        this.image = image;
        this.thumb = thumb;
        this.caption = caption;
        this.setting = setting;
    }

    static async deserialize(data : SerializedGalleryItem) : Promise<GalleryItem> {
        return new GalleryItem(data.image, data.thumb, data.caption, data.setting);
    }

    async getStaticProps() : Promise<GalleryItemStaticProps> {
        const thumbPath = path.join(GALLERY_ASSET_BASEPATH, this.thumb);
        const thumb_dimensions = imageSize(thumbPath);

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
    readonly id : string            = '';
    readonly name : string          = '';
    readonly title : string         = '';
    readonly description : string   = '';
    readonly items : GalleryItem[]  = [];

    constructor(id : string, name : string, title : string, description : string) {
        this.id = id;
        this.name = name;
        this.title = title;
        this.description = description;
    }

    static async deserialize(data : SerializedGallery) : Promise<Gallery> {
        const result = new Gallery(data.id, data.name, data.title, data.description);

        result.items.push(... await Promise.all(data.items.map(async (i) => {
            const item = i;
            item.image = path.join(GALLERY_URL_BASEPATH, data.id, item.image);
            item.thumb = path.join(GALLERY_URL_BASEPATH, data.id, item.thumb);
            return GalleryItem.deserialize(i);
        })));

        return result;
    }

    async getStaticProps() : Promise<GalleryStaticProps> {
        return {
            id : this.id,
            name : this.name,
            title: this.title,
            description : this.description,
            items : await Promise.all(this.items.map((i) => i.getStaticProps()))
        }
    }
}