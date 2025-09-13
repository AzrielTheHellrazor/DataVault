#!/usr/bin/env ts-node

/**
 * DataVault Toplu Yükleme Demonstrasyonu
 * Bu script kapsamlı toplu yükleme örneklerini gösterir
 */

import { AIRepository } from '../src/repository';
import { DatasetMetadata } from '../src/types';
import * as fs from 'fs-extra';
import * as path from 'path';
import dotenv from 'dotenv';

// Environment variables yükle
dotenv.config();

async function createExampleFiles(): Promise<void> {
  console.log('📁 Örnek dosyalar oluşturuluyor...');
  
  const exampleDir = './examples/sample-data';
  await fs.ensureDir(exampleDir);

  // Farklı türde örnek dosyalar oluştur
  const files = [
    // PyTorch model dosyaları
    { name: 'mnist_train.pt', content: Buffer.from('PyTorch model - train'), type: 'application/pytorch' },
    { name: 'mnist_val.pt', content: Buffer.from('PyTorch model - validation'), type: 'application/pytorch' },
    { name: 'mnist_test.pt', content: Buffer.from('PyTorch model - test'), type: 'application/pytorch' },
    
    // Veri seti dosyaları
    { name: 'train_data.json', content: JSON.stringify({ samples: 60000, features: 784 }), type: 'application/json' },
    { name: 'val_data.json', content: JSON.stringify({ samples: 10000, features: 784 }), type: 'application/json' },
    { name: 'test_data.json', content: JSON.stringify({ samples: 10000, features: 784 }), type: 'application/json' },
    
    // Embedding dosyaları
    { name: 'word_embeddings.vec', content: 'word2vec embeddings data', type: 'application/octet-stream' },
    { name: 'sentence_embeddings.npy', content: Buffer.from('numpy array embeddings'), type: 'application/octet-stream' },
    
    // Konfigurasyon dosyaları
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

  console.log('✅ Örnek dosyalar oluşturuldu!');
}

async function demonstrateBatchUpload(): Promise<void> {
  console.log('\n🚀 Toplu Yükleme Demonstrasyonu Başlıyor...\n');

  const privateKey = process.env.IRYS_PRIVATE_KEY;
  const dbPath = process.env.DATABASE_PATH || './data/batch-demo.db';

  if (!privateKey) {
    console.error('❌ IRYS_PRIVATE_KEY environment variable gerekli');
    return;
  }

  // Repository'yi başlat
  const repository = new AIRepository(privateKey, dbPath);

  try {
    // 1. Model Dosyaları Toplu Yükleme
    console.log('🤖 1. Model Dosyaları Toplu Yükleme');
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

    console.log('📤 Model dosyaları yükleniyor...');
    const modelResults = await repository.batchUpload(modelFiles, { 
      receipt: true, 
      batchSize: 2 
    });
    
    console.log('✅ Model yüklemeleri tamamlandı!');
    modelResults.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.transactionId} - ${modelFiles[index].metadata.split}`);
    });

    // 2. Veri Seti Dosyaları Toplu Yükleme
    console.log('\n📊 2. Veri Seti Dosyaları Toplu Yükleme');
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

    console.log('📤 Veri seti dosyaları yükleniyor...');
    const datasetResults = await repository.batchUpload(datasetFiles, { 
      receipt: true, 
      batchSize: 3 
    });
    
    console.log('✅ Veri seti yüklemeleri tamamlandı!');
    datasetResults.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.transactionId} - ${datasetFiles[index].metadata.split}`);
    });

    // 3. Embedding Dosyaları Toplu Yükleme
    console.log('\n🔍 3. Embedding Dosyaları Toplu Yükleme');
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

    console.log('📤 Embedding dosyaları yükleniyor...');
    const embeddingResults = await repository.batchUpload(embeddingFiles, { 
      receipt: true, 
      batchSize: 2 
    });
    
    console.log('✅ Embedding yüklemeleri tamamlandı!');
    embeddingResults.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.transactionId} - ${embeddingFiles[index].metadata.datasetName}`);
    });

    // 4. Konfigurasyon Dosyaları Toplu Yükleme
    console.log('\n⚙️ 4. Konfigurasyon Dosyaları Toplu Yükleme');
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

    console.log('📤 Konfigurasyon dosyaları yükleniyor...');
    const configResults = await repository.batchUpload(configFiles, { 
      receipt: true, 
      batchSize: 2 
    });
    
    console.log('✅ Konfigurasyon yüklemeleri tamamlandı!');
    configResults.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.transactionId} - ${configFiles[index].metadata.datasetName}`);
    });

    // 5. Toplu Sorgu Testi
    console.log('\n🔍 5. Toplu Yükleme Sonuçlarını Sorgulama');
    console.log('========================================');
    
    const queryResults = await repository.queryData({
      filters: { app: 'batch-demo' },
      limit: 20
    });
    
    console.log(`📊 Batch-demo uygulaması için ${queryResults.results.length} sonuç bulundu:`);
    queryResults.results.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.tags.datasetName} (${result.tags.split}) - v${result.tags.version}`);
    });

    // 6. Performance İstatistikleri
    console.log('\n📈 6. Performance İstatistikleri');
    console.log('===============================');
    
    const totalFiles = modelFiles.length + datasetFiles.length + embeddingFiles.length + configFiles.length;
    console.log(`✅ Toplam ${totalFiles} dosya başarıyla yüklendi`);
    console.log(`📊 Toplu işlem verimli şekilde tamamlandı`);
    console.log(`🔍 Tüm dosyalar sorgulanabilir durumda`);

    // 7. Hesap Bakiyesi Kontrolü
    console.log('\n💰 7. Hesap Bakiyesi');
    console.log('==================');
    
    const balance = await repository.getBalance();
    console.log(`💳 Güncel bakiye: ${balance} AR`);

  } catch (error) {
    console.error('❌ Toplu yükleme hatası:', error instanceof Error ? error.message : String(error));
  } finally {
    await repository.close();
  }
}

async function cleanupExampleFiles(): Promise<void> {
  console.log('\n🧹 Örnek dosyalar temizleniyor...');
  
  const exampleDir = './examples/sample-data';
  if (await fs.pathExists(exampleDir)) {
    await fs.remove(exampleDir);
    console.log('✅ Temizlik tamamlandı!');
  }
}

// Main execution
async function main() {
  try {
    await createExampleFiles();
    await demonstrateBatchUpload();
  } catch (error) {
    console.error('❌ Demo hatası:', error);
  } finally {
    await cleanupExampleFiles();
  }
}

// Script doğrudan çalıştırılırsa main'i çağır
if (require.main === module) {
  main();
}

export { main as batchUploadDemo };