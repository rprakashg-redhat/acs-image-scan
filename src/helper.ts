export interface BinaryFound {
    readonly found: true;
    readonly path: string;
}

export interface BinaryNotFound {
    readonly found: false;
    readonly reason?: string;
}

export type FindBinaryStatus = BinaryFound | BinaryNotFound;