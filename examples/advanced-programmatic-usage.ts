#!/usr/bin/env ts-node

/**
 * DataVault Gelişmiş Programatik Kullanım Örnekleri
 * Bu script gelişmiş özellikler ve kullanım senaryolarını demonstre eder
 */

import { AIRepository } from '../src/repository';
import { DatasetMetadata, QueryOptions, UploadResult, DatasetRecord } from '../src/types';
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
    console.log('🚀 Gelişmiş DataVault Demo Başlatılıyor...\n');
    await this.createAdvancedExampleFiles();
  }

  async cleanup(): Promise<void> {
    await this.repository.close();
    await this.cleanupFiles();
  }

  private async createAdvancedExampleFiles(): Promise<void> {
    console.log('📁 Gelişmiş örnek dosyalar oluşturuluyor...');
    
    await fs.ensureDir(this.exampleDir);

    // Model versiyonları
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

      // PyTorch model dosyası simulation
      await fs.writeFile(
        path.join(this.exampleDir, `model_v${version}.pt`),
        Buffer.from(`PyTorch model v${version} - ${modelData.accuracy} accuracy`)
      );
    }

    // Farklı veri seti split'leri
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

    console.log('✅ Gelişmiş örnek dosyalar hazırlandı!');
  }

  // 1. Versiyon Bazlı Model Yönetimi
  async demonstrateVersionManagement(): Promise<void> {
    console.log('\n🔄 1. VERSİYON BAZLI MODEL YÖNETİMİ');
    console.log('=====================================');

    // Farklı versiyonları yükle
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

      console.log(`📤 Model v1.${version}.0 yükleniyor...`);
      const result = await this.repository.uploadFile(
        path.join(this.exampleDir, `model_v${version}.pt`),
        metadata,
        { receipt: true }
      );
      
      // Metadata dosyasını da yükle
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

      console.log(`✅ v1.${version}.0 yüklendi - Transaction: ${result.transactionId}`);
    }

    // Tüm versiyonları listele
    console.log('\n📋 Tüm model versiyonları:');
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

  // 2. Gelişmiş Sorgulama Teknikleri
  async demonstrateAdvancedQuerying(): Promise<void> {
    console.log('\n🔍 2. GELİŞMİŞ SORGULAMA TEKNİKLERİ');
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
      console.log(`   Sayfa ${page}: ${results.results.length} sonuç`);
      
      results.results.forEach((result, index) => {
        console.log(`     ${index + 1}. ${result.tags.datasetName} v${result.tags.version}`);
      });
      
      cursor = results.nextCursor;
      page++;
    } while (cursor && page <= 3); // Sadece 3 sayfa göster

    // Zaman aralığı sorgulama
    console.log('\n📅 Son 24 saat sorgulama:');
    const recentQuery = await this.repository.queryData({
      filters: {
        app: 'version-management-demo',
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      sortBy: 'timestamp',
      sortOrder: 'desc',
      limit: 5
    });

    console.log(`   Son 24 saatte ${recentQuery.results.length} yükleme yapıldı`);

    // İçerik türü bazlı sorgulama
    console.log('\n🎯 İçerik türü bazlı sorgulama:');
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

    console.log(`   ${jsonFiles.results.length} JSON dosyası bulundu`);
  }

  // 3. Toplu İşlem Optimizasyonları
  async demonstrateBatchOptimizations(): Promise<void> {
    console.log('\n⚡ 3. TOPLU İŞLEM OPTİMİZASYONLARI');
    console.log('==================================');

    // Dataset split'lerini toplu yükleme
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

    console.log('📊 Dataset split'leri toplu yükleniyor...');
    const startTime = Date.now();
    
    const batchResults = await this.repository.batchUpload(datasetFiles, {
      receipt: true,
      batchSize: 3
    });
    
    const endTime = Date.now();
    const uploadTime = (endTime - startTime) / 1000;

    console.log(`✅ ${batchResults.length} dosya ${uploadTime.toFixed(2)} saniyede yüklendi`);
    console.log(`⚡ Ortalama: ${(uploadTime / batchResults.length).toFixed(2)} saniye/dosya`);

    // Batch upload results analizi
    const successfulUploads = batchResults.filter(r => r.transactionId);
    console.log(`📈 Başarı oranı: ${((successfulUploads.length / batchResults.length) * 100).toFixed(1)}%`);
  }

  // 4. Performance İzleme Sistemi
  async demonstratePerformanceMonitoring(): Promise<void> {
    console.log('\n📈 4. PERFORMANCE İZLEME SİSTEMİ');
    console.log('===============================');

    // Günlük metrikleri yükle
    const metricFiles = [];
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

    console.log('📊 Günlük performans metrikleri yükleniyor...');
    const metricResults = await this.repository.batchUpload(metricFiles, {
      receipt: true,
      batchSize: 2
    });

    console.log(`✅ ${metricResults.length} günlük metrik kaydedildi`);

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

    console.log(`   ${metricsQuery.results.length} günlük metrik kaydı bulundu`);
    
    // En son metrikleri göster
    if (metricsQuery.results.length > 0) {
      const latestMetrics = await this.repository.getLatestVersion('daily-metrics', 'production');
      if (latestMetrics) {
        console.log(`   En son kayıt: ${latestMetrics.tags.version}`);
      }
    }
  }

  // 5. Akıllı Veri Keşfi
  async demonstrateIntelligentDataDiscovery(): Promise<void> {
    console.log('\n🧠 5. AKILLI VERİ KEŞFİ');
    console.log('======================');

    // Tüm uygulamaları keşfet
    console.log('🔍 Mevcut uygulamalar:');
    const allApps = new Set<string>();
    
    const allRecords = await this.repository.queryData({
      filters: {},
      limit: 100
    });

    allRecords.results.forEach(record => {
      allApps.add(record.tags.app);
    });

    console.log(`   Toplam ${allApps.size} farklı uygulama bulundu:`);
    Array.from(allApps).forEach((app, index) => {
      console.log(`   ${index + 1}. ${app}`);
    });

    // Veri seti türleri analizi
    console.log('\n📊 Veri seti türleri:');
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
      console.log(`   ${index + 1}. ${owner}: ${count} yükleme`);
    });
  }

  // 6. Otomatik Yedekleme ve Senkronizasyon
  async demonstrateBackupAndSync(): Promise<void> {
    console.log('\n💾 6. OTOMATİK YEDEKLEME VE SENKRONİZASYON');
    console.log('==========================================');

    // Critical dosyaları listele
    const criticalFiles = await this.repository.queryData({
      filters: {
        split: 'production'
      },
      limit: 10
    });

    console.log(`🔒 ${criticalFiles.results.length} kritik dosya bulundu (production)`);

    // Yedekleme simülasyonu
    console.log('\n💾 Yedekleme işlemi simülasyonu:');
    const backupDir = './examples/backup';
    await fs.ensureDir(backupDir);

    let backupCount = 0;
    for (const file of criticalFiles.results.slice(0, 3)) { // Sadece 3 dosya için demo
      try {
        const localPath = path.join(backupDir, `backup_${file.id}.download`);
        
        // Dosyayı indir (simülasyon)
        console.log(`   📥 Yedekleniyor: ${file.tags.datasetName} v${file.tags.version}`);
        
        // Real implementation would use:
        // await this.repository.fetchFile({ transactionId: file.id, localPath });
        
        // Simülasyon için dosya oluştur
        await fs.writeFile(localPath, `Backup of ${file.tags.datasetName}`);
        backupCount++;
      } catch (error) {
        console.log(`   ❌ Yedekleme hatası: ${file.tags.datasetName}`);
      }
    }

    console.log(`✅ ${backupCount} dosya yedeklendi`);
    
    // Cleanup
    await fs.remove(backupDir);
  }

  // 7. Gelişmiş Metadata Analizi
  async demonstrateMetadataAnalysis(): Promise<void> {
    console.log('\n🏷️ 7. GELİŞMİŞ METADATA ANALİZİ');
    console.log('===============================');

    // Tüm kayıtları al
    const allRecords = await this.repository.queryData({
      filters: {},
      limit: 100
    });

    // Zaman bazlı analiz
    const timeAnalysis = new Map<string, number>();
    allRecords.results.forEach(record => {
      const date = new Date(record.timestamp).toISOString().split('T')[0];
      timeAnalysis.set(date, (timeAnalysis.get(date) || 0) + 1);
    });

    console.log('📅 Günlük yükleme aktivitesi:');
    Array.from(timeAnalysis.entries())
      .sort()
      .forEach(([date, count]) => {
        console.log(`   ${date}: ${count} yükleme`);
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

    console.log('\n🔢 Major versiyon dağılımı:');
    Array.from(majorVersions.entries()).forEach(([version, count]) => {
      console.log(`   ${version}: ${count} dosya`);
    });

    // Split analizi
    const splitAnalysis = new Map<string, number>();
    allRecords.results.forEach(record => {
      const split = record.tags.split;
      splitAnalysis.set(split, (splitAnalysis.get(split) || 0) + 1);
    });

    console.log('\n📂 Split dağılımı:');
    Array.from(splitAnalysis.entries()).forEach(([split, count]) => {
      console.log(`   ${split}: ${count} dosya`);
    });
  }

  private async cleanupFiles(): Promise<void> {
    console.log('\n🧹 Gelişmiş örnek dosyalar temizleniyor...');
    if (await fs.pathExists(this.exampleDir)) {
      await fs.remove(this.exampleDir);
      console.log('✅ Temizlik tamamlandı!');
    }
  }
}

// Main execution function
async function main() {
  console.log('🚀 DataVault Gelişmiş Programatik Kullanım Demo\n');

  const privateKey = process.env.IRYS_PRIVATE_KEY;
  const dbPath = process.env.DATABASE_PATH || './data/advanced-demo.db';

  if (!privateKey) {
    console.error('❌ IRYS_PRIVATE_KEY environment variable gerekli');
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
    
    console.log('\n🎉 Tüm gelişmiş özellikler demonstre edildi!');
    console.log('💡 Bu örnekler production ortamında kullanılabilir!');
    
  } catch (error) {
    console.error('❌ Demo hatası:', error instanceof Error ? error.message : String(error));
  } finally {
    await demo.cleanup();
  }
}

// Script doğrudan çalıştırılırsa main'i çağır
if (require.main === module) {
  main();
}

export { main as advancedProgrammaticDemo };