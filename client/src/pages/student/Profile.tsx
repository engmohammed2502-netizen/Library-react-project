import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  Card,
  CardContent,
  Chip,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

const StudentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'محمد أحمد',
    studentId: '20231001',
    department: 'الهندسة الكهربائية',
    semester: 'الثالث',
    email: '20231001@student.rsu.edu',
    phone: '+249 123 456 789',
    joinDate: 'أكتوبر 2023',
    coursesEnrolled: 5,
    filesDownloaded: 23,
    forumPosts: 7
  });

  const [tempProfile, setTempProfile] = useState({ ...profile });

  const handleEdit = () => {
    setTempProfile({ ...profile });
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfile({ ...tempProfile });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleChange = (field: string, value: string) => {
    setTempProfile({ ...tempProfile, [field]: value });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        👤 الملف الشخصي
      </Typography>

      <Grid container spacing={3}>
        {/* معلومات الطالب */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                mx: 'auto',
                mb: 2,
                bgcolor: 'primary.main',
                fontSize: '3rem'
              }}
            >
              {profile.name.charAt(0)}
            </Avatar>
            
            <Typography variant="h5" gutterBottom>
              {isEditing ? (
                <TextField
                  fullWidth
                  value={tempProfile.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  sx={{ mb: 2 }}
                />
              ) : (
                profile.name
              )}
            </Typography>
            
            <Chip 
              label={`الرقم الجامعي: ${profile.studentId}`}
              color="primary"
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 3 }}>
              {isEditing ? (
                <>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                  >
                    حفظ
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                  >
                    إلغاء
                  </Button>
                </>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                >
                  تعديل البيانات
                </Button>
              )}
            </Box>
          </Paper>

          {/* الإحصائيات */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              📊 إحصائياتك
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card sx={{ bgcolor: '#e3f2fd' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5">{profile.coursesEnrolled}</Typography>
                    <Typography variant="body2">مادة مسجل بها</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ bgcolor: '#e8f5e9' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5">{profile.filesDownloaded}</Typography>
                    <Typography variant="body2">ملف منزلة</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ bgcolor: '#fff3e0' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5">{profile.forumPosts}</Typography>
                    <Typography variant="body2">مشاركة في المنتدى</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ bgcolor: '#f3e5f5' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5">85%</Typography>
                    <Typography variant="body2">المعدل التراكمي</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* التفاصيل */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              معلومات الطالب
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SchoolIcon sx={{ mr: 2, color: '#666' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      التخصص
                    </Typography>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        value={tempProfile.department}
                        onChange={(e) => handleChange('department', e.target.value)}
                      />
                    ) : (
                      <Typography variant="body1">{profile.department}</Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SchoolIcon sx={{ mr: 2, color: '#666' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      السمستر
                    </Typography>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        value={tempProfile.semester}
                        onChange={(e) => handleChange('semester', e.target.value)}
                      />
                    ) : (
                      <Typography variant="body1">السمستر {profile.semester}</Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmailIcon sx={{ mr: 2, color: '#666' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      البريد الإلكتروني
                    </Typography>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        value={tempProfile.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                      />
                    ) : (
                      <Typography variant="body1">{profile.email}</Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PhoneIcon sx={{ mr: 2, color: '#666' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      رقم الهاتف
                    </Typography>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        value={tempProfile.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                      />
                    ) : (
                      <Typography variant="body1">{profile.phone}</Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarIcon sx={{ mr: 2, color: '#666' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      تاريخ الانضمام
                    </Typography>
                    <Typography variant="body1">{profile.joinDate}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* المواد المسجل بها */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                📚 المواد المسجل بها
              </Typography>
              <Grid container spacing={2}>
                {['رياضيات هندسية 1', 'فيزياء عامة', 'كيمياء عامة', 'برمجة 1', 'لغة إنجليزية'].map((course, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card variant="outlined">
                      <CardContent sx={{ py: 2 }}>
                        <Typography variant="body1">{course}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          السمستر الثالث
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* تغيير كلمة المرور */}
            <Box sx={{ mt: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                🔐 تغيير كلمة المرور
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="password"
                    label="كلمة المرور الحالية"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="password"
                    label="كلمة المرور الجديدة"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="password"
                    label="تأكيد كلمة المرور"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained">
                    تحديث كلمة المرور
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StudentProfile;
