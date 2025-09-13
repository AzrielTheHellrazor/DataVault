#!/usr/bin/env ts-node

/**
 * DataVault Security & Audit Examples
 * This script demonstrates security best practices and audit trail management
 */

import { AIRepository } from '../src/repository';
import { DatasetMetadata } from '../src/types';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

interface AuditEntry {
  id: string;
  timestamp: string;
  action: 'upload' | 'download' | 'query' | 'delete' | 'access';
  userId: string;
  userRole: string;
  resourceId?: string;
  resourceType: string;
  success: boolean;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  riskScore: number;
  compliance: {
    gdpr: boolean;
    hipaa: boolean;
    sox: boolean;
  };
}

interface SecurityPolicy {
  name: string;
  version: string;
  rules: SecurityRule[];
  lastUpdated: string;
  approvedBy: string;
}

interface SecurityRule {
  id: string;
  name: string;
  description: string;
  category: 'access' | 'data' | 'network' | 'audit';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  conditions: Record<string, any>;
  actions: string[];
}

interface ComplianceReport {
  reportId: string;
  timestamp: string;
  period: { start: string; end: string };
  compliance: {
    gdpr: { score: number; violations: number; issues: string[] };
    hipaa: { score: number; violations: number; issues: string[] };
    sox: { score: number; violations: number; issues: string[] };
  };
  recommendations: string[];
  auditedBy: string;
}

class SecurityAuditDemo {
  private repository: AIRepository;
  private securityDir = './examples/security-data';
  private auditLog: AuditEntry[] = [];

  constructor(privateKey: string, dbPath: string) {
    this.repository = new AIRepository(privateKey, dbPath);
  }

  async initialize(): Promise<void> {
    console.log('🔒 Security & Audit Demo Starting...\n');
    await this.createSecurityArtifacts();
  }

  async cleanup(): Promise<void> {
    await this.repository.close();
    await this.cleanupFiles();
  }

  private async createSecurityArtifacts(): Promise<void> {
    console.log('🔐 Creating security artifacts...');
    
    await fs.ensureDir(this.securityDir);
    await fs.ensureDir(path.join(this.securityDir, 'policies'));
    await fs.ensureDir(path.join(this.securityDir, 'audit'));
    await fs.ensureDir(path.join(this.securityDir, 'compliance'));
    await fs.ensureDir(path.join(this.securityDir, 'encrypted'));
    await fs.ensureDir(path.join(this.securityDir, 'backups'));

    // Create security policies
    await this.createSecurityPolicies();
    
    // Generate audit entries
    await this.generateAuditEntries();
    
    // Create compliance reports
    await this.createComplianceReports();

    console.log('✅ Security artifacts created!');
  }

  private async createSecurityPolicies(): Promise<void> {
    const policies: SecurityPolicy[] = [
      {
        name: 'Data Access Control Policy',
        version: '2.1.0',
        lastUpdated: new Date().toISOString(),
        approvedBy: 'security-team@example.com',
        rules: [
          {
            id: 'DAC-001',
            name: 'Role-based Access Control',
            description: 'Users can only access data according to their assigned roles',
            category: 'access',
            severity: 'critical',
            enabled: true,
            conditions: { requireRole: true, allowedRoles: ['admin', 'data-scientist', 'analyst'] },
            actions: ['log', 'block', 'alert']
          },
          {
            id: 'DAC-002',
            name: 'Multi-factor Authentication',
            description: 'MFA required for sensitive data access',
            category: 'access',
            severity: 'high',
            enabled: true,
            conditions: { sensitiveData: true, requireMFA: true },
            actions: ['enforce_mfa', 'log', 'alert']
          }
        ]
      },
      {
        name: 'Data Encryption Policy',
        version: '1.3.0',
        lastUpdated: new Date().toISOString(),
        approvedBy: 'security-team@example.com',
        rules: [
          {
            id: 'ENC-001',
            name: 'Encryption at Rest',
            description: 'All sensitive data must be encrypted when stored',
            category: 'data',
            severity: 'critical',
            enabled: true,
            conditions: { dataClassification: 'sensitive', encryptionRequired: true },
            actions: ['encrypt', 'log', 'verify']
          },
          {
            id: 'ENC-002',
            name: 'Encryption in Transit',
            description: 'All data transfers must use encrypted channels',
            category: 'network',
            severity: 'high',
            enabled: true,
            conditions: { networkTransfer: true, requireTLS: true },
            actions: ['enforce_tls', 'log', 'block_unencrypted']
          }
        ]
      }
    ];

    for (const [index, policy] of policies.entries()) {
      await fs.writeFile(
        path.join(this.securityDir, 'policies', `security_policy_${index + 1}.json`),
        JSON.stringify(policy, null, 2)
      );
    }
  }

  private async generateAuditEntries(): Promise<void> {
    const users = [
      { id: 'user001', role: 'data-scientist', ip: '192.168.1.100' },
      { id: 'user002', role: 'admin', ip: '192.168.1.101' },
      { id: 'user003', role: 'analyst', ip: '192.168.1.102' },
      { id: 'user004', role: 'guest', ip: '192.168.1.103' }
    ];

    const actions = ['upload', 'download', 'query', 'access'] as const;
    const resourceTypes = ['model', 'dataset', 'config', 'report'];

    for (let i = 0; i < 50; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
      
      const entry: AuditEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        action,
        userId: user.id,
        userRole: user.role,
        resourceId: `${resourceType}_${Math.random().toString(36).substring(2, 8)}`,
        resourceType,
        success: Math.random() > 0.05, // 95% success rate
        ipAddress: user.ip,
        userAgent: 'DataVault-Client/1.0.0',
        details: {
          fileSize: action === 'upload' ? Math.floor(Math.random() * 100000000) : undefined,
          duration: Math.floor(Math.random() * 5000),
          queryFilters: action === 'query' ? { limit: 10, sort: 'timestamp' } : undefined
        },
        riskScore: Math.floor(Math.random() * 100),
        compliance: {
          gdpr: Math.random() > 0.1,
          hipaa: Math.random() > 0.05,
          sox: Math.random() > 0.02
        }
      };

      this.auditLog.push(entry);
    }

    // Write audit log
    await fs.writeFile(
      path.join(this.securityDir, 'audit', 'audit_log.json'),
      JSON.stringify(this.auditLog, null, 2)
    );
  }

  private async createComplianceReports(): Promise<void> {
    const reports: ComplianceReport[] = [
      {
        reportId: 'COMP-2024-Q1',
        timestamp: new Date().toISOString(),
        period: {
          start: '2024-01-01T00:00:00Z',
          end: '2024-03-31T23:59:59Z'
        },
        compliance: {
          gdpr: {
            score: 92,
            violations: 2,
            issues: ['Missing consent for user003 data access', 'Data retention period exceeded for archived datasets']
          },
          hipaa: {
            score: 98,
            violations: 0,
            issues: []
          },
          sox: {
            score: 95,
            violations: 1,
            issues: ['Insufficient audit trail for financial model updates']
          }
        },
        recommendations: [
          'Implement automated consent management system',
          'Set up automated data retention policies',
          'Enhance audit logging for financial models',
          'Conduct quarterly compliance training'
        ],
        auditedBy: 'compliance-officer@example.com'
      }
    ];

    for (const [index, report] of reports.entries()) {
      await fs.writeFile(
        path.join(this.securityDir, 'compliance', `compliance_report_${index + 1}.json`),
        JSON.stringify(report, null, 2)
      );
    }
  }

  // 1. Secure File Upload with Encryption
  async demonstrateSecureUpload(): Promise<void> {
    console.log('\n🔒 1. SECURE FILE UPLOAD WITH ENCRYPTION');
    console.log('=========================================');

    // Create sample sensitive data
    const sensitiveData = {
      patientRecords: [
        { id: 'P001', diagnosis: 'Type 2 Diabetes', treatment: 'Metformin' },
        { id: 'P002', diagnosis: 'Hypertension', treatment: 'Lisinopril' }
      ],
      financialData: {
        revenue: 1250000,
        expenses: 890000,
        profit: 360000,
        quarter: 'Q1-2024'
      },
      personalInfo: {
        employees: [
          { id: 'E001', name: 'John Doe', ssn: '***-**-1234' },
          { id: 'E002', name: 'Jane Smith', ssn: '***-**-5678' }
        ]
      }
    };

    const dataPath = path.join(this.securityDir, 'sensitive_data.json');
    await fs.writeFile(dataPath, JSON.stringify(sensitiveData, null, 2));

    // Encrypt the data
    console.log('🔐 Encrypting sensitive data...');
    const encryptedPath = await this.encryptFile(dataPath);
    
    // Upload with security metadata
    const secureMetadata: DatasetMetadata = {
      app: 'secure-storage',
      contentType: 'application/encrypted',
      datasetName: 'sensitive-patient-data',
      split: 'encrypted',
      version: '1.0.0',
      owner: 'security-admin@example.com',
      createdAt: new Date().toISOString()
    };

    const uploadResult = await this.repository.uploadFile(encryptedPath, secureMetadata, { receipt: true });
    console.log(`✅ Encrypted data uploaded - Transaction: ${uploadResult.transactionId}`);

    // Log the upload
    await this.logSecurityEvent('upload', 'security-admin@example.com', 'admin', uploadResult.transactionId, {
      encrypted: true,
      dataClassification: 'sensitive',
      fileSize: (await fs.stat(encryptedPath)).size
    });

    console.log('📋 Security event logged');
  }

  // 2. Audit Trail Management
  async demonstrateAuditTrailManagement(): Promise<void> {
    console.log('\n📋 2. AUDIT TRAIL MANAGEMENT');
    console.log('============================');

    // Upload audit log
    const auditLogPath = path.join(this.securityDir, 'audit', 'audit_log.json');
    
    const auditMetadata: DatasetMetadata = {
      app: 'audit-system',
      contentType: 'application/json',
      datasetName: 'audit-trail',
      split: 'security',
      version: new Date().toISOString().split('T')[0],
      owner: 'audit-system@example.com',
      createdAt: new Date().toISOString()
    };

    const auditResult = await this.repository.uploadFile(auditLogPath, auditMetadata, { receipt: true });
    console.log(`📊 Audit log uploaded - Transaction: ${auditResult.transactionId}`);

    // Analyze audit log
    console.log('\n🔍 Audit Log Analysis:');
    const analysis = this.analyzeAuditLog();
    
    console.log(`   Total Events: ${analysis.totalEvents}`);
    console.log(`   Success Rate: ${analysis.successRate.toFixed(1)}%`);
    console.log(`   High Risk Events: ${analysis.highRiskEvents}`);
    console.log(`   Top Users: ${analysis.topUsers.join(', ')}`);
    console.log(`   Failed Attempts: ${analysis.failedAttempts}`);

    // Generate security alerts
    const alerts = this.generateSecurityAlerts(analysis);
    if (alerts.length > 0) {
      console.log('\n🚨 Security Alerts:');
      alerts.forEach((alert, index) => {
        console.log(`   ${index + 1}. [${alert.severity}] ${alert.message}`);
      });
    }
  }

  // 3. Access Control and Permissions
  async demonstrateAccessControl(): Promise<void> {
    console.log('\n👥 3. ACCESS CONTROL & PERMISSIONS');
    console.log('==================================');

    // Upload security policies
    const policyFiles = await fs.readdir(path.join(this.securityDir, 'policies'));
    
    for (const policyFile of policyFiles) {
      const policyPath = path.join(this.securityDir, 'policies', policyFile);
      
      const policyMetadata: DatasetMetadata = {
        app: 'security-policies',
        contentType: 'application/json',
        datasetName: 'access-control-policies',
        split: 'configuration',
        version: '2.1.0',
        owner: 'security-team@example.com',
        createdAt: new Date().toISOString()
      };

      const result = await this.repository.uploadFile(policyPath, policyMetadata);
      console.log(`📋 Policy uploaded: ${policyFile.replace('.json', '')} - ${result.transactionId.substring(0, 8)}...`);
    }

    // Simulate access control check
    console.log('\n🔍 Access Control Validation:');
    const accessAttempts = [
      { user: 'data-scientist@example.com', role: 'data-scientist', resource: 'sensitive-model', action: 'download' },
      { user: 'guest@example.com', role: 'guest', resource: 'sensitive-model', action: 'download' },
      { user: 'admin@example.com', role: 'admin', resource: 'audit-log', action: 'access' },
      { user: 'analyst@example.com', role: 'analyst', resource: 'public-dataset', action: 'query' }
    ];

    for (const attempt of accessAttempts) {
      const allowed = this.checkAccess(attempt.role, attempt.resource, attempt.action);
      const status = allowed ? '✅ ALLOWED' : '❌ DENIED';
      console.log(`   ${status}: ${attempt.user} → ${attempt.action} ${attempt.resource}`);
      
      // Log access attempt
      await this.logSecurityEvent(
        attempt.action as any,
        attempt.user,
        attempt.role,
        attempt.resource,
        { accessResult: allowed ? 'granted' : 'denied' }
      );
    }
  }

  // 4. Data Classification and Protection
  async demonstrateDataClassification(): Promise<void> {
    console.log('\n🏷️ 4. DATA CLASSIFICATION & PROTECTION');
    console.log('=======================================');

    const classifications = [
      { level: 'Public', files: ['public-dataset.json', 'open-model.pt'] },
      { level: 'Internal', files: ['internal-metrics.json', 'training-logs.txt'] },
      { level: 'Confidential', files: ['customer-data.csv', 'proprietary-model.pt'] },
      { level: 'Restricted', files: ['financial-data.json', 'personal-info.csv'] }
    ];

    for (const classification of classifications) {
      console.log(`\n🔖 Processing ${classification.level} data:`);
      
      for (const file of classification.files) {
        // Create sample file
        const filePath = path.join(this.securityDir, 'classified', file);
        await fs.ensureDir(path.dirname(filePath));
        
        const sampleData = {
          classification: classification.level,
          filename: file,
          created: new Date().toISOString(),
          owner: 'data-owner@example.com',
          content: `Sample ${classification.level.toLowerCase()} content`
        };
        
        await fs.writeFile(filePath, JSON.stringify(sampleData, null, 2));

        // Apply protection based on classification
        const protectedPath = await this.applyDataProtection(filePath, classification.level);
        
        // Upload with classification metadata
        const classificationMetadata: DatasetMetadata = {
          app: 'data-classification',
          contentType: 'application/json',
          datasetName: file.split('.')[0],
          split: classification.level.toLowerCase(),
          version: '1.0.0',
          owner: 'data-governance@example.com',
          createdAt: new Date().toISOString()
        };

        const result = await this.repository.uploadFile(protectedPath, classificationMetadata);
        console.log(`   📁 ${file} (${classification.level}) - ${result.transactionId.substring(0, 8)}...`);
      }
    }
  }

  // 5. Compliance Reporting
  async demonstrateComplianceReporting(): Promise<void> {
    console.log('\n📊 5. COMPLIANCE REPORTING');
    console.log('==========================');

    const reportFiles = await fs.readdir(path.join(this.securityDir, 'compliance'));
    
    for (const reportFile of reportFiles) {
      const reportPath = path.join(this.securityDir, 'compliance', reportFile);
      
      const complianceMetadata: DatasetMetadata = {
        app: 'compliance-reporting',
        contentType: 'application/json',
        datasetName: 'compliance-report',
        split: 'quarterly',
        version: '2024.Q1',
        owner: 'compliance-officer@example.com',
        createdAt: new Date().toISOString()
      };

      const result = await this.repository.uploadFile(reportPath, complianceMetadata, { receipt: true });
      console.log(`📋 Compliance report uploaded - ${result.transactionId}`);

      // Read and display report summary
      const report = JSON.parse(await fs.readFile(reportPath, 'utf8')) as ComplianceReport;
      console.log('\n📈 Compliance Summary:');
      console.log(`   Report Period: ${report.period.start} to ${report.period.end}`);
      console.log(`   GDPR Compliance: ${report.compliance.gdpr.score}% (${report.compliance.gdpr.violations} violations)`);
      console.log(`   HIPAA Compliance: ${report.compliance.hipaa.score}% (${report.compliance.hipaa.violations} violations)`);
      console.log(`   SOX Compliance: ${report.compliance.sox.score}% (${report.compliance.sox.violations} violations)`);
      
      if (report.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        report.recommendations.forEach((rec, index) => {
          console.log(`   ${index + 1}. ${rec}`);
        });
      }
    }
  }

  // 6. Security Incident Response
  async demonstrateIncidentResponse(): Promise<void> {
    console.log('\n🚨 6. SECURITY INCIDENT RESPONSE');
    console.log('=================================');

    // Simulate security incident
    const incident = {
      id: 'INC-2024-001',
      timestamp: new Date().toISOString(),
      severity: 'high',
      type: 'unauthorized_access',
      description: 'Multiple failed login attempts from suspicious IP address',
      affectedResources: ['user-authentication-system', 'user-database'],
      detectionMethod: 'automated-monitoring',
      source: '192.168.1.999',
      impact: 'potential_data_breach',
      status: 'investigating',
      assignedTo: 'security-team@example.com',
      evidence: {
        logEntries: 45,
        failedAttempts: 127,
        timeframe: '15 minutes',
        userAccounts: ['user001', 'user002', 'admin']
      },
      response: {
        immediate: [
          'Block suspicious IP address',
          'Reset affected user passwords',
          'Enable additional monitoring'
        ],
        investigation: [
          'Analyze access logs',
          'Check for data exfiltration',
          'Review security policies'
        ],
        remediation: [
          'Update firewall rules',
          'Implement rate limiting',
          'Enhance monitoring alerts'
        ]
      }
    };

    console.log(`🚨 Security Incident Detected: ${incident.id}`);
    console.log(`   Severity: ${incident.severity.toUpperCase()}`);
    console.log(`   Type: ${incident.type}`);
    console.log(`   Description: ${incident.description}`);
    
    // Store incident report
    const incidentPath = path.join(this.securityDir, 'incidents', `${incident.id}.json`);
    await fs.ensureDir(path.dirname(incidentPath));
    await fs.writeFile(incidentPath, JSON.stringify(incident, null, 2));

    const incidentMetadata: DatasetMetadata = {
      app: 'incident-management',
      contentType: 'application/json',
      datasetName: 'security-incident',
      split: 'investigation',
      version: incident.id,
      owner: 'security-team@example.com',
      createdAt: new Date().toISOString()
    };

    const incidentResult = await this.repository.uploadFile(incidentPath, incidentMetadata, { receipt: true });
    console.log(`📋 Incident report stored - ${incidentResult.transactionId}`);

    // Execute immediate response
    console.log('\n⚡ Immediate Response Actions:');
    incident.response.immediate.forEach((action, index) => {
      console.log(`   ${index + 1}. ${action}`);
    });

    console.log('\n🔍 Investigation Steps:');
    incident.response.investigation.forEach((step, index) => {
      console.log(`   ${index + 1}. ${step}`);
    });
  }

  // Helper methods
  private async encryptFile(filePath: string): Promise<string> {
    const key = crypto.randomBytes(32); // 256-bit key
    const iv = crypto.randomBytes(16);   // 128-bit IV
    
    const cipher = crypto.createCipher('aes-256-cbc', key);
    const input = await fs.readFile(filePath);
    
    let encrypted = cipher.update(input, undefined, 'hex');
    encrypted += cipher.final('hex');
    
    const encryptedPath = path.join(this.securityDir, 'encrypted', path.basename(filePath) + '.enc');
    await fs.ensureDir(path.dirname(encryptedPath));
    
    // Store encrypted data with metadata
    const encryptedData = {
      data: encrypted,
      algorithm: 'aes-256-cbc',
      keyHash: crypto.createHash('sha256').update(key).digest('hex').substring(0, 16), // Store key hash for reference
      iv: iv.toString('hex'),
      originalFile: path.basename(filePath),
      encryptedAt: new Date().toISOString()
    };
    
    await fs.writeFile(encryptedPath, JSON.stringify(encryptedData, null, 2));
    return encryptedPath;
  }

  private async logSecurityEvent(
    action: string,
    userId: string,
    userRole: string,
    resourceId: string,
    details: Record<string, any>
  ): Promise<void> {
    const event: AuditEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action: action as any,
      userId,
      userRole,
      resourceId,
      resourceType: 'file',
      success: true,
      ipAddress: '192.168.1.100',
      userAgent: 'DataVault-Security/1.0.0',
      details,
      riskScore: this.calculateRiskScore(action, userRole, details),
      compliance: {
        gdpr: true,
        hipaa: true,
        sox: true
      }
    };

    this.auditLog.push(event);
  }

  private analyzeAuditLog(): any {
    const totalEvents = this.auditLog.length;
    const successfulEvents = this.auditLog.filter(e => e.success).length;
    const highRiskEvents = this.auditLog.filter(e => e.riskScore > 70).length;
    const failedAttempts = totalEvents - successfulEvents;
    
    const userCounts = new Map<string, number>();
    this.auditLog.forEach(event => {
      userCounts.set(event.userId, (userCounts.get(event.userId) || 0) + 1);
    });
    
    const topUsers = Array.from(userCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([userId]) => userId);

    return {
      totalEvents,
      successRate: (successfulEvents / totalEvents) * 100,
      highRiskEvents,
      failedAttempts,
      topUsers
    };
  }

  private generateSecurityAlerts(analysis: any): Array<{ severity: string; message: string }> {
    const alerts = [];

    if (analysis.successRate < 90) {
      alerts.push({
        severity: 'HIGH',
        message: `Low success rate detected: ${analysis.successRate.toFixed(1)}%`
      });
    }

    if (analysis.highRiskEvents > 5) {
      alerts.push({
        severity: 'MEDIUM',
        message: `${analysis.highRiskEvents} high-risk events detected`
      });
    }

    if (analysis.failedAttempts > 10) {
      alerts.push({
        severity: 'HIGH',
        message: `${analysis.failedAttempts} failed attempts detected - possible brute force attack`
      });
    }

    return alerts;
  }

  private checkAccess(role: string, resource: string, action: string): boolean {
    // Simple role-based access control logic
    const permissions = {
      'admin': ['*'],
      'data-scientist': ['public-dataset', 'internal-model', 'training-data'],
      'analyst': ['public-dataset', 'reports'],
      'guest': ['public-dataset']
    };

    const userPermissions = permissions[role as keyof typeof permissions] || [];
    
    return userPermissions.includes('*') || 
           userPermissions.some(perm => resource.includes(perm)) ||
           (!resource.includes('sensitive') && !resource.includes('restricted'));
  }

  private async applyDataProtection(filePath: string, classification: string): Promise<string> {
    if (classification === 'Restricted' || classification === 'Confidential') {
      // Encrypt sensitive data
      return await this.encryptFile(filePath);
    } else {
      // For internal/public data, just add classification metadata
      const content = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(content);
      data._classification = classification;
      data._protectedAt = new Date().toISOString();
      
      const protectedPath = filePath.replace('.json', '_protected.json');
      await fs.writeFile(protectedPath, JSON.stringify(data, null, 2));
      return protectedPath;
    }
  }

  private calculateRiskScore(action: string, userRole: string, details: Record<string, any>): number {
    let score = 0;
    
    // Base risk by action
    const actionRisk = {
      'upload': 30,
      'download': 40,
      'delete': 80,
      'access': 20,
      'query': 10
    };
    
    score += actionRisk[action as keyof typeof actionRisk] || 0;
    
    // Risk by role
    const roleRisk = {
      'guest': 50,
      'analyst': 20,
      'data-scientist': 10,
      'admin': 5
    };
    
    score += roleRisk[userRole as keyof typeof roleRisk] || 0;
    
    // Additional risk factors
    if (details.encrypted === false) score += 20;
    if (details.dataClassification === 'sensitive') score += 30;
    if (details.accessResult === 'denied') score += 40;
    
    return Math.min(score, 100);
  }

  private async cleanupFiles(): Promise<void> {
    console.log('\n🧹 Cleaning up security artifacts...');
    if (await fs.pathExists(this.securityDir)) {
      await fs.remove(this.securityDir);
      console.log('✅ Cleanup completed!');
    }
  }
}

// Main execution function
async function main() {
  console.log('🔒 DataVault Security & Audit Demo\n');

  const privateKey = process.env.IRYS_PRIVATE_KEY;
  const dbPath = process.env.DATABASE_PATH || './data/security-demo.db';

  if (!privateKey) {
    console.error('❌ IRYS_PRIVATE_KEY environment variable required');
    return;
  }

  const demo = new SecurityAuditDemo(privateKey, dbPath);

  try {
    await demo.initialize();
    
    await demo.demonstrateSecureUpload();
    await demo.demonstrateAuditTrailManagement();
    await demo.demonstrateAccessControl();
    await demo.demonstrateDataClassification();
    await demo.demonstrateComplianceReporting();
    await demo.demonstrateIncidentResponse();
    
    console.log('\n🎉 All security and audit features demonstrated!');
    console.log('🔒 These security patterns ensure compliance and data protection!');
    
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

export { main as securityAuditDemo };