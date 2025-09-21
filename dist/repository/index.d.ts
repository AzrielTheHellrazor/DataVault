import { DatasetMetadata, QueryOptions, FetchOptions } from '../types';
export declare class AIRepository {
    private database;
    private uploader;
    private fetcher;
    constructor(privateKey: string, dbPath: string, irysUrl?: string, gatewayUrl?: string, currency?: string);
    uploadFile(filePath: string, metadata: DatasetMetadata, options?: {
        receipt?: boolean;
    }): Promise<{
        transactionId: string;
        receipt?: string;
    }>;
    uploadBuffer(buffer: Buffer, filename: string, metadata: DatasetMetadata, options?: {
        receipt?: boolean;
    }): Promise<{
        transactionId: string;
        receipt?: string;
    }>;
    batchUpload(files: Array<{
        filePath: string;
        metadata: DatasetMetadata;
    }>, options?: {
        receipt?: boolean;
        batchSize?: number;
    }): Promise<Array<{
        transactionId: string;
        receipt?: string;
        filePath: string;
    }>>;
    queryData(options: QueryOptions): Promise<{
        results: any[];
        nextCursor?: string;
    }>;
    fetchFile(options: FetchOptions): Promise<string>;
    fetchWithMetadata(transactionId: string, metadata: DatasetMetadata, basePath?: string): Promise<string>;
    getLatestVersion(datasetName: string, split?: string): Promise<any>;
    getVersions(datasetName: string, split?: string): Promise<any[]>;
    getBalance(): Promise<number>;
    getPrice(size: number): Promise<number>;
    close(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map