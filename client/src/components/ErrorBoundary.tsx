import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // إرسال الخطأ لخدمة المراقبة (في الإنتاج)
    if (process.env.NODE_ENV === 'production') {
      // يمكن إضافة خدمة مثل Sentry هنا
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          p: 3,
          backgroundColor: '#f5f5f5'
        }}>
          <Paper sx={{
            p: 4,
            maxWidth: 600,
            textAlign: 'center',
            borderRadius: 2
          }}>
            <ErrorIcon sx={{ fontSize: 60, color: '#f44336', mb: 2 }} />
            
            <Typography variant="h4" gutterBottom color="error">
              حدث خطأ غير متوقع
            </Typography>
            
            <Typography variant="body1" paragraph sx={{ mb: 3 }}>
              عذراً، حدث خطأ في التطبيق. يرجى المحاولة مرة أخرى.
            </Typography>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Paper sx={{ 
                p: 2, 
                mb: 3, 
                textAlign: 'left',
                backgroundColor: '#fff5f5',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                overflow: 'auto',
                maxHeight: 200
              }}>
                <Typography variant="subtitle2" gutterBottom>
                  تفاصيل الخطأ:
                </Typography>
                <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                  {this.state.error.toString()}
                </Typography>
                {this.state.errorInfo && (
                  <>
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                      مكان الخطأ:
                    </Typography>
                    <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                      {this.state.errorInfo.componentStack}
                    </Typography>
                  </>
                )}
              </Paper>
            )}
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={this.handleReset}
              >
                إعادة تحميل الصفحة
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => window.history.back()}
              >
                الرجوع للخلف
              </Button>
              
              <Button
                variant="text"
                onClick={() => window.location.href = '/'}
              >
                الصفحة الرئيسية
              </Button>
            </Box>
            
            <Typography variant="caption" sx={{ display: 'block', mt: 3, color: '#666' }}>
              إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني
            </Typography>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
