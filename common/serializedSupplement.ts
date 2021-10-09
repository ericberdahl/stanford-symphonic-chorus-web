import { IModel } from './model'
import { ISupplement } from './supplement';

export type SerializedSupplement = {
    title : string;
    breadcrumb: string;
    content : string;
}

export function deserializeSupplement(data : SerializedSupplement, model : IModel) : ISupplement {
    model.supplements.push(data);
    return data;
}
