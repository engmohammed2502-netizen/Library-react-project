import { http } from './api';

// أنواع البيانات
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileMetadata {
  filename: string;
  originalname: string;
  size: number;
  mimetype: string;
  path: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  file?: {
    _id: string;
    filename: string;
    originalname: string;
    path: string;
    size: number;
    mimetype: string;
    uploadedBy: string;
    createdAt: Date;
  };
  error?: string;
}

// أنواع الملفات المسموحة
export const ALLOWED_FILE_TYPES = {
  documents: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt'],
  images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'],
  archives: ['.zip', '.rar', '.7z'],
  executables: ['.exe'],
  videos: ['.mp4', '.avi', '.mov', '.wmv'],
};

// الحد الأقصى لحجم الملف (150 ميجابايت)
export const MAX_FILE_SIZE = 150 * 1024 * 1024; // 150MB

// الحد الأقصى لصور المنتدى (3 ميجابايت)
export const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3MB

// خدمة الملفات
export const filesService = {
  // التحقق من نوع الملف
  validateFileType(file: File, allowedTypes: string[]): boolean {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    return allowedTypes.includes(extension || '');
  },

  // التحقق من حجم الملف
  validateFileSize(file: File, maxSize: number): boolean {
    return file.size <= maxSize;
  },

  // تنسيق حجم الملف
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // استخراج امتداد الملف
  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  },

  // الحصول على أيقونة الملف بناءً على النوع
  getFileIcon(filename: string): string {
    const ext = this.getFileExtension(filename);
    
    const icons: Record<string, string> = {
      // مستندات
      'pdf': '📕',
      'doc': '📘',
      'docx': '📘',
      'ppt': '📊',
      'pptx': '📊',
      'xls': '📈',
      'xlsx': '📈',
      'txt': '📄',
      
      // صور
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'png': '🖼️',
      'gif': '🖼️',
      'bmp': '🖼️',
      'svg': '🖼️',
      
      // أرشيفات
      'zip': '📦',
      'rar': '📦',
      '7z': '📦',
      
      // تنفيذية
      'exe': '⚙️',
      
      // فيديوهات
      'mp4': '🎬',
      'avi': '🎬',
      'mov': '🎬',
      'wmv': '🎬',
      
      // افتراضي
      'default': '📎',
    };

    return icons[ext] || icons.default;
  },

  // رفع ملف عام
  async uploadFile(
    file: File, 
    endpoint: string, 
    additionalData?: Record<string, string>,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    try {
      const response = await http.post<UploadResponse>(
        endpoint, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress(progress);
            }
          },
        }
      );
      
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'فشل رفع الملف',
        error: error.message,
      };
    }
  },

  // رفع ملف لمادة دراسية
  async uploadCourseFile(
    courseId: string, 
    file: File, 
    type: string, 
    category: string,
    description?: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    const additionalData: Record<string, string> = {
      type,
      category,
    };
    
    if (description) {
      additionalData.description = description;
    }

    return this.uploadFile(
      file, 
      `/courses/${courseId}/upload`,
      additionalData,
      onProgress
    );
  },

  // رفع صورة للمنتدى
  async uploadForumImage(
    forumId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    // التحقق من أن الملف صورة
    if (!this.validateFileType(file, ALLOWED_FILE_TYPES.images)) {
      return {
        success: false,
        message: 'نوع الملف غير مسموح. يُسمح بالصور فقط (JPG, PNG, GIF, BMP, SVG)',
      };
    }

    // التحقق من حجم الصورة
    if (!this.validateFileSize(file, MAX_IMAGE_SIZE)) {
      return {
        success: false,
        message: `حجم الصورة كبير جداً. الحد الأقصى ${this.formatFileSize(MAX_IMAGE_SIZE)}`,
      };
    }

    return this.uploadFile(
      file,
      `/forum/${forumId}/upload-image`,
      {},
      onProgress
    );
  },

  // تحميل ملف
  async downloadFile(fileId: string, filename?: string): Promise<void> {
    return http.download(`/files/download/${fileId}`, filename);
  },

  // حذف ملف
  async deleteFile(fileId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await http.delete<{ message: string }>(`/files/${fileId}`);
      return {
        success: true,
        message: response.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'فشل حذف الملف',
      };
    }
  },

  // الحصول على معلومات الملف
  async getFileInfo(fileId: string): Promise<any> {
    return http.get(`/files/${fileId}/info`);
  },

  // تحديث معلومات الملف
  async updateFileInfo(
    fileId: string, 
    updates: { 
      type?: string; 
      category?: string; 
      description?: string 
    }
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await http.put<{ message: string }>(`/files/${fileId}`, updates);
      return {
        success: true,
        message: response.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'فشل تحديث الملف',
      };
    }
  },

  // الحصول على الملفات المرفوعة حديثاً
  async getRecentFiles(limit = 20): Promise<any[]> {
    return http.get(`/files/recent?limit=${limit}`);
  },

  // البحث في الملفات
  async searchFiles(query: string, filters?: Record<string, any>): Promise<any[]> {
    const params = new URLSearchParams({ q: query });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        params.append(key, value.toString());
      });
    }

    return http.get(`/files/search?${params.toString()}`);
  },

  // الحصول على إحصائيات الملفات
  async getFilesStats(): Promise<{
    totalFiles: number;
    totalSize: string;
    byType: Record<string, number>;
    byDepartment: Record<string, number>;
    popularFiles: any[];
  }> {
    return http.get('/files/stats');
  },

  // تصدير قائمة الملفات
  async exportFiles(format: 'csv' | 'excel' = 'csv'): Promise<void> {
    return http.download(`/files/export?format=${format}`, `files-export.${format}`);
  },

  // معاينة الملف (للمستندات)
  async previewFile(fileId: string): Promise<string> {
    const response = await http.get(`/files/preview/${fileId}`, {
      responseType: 'blob',
    });
    
    const blob = new Blob([response]);
    return URL.createObjectURL(blob);
  },

  // تنزيل عدة ملفات كأرشيف
  async downloadMultipleFiles(fileIds: string[], filename = 'files.zip'): Promise<void> {
    return http.download(`/files/download-multiple?ids=${fileIds.join(',')}`, filename);
  },

  // تنظيف الملفات المؤقتة
  async cleanupTempFiles(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await http.post<{ message: string }>('/files/cleanup');
      return {
        success: true,
        message: response.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'فشل تنظيف الملفات',
      };
    }
  },
};

export default filesService;
