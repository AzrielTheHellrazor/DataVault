/**
 * AI Data Repository on Irys
 *
 * A minimal data repository for storing and managing AI datasets,
 * embeddings, and PyTorch model files on Irys blockchain.
 *
 * @packageDocumentation
 */
export { AIRepository } from './repository';
export { Database } from './database';
export { IrysUploader } from './irys/uploader';
export { IrysQuery } from './irys/query';
export { IrysFetcher } from './irys/fetcher';
export * from './types';
export declare const VERSION = "1.0.0";
export declare const PACKAGE_NAME = "datavault";
export type { DatasetMetadata, QueryOptions, UploadOptions, UploadResult, QueryResult } from './types';
//# sourceMappingURL=index.d.ts.map