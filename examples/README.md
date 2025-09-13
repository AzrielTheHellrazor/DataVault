# DataVault Examples

This directory contains comprehensive examples demonstrating all features of the DataVault AI Data Repository system.

## 🚀 Quick Start

### Run All Examples
```bash
# Run all demonstrations in sequence (recommended for first-time users)
bun run examples/run-all-examples.ts

# Run a specific demo
bun run examples/run-all-examples.ts batch
bun run examples/run-all-examples.ts advanced
bun run examples/run-all-examples.ts cicd
bun run examples/run-all-examples.ts monitoring
bun run examples/run-all-examples.ts security
bun run examples/run-all-examples.ts test
```

### Individual Examples
```bash
# Batch upload demonstration
bun run examples/batch-upload-demo.ts

# Advanced programmatic features
bun run examples/advanced-programmatic-usage.ts

# CI/CD integration patterns
bun run examples/cicd-integration-examples.ts

# Monitoring and analytics
bun run examples/monitoring-analytics-demo.ts

# Security and audit features
bun run examples/security-audit-examples.ts

# Comprehensive test suite
bun run examples/comprehensive-test-suite.ts
```

## 📚 Example Files Overview

### 🔧 Core Examples

| File | Description | Features Demonstrated |
|------|-------------|----------------------|
| `usage-examples.ts` | Basic usage patterns | File upload, query, version management |
| `batch-upload-demo.ts` | Batch operations | Multi-file uploads, batch processing |
| `advanced-programmatic-usage.ts` | Advanced patterns | Version control, analytics, optimization |

### 🏗️ Integration Examples

| File | Description | Use Cases |
|------|-------------|-----------|
| `cicd-integration-examples.ts` | Deployment pipelines | Blue-green, canary deployments, rollbacks |
| `monitoring-analytics-demo.ts` | Observability | Performance monitoring, alerting, reporting |
| `security-audit-examples.ts` | Security features | Encryption, access control, compliance |

### 🧪 Testing & Validation

| File | Description | Coverage |
|------|-------------|----------|
| `comprehensive-test-suite.ts` | Full system tests | All features, performance, error handling |
| `run-all-examples.ts` | Master runner | Orchestrates all demonstrations |

### 📖 Documentation

| File | Description | Content |
|------|-------------|---------|
| `graphql-queries.md` | Query examples | GraphQL patterns, filters, pagination |
| `real-world-examples.md` | Practical use cases | ML models, datasets, embeddings |
| `cli-examples.sh` | CLI demonstrations | Command-line usage patterns |

## 🎯 Feature Matrix

### ✅ Core Features
- [x] File Upload & Download
- [x] Batch Operations
- [x] Query & Search
- [x] Version Management
- [x] Metadata Management
- [x] Local Database Cache
- [x] CLI Interface
- [x] TypeScript API

### 🚀 Advanced Features
- [x] CI/CD Pipeline Integration
- [x] Blue-Green Deployments
- [x] Canary Deployments
- [x] Automated Rollbacks
- [x] Performance Monitoring
- [x] Analytics & Reporting
- [x] Custom Metrics
- [x] Anomaly Detection

### 🔒 Security Features
- [x] Data Encryption
- [x] Access Control
- [x] Audit Trails
- [x] Compliance Reporting
- [x] Incident Response
- [x] Data Classification
- [x] Security Policies

### 🧪 Testing & Quality
- [x] Unit Tests
- [x] Integration Tests
- [x] Performance Tests
- [x] Error Handling Tests
- [x] CLI Tests
- [x] End-to-End Tests

## 🛠️ Prerequisites

Before running the examples, ensure you have:

1. **Environment Configuration**
   ```bash
   # Copy and configure environment variables
   cp env.example .env
   
   # Required variables:
   # IRYS_PRIVATE_KEY=your_private_key_here
   # IRYS_URL=https://node2.irys.xyz
   # DATABASE_PATH=./data/repository.db
   ```

2. **Dependencies Installed**
   ```bash
   bun install
   ```

3. **Project Built**
   ```bash
   bun run build
   ```

## 📋 Example Scenarios

### 🤖 Machine Learning Workflows

**Model Training Pipeline**
```bash
# Upload training data
bun run upload -- -f train.csv -a ml-pipeline -n customer-model -s train -v 1.0.0 -o team@example.com

# Upload trained model
bun run upload -- -f model.pt -a ml-pipeline -n customer-model -s production -v 1.0.0 -o team@example.com

# Query model versions
bun run query -- -n customer-model -l 10
```

**Model Deployment**
```bash
# Get latest production model
bun run latest -- -n customer-model -s production

# Download for deployment
bun run fetch -- -i <transaction-id> -o ./deploy/
```

### 📊 Data Science Workflows

**Dataset Management**
```bash
# Upload different dataset splits
bun run upload -- -f train.parquet -a data-science -n user-behavior -s train -v 2.1.0 -o ds-team@example.com
bun run upload -- -f val.parquet -a data-science -n user-behavior -s validation -v 2.1.0 -o ds-team@example.com
bun run upload -- -f test.parquet -a data-science -n user-behavior -s test -v 2.1.0 -o ds-team@example.com

# Query by time range
bun run query -- -n user-behavior --start-time 2024-01-01T00:00:00Z
```

### 🏢 Enterprise Integration

**Compliance & Audit**
- Automated audit trail generation
- GDPR, HIPAA, SOX compliance reporting
- Security incident tracking
- Access control validation

**DevOps Integration**
- Automated deployment pipelines
- Blue-green deployment strategies
- Canary releases with monitoring
- Rollback mechanisms

## 🔍 Troubleshooting

### Common Issues

**Environment Variables**
```bash
# Check if variables are set
echo $IRYS_PRIVATE_KEY
echo $IRYS_URL
echo $DATABASE_PATH

# Verify .env file exists
ls -la .env
```

**Network Issues**
```bash
# Test Irys connectivity
curl -s https://node2.irys.xyz/info

# Check balance
bun run balance
```

**File Permissions**
```bash
# Ensure data directory is writable
mkdir -p data
chmod 755 data
```

### Getting Help

1. **Check Logs**: All examples include detailed logging
2. **Review Error Messages**: Comprehensive error handling with actionable messages
3. **Test Environment**: Use `comprehensive-test-suite.ts` to validate setup
4. **Documentation**: Refer to main README.md and individual file comments

## 🎉 Success Indicators

After running the examples successfully, you should see:

- ✅ Files uploaded to Irys network with transaction IDs
- ✅ Query results returned with proper metadata
- ✅ Local database populated with records
- ✅ CLI commands working correctly
- ✅ All tests passing in the comprehensive suite
- ✅ Monitoring and security features operational

## 🚀 Next Steps

1. **Customize Examples**: Modify the examples for your specific use case
2. **Integrate into Projects**: Use the patterns in your own applications  
3. **Production Setup**: Configure for production environments
4. **Scale Up**: Implement batch operations for large datasets
5. **Monitor**: Set up monitoring and alerting
6. **Secure**: Implement proper security measures

---

**Happy coding with DataVault! 🎊**

All examples are production-ready and demonstrate best practices for AI data management on the Irys blockchain.