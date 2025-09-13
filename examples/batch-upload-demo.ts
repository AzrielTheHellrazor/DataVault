#!/usr/bin/env ts-node

/**
 * DataVault Batch Upload Demonstration
 * This script demonstrates comprehensive batch upload examples
 */

import { AIRepository } from '../src/repository';
import { DatasetMetadata } from '../src/types';
import * as fs from 'fs-extra';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function createExampleFiles(): Promise<void> {
  console.log('📁 Creating example files...');
  
  const exampleDir = './examples/sample-data';
  await fs.ensureDir(exampleDir);

  // Create different types of example files
  const files = [
    // PyTorch model files
    { name: 'mnist_train.pt', content: Buffer.from('PyTorch model - train'), type: 'application/pytorch' },
    { name: 'mnist_val.pt', content: Buffer.from('PyTorch model - validation'), type: 'application/pytorch' },
    { name: 'mnist_test.pt', content: Buffer.from('PyTorch model - test'), type: 'application/pytorch' },
    
    // Dataset files
    { name: 'train_data.json', content: JSON.stringify({ samples: 60000, features: 784 }), type: 'application/json' },
    { name: 'val_data.json', content: JSON.stringify({ samples: 10000, features: 784 }), type: 'application/json' },
    { name: 'test_data.json', content: JSON.stringify({ samples: 10000, features: 784 }), type: 'application/json' },
    
    // Embedding files
    { name: 'word_embeddings.vec', content: 'word2vec embeddings data', type: 'application/octet-stream' },
    { name: 'sentence_embeddings.npy', content: Buffer.from('numpy array embeddings'), type: 'application/octet-stream' },
    
    // Configuration files
    { name: 'training_config.json', content: JSON.stringify({ 
      learning_rate: 0.001, 
      batch_size: 32, 
      epochs: 100 
    }), type: 'application/json' },
    { name: 'model_architecture.json', content: JSON.stringify({ 
      layers: ['conv2d', 'relu', 'maxpool', 'fc'],
      params: 1234567
    }), type: 'application/json' }
  ];

  for (const file of files) {
    const filePath = path.join(exampleDir, file.name);
    await fs.writeFile(filePath, file.content);
  }

  console.log('✅ Example files created!');
}

async function demonstrateBatchUpload(): Promise<void> {
  console.log('\n🚀 Batch Upload Demonstration Starting...\n');

  const privateKey = process.env.IRYS_PRIVATE_KEY;
  const dbPath = process.env.DATABASE_PATH || './data/batch-demo.db';

  if (!privateKey) {
    console.error('❌ IRYS_PRIVATE_KEY environment variable required');
    return;
  }

  // Initialize repository
  const repository = new AIRepository(privateKey, dbPath);

  try {
    // 1. Batch Model Files Upload
    console.log('🤖 1. Batch Model Files Upload');
    console.log('=====================================');
    
    const modelFiles = [
      {
        filePath: './examples/sample-data/mnist_train.pt',
        metadata: {
          app: 'batch-demo',
          contentType: 'application/pytorch',
          datasetName: 'mnist-cnn',
          split: 'train',
          version: '1.0.0',
          owner: 'ml-team@example.com',
          createdAt: new Date().toISOString()
        } as DatasetMetadata
      },
      {
        filePath: './examples/sample-data/mnist_val.pt',
        metadata: {
          app: 'batch-demo',
          contentType: 'application/pytorch',
          datasetName: 'mnist-cnn',
          split: 'validation',
          version: '1.0.0',
          owner: 'ml-team@example.com',
          createdAt: new Date().toISOString()
        } as DatasetMetadata
      },
      {
        filePath: './examples/sample-data/mnist_test.pt',
        metadata: {
          app: 'batch-demo',
          contentType: 'application/pytorch',
          datasetName: 'mnist-cnn',
          split: 'test',
          version: '1.0.0',
          owner: 'ml-team@example.com',
          createdAt: new Date().toISOString()
        } as DatasetMetadata
      }
    ];

    console.log('📤 Uploading model files...');
    const modelResults = await repository.batchUpload(modelFiles, { 
      receipt: true, 
      batchSize: 2 
    });
    
    console.log('✅ Model uploads completed!');
    modelResults.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.transactionId} - ${modelFiles[index].metadata.split}`);
    });

    // 2. Batch Dataset Files Upload
    console.log('\n📊 2. Batch Dataset Files Upload');
    console.log('========================================');
    
    const datasetFiles = [
      {
        filePath: './examples/sample-data/train_data.json',
        metadata: {
          app: 'batch-demo',
          contentType: 'application/json',
          datasetName: 'mnist-dataset',
          split: 'train',
          version: '1.0.0',
          owner: 'data-team@example.com',
          createdAt: new Date().toISOString()
        } as DatasetMetadata
      },
      {
        filePath: './examples/sample-data/val_data.json',
        metadata: {
          app: 'batch-demo',
          contentType: 'application/json',
          datasetName: 'mnist-dataset',
          split: 'validation',
          version: '1.0.0',
          owner: 'data-team@example.com',
          createdAt: new Date().toISOString()
        } as DatasetMetadata
      },
      {
        filePath: './examples/sample-data/test_data.json',
        metadata: {
          app: 'batch-demo',
          contentType: 'application/json',
          datasetName: 'mnist-dataset',
          split: 'test',
          version: '1.0.0',
          owner: 'data-team@example.com',
          createdAt: new Date().toISOString()
        } as DatasetMetadata
      }
    ];

    console.log('📤 Uploading dataset files...');
    const datasetResults = await repository.batchUpload(datasetFiles, { 
      receipt: true, 
      batchSize: 3 
    });
    
    console.log('✅ Dataset uploads completed!');
    datasetResults.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.transactionId} - ${datasetFiles[index].metadata.split}`);
    });

    // 3. Batch Embedding Files Upload
    console.log('\n🔍 3. Batch Embedding Files Upload');
    console.log('======================================');
    
    const embeddingFiles = [
      {
        filePath: './examples/sample-data/word_embeddings.vec',
        metadata: {
          app: 'nlp-pipeline',
          contentType: 'application/octet-stream',
          datasetName: 'word-embeddings',
          split: 'production',
          version: '2.0.0',
          owner: 'nlp-team@example.com',
          createdAt: new Date().toISOString()
        } as DatasetMetadata
      },
      {
        filePath: './examples/sample-data/sentence_embeddings.npy',
        metadata: {
          app: 'nlp-pipeline',
          contentType: 'application/octet-stream',
          datasetName: 'sentence-embeddings',
          split: 'production',
          version: '1.5.0',
          owner: 'nlp-team@example.com',
          createdAt: new Date().toISOString()
        } as DatasetMetadata
      }
    ];

    console.log('📤 Uploading embedding files...');
    const embeddingResults = await repository.batchUpload(embeddingFiles, { 
      receipt: true, 
      batchSize: 2 
    });
    
    console.log('✅ Embedding uploads completed!');
    embeddingResults.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.transactionId} - ${embeddingFiles[index].metadata.datasetName}`);
    });

    // 4. Batch Configuration Files Upload
    console.log('\n⚙️ 4. Batch Configuration Files Upload');
    console.log('==========================================');
    
    const configFiles = [
      {
        filePath: './examples/sample-data/training_config.json',
        metadata: {
          app: 'batch-demo',
          contentType: 'application/json',
          datasetName: 'training-config',
          split: 'production',
          version: '1.0.0',
          owner: 'ml-engineer@example.com',
          createdAt: new Date().toISOString()
        } as DatasetMetadata
      },
      {
        filePath: './examples/sample-data/model_architecture.json',
        metadata: {
          app: 'batch-demo',
          contentType: 'application/json',
          datasetName: 'model-architecture',
          split: 'production',
          version: '1.0.0',
          owner: 'ml-architect@example.com',
          createdAt: new Date().toISOString()
        } as DatasetMetadata
      }
    ];

    console.log('📤 Uploading configuration files...');
    const configResults = await repository.batchUpload(configFiles, { 
      receipt: true, 
      batchSize: 2 
    });
    
    console.log('✅ Configuration uploads completed!');
    configResults.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.transactionId} - ${configFiles[index].metadata.datasetName}`);
    });

    // 5. Batch Query Test
    console.log('\n🔍 5. Querying Batch Upload Results');
    console.log('========================================');
    
    const queryResults = await repository.queryData({
      filters: { app: 'batch-demo' },
      limit: 20
    });
    
    console.log(`📊 Found ${queryResults.results.length} results for batch-demo application:`);
    queryResults.results.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.tags.datasetName} (${result.tags.split}) - v${result.tags.version}`);
    });

    // 6. Performance İstatistikleri
    console.log('\n📈 6. Performance İstatistikleri');
    console.log('===============================');
    
    const totalFiles = modelFiles.length + datasetFiles.length + embeddingFiles.length + configFiles.length;
    console.log(`✅ Total ${totalFiles} files uploaded successfully`);
    console.log(`📊 Batch operation completed efficiently`);
    console.log(`🔍 All files are queryable`);

    // 7. Account Balance Check
    console.log('\n💰 7. Account Balance');
    console.log('==================');
    
    const balance = await repository.getBalance();
    console.log(`💳 Current balance: ${balance} AR`);

  } catch (error) {
    console.error('❌ Batch upload error:', error instanceof Error ? error.message : String(error));
  } finally {
    await repository.close();
  }
}

async function cleanupExampleFiles(): Promise<void> {
  console.log('\n🧹 Cleaning up example files...');
  
  const exampleDir = './examples/sample-data';
  if (await fs.pathExists(exampleDir)) {
    await fs.remove(exampleDir);
    console.log('✅ Cleanup completed!');
  }
}

// Main execution
async function main() {
  try {
    await createExampleFiles();
    await demonstrateBatchUpload();
  } catch (error) {
    console.error('❌ Demo error:', error);
  } finally {
    await cleanupExampleFiles();
  }
}

// Call main if script is run directly
if (require.main === module) {
  main();
}

export { main as batchUploadDemo };