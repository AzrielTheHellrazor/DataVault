# AI Data Repository on Irys

This project provides a minimal data repository for storing and managing AI datasets, embeddings, and PyTorch model files on Irys.

## Features

- **File Upload**: Upload AI datasets, embeddings, and PyTorch model files (.pt) to Irys
- **Metadata Management**: Required metadata tags for each upload (App, Content-Type, Dataset-Name, Split, Version, Owner, Created-At)
- **Batch Upload**: Efficiently upload large files in batches
- **GraphQL Querying**: Filter by tags and time ranges, sorting and pagination
- **File Download**: Download files to local folders in structured format using transaction ID
- **Local Cache**: SQLite-based local cache/index for fast access
- **CLI Interface**: Easy command-line interaction
- **TypeScript Support**: Full type safety

## Installation

1. Install dependencies:
```bash
bun install
```

2. Set up environment variables:
```bash
cp env.example .env
```

3. Edit the `.env` file:
```env
IRYS_URL=https://node2.irys.xyz
IRYS_PRIVATE_KEY=your_private_key_here
IRYS_CURRENCY=arweave
DATABASE_PATH=./data/repository.db
LOCAL_STORAGE_PATH=./data/downloads
```

4. Build the project:
```bash
bun run build
```

## Usage

### CLI Commands

#### File Upload
```bash
bun run upload -- -f ./model.pt -a my-app -n mnist -s train -v 1.0.0 -o user@example.com --receipt
```

#### Dataset Querying
```bash
# Basic querying
bun run query -- -n mnist -s train -l 10

# Advanced filtering
bun run query -- -n mnist --start-time 2024-01-01T00:00:00Z --end-time 2024-12-31T23:59:59Z

# List datasets of a specific app
bun run query -- -a my-app -l 20
```

#### File Download
```bash
bun run fetch -- -i <transaction_id> -o ./downloads/
```

#### Get Latest Version
```bash
bun run latest -- -n mnist -s train
```

#### Account Balance
```bash
bun run balance
```

### Programmatic Usage

```typescript
import { AIRepository } from './src/repository';
import { DatasetMetadata } from './src/types';

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

### **Real-World Examples**
- 📖 **`examples/real-world-examples.md`** - Practical use cases for ML models, datasets, embeddings
- 🔍 **`examples/graphql-queries.md`** - Complete GraphQL query reference
- 💻 **`examples/usage-examples.ts`** - TypeScript code examples

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