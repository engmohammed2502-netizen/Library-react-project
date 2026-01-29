import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  type?: 'page' | 'button' | 'card' | 'inline';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  type = 'page', 
  text = 'جاري التحميل...' 
}) => {
  const styles = {
    page: {
      container: { 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      },
      spinner: { color: '#1a237e' },
      size: 60
    },
    button: {
      container: { 
        display: 'inline-flex', 
        alignItems: 'center',
        gap: 1
      },
      spinner: { color: 'white' },
      size: 20
    },
    card: {
      container: { 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        py: 8
      },
      spinner: { color: '#1a237e' },
      size: 40
    },
    inline: {
      container: { 
        display: 'inline-flex', 
        alignItems: 'center',
        gap: 1
      },
      spinner: { color: '#1a237e' },
      size: 16
    }
  };

  const style = styles[type];

  return (
    <Box sx={style.container}>
      <CircularProgress 
        size={style.size} 
        sx={style.spinner}
        thickness={type === 'page' ? 4 : 3}
      />
      {text && type !== 'button' && type !== 'inline' && (
        <Typography 
          variant="body1" 
          sx={{ 
            mt: 2, 
            color: type === 'page' ? '#666' : 'inherit'
          }}
        >
          {text}
        </Typography>
      )}
      {text && (type === 'button' || type === 'inline') && (
        <Typography variant="body2">
          {text}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner;
