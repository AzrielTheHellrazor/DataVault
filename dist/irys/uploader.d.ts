import { DatasetMetadata, UploadOptions } from '../types';
export declare class IrysUploader {
    private irys;
    constructor(privateKey: string, url?: string, currency?: string);
    private hexToJWK;
    uploadFile(filePath: string, options: UploadOptions): Promise<{
        transactionId: string;
        receipt?: string;
    }>;
    uploadBuffer(buffer: Buffer, _filename: string, options: UploadOptions): Promise<{
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
    private prepareTags;
    getBalance(): Promise<number>;
    getPrice(size: number): Promise<number>;
}
//# sourceMappingURL=uploader.d.ts.map