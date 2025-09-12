import * as fs from 'fs-extra';
import * as path from 'path';
import { FetchOptions, DatasetMetadata } from '../types';

export class IrysFetcher {
  private gatewayUrl: string;

  constructor(gatewayUrl: string = 'https://gateway.irys.xyz') {
    this.gatewayUrl = gatewayUrl;
  }

  async fetchFile(options: FetchOptions): Promise<string> {
    try {
      const { transactionId, localPath, overwrite = false } = options;
      
      // Build the gateway URL for the file
      const fileUrl = `${this.gatewayUrl}/${transactionId}`;
      
      // Fetch the file
      const response = await fetch(fileUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }

      // Get the file buffer
      const buffer = await response.arrayBuffer();
      const fileBuffer = Buffer.from(buffer);

      // Determine local path if not provided
      const finalLocalPath = localPath || await this.generateLocalPath(transactionId);
      
      // Check if file exists and overwrite is false
      if (await fs.pathExists(finalLocalPath) && !overwrite) {
        throw new Error(`File already exists: ${finalLocalPath}. Use overwrite=true to replace.`);
      }

      // Ensure directory exists
      await fs.ensureDir(path.dirname(finalLocalPath));

      // Write file
      await fs.writeFile(finalLocalPath, fileBuffer);

      return finalLocalPath;
    } catch (error) {
      throw new Error(`Fetch failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async fetchWithMetadata(transactionId: string, metadata: DatasetMetadata, basePath: string = './downloads'): Promise<string> {
    try {
      // Generate structured path: App/Dataset-Name/Version/Split
      const structuredPath = path.join(
        basePath,
        metadata.app,
        metadata.datasetName,
        metadata.version,
        metadata.split
      );

      // Get file extension from content type
      const extension = this.getExtensionFromContentType(metadata.contentType);
      const filename = `${metadata.datasetName}_${metadata.split}_${metadata.version}${extension}`;
      const fullPath = path.join(structuredPath, filename);

      return await this.fetchFile({
        transactionId,
        localPath: fullPath,
        overwrite: true
      });
    } catch (error) {
      throw new Error(`Fetch with metadata failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async generateLocalPath(transactionId: string): Promise<string> {
    // Default path generation
    return path.join('./downloads', `${transactionId}.bin`);
  }

  private getExtensionFromContentType(contentType: string): string {
    const extensions: { [key: string]: string } = {
      'application/octet-stream': '.bin',
      'application/pytorch': '.pt',
      'application/json': '.json',
      'text/plain': '.txt',
      'application/zip': '.zip',
      'application/x-tar': '.tar',
      'application/gzip': '.gz'
    };

    return extensions[contentType] || '.bin';
  }

  async fetchBatch(transactionIds: string[], basePath: string = './downloads'): Promise<string[]> {
    const results: string[] = [];
    
    for (const transactionId of transactionIds) {
      try {
        const localPath = await this.fetchFile({
          transactionId,
          localPath: path.join(basePath, `${transactionId}.bin`),
          overwrite: true
        });
        results.push(localPath);
      } catch (error) {
        console.error(`Failed to fetch ${transactionId}:`, error);
      }
    }

    return results;
  }
}
