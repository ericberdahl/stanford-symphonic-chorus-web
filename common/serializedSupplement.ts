import { deserializePiece, SerializedPiece } from './serializedPiece';
import { ISupplement, Supplement } from './supplement';

export type SerializedSupplement = {
    piece: SerializedPiece;
    title : string;
    breadcrumb: string;
    content : string;
}

export function deserializeSupplement(data : SerializedSupplement) : ISupplement {
    return new Supplement(deserializePiece(data.piece),
                          data.title,
                          data.breadcrumb,
                          data.content);
}
