"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IrysUploader = void 0;
const sdk_1 = __importDefault(require("@irys/sdk"));
const fs = __importStar(require("fs-extra"));
class IrysUploader {
    constructor(privateKey, url = 'https://node2.irys.xyz', currency = 'arweave') {
        // Convert hex private key to JWK wallet format for Irys
        const jwk = this.hexToJWK(privateKey);
        this.irys = new sdk_1.default({ url, token: currency, key: jwk });
    }
    hexToJWK(hexKey) {
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
    async uploadFile(filePath, options) {
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
            const result = {
                transactionId: response.id
            };
            // Include receipt if requested
            if (options.receipt) {
                result.receipt = response.signature || undefined;
            }
            return result;
        }
        catch (error) {
            throw new Error(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async uploadBuffer(buffer, _filename, options) {
        try {
            // Prepare tags
            const tags = this.prepareTags(options.metadata);
            // Upload buffer
            const response = await this.irys.upload(buffer, {
                tags
            });
            const result = {
                transactionId: response.id
            };
            // Include receipt if requested
            if (options.receipt) {
                result.receipt = response.signature || undefined;
            }
            return result;
        }
        catch (error) {
            throw new Error(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async batchUpload(files, options = {}) {
        const batchSize = options.batchSize || 10;
        const results = [];
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
                }
                catch (error) {
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
    prepareTags(metadata) {
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
    async getBalance() {
        try {
            const address = this.irys.address;
            const balance = await this.irys.getBalance(address);
            return balance.toNumber();
        }
        catch (error) {
            throw new Error(`Failed to get balance: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getPrice(size) {
        try {
            const price = await this.irys.getPrice(size);
            return price.toNumber();
        }
        catch (error) {
            throw new Error(`Failed to get price: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.IrysUploader = IrysUploader;
//# sourceMappingURL=uploader.js.map