export class WeakRegistry<KeyT, ValueT extends Object> {
    private readonly collection : Map<KeyT, WeakRef<ValueT>> = new Map<KeyT, WeakRef<ValueT>>();
    // TODO : consider adding a FinalizationRegistry to improve the chances that the collection might
    //        get cleaned up after a GC

    constructor() {

    }

    clear() {
        this.collection.clear();
    }

    remove(key : KeyT) {
        this.collection.delete(key);
    }

    lookup(key : KeyT , registerIfAbsent? : ValueT) : ValueT {
        let result : ValueT = this.get(key);

        if (!result && registerIfAbsent) {
            this.add(key, registerIfAbsent);
            result = registerIfAbsent;
        }

        return result;
    }

    private add(key : KeyT, value : ValueT) {
        this.collection.set(key, new WeakRef<ValueT>(value));
    }

    private get(key : KeyT) : ValueT {
        let result : ValueT;

        const ref = this.collection.get(key);
        if (ref) {
            result = ref.deref();
            if (!result) {
                this.remove(key);
            }
        }

        return result;
    }
}
