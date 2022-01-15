import { IFYLP, FYLP } from './fylp';
import { Piece, SerializedPiece } from './piece';

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

export async function deserializeFYLP(data : SerializedFYLP) : Promise<IFYLP> {
    const result : FYLP = new FYLP(await Piece.deserialize(data.piece), data.description);
    data.albums.forEach((a) => result.addAlbum(a.director, a.description, a.label, a.image, a.shopping));

    return result;
}
