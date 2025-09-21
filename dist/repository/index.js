"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIRepository = void 0;
const database_1 = require("../database");
const uploader_1 = require("../irys/uploader");
const fetcher_1 = require("../irys/fetcher");
class AIRepository {
    constructor(privateKey, dbPath, irysUrl = 'https://node2.irys.xyz', gatewayUrl = 'https://gateway.irys.xyz', currency = 'arweave') {
        this.database = new database_1.Database(dbPath);
        this.uploader = new uploader_1.IrysUploader(privateKey, irysUrl, currency);
        this.fetcher = new fetcher_1.IrysFetcher(gatewayUrl);
    }
    async uploadFile(filePath, metadata, options = {}) {
        try {
            // Upload to Irys
            const uploadResult = await this.uploader.uploadFile(filePath, {
                metadata,
                receipt: options.receipt
            });
            // Store in local database
            const dbRecord = {
                id: uploadResult.transactionId,
                transactionId: uploadResult.transactionId,
                timestamp: Date.now(),
                tags: JSON.stringify(metadata),
                receipt: uploadResult.receipt,
                createdAt: new Date().toISOString()
            };
            await this.database.insertRecord(dbRecord);
            return uploadResult;
        }
        catch (error) {
            throw new Error(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async uploadBuffer(buffer, filename, metadata, options = {}) {
        try {
            // Upload to Irys
            const uploadResult = await this.uploader.uploadBuffer(buffer, filename, {
                metadata,
                receipt: options.receipt
            });
            // Store in local database
            const dbRecord = {
                id: uploadResult.transactionId,
                transactionId: uploadResult.transactionId,
                timestamp: Date.now(),
                tags: JSON.stringify(metadata),
                receipt: uploadResult.receipt,
                createdAt: new Date().toISOString()
            };
            await this.database.insertRecord(dbRecord);
            return uploadResult;
        }
        catch (error) {
            throw new Error(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async batchUpload(files, options = {}) {
        try {
            // Upload to Irys
            const uploadResults = await this.uploader.batchUpload(files, options);
            // Store in local database
            const dbRecords = uploadResults.map(result => ({
                id: result.transactionId,
                transactionId: result.transactionId,
                timestamp: Date.now(),
                tags: JSON.stringify(files.find(f => f.filePath === result.filePath).metadata),
                receipt: result.receipt,
                createdAt: new Date().toISOString()
            }));
            for (const record of dbRecords) {
                await this.database.insertRecord(record);
            }
            return uploadResults;
        }
        catch (error) {
            throw new Error(`Batch upload failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async queryData(options) {
        try {
            // Try local database first
            const localResults = await this.database.queryRecords(options.filters || {}, options.sortBy || 'timestamp', options.sortOrder || 'desc', options.limit || 50, options.cursor);
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
        }
        catch (error) {
            throw new Error(`Query failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async fetchFile(options) {
        try {
            return await this.fetcher.fetchFile(options);
        }
        catch (error) {
            throw new Error(`Fetch failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async fetchWithMetadata(transactionId, metadata, basePath = './downloads') {
        try {
            return await this.fetcher.fetchWithMetadata(transactionId, metadata, basePath);
        }
        catch (error) {
            throw new Error(`Fetch with metadata failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getLatestVersion(datasetName, split) {
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
        }
        catch (error) {
            throw new Error(`Get latest version failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getVersions(datasetName, split) {
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
        }
        catch (error) {
            throw new Error(`Get versions failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getBalance() {
        return await this.uploader.getBalance();
    }
    async getPrice(size) {
        return await this.uploader.getPrice(size);
    }
    async close() {
        await this.database.close();
    }
}
exports.AIRepository = AIRepository;
//# sourceMappingURL=index.js.map