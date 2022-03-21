import { PerformancePiece, PerformancePieceStaticProps, SerializedPerformancePiece } from './performancePiece'

export type SerializedPerformanceRepertoire = {
    main :      SerializedPerformancePiece[];
    other? :    SerializedPerformancePiece[];
}

export type PerformanceRepertoireStaticProps = {
    main :  PerformancePieceStaticProps[];
    full :  PerformancePieceStaticProps[];
}

export class PerformanceRepertoire {
    readonly main : PerformancePiece[]  = []
    readonly full : PerformancePiece[]  = []

    private constructor(main : PerformancePiece[], other? : PerformancePiece[]) {
        this.main.push(...main);
        this.full.push(...main);

        if (other) {
            this.full.push(...other);
        }
    }

    async getStaticProps() : Promise<PerformanceRepertoireStaticProps> {
        return {
            main:   await Promise.all(this.main.map((p) => p.getStaticProps())),
            full:   await Promise.all(this.full.map((p) => p.getStaticProps())),
        }
    }

    static async deserialize(data : SerializedPerformanceRepertoire) : Promise<PerformanceRepertoire> {
        const main = await Promise.all(data.main.map((p) => PerformancePiece.deserialize(p)));
        
        const other = [];
        if (data.other) {
            other.push(...await Promise.all(data.other.map((p) => PerformancePiece.deserialize(p))));
        }

        return new PerformanceRepertoire(main, other);
    }
}
