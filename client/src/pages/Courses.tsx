import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  TextField,
  MenuItem,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  School as CourseIcon,
  Download as DownloadIcon,
  Description as FileIcon,
  Person as ProfessorIcon,
  Update as UpdateIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';

const CoursesPage = () => {
  const [searchParams] = useSearchParams();
  const department = searchParams.get('department');
  const semester = searchParams.get('semester');
  
  const [courses, setCourses] = useState([
    {
      id: 1,
      name: 'رياضيات هندسية 1',
      code: 'MATH101',
      professor: 'د. أحمد محمد',
      files: [
        { id: 1, name: 'محاضرة 1 - المقدمة', type: 'lecture', size: '2.4 MB', downloads: 45 },
        { id: 2, name: 'تمارين الفصل الأول', type: 'exercises', size: '1.2 MB', downloads: 38 },
        { id: 3, name: 'امتحان سابق 2023', type: 'exams', size: '3.1 MB', downloads: 67 }
      ],
      lastUpdate: '2024-01-10',
      downloads: 150
    },
    {
      id: 2,
      name: 'فيزياء عامة',
      code: 'PHYS101',
      professor: 'د. سعاد علي',
      files: [
        { id: 4, name: 'محاضرة 1 - الميكانيكا', type: 'lecture', size: '3.2 MB', downloads: 52 },
        { id: 5, name: 'كتاب المراجع', type: 'reference', size: '15.4 MB', downloads: 28 }
      ],
      lastUpdate: '2024-01-08',
      downloads: 80
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [expandedCourse, setExpandedCourse] = useState<number | false>(false);

  const handleAccordionChange = (courseId: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedCourse(isExpanded ? courseId : false);
  };

  const handleDownload = (fileId: number, fileName: string) => {
    alert(`جاري تحميل: ${fileName}`);
    // API call هنا سيكون 
  };

  const getFileTypeIcon = (type: string) => {
    switch(type) {
      case 'lecture': return '📖';
      case 'reference': return '📚';
      case 'exercises': return '📝';
      case 'exams': return '📄';
      default: return '📎';
    }
  };

  const getFileTypeColor = (type: string) => {
    switch(type) {
      case 'lecture': return 'primary';
      case 'reference': return 'secondary';
      case 'exercises': return 'success';
      case 'exams': return 'error';
      default: return 'default';
    }
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.professor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* العنوان */}
      <Typography variant="h3" gutterBottom>
        📚 المواد الدراسية
      </Typography>
      <Typography variant="h6" color="textSecondary" sx={{ mb: 4 }}>
        السمستر {semester} - {department === 'electrical' ? 'الهندسة الكهربائية' : 'التخصص'}
      </Typography>

      {/* البحث والتصفية */}
      <Card sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="ابحث في المواد أو الأساتذة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: '#666' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="نوع الملف"
              value={fileTypeFilter}
              onChange={(e) => setFileTypeFilter(e.target.value)}
              InputProps={{
                startAdornment: <FilterIcon sx={{ mr: 1, color: '#666' }} />
              }}
            >
              <MenuItem value="all">جميع الأنواع</MenuItem>
              <MenuItem value="lecture">محاضرات</MenuItem>
              <MenuItem value="reference">مراجع</MenuItem>
              <MenuItem value="exercises">تمارين</MenuItem>
              <MenuItem value="exams">امتحانات</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <Chip 
              label={`${courses.length} مادة`}
              color="primary"
              variant="outlined"
              sx={{ width: '100%', py: 2 }}
            />
          </Grid>
        </Grid>
      </Card>

      {/* قائمة المواد */}
      {filteredCourses.map((course) => (
        <Accordion 
          key={course.id}
          expanded={expandedCourse === course.id}
          onChange={handleAccordionChange(course.id)}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
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
                <CourseIcon />
              </Box>
              
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6">{course.name}</Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                  <Chip label={course.code} size="small" variant="outlined" />
                  <Typography variant="body2" color="textSecondary">
                    <ProfessorIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    {course.professor}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <UpdateIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    {course.lastUpdate}
                  </Typography>
                </Box>
              </Box>
              
              <Chip 
                label={`${course.files.length} ملف`}
                color="primary"
                size="small"
              />
            </Box>
          </AccordionSummary>
          
          <AccordionDetails>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              📁 الملفات المتاحة ({course.files.length})
            </Typography>
            
            <List>
              {course.files.map((file) => (
                <ListItem 
                  key={file.id}
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      aria-label="download"
                      onClick={() => handleDownload(file.id, file.name)}
                    >
                      <DownloadIcon />
                    </IconButton>
                  }
                  sx={{ 
                    borderBottom: '1px solid #f0f0f0',
                    '&:hover': { backgroundColor: '#f9f9f9' }
                  }}
                >
                  <ListItemIcon>
                    <Box sx={{ fontSize: '1.5rem' }}>
                      {getFileTypeIcon(file.type)}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 0.5 }}>
                        <Chip 
                          label={file.type === 'lecture' ? 'محاضرة' : 
                                 file.type === 'reference' ? 'مرجع' :
                                 file.type === 'exercises' ? 'تمارين' : 'امتحان'}
                          size="small"
                          color={getFileTypeColor(file.type) as any}
                        />
                        <Typography variant="caption" color="textSecondary">
                          {file.size}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ⬇️ {file.downloads} تنزيل
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
              <Typography variant="caption" color="textSecondary">
                إجمالي التنزيلات: {course.downloads}
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => alert('سيتم تحميل جميع ملفات المادة')}
              >
                تنزيل الكل
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      {filteredCourses.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="textSecondary">
            لا توجد مواد تطابق البحث
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default CoursesPage;
