import { PRACTICEFILES_URL_BASEPATH } from "./constants";

import { strict as assert } from 'assert';
import path from 'path';

export type SerializedPracticeFile = {
    title : string;
    asset : string;
}

export type PracticeFileStaticProps = {
    assetPath :     string;
    assetLabel :    string;
    title :         string;
}

export type SerializedPracticeFileSection = {
    title           : string;
    files?          : SerializedPracticeFile[];
    externalFolder? : string;
    externalLink?   : string;
}

export type PracticeFileSectionStaticProps = {
    externalFolder  : string;
    externalLink    : string;
    files           : PracticeFileStaticProps[];
    title           : string;
}

function getExtension(p: string) : string {
    const ext = path.extname(p);
    const matches = ext.match(/\.(.*)/);
    return (matches.length < 2 ? '' : matches[1]);
}

export class PracticeFile {
    readonly assetPath :    string = '';
    readonly title :        string = '';

    private constructor(title: string, assetPath: string) {
        this.assetPath = assetPath;
        this.title = title;
        
        // TODO : validate that there is a file at the assetPath
    }

    async getStaticProps() : Promise<PracticeFileStaticProps> {
        return {
            assetPath:  this.assetPath,
            assetLabel: getExtension(this.assetPath).toUpperCase(),
            title:      this.title,
        };
    }

    static async deserialize(data: SerializedPracticeFile) : Promise<PracticeFile> {
        return new PracticeFile(data.title,
                                [PRACTICEFILES_URL_BASEPATH, data.asset].join('/'));
    }
}

export class PracticeFileSection {
    readonly externalFolder : string;
    readonly externalLink   : string;
    readonly files          : PracticeFile[]  = [];
    readonly title          : string          = '';

    private constructor(title: string, files: PracticeFile[], externalFolder, externalLink) {
        if (files) {
            this.files.push(...files);
        }

        this.externalFolder = externalFolder;
        this.externalLink   = externalLink;
        this.title = title;

        assert.ok(this.externalFolder || this.externalLink || this.files.length > 0, "PracticeFiles section does not contain files, external folder reference, or external link")
    }

    async getStaticProps() : Promise<PracticeFileSectionStaticProps> {
        return {
            externalFolder  : (this.externalFolder || null),
            externalLink    : (this.externalLink || null),
            files           : await Promise.all(this.files.map((f) => f.getStaticProps())),
            title           : this.title,
        }
    }

    static async deserialize(data: SerializedPracticeFileSection) : Promise<PracticeFileSection> {
        const fileList = (data.files || []);

        return new PracticeFileSection(data.title,
                                       await Promise.all(fileList.map((f) => PracticeFile.deserialize(f))),
                                       data.externalFolder,
                                       data.externalLink);
    }
}
