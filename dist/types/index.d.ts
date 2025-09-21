export interface DatasetMetadata {
    app: string;
    contentType: string;
    datasetName: string;
    split: string;
    version: string;
    owner: string;
    createdAt: string;
}
export interface UploadOptions {
    metadata: DatasetMetadata;
    receipt?: boolean;
    batchSize?: number;
}
export interface UploadResult {
    transactionId: string;
    receipt?: string;
    size?: number;
}
export interface QueryOptions {
    filters?: {
        datasetName?: string;
        split?: string;
        version?: string;
        contentType?: string;
        app?: string;
        owner?: string;
        startTime?: string;
        endTime?: string;
    };
    sortBy?: 'timestamp' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    cursor?: string;
}
export interface QueryResult {
    id: string;
    timestamp: number;
    tags: DatasetMetadata;
    receipt?: string;
    cursor?: string;
}
export interface FetchOptions {
    transactionId: string;
    localPath?: string;
    overwrite?: boolean;
}
export interface DatabaseRecord {
    id: string;
    transactionId: string;
    timestamp: number;
    tags: string;
    receipt?: string;
    createdAt: string;
}
//# sourceMappingURL=index.d.ts.map