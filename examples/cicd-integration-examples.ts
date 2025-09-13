#!/usr/bin/env ts-node

/**
 * DataVault CI/CD Integration Examples
 * This script demonstrates automated deployment and integration patterns
 */

import { AIRepository } from '../src/repository';
import { DatasetMetadata } from '../src/types';
import * as fs from 'fs-extra';
import * as path from 'path';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';

dotenv.config();
const execAsync = promisify(exec);

interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  version: string;
  modelPath: string;
  configPath: string;
  approvalRequired: boolean;
}

interface PipelineResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  deploymentTime: number;
}

class CICDIntegrationDemo {
  private repository: AIRepository;
  private deploymentDir = './examples/deployment-artifacts';

  constructor(privateKey: string, dbPath: string) {
    this.repository = new AIRepository(privateKey, dbPath);
  }

  async initialize(): Promise<void> {
    console.log('🚀 CI/CD Integration Demo Starting...\n');
    await this.createDeploymentArtifacts();
  }

  async cleanup(): Promise<void> {
    await this.repository.close();
    await this.cleanupFiles();
  }

  private async createDeploymentArtifacts(): Promise<void> {
    console.log('📦 Creating deployment artifacts...');
    
    await fs.ensureDir(this.deploymentDir);
    await fs.ensureDir(path.join(this.deploymentDir, 'models'));
    await fs.ensureDir(path.join(this.deploymentDir, 'configs'));
    await fs.ensureDir(path.join(this.deploymentDir, 'tests'));

    // Create model artifacts
    const modelVersions = ['1.0.0', '1.1.0', '1.2.0'];
    for (const version of modelVersions) {
      await fs.writeFile(
        path.join(this.deploymentDir, 'models', `model_v${version.replace(/\./g, '_')}.pt`),
        Buffer.from(`PyTorch model v${version} - production ready`)
      );

      // Model metadata
      const modelMeta = {
        version,
        accuracy: 0.95 + Math.random() * 0.04,
        f1_score: 0.93 + Math.random() * 0.05,
        precision: 0.94 + Math.random() * 0.04,
        recall: 0.92 + Math.random() * 0.06,
        training_samples: 100000,
        validation_samples: 20000,
        test_samples: 20000,
        model_size_mb: 15.5 + Math.random() * 5,
        inference_time_ms: 12 + Math.random() * 3,
        created_at: new Date().toISOString(),
        git_commit: `abc${Math.random().toString(36).substring(2, 8)}`,
        docker_image: `model-server:v${version}`,
        requirements: ['torch>=1.9.0', 'numpy>=1.21.0', 'pillow>=8.3.0']
      };

      await fs.writeFile(
        path.join(this.deploymentDir, 'models', `model_v${version.replace(/\./g, '_')}_metadata.json`),
        JSON.stringify(modelMeta, null, 2)
      );
    }

    // Create configuration files
    const environments = ['development', 'staging', 'production'];
    for (const env of environments) {
      const config = {
        environment: env,
        api_endpoint: `https://${env}.example.com/api/v1`,
        model_endpoint: `https://${env}.example.com/model/predict`,
        batch_size: env === 'production' ? 32 : 16,
        max_concurrent_requests: env === 'production' ? 100 : 50,
        timeout_ms: env === 'production' ? 30000 : 10000,
        logging_level: env === 'production' ? 'INFO' : 'DEBUG',
        monitoring: {
          enabled: true,
          metrics_endpoint: `https://metrics.${env}.example.com`,
          alert_thresholds: {
            error_rate: env === 'production' ? 0.01 : 0.05,
            response_time_p95: env === 'production' ? 500 : 1000,
            throughput_min: env === 'production' ? 10 : 5
          }
        },
        database: {
          connection_pool_size: env === 'production' ? 20 : 5,
          query_timeout_ms: 5000,
          retry_attempts: 3
        }
      };

      await fs.writeFile(
        path.join(this.deploymentDir, 'configs', `${env}_config.json`),
        JSON.stringify(config, null, 2)
      );
    }

    // Create test files
    const testResults = {
      unit_tests: {
        passed: 145,
        failed: 0,
        skipped: 2,
        coverage: 94.5
      },
      integration_tests: {
        passed: 23,
        failed: 0,
        skipped: 1,
        duration_seconds: 127
      },
      performance_tests: {
        avg_response_time_ms: 45,
        p95_response_time_ms: 78,
        throughput_rps: 850,
        error_rate: 0.001
      },
      security_tests: {
        vulnerabilities_found: 0,
        last_scan_date: new Date().toISOString(),
        compliance_score: 98.5
      }
    };

    await fs.writeFile(
      path.join(this.deploymentDir, 'tests', 'test_results.json'),
      JSON.stringify(testResults, null, 2)
    );

    console.log('✅ Deployment artifacts created!');
  }

  // 1. Automated Model Deployment Pipeline
  async demonstrateModelDeploymentPipeline(): Promise<void> {
    console.log('\n🚀 1. AUTOMATED MODEL DEPLOYMENT PIPELINE');
    console.log('==========================================');

    const deploymentConfig: DeploymentConfig = {
      environment: 'production',
      version: '1.2.0',
      modelPath: path.join(this.deploymentDir, 'models', 'model_v1_2_0.pt'),
      configPath: path.join(this.deploymentDir, 'configs', 'production_config.json'),
      approvalRequired: true
    };

    console.log(`📦 Starting deployment pipeline for v${deploymentConfig.version}`);

    // Step 1: Validation
    console.log('\n🔍 Step 1: Pre-deployment validation');
    const validationResult = await this.validateDeployment(deploymentConfig);
    if (!validationResult.success) {
      console.log(`❌ Validation failed: ${validationResult.error}`);
      return;
    }
    console.log('✅ Validation passed');

    // Step 2: Run tests
    console.log('\n🧪 Step 2: Running automated tests');
    const testResult = await this.runAutomatedTests();
    if (!testResult.success) {
      console.log(`❌ Tests failed: ${testResult.error}`);
      return;
    }
    console.log('✅ All tests passed');

    // Step 3: Deploy to staging
    console.log('\n🎭 Step 3: Deploy to staging');
    const stagingResult = await this.deployToEnvironment({
      ...deploymentConfig,
      environment: 'staging'
    });
    
    if (!stagingResult.success) {
      console.log(`❌ Staging deployment failed: ${stagingResult.error}`);
      return;
    }
    console.log(`✅ Staging deployment successful - Transaction: ${stagingResult.transactionId}`);

    // Step 4: Smoke tests
    console.log('\n💨 Step 4: Running smoke tests');
    const smokeTestResult = await this.runSmokeTests();
    if (!smokeTestResult.success) {
      console.log(`❌ Smoke tests failed: ${smokeTestResult.error}`);
      return;
    }
    console.log('✅ Smoke tests passed');

    // Step 5: Production deployment (with approval)
    console.log('\n🚀 Step 5: Production deployment');
    if (deploymentConfig.approvalRequired) {
      console.log('⏳ Waiting for manual approval...');
      const approved = await this.simulateApprovalProcess();
      if (!approved) {
        console.log('❌ Deployment not approved');
        return;
      }
      console.log('✅ Deployment approved');
    }

    const productionResult = await this.deployToEnvironment(deploymentConfig);
    if (!productionResult.success) {
      console.log(`❌ Production deployment failed: ${productionResult.error}`);
      return;
    }

    console.log(`🎉 Production deployment successful!`);
    console.log(`📊 Transaction ID: ${productionResult.transactionId}`);
    console.log(`⏱️  Total deployment time: ${productionResult.deploymentTime}ms`);
  }

  // 2. Blue-Green Deployment Strategy
  async demonstrateBlueGreenDeployment(): Promise<void> {
    console.log('\n🔵🟢 2. BLUE-GREEN DEPLOYMENT STRATEGY');
    console.log('=====================================');

    // Deploy to blue environment (current)
    console.log('🔵 Deploying to BLUE environment...');
    const blueDeployment = await this.deployToEnvironment({
      environment: 'production',
      version: '1.1.0',
      modelPath: path.join(this.deploymentDir, 'models', 'model_v1_1_0.pt'),
      configPath: path.join(this.deploymentDir, 'configs', 'production_config.json'),
      approvalRequired: false
    });

    if (blueDeployment.success) {
      console.log(`✅ BLUE deployment successful - ${blueDeployment.transactionId}`);
    }

    // Deploy to green environment (new version)
    console.log('\n🟢 Deploying to GREEN environment...');
    const greenDeployment = await this.deployToEnvironment({
      environment: 'production',
      version: '1.2.0',
      modelPath: path.join(this.deploymentDir, 'models', 'model_v1_2_0.pt'),
      configPath: path.join(this.deploymentDir, 'configs', 'production_config.json'),
      approvalRequired: false
    });

    if (greenDeployment.success) {
      console.log(`✅ GREEN deployment successful - ${greenDeployment.transactionId}`);
    }

    // Health check and traffic switching
    console.log('\n🔄 Performing health checks...');
    const healthCheck = await this.performHealthCheck('green');
    
    if (healthCheck.success) {
      console.log('✅ GREEN environment healthy, switching traffic');
      await this.switchTraffic('blue', 'green');
      console.log('🔄 Traffic switched to GREEN environment');
      
      // Keep blue as fallback for rollback
      console.log('🔵 BLUE environment kept as fallback');
    } else {
      console.log('❌ GREEN environment unhealthy, keeping BLUE active');
    }
  }

  // 3. Canary Deployment
  async demonstrateCanaryDeployment(): Promise<void> {
    console.log('\n🐤 3. CANARY DEPLOYMENT');
    console.log('=======================');

    const canaryConfig = {
      currentVersion: '1.1.0',
      canaryVersion: '1.2.0',
      trafficPercentages: [5, 10, 25, 50, 100]
    };

    console.log(`🚀 Starting canary deployment: ${canaryConfig.currentVersion} → ${canaryConfig.canaryVersion}`);

    // Deploy canary version
    const canaryDeployment = await this.deployToEnvironment({
      environment: 'production',
      version: canaryConfig.canaryVersion,
      modelPath: path.join(this.deploymentDir, 'models', 'model_v1_2_0.pt'),
      configPath: path.join(this.deploymentDir, 'configs', 'production_config.json'),
      approvalRequired: false
    });

    if (!canaryDeployment.success) {
      console.log('❌ Canary deployment failed');
      return;
    }

    console.log(`✅ Canary version deployed - ${canaryDeployment.transactionId}`);

    // Gradual traffic increase
    for (const percentage of canaryConfig.trafficPercentages) {
      console.log(`\n📈 Increasing canary traffic to ${percentage}%`);
      
      // Monitor metrics
      await this.sleep(2000); // Simulate monitoring period
      const metrics = await this.collectCanaryMetrics(percentage);
      
      console.log(`📊 Metrics - Error rate: ${metrics.errorRate}%, Latency: ${metrics.avgLatency}ms`);
      
      if (metrics.errorRate > 1.0 || metrics.avgLatency > 500) {
        console.log('❌ Canary metrics degraded, rolling back');
        await this.rollbackCanary();
        return;
      }
      
      console.log(`✅ Canary performing well at ${percentage}%`);
    }

    console.log('\n🎉 Canary deployment successful, promoting to full production');
    await this.promoteCanary();
  }

  // 4. Rollback Strategy
  async demonstrateRollbackStrategy(): Promise<void> {
    console.log('\n⏪ 4. ROLLBACK STRATEGY');
    console.log('======================');

    // Simulate a problematic deployment
    console.log('🚨 Simulating problematic deployment...');
    
    const currentVersion = await this.repository.getLatestVersion('production-model', 'production');
    if (!currentVersion) {
      console.log('❌ No current version found for rollback demo');
      return;
    }

    console.log(`📋 Current version: ${currentVersion.tags.version}`);
    
    // Deploy problematic version
    const problematicDeployment = await this.deployToEnvironment({
      environment: 'production',
      version: '1.3.0-problematic',
      modelPath: path.join(this.deploymentDir, 'models', 'model_v1_2_0.pt'), // Using existing file
      configPath: path.join(this.deploymentDir, 'configs', 'production_config.json'),
      approvalRequired: false
    });

    if (problematicDeployment.success) {
      console.log(`🚀 Deployed problematic version - ${problematicDeployment.transactionId}`);
    }

    // Detect issues
    console.log('\n🔍 Monitoring deployment...');
    await this.sleep(1000);
    
    const healthStatus = await this.performHealthCheck('production');
    if (!healthStatus.success) {
      console.log('🚨 Health check failed, initiating automated rollback');
      
      // Automatic rollback
      const rollbackResult = await this.performRollback(currentVersion.id);
      if (rollbackResult.success) {
        console.log(`✅ Rollback successful - restored to ${currentVersion.tags.version}`);
        console.log(`📊 Rollback transaction: ${rollbackResult.transactionId}`);
      } else {
        console.log('❌ Rollback failed, manual intervention required');
      }
    }
  }

  // 5. Multi-Environment Pipeline
  async demonstrateMultiEnvironmentPipeline(): Promise<void> {
    console.log('\n🌍 5. MULTI-ENVIRONMENT PIPELINE');
    console.log('=================================');

    const environments = ['development', 'staging', 'production'];
    const version = '2.0.0';

    for (const env of environments) {
      console.log(`\n🚀 Deploying to ${env.toUpperCase()}`);
      
      const deploymentResult = await this.deployToEnvironment({
        environment: env as any,
        version: `${version}-${env}`,
        modelPath: path.join(this.deploymentDir, 'models', 'model_v1_2_0.pt'),
        configPath: path.join(this.deploymentDir, 'configs', `${env}_config.json`),
        approvalRequired: env === 'production'
      });

      if (deploymentResult.success) {
        console.log(`✅ ${env} deployment successful - ${deploymentResult.transactionId}`);
        
        // Run environment-specific tests
        await this.runEnvironmentTests(env);
        
        if (env !== 'production') {
          console.log(`📋 Promotion to next environment approved`);
        }
      } else {
        console.log(`❌ ${env} deployment failed, stopping pipeline`);
        break;
      }
    }
  }

  // Helper methods
  private async validateDeployment(config: DeploymentConfig): Promise<{ success: boolean; error?: string }> {
    // Check if files exist
    if (!await fs.pathExists(config.modelPath)) {
      return { success: false, error: 'Model file not found' };
    }
    
    if (!await fs.pathExists(config.configPath)) {
      return { success: false, error: 'Config file not found' };
    }

    // Validate version format
    if (!/^\d+\.\d+\.\d+/.test(config.version)) {
      return { success: false, error: 'Invalid version format' };
    }

    return { success: true };
  }

  private async runAutomatedTests(): Promise<{ success: boolean; error?: string }> {
    // Simulate running tests
    await this.sleep(1000);
    
    // Read test results
    const testResults = JSON.parse(
      await fs.readFile(path.join(this.deploymentDir, 'tests', 'test_results.json'), 'utf8')
    );

    const hasFailures = testResults.unit_tests.failed > 0 || testResults.integration_tests.failed > 0;
    
    return { 
      success: !hasFailures, 
      error: hasFailures ? 'Some tests failed' : undefined 
    };
  }

  private async deployToEnvironment(config: DeploymentConfig): Promise<PipelineResult> {
    const startTime = Date.now();
    
    try {
      const metadata: DatasetMetadata = {
        app: 'cicd-pipeline',
        contentType: 'application/pytorch',
        datasetName: 'production-model',
        split: config.environment,
        version: config.version,
        owner: 'cicd-bot@example.com',
        createdAt: new Date().toISOString()
      };

      const result = await this.repository.uploadFile(config.modelPath, metadata, { receipt: true });
      
      // Also upload config
      const configMetadata: DatasetMetadata = {
        app: 'cicd-pipeline',
        contentType: 'application/json',
        datasetName: 'deployment-config',
        split: config.environment,
        version: config.version,
        owner: 'cicd-bot@example.com',
        createdAt: new Date().toISOString()
      };

      await this.repository.uploadFile(config.configPath, configMetadata, { receipt: true });

      return {
        success: true,
        transactionId: result.transactionId,
        deploymentTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        deploymentTime: Date.now() - startTime
      };
    }
  }

  private async runSmokeTests(): Promise<{ success: boolean; error?: string }> {
    await this.sleep(500);
    return { success: true };
  }

  private async simulateApprovalProcess(): Promise<boolean> {
    console.log('   📋 Approval request sent to stakeholders');
    await this.sleep(1000);
    console.log('   ✅ Approval received');
    return true;
  }

  private async performHealthCheck(environment: string): Promise<{ success: boolean }> {
    await this.sleep(500);
    // Simulate health check - 90% success rate
    return { success: Math.random() > 0.1 };
  }

  private async switchTraffic(from: string, to: string): Promise<void> {
    console.log(`   🔄 Switching traffic from ${from} to ${to}`);
    await this.sleep(500);
  }

  private async collectCanaryMetrics(percentage: number): Promise<{ errorRate: number; avgLatency: number }> {
    await this.sleep(1000);
    return {
      errorRate: Math.random() * 0.5, // 0-0.5% error rate
      avgLatency: 100 + Math.random() * 50 // 100-150ms latency
    };
  }

  private async rollbackCanary(): Promise<void> {
    console.log('   ⏪ Rolling back canary deployment');
    await this.sleep(500);
  }

  private async promoteCanary(): Promise<void> {
    console.log('   🎉 Promoting canary to full production');
    await this.sleep(500);
  }

  private async performRollback(previousVersionId: string): Promise<{ success: boolean; transactionId?: string }> {
    try {
      // In a real scenario, you would fetch the previous version and redeploy it
      console.log(`   🔄 Rolling back to transaction ${previousVersionId}`);
      await this.sleep(1000);
      
      return {
        success: true,
        transactionId: previousVersionId
      };
    } catch (error) {
      return { success: false };
    }
  }

  private async runEnvironmentTests(environment: string): Promise<void> {
    console.log(`   🧪 Running ${environment} environment tests...`);
    await this.sleep(800);
    console.log(`   ✅ ${environment} tests passed`);
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async cleanupFiles(): Promise<void> {
    console.log('\n🧹 Cleaning up deployment artifacts...');
    if (await fs.pathExists(this.deploymentDir)) {
      await fs.remove(this.deploymentDir);
      console.log('✅ Cleanup completed!');
    }
  }
}

// Main execution function
async function main() {
  console.log('🚀 DataVault CI/CD Integration Demo\n');

  const privateKey = process.env.IRYS_PRIVATE_KEY;
  const dbPath = process.env.DATABASE_PATH || './data/cicd-demo.db';

  if (!privateKey) {
    console.error('❌ IRYS_PRIVATE_KEY environment variable required');
    return;
  }

  const demo = new CICDIntegrationDemo(privateKey, dbPath);

  try {
    await demo.initialize();
    
    await demo.demonstrateModelDeploymentPipeline();
    await demo.demonstrateBlueGreenDeployment();
    await demo.demonstrateCanaryDeployment();
    await demo.demonstrateRollbackStrategy();
    await demo.demonstrateMultiEnvironmentPipeline();
    
    console.log('\n🎉 All CI/CD integration patterns demonstrated!');
    console.log('💡 These patterns can be integrated into your deployment pipelines!');
    
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

export { main as cicdIntegrationDemo };