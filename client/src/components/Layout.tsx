import React, { ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {isAuthenticated && <Navbar />}
      <Container 
        component="main" 
        maxWidth="xl" 
        sx={{ 
          flexGrow: 1,
          py: isAuthenticated ? 4 : 0,
          mt: isAuthenticated ? 8 : 0
        }}
      >
        {children}
      </Container>
      {isAuthenticated && <Footer />}
    </Box>
  );
};

export default Layout;
