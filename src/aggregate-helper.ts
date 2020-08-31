export class AggregateHelper<T> {
    constructor(
        private identify: (x: T) => string,
    ) { }

    public join(a: T[], b: T[]): T[] {
        const p = new Set<string>();
        const q = new Map<string, T>();
        a.forEach(r => p.add(this.identify(r)));
        b.forEach(r => q.set(this.identify(r), r));
        const result: T[] = [];
        q.forEach((r, k) => { if (p.has(k)) { result.push(r); } });
        return result;
    }

    public union(a: T[], b: T[]): T[] {
        const t = new Map<string, T>();
        a.forEach(r => t.set(this.identify(r), r));
        b.forEach(r => t.set(this.identify(r), r));
        const result: T[] = [];
        t.forEach(r => result.push(r));
        return result;
    }

    public outerJoin(a: T[], b: T[]): T[] {
        const p = new Map<string, T>();
        const q = new Map<string, T>();
        a.forEach(r => p.set(this.identify(r), r));
        b.forEach(r => q.set(this.identify(r), r));
        const result: T[] = [];
        p.forEach((r, k) => { if (!q.has(k)) { result.push(r); } });
        q.forEach((r, k) => { if (!p.has(k)) { result.push(r); } });
        return result;
    }

    public exclude(a: T[], b: T[]): T[] {
        const p = new Map<string, T>();
        const q = new Map<string, T>();
        a.forEach(r => p.set(this.identify(r), r));
        b.forEach(r => q.set(this.identify(r), r));
        const result: T[] = [];
        p.forEach((r, k) => { if (!q.has(k)) { result.push(r); } });
        return result;
    }
}
