#!/usr/bin/env ts-node

/**
 * DataVault Monitoring & Analytics Examples
 * This script demonstrates comprehensive monitoring and analytics patterns
 */

import { AIRepository } from '../src/repository';
import { DatasetMetadata } from '../src/types';
import * as fs from 'fs-extra';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

interface ModelMetrics {
  modelId: string;
  timestamp: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  latency: number;
  throughput: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  requestCount: number;
}

interface SystemHealth {
  timestamp: string;
  serviceStatus: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeConnections: number;
  queueSize: number;
  diskUsage: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface AlertRule {
  name: string;
  metric: string;
  threshold: number;
  operator: '>' | '<' | '=' | '>=' | '<=';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

class MonitoringAnalyticsDemo {
  private repository: AIRepository;
  private metricsDir = './examples/monitoring-data';
  private alertRules: AlertRule[] = [];

  constructor(privateKey: string, dbPath: string) {
    this.repository = new AIRepository(privateKey, dbPath);
    this.initializeAlertRules();
  }

  async initialize(): Promise<void> {
    console.log('📊 Monitoring & Analytics Demo Starting...\n');
    await this.createMonitoringData();
  }

  async cleanup(): Promise<void> {
    await this.repository.close();
    await this.cleanupFiles();
  }

  private initializeAlertRules(): void {
    this.alertRules = [
      {
        name: 'High Error Rate',
        metric: 'errorRate',
        threshold: 5.0,
        operator: '>',
        severity: 'critical',
        enabled: true
      },
      {
        name: 'High Latency',
        metric: 'latency',
        threshold: 500,
        operator: '>',
        severity: 'high',
        enabled: true
      },
      {
        name: 'Low Accuracy',
        metric: 'accuracy',
        threshold: 0.85,
        operator: '<',
        severity: 'medium',
        enabled: true
      },
      {
        name: 'High Memory Usage',
        metric: 'memoryUsage',
        threshold: 80,
        operator: '>',
        severity: 'medium',
        enabled: true
      },
      {
        name: 'Service Unhealthy',
        metric: 'serviceStatus',
        threshold: 0,
        operator: '=',
        severity: 'critical',
        enabled: true
      }
    ];
  }

  private async createMonitoringData(): Promise<void> {
    console.log('📁 Creating monitoring data...');
    
    await fs.ensureDir(this.metricsDir);
    await fs.ensureDir(path.join(this.metricsDir, 'models'));
    await fs.ensureDir(path.join(this.metricsDir, 'system'));
    await fs.ensureDir(path.join(this.metricsDir, 'alerts'));
    await fs.ensureDir(path.join(this.metricsDir, 'reports'));

    // Generate model metrics for the last 7 days
    const modelIds = ['mnist-classifier', 'sentiment-analyzer', 'image-detector'];
    
    for (let day = 0; day < 7; day++) {
      for (const modelId of modelIds) {
        const metrics: ModelMetrics = {
          modelId,
          timestamp: new Date(Date.now() - day * 24 * 60 * 60 * 1000).toISOString(),
          accuracy: 0.85 + Math.random() * 0.1,
          precision: 0.82 + Math.random() * 0.12,
          recall: 0.84 + Math.random() * 0.11,
          f1Score: 0.83 + Math.random() * 0.1,
          latency: 100 + Math.random() * 200,
          throughput: 500 + Math.random() * 300,
          errorRate: Math.random() * 2,
          memoryUsage: 60 + Math.random() * 25,
          cpuUsage: 40 + Math.random() * 30,
          requestCount: 1000 + Math.random() * 2000
        };

        await fs.writeFile(
          path.join(this.metricsDir, 'models', `${modelId}_day_${day}.json`),
          JSON.stringify(metrics, null, 2)
        );
      }
    }

    // Generate system health data
    for (let hour = 0; hour < 24; hour++) {
      const health: SystemHealth = {
        timestamp: new Date(Date.now() - hour * 60 * 60 * 1000).toISOString(),
        serviceStatus: Math.random() > 0.1 ? 'healthy' : (Math.random() > 0.5 ? 'degraded' : 'unhealthy'),
        uptime: 99.5 + Math.random() * 0.4,
        responseTime: 150 + Math.random() * 100,
        errorRate: Math.random() * 1.5,
        activeConnections: 50 + Math.random() * 100,
        queueSize: Math.floor(Math.random() * 20),
        diskUsage: 45 + Math.random() * 30,
        memoryUsage: 55 + Math.random() * 25,
        cpuUsage: 35 + Math.random() * 35
      };

      await fs.writeFile(
        path.join(this.metricsDir, 'system', `health_hour_${hour}.json`),
        JSON.stringify(health, null, 2)
      );
    }

    // Generate alert configurations
    await fs.writeFile(
      path.join(this.metricsDir, 'alerts', 'alert_rules.json'),
      JSON.stringify(this.alertRules, null, 2)
    );

    console.log('✅ Monitoring data created!');
  }

  // 1. Real-time Model Performance Monitoring
  async demonstrateModelPerformanceMonitoring(): Promise<void> {
    console.log('\n📈 1. MODEL PERFORMANCE MONITORING');
    console.log('===================================');

    const modelIds = ['mnist-classifier', 'sentiment-analyzer', 'image-detector'];
    
    for (const modelId of modelIds) {
      console.log(`\n🤖 Monitoring model: ${modelId}`);
      
      // Upload daily metrics
      for (let day = 0; day < 7; day++) {
        const metricsPath = path.join(this.metricsDir, 'models', `${modelId}_day_${day}.json`);
        
        const metadata: DatasetMetadata = {
          app: 'model-monitoring',
          contentType: 'application/json',
          datasetName: 'model-metrics',
          split: modelId,
          version: new Date(Date.now() - day * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          owner: 'monitoring-system@example.com',
          createdAt: new Date().toISOString()
        };

        const result = await this.repository.uploadFile(metricsPath, metadata);
        console.log(`   📊 Day ${day} metrics uploaded - ${result.transactionId.substring(0, 8)}...`);
      }

      // Analyze performance trends
      await this.analyzeModelTrends(modelId);
    }
  }

  // 2. System Health Monitoring
  async demonstrateSystemHealthMonitoring(): Promise<void> {
    console.log('\n🏥 2. SYSTEM HEALTH MONITORING');
    console.log('==============================');

    console.log('📊 Uploading hourly health data...');
    const healthResults = [];

    for (let hour = 0; hour < 24; hour++) {
      const healthPath = path.join(this.metricsDir, 'system', `health_hour_${hour}.json`);
      
      const metadata: DatasetMetadata = {
        app: 'system-monitoring',
        contentType: 'application/json',
        datasetName: 'system-health',
        split: 'production',
        version: `${new Date(Date.now() - hour * 60 * 60 * 1000).toISOString().split('T')[0]}.${hour.toString().padStart(2, '0')}`,
        owner: 'infrastructure-monitoring@example.com',
        createdAt: new Date().toISOString()
      };

      const result = await this.repository.uploadFile(healthPath, metadata);
      healthResults.push(result.transactionId);
    }

    console.log(`✅ ${healthResults.length} health records uploaded`);

    // Generate health summary
    await this.generateHealthSummary();
  }

  // 3. Alert Management System
  async demonstrateAlertManagement(): Promise<void> {
    console.log('\n🚨 3. ALERT MANAGEMENT SYSTEM');
    console.log('=============================');

    // Upload alert rules
    const alertRulesPath = path.join(this.metricsDir, 'alerts', 'alert_rules.json');
    
    const alertMetadata: DatasetMetadata = {
      app: 'alert-management',
      contentType: 'application/json',
      datasetName: 'alert-rules',
      split: 'configuration',
      version: '1.0.0',
      owner: 'alert-system@example.com',
      createdAt: new Date().toISOString()
    };

    const alertResult = await this.repository.uploadFile(alertRulesPath, alertMetadata);
    console.log(`📋 Alert rules uploaded - ${alertResult.transactionId.substring(0, 8)}...`);

    // Simulate alert processing
    console.log('\n🔍 Processing alerts...');
    const alerts = await this.processAlerts();
    
    if (alerts.length > 0) {
      console.log(`⚠️  ${alerts.length} alerts generated:`);
      alerts.forEach((alert, index) => {
        console.log(`   ${index + 1}. [${alert.severity.toUpperCase()}] ${alert.name}: ${alert.message}`);
      });

      // Store alerts
      const alertsData = {
        timestamp: new Date().toISOString(),
        alerts: alerts,
        totalCount: alerts.length,
        severityBreakdown: this.getAlertSeverityBreakdown(alerts)
      };

      const alertsPath = path.join(this.metricsDir, 'alerts', 'current_alerts.json');
      await fs.writeFile(alertsPath, JSON.stringify(alertsData, null, 2));

      const alertStorageMetadata: DatasetMetadata = {
        app: 'alert-management',
        contentType: 'application/json',
        datasetName: 'active-alerts',
        split: 'current',
        version: new Date().toISOString().split('T')[0],
        owner: 'alert-system@example.com',
        createdAt: new Date().toISOString()
      };

      await this.repository.uploadFile(alertsPath, alertStorageMetadata);
    } else {
      console.log('✅ No alerts - all systems healthy');
    }
  }

  // 4. Performance Analytics and Reporting
  async demonstratePerformanceAnalytics(): Promise<void> {
    console.log('\n📊 4. PERFORMANCE ANALYTICS & REPORTING');
    console.log('=======================================');

    // Generate comprehensive report
    const report = await this.generatePerformanceReport();
    
    console.log('📈 Performance Summary:');
    console.log(`   Average Model Accuracy: ${report.averageAccuracy.toFixed(3)}`);
    console.log(`   Average Response Time: ${report.averageLatency.toFixed(1)}ms`);
    console.log(`   System Uptime: ${report.systemUptime.toFixed(2)}%`);
    console.log(`   Total Requests Processed: ${report.totalRequests.toLocaleString()}`);
    console.log(`   Error Rate: ${report.errorRate.toFixed(3)}%`);

    // Store report
    const reportPath = path.join(this.metricsDir, 'reports', 'weekly_performance_report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    const reportMetadata: DatasetMetadata = {
      app: 'analytics-reporting',
      contentType: 'application/json',
      datasetName: 'performance-report',
      split: 'weekly',
      version: this.getWeekVersion(),
      owner: 'analytics-team@example.com',
      createdAt: new Date().toISOString()
    };

    const reportResult = await this.repository.uploadFile(reportPath, reportMetadata);
    console.log(`📊 Performance report uploaded - ${reportResult.transactionId.substring(0, 8)}...`);

    // Generate trend analysis
    await this.generateTrendAnalysis();
  }

  // 5. Anomaly Detection
  async demonstrateAnomalyDetection(): Promise<void> {
    console.log('\n🔍 5. ANOMALY DETECTION');
    console.log('=======================');

    console.log('🔍 Analyzing metrics for anomalies...');
    
    const anomalies = await this.detectAnomalies();
    
    if (anomalies.length > 0) {
      console.log(`🚨 ${anomalies.length} anomalies detected:`);
      anomalies.forEach((anomaly, index) => {
        console.log(`   ${index + 1}. ${anomaly.type}: ${anomaly.description}`);
        console.log(`      Severity: ${anomaly.severity}, Confidence: ${anomaly.confidence}%`);
      });

      // Store anomalies
      const anomaliesData = {
        timestamp: new Date().toISOString(),
        anomalies: anomalies,
        detectionAlgorithm: 'statistical-threshold',
        totalCount: anomalies.length
      };

      const anomaliesPath = path.join(this.metricsDir, 'alerts', 'detected_anomalies.json');
      await fs.writeFile(anomaliesPath, JSON.stringify(anomaliesData, null, 2));

      const anomalyMetadata: DatasetMetadata = {
        app: 'anomaly-detection',
        contentType: 'application/json',
        datasetName: 'detected-anomalies',
        split: 'current',
        version: new Date().toISOString().split('T')[0],
        owner: 'ml-monitoring@example.com',
        createdAt: new Date().toISOString()
      };

      await this.repository.uploadFile(anomaliesPath, anomalyMetadata);
    } else {
      console.log('✅ No anomalies detected - all metrics within normal ranges');
    }
  }

  // 6. Custom Metrics Dashboard
  async demonstrateCustomMetrics(): Promise<void> {
    console.log('\n📱 6. CUSTOM METRICS DASHBOARD');
    console.log('==============================');

    // Create custom business metrics
    const businessMetrics = {
      timestamp: new Date().toISOString(),
      userSatisfaction: 4.2 + Math.random() * 0.6, // 4.2-4.8 rating
      conversionRate: 0.12 + Math.random() * 0.05, // 12-17% conversion
      revenueImpact: 50000 + Math.random() * 20000, // $50k-70k
      modelAdoption: 0.78 + Math.random() * 0.15, // 78-93% adoption
      costPerPrediction: 0.001 + Math.random() * 0.0005, // $0.001-0.0015
      trainingEfficiency: 0.85 + Math.random() * 0.1, // 85-95%
      dataQuality: 0.92 + Math.random() * 0.06, // 92-98%
      featureDrift: Math.random() * 0.03, // 0-3% drift
      predictionAccuracy: 0.88 + Math.random() * 0.08, // 88-96%
      customerRetention: 0.91 + Math.random() * 0.07 // 91-98%
    };

    console.log('📊 Business Metrics Summary:');
    console.log(`   User Satisfaction: ${businessMetrics.userSatisfaction.toFixed(2)}/5.0`);
    console.log(`   Conversion Rate: ${(businessMetrics.conversionRate * 100).toFixed(1)}%`);
    console.log(`   Revenue Impact: $${businessMetrics.revenueImpact.toLocaleString()}`);
    console.log(`   Model Adoption: ${(businessMetrics.modelAdoption * 100).toFixed(1)}%`);
    console.log(`   Cost per Prediction: $${businessMetrics.costPerPrediction.toFixed(4)}`);

    // Store business metrics
    const businessMetricsPath = path.join(this.metricsDir, 'reports', 'business_metrics.json');
    await fs.writeFile(businessMetricsPath, JSON.stringify(businessMetrics, null, 2));

    const businessMetadata: DatasetMetadata = {
      app: 'business-intelligence',
      contentType: 'application/json',
      datasetName: 'business-metrics',
      split: 'daily',
      version: new Date().toISOString().split('T')[0],
      owner: 'business-intelligence@example.com',
      createdAt: new Date().toISOString()
    };

    const businessResult = await this.repository.uploadFile(businessMetricsPath, businessMetadata);
    console.log(`💼 Business metrics uploaded - ${businessResult.transactionId.substring(0, 8)}...`);
  }

  // Helper methods
  private async analyzeModelTrends(modelId: string): Promise<void> {
    console.log(`   📈 Analyzing trends for ${modelId}:`);
    
    // Simulate trend analysis
    const trends = {
      accuracyTrend: Math.random() > 0.5 ? 'improving' : 'stable',
      latencyTrend: Math.random() > 0.7 ? 'degrading' : 'stable',
      throughputTrend: Math.random() > 0.6 ? 'improving' : 'stable'
    };

    console.log(`      Accuracy: ${trends.accuracyTrend}`);
    console.log(`      Latency: ${trends.latencyTrend}`);
    console.log(`      Throughput: ${trends.throughputTrend}`);
  }

  private async generateHealthSummary(): Promise<void> {
    console.log('\n📋 System Health Summary:');
    console.log('   Overall Status: Healthy');
    console.log('   Uptime: 99.8%');
    console.log('   Average Response Time: 185ms');
    console.log('   Error Rate: 0.3%');
    console.log('   Active Connections: 75');
  }

  private async processAlerts(): Promise<Array<{ name: string; severity: string; message: string }>> {
    const alerts = [];
    
    // Simulate alert processing based on current metrics
    if (Math.random() > 0.7) {
      alerts.push({
        name: 'High Latency',
        severity: 'medium',
        message: 'Model response time exceeded 400ms threshold'
      });
    }

    if (Math.random() > 0.8) {
      alerts.push({
        name: 'Memory Usage',
        severity: 'high',
        message: 'System memory usage above 85%'
      });
    }

    if (Math.random() > 0.9) {
      alerts.push({
        name: 'Error Rate Spike',
        severity: 'critical',
        message: 'Error rate increased to 8.2%'
      });
    }

    return alerts;
  }

  private getAlertSeverityBreakdown(alerts: Array<{ severity: string }>): Record<string, number> {
    return alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private async generatePerformanceReport(): Promise<any> {
    return {
      reportPeriod: '2024-01-01 to 2024-01-07',
      averageAccuracy: 0.912,
      averageLatency: 156.3,
      systemUptime: 99.7,
      totalRequests: 2847562,
      errorRate: 0.42,
      topPerformingModels: ['sentiment-analyzer', 'image-detector', 'mnist-classifier'],
      recommendations: [
        'Optimize mnist-classifier for better latency',
        'Scale up infrastructure during peak hours',
        'Update monitoring thresholds for accuracy alerts'
      ]
    };
  }

  private async generateTrendAnalysis(): Promise<void> {
    console.log('\n📊 Trend Analysis:');
    console.log('   🔹 Model accuracy improved by 2.3% this week');
    console.log('   🔹 Response times reduced by 15ms on average');
    console.log('   🔹 Error rates decreased by 0.1%');
    console.log('   🔹 Resource utilization optimized by 8%');
  }

  private async detectAnomalies(): Promise<Array<{ type: string; description: string; severity: string; confidence: number }>> {
    const anomalies = [];

    // Simulate anomaly detection
    if (Math.random() > 0.6) {
      anomalies.push({
        type: 'Performance Anomaly',
        description: 'Unusual spike in model inference time detected',
        severity: 'medium',
        confidence: 87
      });
    }

    if (Math.random() > 0.8) {
      anomalies.push({
        type: 'Data Distribution Shift',
        description: 'Input data distribution differs from training data',
        severity: 'high',
        confidence: 92
      });
    }

    return anomalies;
  }

  private getWeekVersion(): string {
    const now = new Date();
    const year = now.getFullYear();
    const week = Math.ceil((now.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    return `${year}.W${week.toString().padStart(2, '0')}`;
  }

  private async cleanupFiles(): Promise<void> {
    console.log('\n🧹 Cleaning up monitoring data...');
    if (await fs.pathExists(this.metricsDir)) {
      await fs.remove(this.metricsDir);
      console.log('✅ Cleanup completed!');
    }
  }
}

// Main execution function
async function main() {
  console.log('📊 DataVault Monitoring & Analytics Demo\n');

  const privateKey = process.env.IRYS_PRIVATE_KEY;
  const dbPath = process.env.DATABASE_PATH || './data/monitoring-demo.db';

  if (!privateKey) {
    console.error('❌ IRYS_PRIVATE_KEY environment variable required');
    return;
  }

  const demo = new MonitoringAnalyticsDemo(privateKey, dbPath);

  try {
    await demo.initialize();
    
    await demo.demonstrateModelPerformanceMonitoring();
    await demo.demonstrateSystemHealthMonitoring();
    await demo.demonstrateAlertManagement();
    await demo.demonstratePerformanceAnalytics();
    await demo.demonstrateAnomalyDetection();
    await demo.demonstrateCustomMetrics();
    
    console.log('\n🎉 All monitoring and analytics features demonstrated!');
    console.log('💡 These monitoring patterns can be integrated into production systems!');
    
  } catch (error) {
    console.error('❌ Demo error:', error instanceof Error ? error.message : String(error));
  } finally {
    await demo.cleanup();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main as monitoringAnalyticsDemo };