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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IrysFetcher = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
class IrysFetcher {
    constructor(gatewayUrl = 'https://gateway.irys.xyz') {
        this.gatewayUrl = gatewayUrl;
    }
    async fetchFile(options) {
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
        }
        catch (error) {
            throw new Error(`Fetch failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async fetchWithMetadata(transactionId, metadata, basePath = './downloads') {
        try {
            // Generate structured path: App/Dataset-Name/Version/Split
            const structuredPath = path.join(basePath, metadata.app, metadata.datasetName, metadata.version, metadata.split);
            // Get file extension from content type
            const extension = this.getExtensionFromContentType(metadata.contentType);
            const filename = `${metadata.datasetName}_${metadata.split}_${metadata.version}${extension}`;
            const fullPath = path.join(structuredPath, filename);
            return await this.fetchFile({
                transactionId,
                localPath: fullPath,
                overwrite: true
            });
        }
        catch (error) {
            throw new Error(`Fetch with metadata failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async generateLocalPath(transactionId) {
        // Default path generation
        return path.join('./downloads', `${transactionId}.bin`);
    }
    getExtensionFromContentType(contentType) {
        const extensions = {
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
    async fetchBatch(transactionIds, basePath = './downloads') {
        const results = [];
        for (const transactionId of transactionIds) {
            try {
                const localPath = await this.fetchFile({
                    transactionId,
                    localPath: path.join(basePath, `${transactionId}.bin`),
                    overwrite: true
                });
                results.push(localPath);
            }
            catch (error) {
                console.error(`Failed to fetch ${transactionId}:`, error);
            }
        }
        return results;
    }
}
exports.IrysFetcher = IrysFetcher;
//# sourceMappingURL=fetcher.js.map