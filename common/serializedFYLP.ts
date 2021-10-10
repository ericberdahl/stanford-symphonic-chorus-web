import { IFYLP, FYLP } from './fylp';
import { IModel } from './model';
import { SerializedPiece, deserializePiece } from './serializedPiece';

type SerializedAlbum = {
    director : string;
    description : string;
    label? : string;
    image? : string;
    shopping? : string[];
}

type SerializedFYLP = {
    piece : SerializedPiece;
    description? : string;
    albums : SerializedAlbum[];
}

export function deserializeFYLP(data : SerializedFYLP, model : IModel) : IFYLP {
    const piece = deserializePiece(data.piece, model.repertoire);

    const result : FYLP = new FYLP(piece, data.description);
    data.albums.forEach((a) => result.addAlbum(a.director, a.description, a.label, a.image, a.shopping));

    piece.fylp = result;

    return result;
}
