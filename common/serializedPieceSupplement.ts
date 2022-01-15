import { IPieceSupplement, PieceSupplement } from './pieceSupplement';
import { deserializePiece, SerializedPiece } from './serializedPiece';

export type SerializedPieceSupplement = {
    piece : SerializedPiece;
    title : string;
    breadcrumb : string;
    content : string;
}

export function deserializeSupplement(data : SerializedPieceSupplement) : IPieceSupplement {
    return new PieceSupplement(deserializePiece(data.piece),
                               data.title,
                               data.breadcrumb,
                               data.content);
}
