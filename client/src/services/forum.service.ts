import { http } from './api';

// أنواع البيانات
export interface ForumCategory {
  _id: string;
  name: string;
  description: string;
  courseId: string;
  courseName: string;
  isActive: boolean;
  messageCount: number;
  lastMessage?: ForumMessage;
  createdAt: Date;
}

export interface ForumMessage {
  _id: string;
  forumId: string;
  userId: string;
  userName: string;
  userRole: string;
  userAvatar?: string;
  content: string;
  images?: string[];
  isEdited: boolean;
  isPinned: boolean;
  likes: string[]; // array of user IDs
  replies: ForumReply[];
  replyTo?: string; // للردود على رسائل أخرى
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumReply {
  _id: string;
  messageId: string;
  userId: string;
  userName: string;
  userRole: string;
  content: string;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateForumRequest {
  courseId: string;
  name: string;
  description: string;
}

export interface CreateMessageRequest {
  content: string;
  images?: File[];
  replyTo?: string;
}

export interface CreateReplyRequest {
  content: string;
}

export interface UpdateMessageRequest {
  content?: string;
  images?: string[];
}

// خدمة المنتدى
export const forumService = {
  // الحصول على جميع منتديات المادة
  async getCourseForums(courseId: string): Promise<ForumCategory[]> {
    return http.get<ForumCategory[]>(`/forum/course/${courseId}`);
  },

  // الحصول على منتدى معين
  async getForumById(forumId: string): Promise<ForumCategory> {
    return http.get<ForumCategory>(`/forum/${forumId}`);
  },

  // إنشاء منتدى جديد (للأساتذة والإدارة)
  async createForum(data: CreateForumRequest): Promise<{ message: string; forum: ForumCategory }> {
    return http.post('/forum', data);
  },

  // تحديث منتدى (للمالك والإدارة)
  async updateForum(forumId: string, data: { name?: string; description?: string; isActive?: boolean }): Promise<{ message: string; forum: ForumCategory }> {
    return http.put(`/forum/${forumId}`, data);
  },

  // حذف منتدى (للمالك والإدارة فقط)
  async deleteForum(forumId: string): Promise<{ message: string }> {
    return http.delete(`/forum/${forumId}`);
  },

  // الحصول على رسائل المنتدى
  async getForumMessages(
    forumId: string, 
    page = 1, 
    limit = 50,
    sortBy = 'newest'
  ): Promise<{ messages: ForumMessage[]; total: number; page: number; pages: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
    });

    return http.get(`/forum/${forumId}/messages?${params.toString()}`);
  },

  // إرسال رسالة جديدة
  async createMessage(forumId: string, data: CreateMessageRequest): Promise<{ message: string; forumMessage: ForumMessage }> {
    const formData = new FormData();
    formData.append('content', data.content);
    
    if (data.replyTo) {
      formData.append('replyTo', data.replyTo);
    }
    
    if (data.images && data.images.length > 0) {
      data.images.forEach((image, index) => {
        formData.append(`images`, image);
      });
    }

    return http.post(`/forum/${forumId}/messages`, formData);
  },

  // تحديث رسالة
  async updateMessage(
    messageId: string, 
    data: UpdateMessageRequest
  ): Promise<{ message: string; forumMessage: ForumMessage }> {
    return http.put(`/forum/messages/${messageId}`, data);
  },

  // حذف رسالة (للكاتب أو الإدارة)
  async deleteMessage(messageId: string): Promise<{ message: string }> {
    return http.delete(`/forum/messages/${messageId}`);
  },

  // إضافة رد على رسالة
  async createReply(messageId: string, content: string): Promise<{ message: string; reply: ForumReply }> {
    return http.post(`/forum/messages/${messageId}/replies`, { content });
  },

  // تحديث رد
  async updateReply(replyId: string, content: string): Promise<{ message: string; reply: ForumReply }> {
    return http.put(`/forum/replies/${replyId}`, { content });
  },

  // حذف رد
  async deleteReply(replyId: string): Promise<{ message: string }> {
    return http.delete(`/forum/replies/${replyId}`);
  },

  // الإعجاب بالرسالة
  async likeMessage(messageId: string): Promise<{ message: string; likes: string[] }> {
    return http.post(`/forum/messages/${messageId}/like`);
  },

  // إلغاء الإعجاب
  async unlikeMessage(messageId: string): Promise<{ message: string; likes: string[] }> {
    return http.delete(`/forum/messages/${messageId}/like`);
  },

  // تثبيت رسالة (للأساتذة والإدارة)
  async pinMessage(messageId: string, pinned: boolean): Promise<{ message: string }> {
    return http.put(`/forum/messages/${messageId}/pin`, { pinned });
  },

  // البحث في الرسائل
  async searchMessages(forumId: string, query: string): Promise<ForumMessage[]> {
    return http.get(`/forum/${forumId}/search?q=${encodeURIComponent(query)}`);
  },

  // الحصول على أحدث الرسائل
  async getLatestMessages(limit = 20): Promise<ForumMessage[]> {
    return http.get(`/forum/messages/latest?limit=${limit}`);
  },

  // الحصول على رسائل المستخدم
  async getUserMessages(userId: string): Promise<ForumMessage[]> {
    return http.get(`/forum/user/${userId}/messages`);
  },

  // الحصول على إحصائيات المنتدى
  async getForumStats(): Promise<{
    totalForums: number;
    totalMessages: number;
    totalReplies: number;
    activeForums: number;
    popularForums: ForumCategory[];
    recentActivity: ForumMessage[];
  }> {
    return http.get('/forum/stats');
  },

  // الحصول على الإشعارات (المنشورات الجديدة)
  async getNotifications(userId: string): Promise<{
    unreadMessages: number;
    mentions: ForumMessage[];
    replies: ForumReply[];
  }> {
    return http.get(`/forum/notifications/${userId}`);
  },

  // تحديد الرسائل كمقروءة
  async markAsRead(messageIds: string[]): Promise<{ message: string }> {
    return http.post('/forum/mark-read', { messageIds });
  },

  // الاشتراك في منتدى
  async subscribeToForum(forumId: string): Promise<{ message: string }> {
    return http.post(`/forum/${forumId}/subscribe`);
  },

  // إلغاء الاشتراك
  async unsubscribeFromForum(forumId: string): Promise<{ message: string }> {
    return http.delete(`/forum/${forumId}/subscribe`);
  },

  // الحصول على المشتركين
  async getForumSubscribers(forumId: string): Promise<string[]> {
    return http.get(`/forum/${forumId}/subscribers`);
  },

  // الحصول على الإعدادات
  async getForumSettings(): Promise<{
    allowGuestView: boolean;
    allowGuestPost: boolean;
    maxMessageLength: number;
    maxImagesPerMessage: number;
    moderationEnabled: boolean;
  }> {
    return http.get('/forum/settings');
  },

  // تحديث الإعدادات (للإدارة)
  async updateForumSettings(settings: {
    allowGuestView?: boolean;
    allowGuestPost?: boolean;
    maxMessageLength?: number;
    maxImagesPerMessage?: number;
    moderationEnabled?: boolean;
  }): Promise<{ message: string }> {
    return http.put('/forum/settings', settings);
  },

  // إدارة الرسائل (للإدارة)
  async moderateMessage(messageId: string, action: 'approve' | 'reject' | 'hide'): Promise<{ message: string }> {
    return http.put(`/forum/moderate/${messageId}`, { action });
  },

  // تصدير محادثات المنتدى
  async exportForumMessages(forumId: string, format: 'json' | 'csv' = 'json'): Promise<void> {
    return http.download(`/forum/${forumId}/export?format=${format}`, `forum-${forumId}-export.${format}`);
  },

  // تنظيف الرسائل القديمة
  async cleanupOldMessages(days: number = 365): Promise<{ message: string; deletedCount: number }> {
    return http.post('/forum/cleanup', { days });
  },
};

export default forumService;
