import { IPieceSupplement, PieceSupplement } from './pieceSupplement';
import { Piece, SerializedPiece } from './piece';

export type SerializedPieceSupplement = {
    piece : SerializedPiece;
    title : string;
    breadcrumb : string;
    content : string;
}

export async function deserializeSupplement(data : SerializedPieceSupplement) : Promise<IPieceSupplement> {
    return new PieceSupplement(await Piece.deserialize(data.piece),
                               data.title,
                               data.breadcrumb,
                               data.content);
}
