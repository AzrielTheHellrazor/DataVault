# Real-World Usage Examples

This document provides practical examples for common AI data repository use cases.

## 🤖 Machine Learning Models

### Upload a PyTorch Model
```bash
# Upload a trained model
bun run upload -- -f ./models/mnist_cnn.pt -a ml-training -n mnist-classifier -s production -v 2.1.0 -o team@company.com --receipt
```

### Upload Model Checkpoints
```bash
# Upload training checkpoints
bun run upload -- -f ./checkpoints/epoch_50.pt -a ml-training -n mnist-classifier -s checkpoint -v 2.1.0 -o team@company.com
bun run upload -- -f ./checkpoints/epoch_100.pt -a ml-training -n mnist-classifier -s checkpoint -v 2.1.0 -o team@company.com
```

## 📊 Datasets

### Upload Training Data
```bash
# Upload training dataset
bun run upload -- -f ./data/train.csv -a data-pipeline -n customer-data -s train -v 1.0.0 -o data-team@company.com

# Upload test dataset
bun run upload -- -f ./data/test.csv -a data-pipeline -n customer-data -s test -v 1.0.0 -o data-team@company.com
```

### Upload Preprocessed Data
```bash
# Upload preprocessed features
bun run upload -- -f ./features/train_features.npy -a feature-engineering -n customer-features -s train -v 1.2.0 -o ml-engineer@company.com
```

## 🔍 Embeddings & Vectors

### Upload Word Embeddings
```bash
# Upload pre-trained embeddings
bun run upload -- -f ./embeddings/word2vec.bin -a nlp-pipeline -n word-embeddings -s production -v 3.0.0 -o nlp-team@company.com
```

### Upload Document Embeddings
```bash
# Upload document vectors
bun run upload -- -f ./embeddings/documents.vec -a search-engine -n doc-embeddings -s production -v 1.5.0 -o search-team@company.com
```

## 🔄 Version Management

### Query All Versions
```bash
# Get all versions of a dataset
bun run query -- -n mnist-classifier -l 20

# Get latest production version
bun run latest -- -n mnist-classifier -s production
```

### Download Specific Version
```bash
# Download latest version
bun run latest -- -n mnist-classifier -s production
# Then use the transaction ID to download
bun run fetch -- -i <transaction_id> -o ./models/
```

## 🏗️ CI/CD Integration

### Automated Model Deployment
```typescript
import { AIRepository } from './src/repository';

async function deployModel(modelPath: string, version: string) {
  const repository = new AIRepository(
    process.env.IRYS_PRIVATE_KEY!,
    './data/deployment.db'
  );

  const metadata = {
    app: 'automated-deployment',
    contentType: 'application/pytorch',
    datasetName: 'production-model',
    split: 'production',
    version: version,
    owner: 'ci-cd@company.com',
    createdAt: new Date().toISOString()
  };

  const result = await repository.uploadFile(modelPath, metadata, { receipt: true });
  
  // Update deployment configuration with new transaction ID
  await updateDeploymentConfig(result.transactionId);
  
  await repository.close();
}
```

### Batch Dataset Upload
```typescript
async function uploadDatasetSplit(datasetPath: string) {
  const repository = new AIRepository(
    process.env.IRYS_PRIVATE_KEY!,
    './data/dataset.db'
  );

  const splits = ['train', 'validation', 'test'];
  const files = [];

  for (const split of splits) {
    const filePath = `${datasetPath}/${split}.parquet`;
    files.push({
      filePath,
      metadata: {
        app: 'dataset-pipeline',
        contentType: 'application/parquet',
        datasetName: 'customer-dataset',
        split: split,
        version: '2.0.0',
        owner: 'data-team@company.com',
        createdAt: new Date().toISOString()
      }
    });
  }

  const results = await repository.batchUpload(files, { 
    receipt: true, 
    batchSize: 3 
  });

  await repository.close();
  return results;
}
```

## 🔍 Data Discovery

### Find Models by App
```bash
# Find all models from a specific app
bun run query -- -a ml-training -l 50

# Find production models
bun run query -- -a ml-training -s production -l 20
```

### Find Datasets by Owner
```bash
# Find datasets by team
bun run query -- -o data-team@company.com -l 30

# Find recent uploads
bun run query -- --start-time 2024-01-01T00:00:00Z -l 20
```

## 📈 Monitoring & Analytics

### Track Model Performance
```typescript
async function trackModelPerformance(modelId: string, metrics: any) {
  const repository = new AIRepository(
    process.env.IRYS_PRIVATE_KEY!,
    './data/analytics.db'
  );

  const performanceData = {
    modelId,
    metrics,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  };

  const metadata = {
    app: 'model-monitoring',
    contentType: 'application/json',
    datasetName: 'model-metrics',
    split: 'performance',
    version: '1.0.0',
    owner: 'mlops@company.com',
    createdAt: new Date().toISOString()
  };

  const result = await repository.uploadBuffer(
    Buffer.from(JSON.stringify(performanceData)),
    `metrics_${modelId}_${Date.now()}.json`,
    metadata,
    { receipt: true }
  );

  await repository.close();
  return result;
}
```

## 🛡️ Security & Compliance

### Upload with Audit Trail
```typescript
async function uploadWithAudit(filePath: string, metadata: any, auditInfo: any) {
  const repository = new AIRepository(
    process.env.IRYS_PRIVATE_KEY!,
    './data/audit.db'
  );

  // Add audit information to metadata
  const auditMetadata = {
    ...metadata,
    auditTrail: {
      uploadedBy: auditInfo.user,
      uploadedAt: new Date().toISOString(),
      approvalId: auditInfo.approvalId,
      complianceCheck: auditInfo.complianceStatus
    }
  };

  const result = await repository.uploadFile(filePath, auditMetadata, { receipt: true });
  
  // Log to audit system
  await logAuditEvent('upload', result.transactionId, auditInfo);
  
  await repository.close();
  return result;
}
```

## 💡 Best Practices

### 1. Naming Conventions
- Use consistent dataset names: `{domain}-{type}-{version}`
- Use meaningful splits: `train`, `validation`, `test`, `production`
- Include version numbers for model iterations

### 2. Metadata Strategy
- Always include owner information for accountability
- Use descriptive app names for organization
- Include creation timestamps for tracking

### 3. File Organization
- Use structured folder paths: `App/Dataset-Name/Version/Split/`
- Keep related files together with consistent naming
- Use appropriate content types for better indexing

### 4. Version Control
- Increment version numbers for new iterations
- Use semantic versioning for models
- Keep production versions separate from development

### 5. Security
- Always generate receipts for important uploads
- Use environment variables for sensitive data
- Implement proper access controls in your applications
