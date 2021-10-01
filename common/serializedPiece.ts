import { IModel } from './model'
import { IPiece, Piece, NotedPerformance, IComposer, Composer } from './piece'

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

export function deserializePiece(data : SerializedPiece, model : IModel) : IPiece {
    const composer = deserializeComposer(data.composer, model);

    const piece = model.repertoire.addPiece(new Piece(data.title,
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

function deserializeComposer(composer: SerializedComposer, model : IModel) : IComposer {

    // If the composer field is an array, the final element is the family name and
    // the space-joined concatenation of the fields is the full name.
    // If the composer field is a single string, the family name is the final word
    // in the string.

    const result = (!composer ? new Composer('', '') :
                   (Array.isArray(composer) ? new Composer(composer.join(' '), composer[composer.length - 1]) :
                   (new Composer(composer, composer.split(' ').slice(-1)[0])) ));

    return model.repertoire.validateComposer(result);
}
