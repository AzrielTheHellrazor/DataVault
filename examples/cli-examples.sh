#!/bin/bash

# DataVault CLI Kullanım Örnekleri
# Bu script tüm temel CLI komutlarını demonstre eder

echo "🚀 DataVault CLI Örnekleri - Başlatılıyor..."

# Renk kodları
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Örnek dosyalar oluştur
echo -e "${BLUE}📁 Örnek dosyalar oluşturuluyor...${NC}"
mkdir -p example-data
echo '{"model": "mnist_classifier", "accuracy": 0.98, "epochs": 50}' > example-data/model_info.json
echo '{"training_data": "mnist", "batch_size": 32, "learning_rate": 0.001}' > example-data/training_config.json
dd if=/dev/urandom of=example-data/model.pt bs=1024 count=10 2>/dev/null
echo "Example dataset content" > example-data/dataset.txt

echo -e "\n${GREEN}✅ Örnek dosyalar hazırlandı!${NC}"

# 1. Dosya Yükleme Örnekleri
echo -e "\n${BLUE}📤 1. DOSYA YÜKLEME ÖRNEKLERİ${NC}"

echo -e "\n${YELLOW}🤖 PyTorch Model Yükleme:${NC}"
echo "bun run upload -- -f ./example-data/model.pt -a ml-training -n mnist-classifier -s production -v 1.0.0 -o team@example.com --receipt"

echo -e "\n${YELLOW}📊 Veri Seti Yükleme:${NC}"
echo "bun run upload -- -f ./example-data/dataset.txt -a data-pipeline -n customer-data -s train -v 1.0.0 -o data-team@example.com --receipt"

echo -e "\n${YELLOW}⚙️ Konfigurasyon Dosyası Yükleme:${NC}"
echo "bun run upload -- -f ./example-data/training_config.json -a ml-training -n training-config -s production -v 1.0.0 -o ml-engineer@example.com --receipt"

echo -e "\n${YELLOW}📋 Model Bilgileri Yükleme:${NC}"
echo "bun run upload -- -f ./example-data/model_info.json -a ml-training -n model-metadata -s production -v 1.0.0 -o ml-engineer@example.com --receipt"

# 2. Sorgulama Örnekleri
echo -e "\n${BLUE}🔍 2. SORGULAMA ÖRNEKLERİ${NC}"

echo -e "\n${YELLOW}🎯 Belirli veri seti arama:${NC}"
echo "bun run query -- -n mnist-classifier -l 10"

echo -e "\n${YELLOW}📱 Uygulama bazlı arama:${NC}"
echo "bun run query -- -a ml-training -l 20"

echo -e "\n${YELLOW}👤 Sahip bazlı arama:${NC}"
echo "bun run query -- -o team@example.com -l 15"

echo -e "\n${YELLOW}🗂️ Split bazlı arama:${NC}"
echo "bun run query -- -s production -l 10"

echo -e "\n${YELLOW}📅 Tarih aralığında arama:${NC}"
echo "bun run query -- --start-time 2024-01-01T00:00:00Z --end-time 2024-12-31T23:59:59Z -l 20"

echo -e "\n${YELLOW}🔄 Karmaşık filtreleme:${NC}"
echo "bun run query -- -n mnist-classifier -s production -a ml-training -o team@example.com -l 5"

# 3. Dosya İndirme Örnekleri
echo -e "\n${BLUE}📥 3. DOSYA İNDİRME ÖRNEKLERİ${NC}"

echo -e "\n${YELLOW}⬇️ Transaction ID ile indirme:${NC}"
echo "bun run fetch -- -i <TRANSACTION_ID> -o ./downloads/"

echo -e "\n${YELLOW}🔄 Üzerine yazma ile indirme:${NC}"
echo "bun run fetch -- -i <TRANSACTION_ID> -o ./downloads/model.pt --overwrite"

# 4. Sürüm Yönetimi Örnekleri
echo -e "\n${BLUE}📋 4. SÜRÜM YÖNETİMİ ÖRNEKLERİ${NC}"

echo -e "\n${YELLOW}🆕 En son sürümü getirme:${NC}"
echo "bun run latest -- -n mnist-classifier -s production"

echo -e "\n${YELLOW}🔍 Belirli split'in en son sürümü:${NC}"
echo "bun run latest -- -n customer-data -s train"

# 5. Hesap Yönetimi
echo -e "\n${BLUE}💰 5. HESAP YÖNETİMİ${NC}"

echo -e "\n${YELLOW}💳 Hesap bakiyesi kontrol:${NC}"
echo "bun run balance"

# 6. Gelişmiş Kullanım Senaryoları
echo -e "\n${BLUE}🚀 6. GELİŞMİŞ KULLANIM SENARYOLARI${NC}"

echo -e "\n${YELLOW}🔄 Model pipeline workflow:${NC}"
cat << 'EOF'
# 1. Model eğitimi sonrası checkpoint yükle
bun run upload -- -f ./models/checkpoint_epoch_50.pt -a ml-pipeline -n mnist-v2 -s checkpoint -v 1.1.0 -o trainer@example.com --receipt

# 2. En son checkpoint'i bul
bun run latest -- -n mnist-v2 -s checkpoint

# 3. Production'a terfi ettir
bun run upload -- -f ./models/final_model.pt -a ml-pipeline -n mnist-v2 -s production -v 1.1.0 -o mlops@example.com --receipt

# 4. Production modelini doğrula
bun run query -- -n mnist-v2 -s production -v 1.1.0
EOF

echo -e "\n${YELLOW}📊 Veri seti management workflow:${NC}"
cat << 'EOF'
# 1. Ham veriyi yükle
bun run upload -- -f ./data/raw_data.csv -a data-processing -n customer-analytics -s raw -v 1.0.0 -o data-engineer@example.com --receipt

# 2. İşlenmiş veriyi yükle
bun run upload -- -f ./data/processed_features.csv -a data-processing -n customer-analytics -s processed -v 1.0.0 -o data-engineer@example.com --receipt

# 3. Train/test split'lerini yükle
bun run upload -- -f ./data/train_set.csv -a ml-ready -n customer-analytics -s train -v 1.0.0 -o ml-team@example.com --receipt
bun run upload -- -f ./data/test_set.csv -a ml-ready -n customer-analytics -s test -v 1.0.0 -o ml-team@example.com --receipt
EOF

# 7. İzleme ve Audit
echo -e "\n${YELLOW}📈 İzleme ve audit workflow:${NC}"
cat << 'EOF'
# 1. Günlük model performansını kaydet
bun run upload -- -f ./metrics/daily_metrics.json -a monitoring -n model-performance -s daily -v $(date +%Y.%m.%d) -o monitor@example.com --receipt

# 2. Son 30 günün metriklerini listele
bun run query -- -n model-performance -s daily --start-time $(date -d '30 days ago' -Iseconds) -l 30

# 3. Audit log'larını kaydet
bun run upload -- -f ./logs/audit_$(date +%Y%m%d).log -a audit -n system-audit -s daily -v $(date +%Y.%m.%d) -o security@example.com --receipt
EOF

# Temizlik uyarısı
echo -e "\n${RED}🧹 Temizlik:${NC}"
echo "rm -rf example-data"

echo -e "\n${GREEN}✅ Tüm CLI örnekleri listelendi!${NC}"
echo -e "${BLUE}💡 Bu komutları çalıştırmadan önce .env dosyasını doğru şekilde yapılandırdığınızdan emin olun.${NC}"

# Örnek dosyaları temizle
echo -e "\n${YELLOW}🧹 Örnek dosyalar temizleniyor...${NC}"
rm -rf example-data

echo -e "${GREEN}✅ Temizlik tamamlandı!${NC}"