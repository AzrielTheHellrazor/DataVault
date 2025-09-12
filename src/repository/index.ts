import { Database } from '../database';
import { IrysUploader } from '../irys/uploader';
import { IrysQuery } from '../irys/query';
import { IrysFetcher } from '../irys/fetcher';
import { DatasetMetadata, UploadOptions, QueryOptions, FetchOptions, DatabaseRecord } from '../types';

export class AIRepository {
  private database: Database;
  private uploader: IrysUploader;
  private query: IrysQuery;
  private fetcher: IrysFetcher;

  constructor(
    privateKey: string,
    dbPath: string,
    irysUrl: string = 'https://node2.irys.xyz',
    gatewayUrl: string = 'https://gateway.irys.xyz',
    currency: string = 'arweave'
  ) {
    this.database = new Database(dbPath);
    this.uploader = new IrysUploader(privateKey, irysUrl, currency);
    this.query = new IrysQuery(gatewayUrl);
    this.fetcher = new IrysFetcher(gatewayUrl);
  }

  async uploadFile(filePath: string, metadata: DatasetMetadata, options: { receipt?: boolean } = {}): Promise<{ transactionId: string; receipt?: string }> {
    try {
      // Upload to Irys
      const uploadResult = await this.uploader.uploadFile(filePath, {
        metadata,
        receipt: options.receipt
      });

      // Store in local database
      const dbRecord: DatabaseRecord = {
        id: uploadResult.transactionId,
        transactionId: uploadResult.transactionId,
        timestamp: Date.now(),
        tags: JSON.stringify(metadata),
        receipt: uploadResult.receipt,
        createdAt: new Date().toISOString()
      };

      await this.database.insertRecord(dbRecord);

      return uploadResult;
    } catch (error) {
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async uploadBuffer(buffer: Buffer, filename: string, metadata: DatasetMetadata, options: { receipt?: boolean } = {}): Promise<{ transactionId: string; receipt?: string }> {
    try {
      // Upload to Irys
      const uploadResult = await this.uploader.uploadBuffer(buffer, filename, {
        metadata,
        receipt: options.receipt
      });

      // Store in local database
      const dbRecord: DatabaseRecord = {
        id: uploadResult.transactionId,
        transactionId: uploadResult.transactionId,
        timestamp: Date.now(),
        tags: JSON.stringify(metadata),
        receipt: uploadResult.receipt,
        createdAt: new Date().toISOString()
      };

      await this.database.insertRecord(dbRecord);

      return uploadResult;
    } catch (error) {
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async batchUpload(files: Array<{ filePath: string; metadata: DatasetMetadata }>, options: { receipt?: boolean; batchSize?: number } = {}): Promise<Array<{ transactionId: string; receipt?: string; filePath: string }>> {
    try {
      // Upload to Irys
      const uploadResults = await this.uploader.batchUpload(files, options);

      // Store in local database
      const dbRecords: DatabaseRecord[] = uploadResults.map(result => ({
        id: result.transactionId,
        transactionId: result.transactionId,
        timestamp: Date.now(),
        tags: JSON.stringify(files.find(f => f.filePath === result.filePath)!.metadata),
        receipt: result.receipt,
        createdAt: new Date().toISOString()
      }));

      for (const record of dbRecords) {
        await this.database.insertRecord(record);
      }

      return uploadResults;
    } catch (error) {
      throw new Error(`Batch upload failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async queryData(options: QueryOptions): Promise<{ results: any[], nextCursor?: string }> {
    try {
      // Try local database first
      const localResults = await this.database.queryRecords(
        options.filters || {},
        options.sortBy || 'timestamp',
        options.sortOrder || 'desc',
        options.limit || 50,
        options.cursor
      );

      // Always return local results, even if empty
      return {
        results: localResults.records.map(record => ({
          id: record.transactionId,
          timestamp: record.timestamp,
          tags: typeof record.tags === 'string' ? JSON.parse(record.tags) : record.tags,
          receipt: record.receipt,
          cursor: record.timestamp.toString()
        })),
        nextCursor: localResults.nextCursor
      };
    } catch (error) {
      throw new Error(`Query failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async fetchFile(options: FetchOptions): Promise<string> {
    try {
      return await this.fetcher.fetchFile(options);
    } catch (error) {
      throw new Error(`Fetch failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async fetchWithMetadata(transactionId: string, metadata: DatasetMetadata, basePath: string = './downloads'): Promise<string> {
    try {
      return await this.fetcher.fetchWithMetadata(transactionId, metadata, basePath);
    } catch (error) {
      throw new Error(`Fetch with metadata failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getLatestVersion(datasetName: string, split?: string): Promise<any> {
    try {
      // Try local database first
      const localResults = await this.database.queryRecords({
        datasetName,
        ...(split && { split })
      }, 'timestamp', 'desc', 1);

      if (localResults.records.length > 0) {
        const record = localResults.records[0];
        return {
          id: record.transactionId,
          timestamp: record.timestamp,
          tags: typeof record.tags === 'string' ? JSON.parse(record.tags) : record.tags,
          receipt: record.receipt
        };
      }

      // Return null if no local results found
      return null;
    } catch (error) {
      throw new Error(`Get latest version failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getVersions(datasetName: string, split?: string): Promise<any[]> {
    try {
      // Try local database first
      const localResults = await this.database.queryRecords({
        datasetName,
        ...(split && { split })
      }, 'timestamp', 'desc');

      return localResults.records.map(record => ({
        id: record.transactionId,
        timestamp: record.timestamp,
        tags: typeof record.tags === 'string' ? JSON.parse(record.tags) : record.tags,
        receipt: record.receipt
      }));
    } catch (error) {
      throw new Error(`Get versions failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getBalance(): Promise<number> {
    return await this.uploader.getBalance();
  }

  async getPrice(size: number): Promise<number> {
    return await this.uploader.getPrice(size);
  }

  async close(): Promise<void> {
    await this.database.close();
  }
}
