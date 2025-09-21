#!/usr/bin/env node
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
const commander_1 = require("commander");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const repository_1 = require("./repository");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const program = new commander_1.Command();
program
    .name('datavault')
    .description('DataVault CLI - AI Data Repository on Irys')
    .version('1.0.0');
// Upload command
program
    .command('upload')
    .description('Upload a file to the AI repository')
    .requiredOption('-f, --file <path>', 'Path to the file to upload')
    .requiredOption('-a, --app <name>', 'Application name')
    .requiredOption('-n, --dataset-name <name>', 'Dataset name')
    .requiredOption('-s, --split <split>', 'Dataset split (train, test, val, etc.)')
    .requiredOption('-v, --version <version>', 'Dataset version')
    .requiredOption('-o, --owner <owner>', 'Dataset owner')
    .option('-t, --content-type <type>', 'Content type (default: auto-detect)')
    .option('-r, --receipt', 'Include receipt in response')
    .action(async (options) => {
    try {
        const privateKey = process.env.IRYS_PRIVATE_KEY;
        const dbPath = process.env.DATABASE_PATH || './data/repository.db';
        if (!privateKey) {
            console.error('Error: IRYS_PRIVATE_KEY environment variable is required');
            process.exit(1);
        }
        // Ensure database directory exists
        await fs.ensureDir(path.dirname(dbPath));
        const irysUrl = process.env.IRYS_URL || 'https://node1.irys.xyz';
        const gatewayUrl = process.env.IRYS_GATEWAY_URL || 'https://gateway.irys.xyz';
        const currency = process.env.IRYS_CURRENCY || 'ethereum';
        const repository = new repository_1.AIRepository(privateKey, dbPath, irysUrl, gatewayUrl, currency);
        // Auto-detect content type if not provided
        let contentType = options.contentType;
        if (!contentType) {
            const ext = path.extname(options.file).toLowerCase();
            const mimeTypes = {
                '.pt': 'application/pytorch',
                '.json': 'application/json',
                '.txt': 'text/plain',
                '.zip': 'application/zip',
                '.tar': 'application/x-tar',
                '.gz': 'application/gzip'
            };
            contentType = mimeTypes[ext] || 'application/octet-stream';
        }
        const metadata = {
            app: options.app,
            contentType,
            datasetName: options.datasetName,
            split: options.split,
            version: options.version,
            owner: options.owner,
            createdAt: new Date().toISOString()
        };
        console.log('Uploading file...');
        const result = await repository.uploadFile(options.file, metadata, {
            receipt: options.receipt
        });
        console.log('Upload successful!');
        console.log(`Transaction ID: ${result.transactionId}`);
        if (result.receipt) {
            console.log(`Receipt: ${result.receipt}`);
        }
        await repository.close();
    }
    catch (error) {
        console.error('Upload failed:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
});
// Query command
program
    .command('query')
    .description('Query datasets in the repository')
    .option('-n, --dataset-name <name>', 'Filter by dataset name')
    .option('-s, --split <split>', 'Filter by split')
    .option('-v, --version <version>', 'Filter by version')
    .option('-t, --content-type <type>', 'Filter by content type')
    .option('-a, --app <name>', 'Filter by app')
    .option('-o, --owner <owner>', 'Filter by owner')
    .option('--start-time <time>', 'Start time (ISO format)')
    .option('--end-time <time>', 'End time (ISO format)')
    .option('-l, --limit <number>', 'Limit number of results', '50')
    .option('--cursor <cursor>', 'Cursor for pagination')
    .action(async (options) => {
    try {
        const privateKey = process.env.IRYS_PRIVATE_KEY;
        const dbPath = process.env.DATABASE_PATH || './data/repository.db';
        if (!privateKey) {
            console.error('Error: IRYS_PRIVATE_KEY environment variable is required');
            process.exit(1);
        }
        const irysUrl = process.env.IRYS_URL || 'https://node1.irys.xyz';
        const gatewayUrl = process.env.IRYS_GATEWAY_URL || 'https://gateway.irys.xyz';
        const currency = process.env.IRYS_CURRENCY || 'ethereum';
        const repository = new repository_1.AIRepository(privateKey, dbPath, irysUrl, gatewayUrl, currency);
        const queryOptions = {
            filters: {
                ...(options.datasetName && { datasetName: options.datasetName }),
                ...(options.split && { split: options.split }),
                ...(options.version && { version: options.version }),
                ...(options.contentType && { contentType: options.contentType }),
                ...(options.app && { app: options.app }),
                ...(options.owner && { owner: options.owner }),
                ...(options.startTime && { startTime: options.startTime }),
                ...(options.endTime && { endTime: options.endTime })
            },
            limit: parseInt(options.limit),
            cursor: options.cursor
        };
        console.log('Querying datasets...');
        const { results, nextCursor } = await repository.queryData(queryOptions);
        console.log(`Found ${results.length} results:`);
        results.forEach((result, index) => {
            console.log(`\n${index + 1}. Transaction ID: ${result.id}`);
            console.log(`   Timestamp: ${new Date(result.timestamp).toISOString()}`);
            console.log(`   Dataset: ${result.tags.datasetName}`);
            console.log(`   Split: ${result.tags.split}`);
            console.log(`   Version: ${result.tags.version}`);
            console.log(`   App: ${result.tags.app}`);
            console.log(`   Owner: ${result.tags.owner}`);
            if (result.receipt) {
                console.log(`   Receipt: ${result.receipt}`);
            }
        });
        if (nextCursor) {
            console.log(`\nNext cursor: ${nextCursor}`);
        }
        await repository.close();
    }
    catch (error) {
        console.error('Query failed:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
});
// Fetch command
program
    .command('fetch')
    .description('Fetch a dataset from the repository')
    .requiredOption('-i, --id <transactionId>', 'Transaction ID to fetch')
    .option('-o, --output <path>', 'Output path (default: ./downloads)')
    .option('--overwrite', 'Overwrite existing files')
    .action(async (options) => {
    try {
        const privateKey = process.env.IRYS_PRIVATE_KEY;
        const dbPath = process.env.DATABASE_PATH || './data/repository.db';
        if (!privateKey) {
            console.error('Error: IRYS_PRIVATE_KEY environment variable is required');
            process.exit(1);
        }
        const irysUrl = process.env.IRYS_URL || 'https://node1.irys.xyz';
        const gatewayUrl = process.env.IRYS_GATEWAY_URL || 'https://gateway.irys.xyz';
        const currency = process.env.IRYS_CURRENCY || 'ethereum';
        const repository = new repository_1.AIRepository(privateKey, dbPath, irysUrl, gatewayUrl, currency);
        console.log('Fetching file...');
        const localPath = await repository.fetchFile({
            transactionId: options.id,
            localPath: options.output,
            overwrite: options.overwrite
        });
        console.log(`File downloaded to: ${localPath}`);
        await repository.close();
    }
    catch (error) {
        console.error('Fetch failed:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
});
// Latest version command
program
    .command('latest')
    .description('Get the latest version of a dataset')
    .requiredOption('-n, --dataset-name <name>', 'Dataset name')
    .option('-s, --split <split>', 'Dataset split')
    .action(async (options) => {
    try {
        const privateKey = process.env.IRYS_PRIVATE_KEY;
        const dbPath = process.env.DATABASE_PATH || './data/repository.db';
        if (!privateKey) {
            console.error('Error: IRYS_PRIVATE_KEY environment variable is required');
            process.exit(1);
        }
        const irysUrl = process.env.IRYS_URL || 'https://node1.irys.xyz';
        const gatewayUrl = process.env.IRYS_GATEWAY_URL || 'https://gateway.irys.xyz';
        const currency = process.env.IRYS_CURRENCY || 'ethereum';
        const repository = new repository_1.AIRepository(privateKey, dbPath, irysUrl, gatewayUrl, currency);
        console.log('Getting latest version...');
        const result = await repository.getLatestVersion(options.datasetName, options.split);
        if (result) {
            console.log('Latest version found:');
            console.log(`Transaction ID: ${result.id}`);
            console.log(`Timestamp: ${new Date(result.timestamp).toISOString()}`);
            console.log(`Dataset: ${result.tags.datasetName}`);
            console.log(`Split: ${result.tags.split}`);
            console.log(`Version: ${result.tags.version}`);
            console.log(`App: ${result.tags.app}`);
            console.log(`Owner: ${result.tags.owner}`);
            if (result.receipt) {
                console.log(`Receipt: ${result.receipt}`);
            }
        }
        else {
            console.log('No versions found for the specified dataset.');
        }
        await repository.close();
    }
    catch (error) {
        console.error('Get latest version failed:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
});
// Balance command
program
    .command('balance')
    .description('Check Irys account balance')
    .action(async () => {
    try {
        const privateKey = process.env.IRYS_PRIVATE_KEY;
        const dbPath = process.env.DATABASE_PATH || './data/repository.db';
        if (!privateKey) {
            console.error('Error: IRYS_PRIVATE_KEY environment variable is required');
            process.exit(1);
        }
        const irysUrl = process.env.IRYS_URL || 'https://node1.irys.xyz';
        const gatewayUrl = process.env.IRYS_GATEWAY_URL || 'https://gateway.irys.xyz';
        const currency = process.env.IRYS_CURRENCY || 'ethereum';
        const repository = new repository_1.AIRepository(privateKey, dbPath, irysUrl, gatewayUrl, currency);
        console.log('Checking balance...');
        const balance = await repository.getBalance();
        console.log(`Current balance: ${balance} AR`);
        await repository.close();
    }
    catch (error) {
        console.error('Balance check failed:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
});
program.parse();
//# sourceMappingURL=cli.js.map