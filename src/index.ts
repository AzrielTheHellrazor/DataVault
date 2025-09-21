/**
 * AI Data Repository on Irys
 * 
 * A minimal data repository for storing and managing AI datasets, 
 * embeddings, and PyTorch model files on Irys blockchain.
 * 
 * @packageDocumentation
 */

// Main exports
export { AIRepository } from './repository';
export { Database } from './database';
export { IrysUploader } from './irys/uploader';
export { IrysQuery } from './irys/query';
export { IrysFetcher } from './irys/fetcher';

// Type exports
export * from './types';

// Version information
export const VERSION = '1.0.0';
export const PACKAGE_NAME = 'datavault';

// Re-export commonly used types for convenience
export type { 
  DatasetMetadata, 
  QueryOptions, 
  UploadOptions, 
  UploadResult, 
  QueryResult 
} from './types';
