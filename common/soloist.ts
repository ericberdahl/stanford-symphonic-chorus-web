export type SerializedSoloist = {
    name : string;
    part : string;
}

export type SoloistStaticProps = {
    name : string;
    part : string;
}

export class Soloist {
    readonly name : string;
    readonly part : string;

    private constructor(name : string, part : string) {
        this.name = name;
        this.part = part;
    }

    async getStaticProps() : Promise<SoloistStaticProps> {
        return {
            name: this.name,
            part: this.part || null,
        }
    }

    static async deserialize(data : SerializedSoloist) : Promise<Soloist> {
        return new Soloist(data.name, data.part);
    }
}
