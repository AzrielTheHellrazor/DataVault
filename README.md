# AI Data Repository on Irys

[![npm version](https://badge.fury.io/js/datavault.svg)](https://www.npmjs.com/package/datavault)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A minimal data repository for storing and managing AI datasets, embeddings, and PyTorch model files on Irys blockchain. Built with TypeScript and designed for production use.

## Features

- 🚀 **File Upload**: Upload AI datasets, embeddings, and PyTorch model files (.pt) to Irys
- 🏷️ **Metadata Management**: Required metadata tags for each upload (App, Content-Type, Dataset-Name, Split, Version, Owner, Created-At)
- 📦 **Batch Upload**: Efficiently upload large files in batches
- 🔍 **GraphQL Querying**: Filter by tags and time ranges, sorting and pagination
- ⬇️ **File Download**: Download files to local folders in structured format using transaction ID
- 💾 **Local Cache**: SQLite-based local cache/index for fast access
- 🖥️ **CLI Interface**: Easy command-line interaction
- 🔧 **TypeScript Support**: Full type safety and IntelliSense

## Installation

### As an NPM Package

```bash
npm install datavault
# or
yarn add datavault
# or
pnpm add datavault
```

### Global CLI Installation

```bash
npm install -g datavault
```

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/AzrielTheHellrazor/DataVault.git
cd DataVault
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Set up environment variables:
```bash
cp env.example .env
```

4. Edit the `.env` file:
```env
IRYS_URL=https://node2.irys.xyz
IRYS_PRIVATE_KEY=your_private_key_here
IRYS_CURRENCY=arweave
DATABASE_PATH=./data/repository.db
LOCAL_STORAGE_PATH=./data/downloads
```

5. Build the project:
```bash
npm run build
```

## Usage

### CLI Commands

After installing globally, you can use the `datavault` command:

#### File Upload
```bash
datavault upload -f ./model.pt -a my-app -n mnist -s train -v 1.0.0 -o user@example.com --receipt
```

#### Dataset Querying
```bash
# Basic querying
datavault query -n mnist -s train -l 10

# Advanced filtering
datavault query -n mnist --start-time 2024-01-01T00:00:00Z --end-time 2024-12-31T23:59:59Z

# List datasets of a specific app
datavault query -a my-app -l 20
```

#### File Download
```bash
datavault fetch -i <transaction_id> -o ./downloads/
```

#### Get Latest Version
```bash
datavault latest -n mnist -s train
```

#### Account Balance
```bash
datavault balance
```

### Development CLI Commands

If you're working with the source code:

```bash
# File Upload
npm run upload -- -f ./model.pt -a my-app -n mnist -s train -v 1.0.0 -o user@example.com --receipt

# Dataset Querying
npm run query -- -n mnist -s train -l 10

# File Download
npm run fetch -- -i <transaction_id> -o ./downloads/

# Get Latest Version
npm run latest -- -n mnist -s train

# Account Balance
npm run balance
```

### Programmatic Usage

#### Basic Import

```typescript
import { AIRepository, DatasetMetadata } from 'datavault';

// Initialize repository
const repository = new AIRepository(privateKey, dbPath);

// File upload
const metadata: DatasetMetadata = {
  app: 'my-app',
  contentType: 'application/pytorch',
  datasetName: 'mnist',
  split: 'train',
  version: '1.0.0',
  owner: 'user@example.com',
  createdAt: new Date().toISOString()
};

const result = await repository.uploadFile('./model.pt', metadata, { receipt: true });

// Dataset querying
const queryResults = await repository.queryData({
  filters: { datasetName: 'mnist' },
  limit: 10
});

// File download
const localPath = await repository.fetchFile({
  transactionId: result.transactionId,
  localPath: './downloads/model.pt'
});

await repository.close();
```

#### Advanced Usage

```typescript
import { 
  AIRepository, 
  IrysUploader, 
  IrysQuery, 
  IrysFetcher,
  DatasetMetadata,
  QueryOptions 
} from 'datavault';

// Custom configuration
const repository = new AIRepository(
  privateKey, 
  dbPath, 
  'https://node2.irys.xyz',  // Irys URL
  'https://gateway.irys.xyz', // Gateway URL
  'arweave'                   // Currency
);

// Batch upload
const files = [
  { filePath: './train.pt', metadata: trainMetadata },
  { filePath: './test.pt', metadata: testMetadata },
  { filePath: './val.pt', metadata: valMetadata }
];

const results = await repository.batchUpload(files, { 
  receipt: true, 
  batchSize: 10 
});

// Advanced querying
const queryOptions: QueryOptions = {
  filters: {
    datasetName: 'mnist',
    split: 'train',
    startTime: '2024-01-01T00:00:00Z',
    endTime: '2024-12-31T23:59:59Z'
  },
  limit: 50,
  sort: 'timestamp',
  order: 'desc'
};

const { results, nextCursor } = await repository.queryData(queryOptions);
```

#### TypeScript Support

The package provides full TypeScript support with comprehensive type definitions:

```typescript
import type { 
  DatasetMetadata,
  QueryOptions,
  UploadOptions,
  UploadResult,
  QueryResult,
  DatabaseRecord
} from 'datavault';
```

## Metadata Tags

The following metadata tags are required for each uploaded file:

- **App**: Application name
- **Content-Type**: File type (e.g., application/pytorch, application/json)
- **Dataset-Name**: Dataset name
- **Split**: Dataset split (train, test, val, etc.)
- **Version**: Dataset version
- **Owner**: Dataset owner
- **Created-At**: Creation date (ISO format)

## Examples & Documentation

### **Comprehensive Examples Suite**
- 🚀 **`examples/run-all-examples.ts`** - Master runner for all demonstrations
- 📦 **`examples/batch-upload-demo.ts`** - Batch operations and bulk processing
- 🎯 **`examples/advanced-programmatic-usage.ts`** - Advanced features and patterns
- 🏗️ **`examples/cicd-integration-examples.ts`** - CI/CD pipelines and deployment strategies
- 📊 **`examples/monitoring-analytics-demo.ts`** - Performance monitoring and analytics
- 🔒 **`examples/security-audit-examples.ts`** - Security features and compliance
- 🧪 **`examples/comprehensive-test-suite.ts`** - Full system testing and validation

### **Documentation & References**
- 📖 **`examples/real-world-examples.md`** - Practical use cases for ML models, datasets, embeddings
- 🔍 **`examples/graphql-queries.md`** - Complete GraphQL query reference
- 💻 **`examples/usage-examples.ts`** - Basic TypeScript code examples
- 💾 **`examples/cli-examples.sh`** - Command-line usage demonstrations
- 📚 **`examples/README.md`** - Detailed examples documentation

### **Quick Start with Examples**
```bash
# Run all example demonstrations
bun run examples

# Run specific example categories
bun run example:batch        # Batch upload demonstrations
bun run example:advanced     # Advanced programmatic features
bun run example:cicd         # CI/CD integration patterns
bun run example:monitoring   # Performance monitoring & analytics
bun run example:security     # Security & audit features
bun run example:test         # Comprehensive test suite

# Quick demo of basic features
bun run demo:quick
```

### **Common Use Cases**
```bash
# Upload a PyTorch model
bun run upload -- -f ./models/mnist_cnn.pt -a ml-training -n mnist-classifier -s production -v 2.1.0 -o team@company.com

# Upload training data
bun run upload -- -f ./data/train.csv -a data-pipeline -n customer-data -s train -v 1.0.0 -o data-team@company.com

# Find all models from an app
bun run query -- -a ml-training -l 20

# Download latest production model
bun run latest -- -n mnist-classifier -s production
```

## GraphQL Queries

The project provides advanced querying features using the Irys GraphQL API. See the `examples/graphql-queries.md` file for detailed examples.

### Example Query
```graphql
query GetLatestDatasetVersion($datasetName: String!) {
  transactions(
    first: 1
    sort: BLOCK_HEIGHT_DESC
    filters: {
      tags: {
        some: {
          name: { equalTo: "Dataset-Name" }
          value: { equalTo: $datasetName }
        }
      }
    }
  ) {
    edges {
      node {
        id
        block {
          timestamp
        }
        tags {
          name
          value
        }
      }
    }
  }
}
```

## File Structure

```
src/
├── types/           # TypeScript type definitions
├── database/        # SQLite database management
├── irys/           # Irys SDK integration
│   ├── uploader.ts # File upload
│   ├── query.ts    # GraphQL querying
│   └── fetcher.ts  # File download
├── repository/     # Main repository class
├── cli.ts          # Command-line interface
└── index.ts        # Main entry point

examples/
├── graphql-queries.md    # GraphQL query examples
└── usage-examples.ts     # Usage examples
```

## Local Cache

The project uses a SQLite-based local cache for fast access. The cache stores:

- Transaction IDs
- Metadata tags
- Timestamps
- Receipt information
- Creation dates

## Batch Upload

Batch upload feature for efficiently uploading large file sets:

```typescript
const files = [
  { filePath: './train.pt', metadata: trainMetadata },
  { filePath: './test.pt', metadata: testMetadata },
  { filePath: './val.pt', metadata: valMetadata }
];

const results = await repository.batchUpload(files, { 
  receipt: true, 
  batchSize: 10 
});
```

## ✅ Verified Working Features

The following features have been **tested and verified** to work correctly:

### **File Upload & Download**
- ✅ **Real Irys Upload**: Successfully uploaded files to Irys network
- ✅ **Transaction ID Generation**: Real blockchain transaction IDs
- ✅ **Receipt Generation**: Cryptographic receipts for verification
- ✅ **File Download**: Retrieved files from Irys gateway
- ✅ **File Integrity**: Perfect preservation of file content

### **CLI Commands**
- ✅ **Upload Command**: `bun run upload -- -f file.json -a app -n dataset -s train -v 1.0.0 -o owner`
- ✅ **Fetch Command**: `bun run fetch -- -i <transaction_id> -o ./downloads/`
- ✅ **Balance Check**: `bun run balance`
- ✅ **Metadata Tagging**: Automatic tagging with required metadata

### **Programmatic API**
- ✅ **Repository Creation**: TypeScript repository with full type safety
- ✅ **Database Operations**: SQLite database with proper record management
- ✅ **Query System**: Advanced filtering and pagination
- ✅ **Error Handling**: Graceful error management

### **Real Test Results**
```
✅ Upload successful! Transaction ID: Rpzhtvwwx7qWZD4NgEq017YB7E9udGepFR9lJ063J64
✅ File downloaded to: ./downloads/downloaded-model.json
✅ File integrity verified: 451 bytes, content preserved perfectly
✅ Cryptographic receipt generated and verified
```

### **Production Ready**
The AI Data Repository is **fully functional** and ready for:
- Storing AI models, datasets, and embeddings
- Managing version control and metadata
- Querying and filtering data
- Downloading files in organized structures
- CLI-based operations
- Programmatic integration in AI applications

## Error Handling

All operations are wrapped with proper error handling. Errors are thrown with descriptive messages.

## Development

```bash
# Run in development mode
bun run dev

# Linting
bun run lint

# Test
bun run test

# Build
bun run build
```

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

Use GitHub Issues for problems or check the documentation.