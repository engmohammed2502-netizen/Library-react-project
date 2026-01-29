#!/bin/bash

# ============================================
# سكربت استعادة النظام - مكتبة كلية الهندسة
# جامعة البحر الأحمر
# ============================================

# إعدادات الألوان
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# مسارات النظام
PROJECT_ROOT="/var/www/engineering-library"
BACKUP_DIR="/var/backups/engineering-library"
UPLOADS_DIR="/var/www/engineering-library/uploads"
LOGS_DIR="/var/www/engineering-library/logs"
CONFIG_DIR="/var/www/engineering-library"

# متغيرات المساعدة
SCRIPT_NAME=$(basename "$0")
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
RESTORE_LOG="$LOGS_DIR/restore_${TIMESTAMP}.log"

# دالة لطباعة رسائل المعلومات
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
    echo "[INFO] $1" >> "$RESTORE_LOG"
}

# دالة لطباعة رسائل النجاح
print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    echo "[SUCCESS] $1" >> "$RESTORE_LOG"
}

# دالة لطباعة رسائل التحذير
print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    echo "[WARNING] $1" >> "$RESTORE_LOG"
}

# دالة لطباعة رسائل الخطأ
print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    echo "[ERROR] $1" >> "$RESTORE_LOG"
}

# دالة للتحقق من صلاحيات الجذر
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "يجب تشغيل السكربت كـ root أو باستخدام sudo"
        exit 1
    fi
}

# دالة لعرض المساعدة
show_help() {
    echo "استخدام: $SCRIPT_NAME [خيارات]"
    echo ""
    echo "خيارات:"
    echo "  -h, --help                 عرض هذه الرسالة"
    echo "  -l, --list                 عرض قائمة النسخ الاحتياطية المتاحة"
    echo "  -b, --backup-id ID         معرف النسخة الاحتياطية للاستعادة"
    echo "  -d, --database-only        استعادة قاعدة البيانات فقط"
    echo "  -f, --files-only           استعادة الملفات فقط"
    echo "  -c, --config-only          استعادة الإعدادات فقط"
    echo "  -a, --all                  استعادة كل شيء (الافتراضي)"
    echo "  -y, --yes                  تأكيد الاستعادة بدون مطالبة"
    echo "  --dry-run                  محاكاة الاستعادة بدون تنفيذ"
    echo ""
    echo "أمثلة:"
    echo "  $SCRIPT_NAME --list"
    echo "  $SCRIPT_NAME --backup-id backup-2024-01-15-143022 --all"
    echo "  $SCRIPT_NAME --backup-id backup-2024-01-15-143022 --database-only"
}

# دالة لعرض قائمة النسخ الاحتياطية
list_backups() {
    print_info "جاري عرض النسخ الاحتياطية المتاحة..."
    
    if [ ! -d "$BACKUP_DIR" ]; then
        print_error "مجلد النسخ الاحتياطية غير موجود: $BACKUP_DIR"
        return 1
    fi
    
    local backups=($(ls -1t "$BACKUP_DIR" 2>/dev/null | grep ^backup-))
    
    if [ ${#backups[@]} -eq 0 ]; then
        print_warning "لا توجد نسخ احتياطية"
        return 0
    fi
    
    echo ""
    echo "النسخ الاحتياطية المتاحة:"
    echo "=========================="
    
    for backup in "${backups[@]}"; do
        local backup_path="$BACKUP_DIR/$backup"
        local info_file="$backup_path/backup-info.json"
        
        if [ -f "$info_file" ]; then
            local timestamp=$(jq -r '.timestamp' "$info_file" 2>/dev/null || echo "غير معروف")
            local size=$(du -sh "$backup_path" | cut -f1)
            echo "  $backup"
            echo "    الوقت: $timestamp"
            echo "    الحجم: $size"
            echo ""
        else
            echo "  $backup (بدون معلومات)"
            echo ""
        fi
    done
}

# دالة للتحقق من وجود النسخة الاحتياطية
validate_backup() {
    local backup_id=$1
    local backup_path="$BACKUP_DIR/$backup_id"
    
    if [ ! -d "$backup_path" ]; then
        print_error "النسخة الاحتياطية غير موجودة: $backup_id"
        return 1
    fi
    
    local required_files=("backup-info.json" "database" "config")
    
    for file in "${required_files[@]}"; do
        if [ ! -e "$backup_path/$file" ]; then
            print_warning "الملف/المجلد غير موجود في النسخة الاحتياطية: $file"
        fi
    done
    
    return 0
}

# دالة لاستعادة قاعدة البيانات
restore_database() {
    local backup_path=$1
    
    print_info "جاري استعادة قاعدة البيانات..."
    
    # التحقق من وجود mongorestore
    if ! command -v mongorestore &> /dev/null; then
        print_error "أداة mongorestore غير مثبتة"
        return 1
    fi
    
    local mongodump_path="$backup_path/database/mongodump"
    
    if [ -d "$mongodump_path" ]; then
        # استعادة باستخدام mongodump
        print_info "استعادة قاعدة البيانات باستخدام mongodump..."
        
        if [ "$DRY_RUN" = true ]; then
            print_info "محاكاة: mongorestore --uri=\"$MONGODB_URI\" \"$mongodump_path\" --drop"
            return 0
        fi
        
        if mongorestore --uri="$MONGODB_URI" "$mongodump_path" --drop >> "$RESTORE_LOG" 2>&1; then
            print_success "تم استعادة قاعدة البيانات باستخدام mongodump"
            return 0
        else
            print_error "فشل استعادة قاعدة البيانات باستخدام mongodump"
            return 1
        fi
    else
        # استعادة باستخدام ملفات JSON
        print_info "استعادة قاعدة البيانات باستخدام ملفات JSON..."
        
        local json_files=($(find "$backup_path/database" -name "*.json"))
        
        if [ ${#json_files[@]} -eq 0 ]; then
            print_warning "لا توجد ملفات JSON لاستعادة قاعدة البيانات"
            return 0
        fi
        
        for json_file in "${json_files[@]}"; do
            local collection=$(basename "$json_file" .json)
            
            if [ "$DRY_RUN" = true ]; then
                print_info "محاكاة: استعادة collection: $collection"
                continue
            fi
            
            # استيراد البيانات إلى MongoDB
            if mongoimport --uri="$MONGODB_URI" --collection="$collection" --file="$json_file" --drop >> "$RESTORE_LOG" 2>&1; then
                print_info "  ✓ تم استعادة collection: $collection"
            else
                print_error "  ✗ فشل استعادة collection: $collection"
            fi
        done
        
        print_success "تم استعادة قاعدة البيانات من ملفات JSON"
        return 0
    fi
}

# دالة لاستعادة ملفات التحميل
restore_uploads() {
    local backup_path=$1
    
    print_info "جاري استعادة ملفات التحميل..."
    
    local uploads_backup="$backup_path/uploads"
    
    if [ ! -d "$uploads_backup" ]; then
        print_warning "مجلد ملفات التحميل غير موجود في النسخة الاحتياطية"
        return 0
    fi
    
    if [ "$DRY_RUN" = true ]; then
        print_info "محاكاة: نسخ $uploads_backup إلى $UPLOADS_DIR"
        return 0
    fi
    
    # إنشاء نسخة احتياطية من الملفات الحالية
    if [ -d "$UPLOADS_DIR" ]; then
        local backup_current="$UPLOADS_DIR.backup_$TIMESTAMP"
        print_info "إنشاء نسخة احتياطية من الملفات الحالية: $backup_current"
        cp -r "$UPLOADS_DIR" "$backup_current"
    fi
    
    # حذف الملفات الحالية
    print_info "حذف ملفات التحميل الحالية..."
    rm -rf "$UPLOADS_DIR"
    
    # نسخ الملفات المستعادة
    print_info "نسخ ملفات التحميل المستعادة..."
    cp -r "$uploads_backup" "$UPLOADS_DIR"
    
    # تعديل الصلاحيات
    chown -R www-data:www-data "$UPLOADS_DIR"
    chmod -R 755 "$UPLOADS_DIR"
    
    print_success "تم استعادة ملفات التحميل"
    return 0
}

# دالة لاستعادة ملفات الإعداد
restore_config() {
    local backup_path=$1
    
    print_info "جاري استعادة ملفات الإعداد..."
    
    local config_backup="$backup_path/config"
    
    if [ ! -d "$config_backup" ]; then
        print_warning "مجلد الإعدادات غير موجود في النسخة الاحتياطية"
        return 0
    fi
    
    # قائمة الملفات المراد استعادتها
    local config_files=(".env" "nginx.conf" "ecosystem.config.js")
    
    for config_file in "${config_files[@]}"; do
        local source_file="$config_backup/$config_file"
        local dest_file="$CONFIG_DIR/$config_file"
        
        if [ -f "$source_file" ]; then
            if [ "$DRY_RUN" = true ]; then
                print_info "محاكاة: نسخ $source_file إلى $dest_file"
                continue
            fi
            
            # إنشاء نسخة احتياطية من الملف الحالي
            if [ -f "$dest_file" ]; then
                cp "$dest_file" "${dest_file}.backup_$TIMESTAMP"
            fi
            
            # نسخ الملف الجديد
            cp "$source_file" "$dest_file"
            print_info "  ✓ تم استعادة: $config_file"
        else
            print_warning "  ملف غير موجود: $config_file"
        fi
    done
    
    print_success "تم استعادة ملفات الإعداد"
    return 0
}

# دالة الاستعادة الرئيسية
restore_system() {
    local backup_id=$1
    local restore_mode=$2
    
    print_info "بدء عملية الاستعادة..."
    print_info "النسخة الاحتياطية: $backup_id"
    print_info "وضع الاستعادة: $restore_mode"
    
    local backup_path="$BACKUP_DIR/$backup_id"
    
    # التحقق من النسخة الاحتياطية
    if ! validate_backup "$backup_id"; then
        print_error "فشل التحقق من النسخة الاحتياطية"
        return 1
    fi
    
    # تأكيد الاستعادة
    if [ "$AUTO_CONFIRM" != true ]; then
        echo ""
        print_warning "تحذير: هذه العملية ستؤدي إلى استبدال البيانات الحالية!"
        print_warning "النسخة الاحتياطية: $backup_id"
        read -p "هل تريد المتابعة؟ (نعم/لا): " confirm
        
        if [[ ! "$confirm" =~ ^(نعم|yes|y|Y)$ ]]; then
            print_info "تم إلغاء عملية الاستعادة"
            return 0
        fi
    fi
    
    # إنشاء مجلد السجلات إذا لم يكن موجوداً
    mkdir -p "$LOGS_DIR"
    
    # بدء تسجيل السجلات
    echo "===== سجل استعادة النظام =====" > "$RESTORE_LOG"
    echo "الوقت: $TIMESTAMP" >> "$RESTORE_LOG"
    echo "النسخة الاحتياطية: $backup_id" >> "$RESTORE_LOG"
    echo "وضع الاستعادة: $restore_mode" >> "$RESTORE_LOG"
    echo "" >> "$RESTORE_LOG"
    
    # تنفيذ الاستعادة بناءً على الوضع
    case $restore_mode in
        "database-only")
            restore_database "$backup_path"
            ;;
        "files-only")
            restore_uploads "$backup_path"
            ;;
        "config-only")
            restore_config "$backup_path"
            ;;
        "all"|*)
            restore_database "$backup_path"
            restore_uploads "$backup_path"
            restore_config "$backup_path"
            ;;
    esac
    
    # إعادة تشغيل الخدمات
    if [ "$DRY_RUN" != true ]; then
        print_info "إعادة تشغيل الخدمات..."
        
        # إعادة تشغيل Node.js باستخدام PM2
        if command -v pm2 &> /dev/null; then
            pm2 restart all >> "$RESTORE_LOG" 2>&1
            print_info "  ✓ تم إعادة تشغيل Node.js"
        fi
        
        # إعادة تحميل Nginx
        if command -v nginx &> /dev/null; then
            nginx -t && systemctl reload nginx >> "$RESTORE_LOG" 2>&1
            print_info "  ✓ تم إعادة تحميل Nginx"
        fi
        
        # إعادة تشغيل MongoDB
        systemctl restart mongod >> "$RESTORE_LOG" 2>&1
        print_info "  ✓ تم إعادة تشغيل MongoDB"
    fi
    
    print_success "تمت عملية الاستعادة بنجاح!"
    print_info "سجل الاستعادة: $RESTORE_LOG"
    
    # عرض ملخص الاستعادة
    echo ""
    echo "===== ملخص الاستعادة ====="
    echo "النسخة الاحتياطية: $backup_id"
    echo "الوضع: $restore_mode"
    echo "الوقت: $(date)"
    echo "السجل: $RESTORE_LOG"
    echo ""
    
    return 0
}

# ============================================
# التنفيذ الرئيسي
# ============================================

# تهيئة المتغيرات
BACKUP_ID=""
RESTORE_MODE="all"
AUTO_CONFIRM=false
DRY_RUN=false
MONGODB_URI="mongodb://localhost:27017/engineering_library"

# قراءة المعاملات
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -l|--list)
            list_backups
            exit 0
            ;;
        -b|--backup-id)
            BACKUP_ID="$2"
            shift 2
            ;;
        -d|--database-only)
            RESTORE_MODE="database-only"
            shift
            ;;
        -f|--files-only)
            RESTORE_MODE="files-only"
            shift
            ;;
        -c|--config-only)
            RESTORE_MODE="config-only"
            shift
            ;;
        -a|--all)
            RESTORE_MODE="all"
            shift
            ;;
        -y|--yes)
            AUTO_CONFIRM=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            print_error "معامل غير معروف: $1"
            show_help
            exit 1
            ;;
    esac
done

# التحقق من صلاحيات الجذر
check_root

# التحقق من وجود معرف النسخة الاحتياطية
if [ -z "$BACKUP_ID" ] && [ "$1" != "--list" ]; then
    print_error "يجب تحديد معرف النسخة الاحتياطية باستخدام --backup-id"
    echo ""
    show_help
    exit 1
fi

# تنفيذ عملية الاستعادة
if [ -n "$BACKUP_ID" ]; then
    restore_system "$BACKUP_ID" "$RESTORE_MODE"
    exit $?
fi

exit 0
