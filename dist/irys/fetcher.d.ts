import { FetchOptions, DatasetMetadata } from '../types';
export declare class IrysFetcher {
    private gatewayUrl;
    constructor(gatewayUrl?: string);
    fetchFile(options: FetchOptions): Promise<string>;
    fetchWithMetadata(transactionId: string, metadata: DatasetMetadata, basePath?: string): Promise<string>;
    private generateLocalPath;
    private getExtensionFromContentType;
    fetchBatch(transactionIds: string[], basePath?: string): Promise<string[]>;
}
//# sourceMappingURL=fetcher.d.ts.map