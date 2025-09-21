import Irys from '@irys/sdk';
import * as fs from 'fs-extra';
import { DatasetMetadata, UploadOptions } from '../types';

export class IrysUploader {
  private irys: Irys;

  constructor(privateKey: string, url: string = 'https://node2.irys.xyz', currency: string = 'arweave') {
    
    // Convert hex private key to JWK wallet format for Irys
    const jwk = this.hexToJWK(privateKey);
    this.irys = new Irys({ url, token: currency, key: jwk });
  }

  private hexToJWK(hexKey: string): any {
    // Simple JWK wallet format for testing
    // In production, you should use proper key derivation
    return {
      kty: 'RSA',
      e: 'AQAB',
      n: 'test',
      d: hexKey,
      p: 'test',
      q: 'test',
      dp: 'test',
      dq: 'test',
      qi: 'test'
    };
  }

  async uploadFile(filePath: string, options: UploadOptions): Promise<{ transactionId: string; receipt?: string }> {
    try {
      // Validate file exists
      if (!await fs.pathExists(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Prepare tags
      const tags = this.prepareTags(options.metadata);

      // Upload file
      const response = await this.irys.uploadFile(filePath, {
        tags
      });

      const result: { transactionId: string; receipt?: string } = {
        transactionId: response.id
      };

      // Include receipt if requested
      if (options.receipt) {
        result.receipt = response.signature || undefined;
      }

      return result;
    } catch (error) {
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async uploadBuffer(buffer: Buffer, _filename: string, options: UploadOptions): Promise<{ transactionId: string; receipt?: string }> {
    try {
      // Prepare tags
      const tags = this.prepareTags(options.metadata);

      // Upload buffer
      const response = await this.irys.upload(buffer, {
        tags
      });

      const result: { transactionId: string; receipt?: string } = {
        transactionId: response.id
      };

      // Include receipt if requested
      if (options.receipt) {
        result.receipt = response.signature || undefined;
      }

      return result;
    } catch (error) {
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async batchUpload(files: Array<{ filePath: string; metadata: DatasetMetadata }>, options: { receipt?: boolean; batchSize?: number } = {}): Promise<Array<{ transactionId: string; receipt?: string; filePath: string }>> {
    const batchSize = options.batchSize || 10;
    const results: Array<{ transactionId: string; receipt?: string; filePath: string }> = [];

    // Process files in batches
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (file) => {
        try {
          const result = await this.uploadFile(file.filePath, {
            metadata: file.metadata,
            receipt: options.receipt
          });
          
          return {
            ...result,
            filePath: file.filePath
          };
        } catch (error) {
          console.error(`Failed to upload ${file.filePath}:`, error);
          throw error;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add delay between batches to avoid rate limiting
      if (i + batchSize < files.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  private prepareTags(metadata: DatasetMetadata): Array<{ name: string; value: string }> {
    return [
      { name: 'App', value: metadata.app },
      { name: 'Content-Type', value: metadata.contentType },
      { name: 'Dataset-Name', value: metadata.datasetName },
      { name: 'Split', value: metadata.split },
      { name: 'Version', value: metadata.version },
      { name: 'Owner', value: metadata.owner },
      { name: 'Created-At', value: metadata.createdAt }
    ];
  }

  async getBalance(): Promise<number> {
    try {
      const address = this.irys.address;
      const balance = await this.irys.getBalance(address);
      return balance.toNumber();
    } catch (error) {
      throw new Error(`Failed to get balance: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getPrice(size: number): Promise<number> {
    try {
      const price = await this.irys.getPrice(size);
      return price.toNumber();
    } catch (error) {
      throw new Error(`Failed to get price: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
