import { IFYLP, FYLP } from './fylp';
import { Repertoire } from './repertoire';
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

export function deserializeFYLP(data : SerializedFYLP) : IFYLP {
    const result : FYLP = new FYLP(deserializePiece(data.piece), data.description);
    data.albums.forEach((a) => result.addAlbum(a.director, a.description, a.label, a.image, a.shopping));

    return result;
}
