import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { arSD, enUS } from '@mui/material/locale';

// أنواع البيانات
interface ThemeContextType {
  mode: 'light' | 'dark';
  language: 'ar' | 'en';
  direction: 'rtl' | 'ltr';
  toggleTheme: () => void;
  toggleLanguage: () => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
  setLanguage: (lang: 'ar' | 'en') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

// الألوان الأساسية (الأزرق السماوي)
const primaryColors = {
  main: '#4A90E2',
  light: '#7BB4F0',
  dark: '#2C6BB7',
  contrastText: '#FFFFFF',
};

const secondaryColors = {
  main: '#00BCD4',
  light: '#5DDFF3',
  dark: '#008BA3',
  contrastText: '#FFFFFF',
};

// تخصيص التصميم الهندسي
const engineeringTheme = {
  typography: {
    fontFamily: {
      ar: '"Noto Sans Arabic", "Tajawal", sans-serif',
      en: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 2px 4px rgba(0,0,0,0.1)',
    '0 4px 8px rgba(0,0,0,0.12)',
    '0 8px 16px rgba(0,0,0,0.14)',
    '0 12px 24px rgba(0,0,0,0.16)',
    // ... المزيد من الظلال
  ] as any,
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode as 'light' | 'dark') || 'light';
  });

  const [language, setLanguage] = useState<'ar' | 'en'>(() => {
    const savedLang = localStorage.getItem('language');
    return (savedLang as 'ar' | 'en') || 'ar';
  });

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  // تحميل المظهر المحفوظ
  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
    
    // إضافة فئات CSS للاتجاه
    if (direction === 'rtl') {
      document.documentElement.classList.add('rtl');
      document.documentElement.classList.remove('ltr');
    } else {
      document.documentElement.classList.add('ltr');
      document.documentElement.classList.remove('rtl');
    }
  }, [direction, language]);

  // إنشاء التصميم بناء على الإعدادات
  const theme = createTheme({
    direction,
    palette: {
      mode,
      primary: mode === 'light' ? primaryColors : {
        ...primaryColors,
        light: '#2C6BB7',
        dark: '#1E4A8C',
      },
      secondary: mode === 'light' ? secondaryColors : {
        ...secondaryColors,
        light: '#008BA3',
        dark: '#006B7A',
      },
      background: {
        default: mode === 'light' ? '#F5F8FF' : '#121212',
        paper: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
      },
      text: {
        primary: mode === 'light' ? '#1A237E' : '#E0E0E0',
        secondary: mode === 'light' ? '#5C6BC0' : '#B0B0B0',
      },
      error: {
        main: '#F44336',
        light: '#E57373',
        dark: '#D32F2F',
      },
      success: {
        main: '#4CAF50',
        light: '#81C784',
        dark: '#388E3C',
      },
      warning: {
        main: '#FF9800',
        light: '#FFB74D',
        dark: '#F57C00',
      },
      info: {
        main: '#2196F3',
        light: '#64B5F6',
        dark: '#1976D2',
      },
    },
    typography: {

      ...engineeringTheme.typography,

      fontFamily: (language === 'ar' 
        ? engineeringTheme.typography.fontFamily.ar
        : engineeringTheme.typography.fontFamily.en) as any,
    },
    shape: engineeringTheme.shape,
    shadows: engineeringTheme.shadows,
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: engineeringTheme.shape.borderRadius,
            fontWeight: 500,
            textTransform: 'none' as const,
            padding: '8px 24px',
          },
          contained: {
            boxShadow: engineeringTheme.shadows[2],
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: engineeringTheme.shape.borderRadius * 2,
            boxShadow: engineeringTheme.shadows[2],
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? primaryColors.main : '#1E1E1E',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  }, language === 'ar' ? arSD : enUS);

  // تبديل المظهر
  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  // تبديل اللغة
  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  // تعيين المظهر يدوياً
  const setThemeMode = (newMode: 'light' | 'dark') => {
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  // تعيين اللغة يدوياً
  const setLanguageHandler = (lang: 'ar' | 'en') => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const value: ThemeContextType = {
    mode,
    language,
    direction,
    toggleTheme,
    toggleLanguage,
    setThemeMode,
    setLanguage: setLanguageHandler,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MUIThemeProvider theme={theme}>
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};
