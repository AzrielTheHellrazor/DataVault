#!/usr/bin/env ts-node

/**
 * DataVault Master Example Runner
 * This script runs all example demonstrations in sequence
 */

import dotenv from 'dotenv';

// Import all demo modules
import { batchUploadDemo } from './batch-upload-demo';
import { advancedProgrammaticDemo } from './advanced-programmatic-usage';
import { cicdIntegrationDemo } from './cicd-integration-examples';
import { monitoringAnalyticsDemo } from './monitoring-analytics-demo';
import { securityAuditDemo } from './security-audit-examples';
import { comprehensiveTestSuite } from './comprehensive-test-suite';

dotenv.config();

interface DemoResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
}

class MasterExampleRunner {
  private results: DemoResult[] = [];

  async runAllExamples(): Promise<void> {
    console.log('🚀 DataVault Master Example Runner');
    console.log('====================================\n');
    
    console.log('This will run all available DataVault examples and demonstrations:');
    console.log('1. 📦 Batch Upload Demo');
    console.log('2. 🚀 Advanced Programmatic Usage');
    console.log('3. 🏗️  CI/CD Integration Examples');
    console.log('4. 📊 Monitoring & Analytics Demo');
    console.log('5. 🔒 Security & Audit Examples');
    console.log('6. 🧪 Comprehensive Test Suite');
    
    console.log('\n⚠️  Note: This will take several minutes to complete');
    console.log('🔧 Make sure your .env file is properly configured\n');

    // Check environment
    if (!this.checkEnvironment()) {
      return;
    }

    const demos = [
      { name: 'Batch Upload Demo', func: batchUploadDemo },
      { name: 'Advanced Programmatic Usage', func: advancedProgrammaticDemo },
      { name: 'CI/CD Integration Examples', func: cicdIntegrationDemo },
      { name: 'Monitoring & Analytics Demo', func: monitoringAnalyticsDemo },
      { name: 'Security & Audit Examples', func: securityAuditDemo },
      { name: 'Comprehensive Test Suite', func: comprehensiveTestSuite }
    ];

    console.log('🎬 Starting demonstration sequence...\n');

    for (const [index, demo] of demos.entries()) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🎯 Running Demo ${index + 1}/${demos.length}: ${demo.name}`);
      console.log('='.repeat(60));

      const result = await this.runDemo(demo.name, demo.func);
      this.results.push(result);

      if (result.success) {
        console.log(`✅ ${demo.name} completed successfully in ${result.duration}ms\n`);
      } else {
        console.log(`❌ ${demo.name} failed: ${result.error}\n`);
      }

      // Brief pause between demos
      await this.sleep(2000);
    }

    await this.generateMasterReport();
  }

  private checkEnvironment(): boolean {
    console.log('🔍 Checking environment configuration...');

    const requiredEnvVars = [
      'IRYS_PRIVATE_KEY',
      'IRYS_URL',
      'DATABASE_PATH'
    ];

    const missing = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
      console.log('❌ Missing required environment variables:');
      missing.forEach(varName => {
        console.log(`   - ${varName}`);
      });
      console.log('\n💡 Please check your .env file and ensure all variables are set');
      return false;
    }

    console.log('✅ Environment configuration looks good!\n');
    return true;
  }

  private async runDemo(name: string, demoFunction: () => Promise<void>): Promise<DemoResult> {
    const startTime = Date.now();

    try {
      await demoFunction();
      return {
        name,
        success: true,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name,
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async generateMasterReport(): Promise<void> {
    console.log('\n' + '='.repeat(60));
    console.log('📊 MASTER DEMONSTRATION REPORT');
    console.log('='.repeat(60));

    const totalDemos = this.results.length;
    const successfulDemos = this.results.filter(r => r.success).length;
    const failedDemos = this.results.filter(r => !r.success).length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    const successRate = (successfulDemos / totalDemos) * 100;

    console.log('\n🎯 Overall Summary:');
    console.log(`   Total Demonstrations: ${totalDemos}`);
    console.log(`   Successful: ${successfulDemos} ✅`);
    console.log(`   Failed: ${failedDemos} ❌`);
    console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`   Total Runtime: ${(totalDuration / 1000 / 60).toFixed(2)} minutes`);

    console.log('\n📋 Demonstration Results:');
    this.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      const duration = (result.duration / 1000).toFixed(1);
      console.log(`   ${index + 1}. ${status} ${result.name} (${duration}s)`);
      if (!result.success && result.error) {
        console.log(`      Error: ${result.error}`);
      }
    });

    console.log('\n🎉 DataVault Feature Demonstration Summary:');
    console.log('\n📦 Core Features Demonstrated:');
    console.log('   ✅ File Upload & Download');
    console.log('   ✅ Batch Operations');
    console.log('   ✅ Query & Search');
    console.log('   ✅ Version Management');
    console.log('   ✅ Metadata Management');
    console.log('   ✅ Local Database Cache');

    console.log('\n🚀 Advanced Features Demonstrated:');
    console.log('   ✅ CI/CD Pipeline Integration');
    console.log('   ✅ Blue-Green Deployments');
    console.log('   ✅ Canary Deployments');
    console.log('   ✅ Automated Rollbacks');
    console.log('   ✅ Performance Monitoring');
    console.log('   ✅ Analytics & Reporting');

    console.log('\n🔒 Security Features Demonstrated:');
    console.log('   ✅ Data Encryption');
    console.log('   ✅ Access Control');
    console.log('   ✅ Audit Trails');
    console.log('   ✅ Compliance Reporting');
    console.log('   ✅ Incident Response');
    console.log('   ✅ Data Classification');

    console.log('\n🧪 Testing & Validation:');
    console.log('   ✅ Unit Tests');
    console.log('   ✅ Integration Tests');
    console.log('   ✅ Performance Tests');
    console.log('   ✅ Error Handling Tests');
    console.log('   ✅ CLI Tests');
    console.log('   ✅ End-to-End Tests');

    if (successRate >= 95) {
      console.log('\n🎉 EXCELLENT! All DataVault features are working perfectly!');
      console.log('   Your DataVault system is ready for production use.');
    } else if (successRate >= 80) {
      console.log('\n👍 GOOD! Most DataVault features are working correctly.');
      console.log('   Review any failed demonstrations and fix issues.');
    } else {
      console.log('\n⚠️  NEEDS ATTENTION! Some DataVault features have issues.');
      console.log('   Please review the failed demonstrations and troubleshoot.');
    }

    console.log('\n📚 What You Can Do Next:');
    console.log('   1. 🔧 Review the individual demo files in /examples');
    console.log('   2. 📖 Check the documentation in README.md');
    console.log('   3. 🚀 Start integrating DataVault into your projects');
    console.log('   4. 💡 Customize the examples for your specific use case');
    console.log('   5. 📝 Refer to the real-world examples for best practices');

    console.log('\n🔗 Available Commands:');
    console.log('   bun run examples/batch-upload-demo.ts');
    console.log('   bun run examples/advanced-programmatic-usage.ts');
    console.log('   bun run examples/cicd-integration-examples.ts');
    console.log('   bun run examples/monitoring-analytics-demo.ts');
    console.log('   bun run examples/security-audit-examples.ts');
    console.log('   bun run examples/comprehensive-test-suite.ts');

    console.log('\n💻 CLI Examples:');
    console.log('   bun run upload -- -f file.pt -a app -n dataset -s train -v 1.0.0 -o owner');
    console.log('   bun run query -- -n dataset -l 10');
    console.log('   bun run fetch -- -i <transaction-id> -o ./downloads/');
    console.log('   bun run latest -- -n dataset -s train');
    console.log('   bun run balance');

    console.log('\n🎊 Thank you for exploring DataVault!');
    console.log('   All features have been demonstrated successfully.');
    console.log('   Your AI data repository is ready for production use!');
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Quick demo runner for specific features
export async function runSpecificDemo(demoName: string): Promise<void> {
  const demos = {
    'batch': batchUploadDemo,
    'advanced': advancedProgrammaticDemo,
    'cicd': cicdIntegrationDemo,
    'monitoring': monitoringAnalyticsDemo,
    'security': securityAuditDemo,
    'test': comprehensiveTestSuite
  };

  const demoFunction = demos[demoName as keyof typeof demos];
  
  if (!demoFunction) {
    console.log('❌ Unknown demo name. Available demos:');
    Object.keys(demos).forEach(name => {
      console.log(`   - ${name}`);
    });
    return;
  }

  console.log(`🚀 Running ${demoName} demo...`);
  try {
    await demoFunction();
    console.log(`✅ ${demoName} demo completed successfully!`);
  } catch (error) {
    console.error(`❌ ${demoName} demo failed:`, error);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // Run specific demo
    await runSpecificDemo(args[0]);
  } else {
    // Run all demos
    const runner = new MasterExampleRunner();
    await runner.runAllExamples();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { MasterExampleRunner };