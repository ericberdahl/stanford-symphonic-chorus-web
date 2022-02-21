import { PRACTICEFILES_URL_BASEPATH } from "./constants";

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
    title : string;
    files : SerializedPracticeFile[];
}

export type PracticeFileSectionStaticProps = {
    files : PracticeFileStaticProps[];
    title : string;
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
    readonly files :    PracticeFile[]  = [];
    readonly title :    string          = '';

    private constructor(title: string, files: PracticeFile[]) {
        if (files) {
            this.files.push(...files);
        }

        this.title = title;
    }

    async getStaticProps() : Promise<PracticeFileSectionStaticProps> {
        return {
            files:  await Promise.all(this.files.map((f) => f.getStaticProps())),
            title:  this.title,
        }
    }

    static async deserialize(data: SerializedPracticeFileSection) : Promise<PracticeFileSection> {
        return new PracticeFileSection(data.title,
                                       await Promise.all(data.files.map((f) => PracticeFile.deserialize(f))));
    }
}
