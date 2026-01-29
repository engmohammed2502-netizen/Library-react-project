import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  School as SchoolIcon,
  Book as BookIcon,
  People as PeopleIcon,
  Upload as UploadIcon,
  TrendingUp as TrendingIcon,
  Notifications as NotificationsIcon,
  Forum as ForumIcon,
  Download as DownloadIcon,
  Add as AddIcon
} from '@mui/icons-material';

const ProfessorDashboard = () => {
  const [stats, setStats] = useState({
    coursesTeaching: 3,
    totalStudents: 85,
    uploadedFiles: 42,
    forumAnswers: 19
  });

  const [recentUploads, setRecentUploads] = useState([
    { id: 1, course: 'رياضيات هندسية 1', file: 'محاضرة 5', type: 'محاضرة', time: 'منذ ساعتين', downloads: 45 },
    { id: 2, course: 'رياضيات هندسية 1', file: 'تمارين الفصل 2', type: 'تمارين', time: 'منذ يوم', downloads: 38 },
    { id: 3, course: 'فيزياء عامة', file: 'امتحان سابق', type: 'امتحان', time: 'منذ يومين', downloads: 67 }
  ]);

  const [studentQuestions, setStudentQuestions] = useState([
    { id: 1, student: 'محمد أحمد', course: 'رياضيات هندسية 1', question: 'شرح النقطة الثالثة', time: 'منذ ساعة' },
    { id: 2, student: 'سارة محمد', course: 'فيزياء عامة', question: 'سؤال في التمارين', time: 'منذ 3 ساعات' },
    { id: 3, student: 'عمر خالد', course: 'رياضيات هندسية 1', question: 'توضيح مثال', time: 'منذ يوم' }
  ]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* الترحيب */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: '#fff3e0' }}>
        <Typography variant="h4" gutterBottom>
          👨‍🏫 مرحباً، د. أحمد محمد
        </Typography>
        <Typography variant="body1" color="textSecondary">
          لوحة تحكم الأستاذ - نظرة عامة على نشاطك التدريسي
        </Typography>
      </Paper>

      {/* الإحصائيات */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#e3f2fd',
                  color: '#1976d2',
                  mr: 2
                }}>
                  <BookIcon />
                </Box>
                <Box>
                  <Typography variant="h4">{stats.coursesTeaching}</Typography>
                  <Typography variant="body2" color="textSecondary">مادة تدرسها</Typography>
                </Box>
              </Box>
              <Button size="small" fullWidth variant="outlined" startIcon={<AddIcon />}>
                إضافة مادة
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#e8f5e9',
                  color: '#4caf50',
                  mr: 2
                }}>
                  <PeopleIcon />
                </Box>
                <Box>
                  <Typography variant="h4">{stats.totalStudents}</Typography>
                  <Typography variant="body2" color="textSecondary">طالب</Typography>
                </Box>
              </Box>
              <Button size="small" fullWidth variant="outlined">
                إدارة الطلاب
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#fff3e0',
                  color: '#ff9800',
                  mr: 2
                }}>
                  <UploadIcon />
                </Box>
                <Box>
                  <Typography variant="h4">{stats.uploadedFiles}</Typography>
                  <Typography variant="body2" color="textSecondary">ملف مرفوع</Typography>
                </Box>
              </Box>
              <Button size="small" fullWidth variant="outlined">
                رفع ملف جديد
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#f3e5f5',
                  color: '#9c27b0',
                  mr: 2
                }}>
                  <ForumIcon />
                </Box>
                <Box>
                  <Typography variant="h4">{stats.forumAnswers}</Typography>
                  <Typography variant="body2" color="textSecondary">إجابة في المنتدى</Typography>
                </Box>
              </Box>
              <Button size="small" fullWidth variant="outlined">
                الرد على الأسئلة
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* الأسئلة الجديدة */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <NotificationsIcon sx={{ mr: 1 }} />
                الأسئلة الجديدة من الطلاب
              </Typography>
              <Chip label={studentQuestions.length} color="primary" />
            </Box>
            <List>
              {studentQuestions.map((question) => (
                <ListItem 
                  key={question.id}
                  sx={{ 
                    borderBottom: '1px solid #f0f0f0',
                    '&:hover': { backgroundColor: '#f9f9f9' }
                  }}
                  secondaryAction={
                    <Button size="small" variant="outlined">
                      الرد
                    </Button>
                  }
                >
                  <ListItemIcon>
                    <PeopleIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={question.question}
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          {question.student} - {question.course}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ mr: 2 }}>
                          • {question.time}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Button fullWidth variant="text" sx={{ mt: 2 }}>
              عرض كل الأسئلة
            </Button>
          </Paper>
        </Grid>

        {/* آخر الملفات المرفوعة */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <UploadIcon sx={{ mr: 1 }} />
              آخر الملفات المرفوعة
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>المادة</TableCell>
                    <TableCell>الملف</TableCell>
                    <TableCell>النوع</TableCell>
                    <TableCell align="center">التنزيلات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentUploads.map((upload) => (
                    <TableRow key={upload.id} hover>
                      <TableCell>{upload.course}</TableCell>
                      <TableCell>{upload.file}</TableCell>
                      <TableCell>
                        <Chip 
                          label={upload.type}
                          size="small"
                          color={upload.type === 'محاضرة' ? 'primary' : 
                                 upload.type === 'تمارين' ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <DownloadIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {upload.downloads}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button 
              fullWidth 
              variant="contained" 
              startIcon={<UploadIcon />}
              sx={{ mt: 2 }}
            >
              رفع ملف جديد
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* الإجراءات السريعة */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          🚀 الإجراءات السريعة
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4} md={2}>
            <Button fullWidth variant="outlined" startIcon={<BookIcon />}>
              موادك
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button fullWidth variant="outlined" startIcon={<UploadIcon />}>
              رفع ملف
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button fullWidth variant="outlined" startIcon={<PeopleIcon />}>
              طلابك
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button fullWidth variant="outlined" startIcon={<ForumIcon />}>
              المنتدى
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button fullWidth variant="outlined" startIcon={<AddIcon />}>
              مادة جديدة
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button fullWidth variant="outlined">
              التقارير
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ProfessorDashboard;
