import { IPiece, Piece, NotedPerformance, IComposer, Composer } from './piece'
import { Repertoire } from './repertoire';

type SerializedComposer = string | Array<string>;

export type SerializedPiece = {
    title : string;
    composer? : SerializedComposer;
    movement? : string;
    translation? : string;
    commonTitle? : string;
    catalog? : string;
    arranger? : string;
    prefix? : string;
    suffix? : string;
    performanceNote? : string;
}

export function deserializePiece(data : SerializedPiece, repertoire? : Repertoire) : IPiece {
    const composer = deserializeComposer(data.composer, repertoire);

    const piece = repertoire.addPiece(new Piece(data.title,
                                                composer,
                                                data.movement,
                                                data.translation,
                                                data.commonTitle,
                                                data.catalog,
                                                data.arranger,
                                                data.prefix,
                                                data.suffix));
    
    return (data.performanceNote ?
                new NotedPerformance(piece, data.performanceNote) :
                piece);
}

function deserializeComposer(composer: SerializedComposer, repertoire? : Repertoire) : IComposer {

    // If the composer field is an array, the final element is the family name and
    // the space-joined concatenation of the fields is the full name.
    // If the composer field is a single string, the family name is the final word
    // in the string.

    const result = (!composer ? new Composer('', '') :
                   (Array.isArray(composer) ? new Composer(composer.join(' '), composer[composer.length - 1]) :
                   (new Composer(composer, composer.split(' ').slice(-1)[0])) ));

    return repertoire?.validateComposer(result) || result;
}
