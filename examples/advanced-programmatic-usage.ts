#!/usr/bin/env ts-node

/**
 * DataVault Advanced Programmatic Usage Examples
 * This script demonstrates advanced features and usage scenarios
 */

import { AIRepository } from '../src/repository';
import { DatasetMetadata, QueryOptions, DatabaseRecord } from '../src/types';
import * as fs from 'fs-extra';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

class AdvancedDataVaultDemo {
  private repository: AIRepository;
  private exampleDir = './examples/advanced-data';

  constructor(privateKey: string, dbPath: string) {
    this.repository = new AIRepository(privateKey, dbPath);
  }

  async initialize(): Promise<void> {
    console.log('🚀 Starting Advanced DataVault Demo...\n');
    await this.createAdvancedExampleFiles();
  }

  async cleanup(): Promise<void> {
    await this.repository.close();
    await this.cleanupFiles();
  }

  private async createAdvancedExampleFiles(): Promise<void> {
    console.log('📁 Creating advanced example files...');
    
    await fs.ensureDir(this.exampleDir);

    // Model versions
    for (let version = 1; version <= 3; version++) {
      const modelData = {
        version: `1.${version}.0`,
        accuracy: 0.85 + (version * 0.05),
        loss: 0.5 - (version * 0.1),
        parameters: 1000000 + (version * 100000),
        training_time: `${version * 2}h`,
        created_at: new Date(2024, 0, version * 10).toISOString()
      };
      
      await fs.writeFile(
        path.join(this.exampleDir, `model_v${version}.json`),
        JSON.stringify(modelData, null, 2)
      );

      // PyTorch model file simulation
      await fs.writeFile(
        path.join(this.exampleDir, `model_v${version}.pt`),
        Buffer.from(`PyTorch model v${version} - ${modelData.accuracy} accuracy`)
      );
    }

    // Different dataset splits
    const splits = ['train', 'validation', 'test'];
    for (const split of splits) {
      const splitData = {
        split: split,
        samples: split === 'train' ? 60000 : 10000,
        features: 784,
        classes: 10,
        preprocessing: 'normalized',
        augmentation: split === 'train' ? 'rotation, flip' : 'none'
      };
      
      await fs.writeFile(
        path.join(this.exampleDir, `${split}_dataset.json`),
        JSON.stringify(splitData, null, 2)
      );
    }

    // Performance metrikleri
    for (let day = 1; day <= 5; day++) {
      const metrics = {
        date: new Date(2024, 0, day).toISOString().split('T')[0],
        accuracy: 0.9 + Math.random() * 0.05,
        precision: 0.85 + Math.random() * 0.1,
        recall: 0.88 + Math.random() * 0.07,
        f1_score: 0.87 + Math.random() * 0.06,
        inference_time_ms: 10 + Math.random() * 5,
        throughput: 1000 + Math.random() * 200
      };
      
      await fs.writeFile(
        path.join(this.exampleDir, `metrics_day_${day}.json`),
        JSON.stringify(metrics, null, 2)
      );
    }

    console.log('✅ Advanced example files prepared!');
  }

  // 1. Version-Based Model Management
  async demonstrateVersionManagement(): Promise<void> {
    console.log('\n🔄 1. VERSION-BASED MODEL MANAGEMENT');
    console.log('=====================================');

    // Upload different versions
    for (let version = 1; version <= 3; version++) {
      const metadata: DatasetMetadata = {
        app: 'version-management-demo',
        contentType: 'application/pytorch',
        datasetName: 'mnist-evolution',
        split: 'production',
        version: `1.${version}.0`,
        owner: 'model-versioning@example.com',
        createdAt: new Date().toISOString()
      };

      console.log(`📤 Uploading model v1.${version}.0...`);
      const result = await this.repository.uploadFile(
        path.join(this.exampleDir, `model_v${version}.pt`),
        metadata,
        { receipt: true }
      );
      
      // Also upload metadata file
      const metadataJson: DatasetMetadata = {
        ...metadata,
        contentType: 'application/json',
        datasetName: 'mnist-evolution-metadata',
        split: 'metadata'
      };

      await this.repository.uploadFile(
        path.join(this.exampleDir, `model_v${version}.json`),
        metadataJson,
        { receipt: true }
      );

      console.log(`✅ v1.${version}.0 uploaded - Transaction: ${result.transactionId}`);
    }

    // List all versions
    console.log('\n📋 All model versions:');
    const allVersions = await this.repository.getVersions('mnist-evolution', 'production');
    allVersions.forEach((version, index) => {
      console.log(`   ${index + 1}. v${version.tags.version} - ${new Date(version.timestamp).toLocaleDateString()}`);
    });

    // En son versiyonu al
    const latestVersion = await this.repository.getLatestVersion('mnist-evolution', 'production');
    if (latestVersion) {
      console.log(`\n🆕 En son versiyon: v${latestVersion.tags.version}`);
    }
  }

  // 2. Advanced Querying Techniques
  async demonstrateAdvancedQuerying(): Promise<void> {
    console.log('\n🔍 2. ADVANCED QUERYING TECHNIQUES');
    console.log('===================================');

    // Pagination ile sorgulama
    console.log('📄 Sayfalama ile sorgulama:');
    let cursor: string | undefined;
    let page = 1;
    
    do {
      const queryOptions: QueryOptions = {
        filters: { app: 'version-management-demo' },
        limit: 2,
        cursor
      };
      
      const results = await this.repository.queryData(queryOptions);
      console.log(`   Page ${page}: ${results.results.length} results`);
      
      results.results.forEach((result, index) => {
        console.log(`     ${index + 1}. ${result.tags.datasetName} v${result.tags.version}`);
      });
      
      cursor = results.nextCursor;
      page++;
    } while (cursor && page <= 3); // Show only 3 pages

    // Time range query
    console.log('\n📅 Last 24 hours query:');
    const recentQuery = await this.repository.queryData({
      filters: {
        app: 'version-management-demo',
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      sortBy: 'timestamp',
      sortOrder: 'desc',
      limit: 5
    });

    console.log(`   ${recentQuery.results.length} uploads made in the last 24 hours`);

    // Content type based query
    console.log('\n🎯 Content type based query:');
    const pytorchModels = await this.repository.queryData({
      filters: { 
        app: 'version-management-demo',
        contentType: 'application/pytorch' 
      },
      limit: 10
    });

    console.log(`   ${pytorchModels.results.length} PyTorch modeli bulundu`);

    const jsonFiles = await this.repository.queryData({
      filters: { 
        app: 'version-management-demo',
        contentType: 'application/json' 
      },
      limit: 10
    });

    console.log(`   ${jsonFiles.results.length} JSON files found`);
  }

  // 3. Batch Processing Optimizations
  async demonstrateBatchOptimizations(): Promise<void> {
    console.log('\n⚡ 3. BATCH PROCESSING OPTIMIZATIONS');
    console.log('==================================');

    // Batch upload dataset splits
    const datasetFiles = ['train', 'validation', 'test'].map(split => ({
      filePath: path.join(this.exampleDir, `${split}_dataset.json`),
      metadata: {
        app: 'batch-optimization-demo',
        contentType: 'application/json',
        datasetName: 'optimized-mnist-dataset',
        split: split,
        version: '2.0.0',
        owner: 'optimization-team@example.com',
        createdAt: new Date().toISOString()
      } as DatasetMetadata
    }));

    console.log('📊 Batch uploading dataset splits...');
    const startTime = Date.now();
    
    const batchResults = await this.repository.batchUpload(datasetFiles, {
      receipt: true,
      batchSize: 3
    });
    
    const endTime = Date.now();
    const uploadTime = (endTime - startTime) / 1000;

    console.log(`✅ ${batchResults.length} files uploaded in ${uploadTime.toFixed(2)} seconds`);
    console.log(`⚡ Average: ${(uploadTime / batchResults.length).toFixed(2)} seconds/file`);

    // Batch upload results analysis
    const successfulUploads = batchResults.filter(r => r.transactionId);
    console.log(`📈 Success rate: ${((successfulUploads.length / batchResults.length) * 100).toFixed(1)}%`);
  }

  // 4. Performance İzleme Sistemi
  async demonstratePerformanceMonitoring(): Promise<void> {
    console.log('\n📈 4. PERFORMANCE İZLEME SİSTEMİ');
    console.log('===============================');

    // Upload daily metrics
    const metricFiles: Array<{ filePath: string; metadata: DatasetMetadata }> = [];
    for (let day = 1; day <= 5; day++) {
      metricFiles.push({
        filePath: path.join(this.exampleDir, `metrics_day_${day}.json`),
        metadata: {
          app: 'performance-monitoring',
          contentType: 'application/json',
          datasetName: 'daily-metrics',
          split: 'production',
          version: `2024.01.${day.toString().padStart(2, '0')}`,
          owner: 'monitoring@example.com',
          createdAt: new Date(2024, 0, day).toISOString()
        } as DatasetMetadata
      });
    }

    console.log('📊 Uploading daily performance metrics...');
    const metricResults = await this.repository.batchUpload(metricFiles, {
      receipt: true,
      batchSize: 2
    });

    console.log(`✅ ${metricResults.length} daily metrics recorded`);

    // Metrik analizi
    console.log('\n📊 Performans analizi:');
    const metricsQuery = await this.repository.queryData({
      filters: {
        app: 'performance-monitoring',
        datasetName: 'daily-metrics'
      },
      sortBy: 'timestamp',
      sortOrder: 'asc',
      limit: 10
    });

    console.log(`   ${metricsQuery.results.length} daily metric records found`);
    
    // Show latest metrics
    if (metricsQuery.results.length > 0) {
      const latestMetrics = await this.repository.getLatestVersion('daily-metrics', 'production');
      if (latestMetrics) {
        console.log(`   Latest record: ${latestMetrics.tags.version}`);
      }
    }
  }

  // 5. Intelligent Data Discovery
  async demonstrateIntelligentDataDiscovery(): Promise<void> {
    console.log('\n🧠 5. INTELLIGENT DATA DISCOVERY');
    console.log('======================');

    // Discover all applications
    console.log('🔍 Available applications:');
    const allApps = new Set<string>();
    
    const allRecords = await this.repository.queryData({
      filters: {},
      limit: 100
    });

    allRecords.results.forEach(record => {
      allApps.add(record.tags.app);
    });

    console.log(`   Total ${allApps.size} different applications found:`);
    Array.from(allApps).forEach((app, index) => {
      console.log(`   ${index + 1}. ${app}`);
    });

    // Dataset types analysis
    console.log('\n📊 Dataset types:');
    const contentTypes = new Map<string, number>();
    
    allRecords.results.forEach(record => {
      const contentType = record.tags.contentType;
      contentTypes.set(contentType, (contentTypes.get(contentType) || 0) + 1);
    });

    contentTypes.forEach((count, type) => {
      console.log(`   ${type}: ${count} dosya`);
    });

    // En aktif sahipler
    console.log('\n👥 En aktif sahipler:');
    const owners = new Map<string, number>();
    
    allRecords.results.forEach(record => {
      const owner = record.tags.owner;
      owners.set(owner, (owners.get(owner) || 0) + 1);
    });

    const sortedOwners = Array.from(owners.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    sortedOwners.forEach(([owner, count], index) => {
      console.log(`   ${index + 1}. ${owner}: ${count} uploads`);
    });
  }

  // 6. Otomatik Yedekleme ve Senkronizasyon
  async demonstrateBackupAndSync(): Promise<void> {
    console.log('\n💾 6. OTOMATİK YEDEKLEME VE SENKRONİZASYON');
    console.log('==========================================');

    // List critical files
    const criticalFiles = await this.repository.queryData({
      filters: {
        split: 'production'
      },
      limit: 10
    });

    console.log(`🔒 ${criticalFiles.results.length} kritik dosya bulundu (production)`);

    // Backup simulation
    console.log('\n💾 Backup process simulation:');
    const backupDir = './examples/backup';
    await fs.ensureDir(backupDir);

    let backupCount = 0;
    for (const file of criticalFiles.results.slice(0, 3)) { // Demo for only 3 files
      try {
        const localPath = path.join(backupDir, `backup_${file.id}.download`);
        
        // Download file (simulation)
        console.log(`   📥 Backing up: ${file.tags.datasetName} v${file.tags.version}`);
        
        // Real implementation would use:
        // await this.repository.fetchFile({ transactionId: file.id, localPath });
        
        // Create file for simulation
        await fs.writeFile(localPath, `Backup of ${file.tags.datasetName}`);
        backupCount++;
      } catch (error) {
        console.log(`   ❌ Backup error: ${file.tags.datasetName}`);
      }
    }

    console.log(`✅ ${backupCount} dosya yedeklendi`);
    
    // Cleanup
    await fs.remove(backupDir);
  }

  // 7. Advanced Metadata Analysis
  async demonstrateMetadataAnalysis(): Promise<void> {
    console.log('\n🏷️ 7. ADVANCED METADATA ANALYSIS');
    console.log('===============================');

    // Get all records
    const allRecords = await this.repository.queryData({
      filters: {},
      limit: 100
    });

    // Time-based analysis
    const timeAnalysis = new Map<string, number>();
    allRecords.results.forEach(record => {
      const date = new Date(record.timestamp).toISOString().split('T')[0];
      timeAnalysis.set(date, (timeAnalysis.get(date) || 0) + 1);
    });

    console.log('📅 Daily upload activity:');
    Array.from(timeAnalysis.entries())
      .sort()
      .forEach(([date, count]) => {
        console.log(`   ${date}: ${count} uploads`);
      });

    // Versiyon analizi
    const versionPattern = /^(\d+)\.(\d+)\.(\d+)$/;
    const majorVersions = new Map<string, number>();
    
    allRecords.results.forEach(record => {
      const version = record.tags.version;
      const match = version.match(versionPattern);
      if (match) {
        const majorVersion = `${match[1]}.x.x`;
        majorVersions.set(majorVersion, (majorVersions.get(majorVersion) || 0) + 1);
      }
    });

    console.log('\n🔢 Major version distribution:');
    Array.from(majorVersions.entries()).forEach(([version, count]) => {
      console.log(`   ${version}: ${count} dosya`);
    });

    // Split analizi
    const splitAnalysis = new Map<string, number>();
    allRecords.results.forEach(record => {
      const split = record.tags.split;
      splitAnalysis.set(split, (splitAnalysis.get(split) || 0) + 1);
    });

    console.log('\n📂 Split distribution:');
    Array.from(splitAnalysis.entries()).forEach(([split, count]) => {
      console.log(`   ${split}: ${count} dosya`);
    });
  }

  private async cleanupFiles(): Promise<void> {
    console.log('\n🧹 Cleaning up advanced example files...');
    if (await fs.pathExists(this.exampleDir)) {
      await fs.remove(this.exampleDir);
      console.log('✅ Cleanup completed!');
    }
  }
}

// Main execution function
async function main() {
  console.log('🚀 DataVault Advanced Programmatic Usage Demo\n');

  const privateKey = process.env.IRYS_PRIVATE_KEY;
  const dbPath = process.env.DATABASE_PATH || './data/advanced-demo.db';

  if (!privateKey) {
    console.error('❌ IRYS_PRIVATE_KEY environment variable required');
    return;
  }

  const demo = new AdvancedDataVaultDemo(privateKey, dbPath);

  try {
    await demo.initialize();
    
    await demo.demonstrateVersionManagement();
    await demo.demonstrateAdvancedQuerying();
    await demo.demonstrateBatchOptimizations();
    await demo.demonstratePerformanceMonitoring();
    await demo.demonstrateIntelligentDataDiscovery();
    await demo.demonstrateBackupAndSync();
    await demo.demonstrateMetadataAnalysis();
    
    console.log('\n🎉 All advanced features demonstrated!');
    console.log('💡 These examples can be used in production environment!');
    
  } catch (error) {
    console.error('❌ Demo error:', error instanceof Error ? error.message : String(error));
  } finally {
    await demo.cleanup();
  }
}

// Call main if script is run directly
if (require.main === module) {
  main();
}

export { main as advancedProgrammaticDemo };