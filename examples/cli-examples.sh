#!/bin/bash

# DataVault CLI Usage Examples
# This script demonstrates all basic CLI commands

echo "🚀 DataVault CLI Examples - Starting..."

# Renk kodları
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create example files
echo -e "${BLUE}📁 Creating example files...${NC}"
mkdir -p example-data
echo '{"model": "mnist_classifier", "accuracy": 0.98, "epochs": 50}' > example-data/model_info.json
echo '{"training_data": "mnist", "batch_size": 32, "learning_rate": 0.001}' > example-data/training_config.json
dd if=/dev/urandom of=example-data/model.pt bs=1024 count=10 2>/dev/null
echo "Example dataset content" > example-data/dataset.txt

echo -e "\n${GREEN}✅ Example files prepared!${NC}"

# 1. File Upload Examples
echo -e "\n${BLUE}📤 1. FILE UPLOAD EXAMPLES${NC}"

echo -e "\n${YELLOW}🤖 PyTorch Model Upload:${NC}"
echo "bun run upload -- -f ./example-data/model.pt -a ml-training -n mnist-classifier -s production -v 1.0.0 -o team@example.com --receipt"

echo -e "\n${YELLOW}📊 Dataset Upload:${NC}"
echo "bun run upload -- -f ./example-data/dataset.txt -a data-pipeline -n customer-data -s train -v 1.0.0 -o data-team@example.com --receipt"

echo -e "\n${YELLOW}⚙️ Configuration File Upload:${NC}"
echo "bun run upload -- -f ./example-data/training_config.json -a ml-training -n training-config -s production -v 1.0.0 -o ml-engineer@example.com --receipt"

echo -e "\n${YELLOW}📋 Model Info Upload:${NC}"
echo "bun run upload -- -f ./example-data/model_info.json -a ml-training -n model-metadata -s production -v 1.0.0 -o ml-engineer@example.com --receipt"

# 2. Query Examples
echo -e "\n${BLUE}🔍 2. QUERY EXAMPLES${NC}"

echo -e "\n${YELLOW}🎯 Search specific dataset:${NC}"
echo "bun run query -- -n mnist-classifier -l 10"

echo -e "\n${YELLOW}📱 App-based search:${NC}"
echo "bun run query -- -a ml-training -l 20"

echo -e "\n${YELLOW}👤 Owner-based search:${NC}"
echo "bun run query -- -o team@example.com -l 15"

echo -e "\n${YELLOW}🗂️ Split-based search:${NC}"
echo "bun run query -- -s production -l 10"

echo -e "\n${YELLOW}📅 Date range search:${NC}"
echo "bun run query -- --start-time 2024-01-01T00:00:00Z --end-time 2024-12-31T23:59:59Z -l 20"

echo -e "\n${YELLOW}🔄 Complex filtering:${NC}"
echo "bun run query -- -n mnist-classifier -s production -a ml-training -o team@example.com -l 5"

# 3. File Download Examples
echo -e "\n${BLUE}📥 3. FILE DOWNLOAD EXAMPLES${NC}"

echo -e "\n${YELLOW}⬇️ Download with Transaction ID:${NC}"
echo "bun run fetch -- -i <TRANSACTION_ID> -o ./downloads/"

echo -e "\n${YELLOW}🔄 Download with overwrite:${NC}"
echo "bun run fetch -- -i <TRANSACTION_ID> -o ./downloads/model.pt --overwrite"

# 4. Version Management Examples
echo -e "\n${BLUE}📋 4. VERSION MANAGEMENT EXAMPLES${NC}"

echo -e "\n${YELLOW}🆕 Get latest version:${NC}"
echo "bun run latest -- -n mnist-classifier -s production"

echo -e "\n${YELLOW}🔍 Latest version of specific split:${NC}"
echo "bun run latest -- -n customer-data -s train"

# 5. Account Management
echo -e "\n${BLUE}💰 5. ACCOUNT MANAGEMENT${NC}"

echo -e "\n${YELLOW}💳 Account balance check:${NC}"
echo "bun run balance"

# 6. Advanced Usage Scenarios
echo -e "\n${BLUE}🚀 6. ADVANCED USAGE SCENARIOS${NC}"

echo -e "\n${YELLOW}🔄 Model pipeline workflow:${NC}"
cat << 'EOF'
# 1. Upload checkpoint after model training
bun run upload -- -f ./models/checkpoint_epoch_50.pt -a ml-pipeline -n mnist-v2 -s checkpoint -v 1.1.0 -o trainer@example.com --receipt

# 2. Find latest checkpoint
bun run latest -- -n mnist-v2 -s checkpoint

# 3. Promote to production
bun run upload -- -f ./models/final_model.pt -a ml-pipeline -n mnist-v2 -s production -v 1.1.0 -o mlops@example.com --receipt

# 4. Verify production model
bun run query -- -n mnist-v2 -s production -v 1.1.0
EOF

echo -e "\n${YELLOW}📊 Veri seti management workflow:${NC}"
cat << 'EOF'
# 1. Upload raw data
bun run upload -- -f ./data/raw_data.csv -a data-processing -n customer-analytics -s raw -v 1.0.0 -o data-engineer@example.com --receipt

# 2. Upload processed data
bun run upload -- -f ./data/processed_features.csv -a data-processing -n customer-analytics -s processed -v 1.0.0 -o data-engineer@example.com --receipt

# 3. Upload train/test splits
bun run upload -- -f ./data/train_set.csv -a ml-ready -n customer-analytics -s train -v 1.0.0 -o ml-team@example.com --receipt
bun run upload -- -f ./data/test_set.csv -a ml-ready -n customer-analytics -s test -v 1.0.0 -o ml-team@example.com --receipt
EOF

# 7. Monitoring and Audit
echo -e "\n${YELLOW}📈 İzleme ve audit workflow:${NC}"
cat << 'EOF'
# 1. Record daily model performance
bun run upload -- -f ./metrics/daily_metrics.json -a monitoring -n model-performance -s daily -v $(date +%Y.%m.%d) -o monitor@example.com --receipt

# 2. List last 30 days metrics
bun run query -- -n model-performance -s daily --start-time $(date -d '30 days ago' -Iseconds) -l 30

# 3. Record audit logs
bun run upload -- -f ./logs/audit_$(date +%Y%m%d).log -a audit -n system-audit -s daily -v $(date +%Y.%m.%d) -o security@example.com --receipt
EOF

# Cleanup warning
echo -e "\n${RED}🧹 Cleanup:${NC}"
echo "rm -rf example-data"

echo -e "\n${GREEN}✅ All CLI examples listed!${NC}"
echo -e "${BLUE}💡 Make sure to properly configure your .env file before running these commands.${NC}"

# Örnek dosyaları temizle
echo -e "\n${YELLOW}🧹 Cleaning up example files...${NC}"
rm -rf example-data

echo -e "${GREEN}✅ Cleanup completed!${NC}"