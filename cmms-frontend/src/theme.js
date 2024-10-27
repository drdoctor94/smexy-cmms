// src/theme.js
import { createTheme } from '@mui/material/styles';
import '@fontsource/poppins'; // Import Poppins font

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff4081',  // Pink color for primary elements
      contrastText: '#ffffff', // Ensure good contrast against dark background
    },
    secondary: {
      main: '#f50057',  // A darker shade of pink for secondary elements
      contrastText: '#ffffff',
    },
    background: {
      default: '#121212',  // Very dark background for dark mode
      paper: '#1d1d1d',  // Slightly lighter for cards and paper components
    },
    text: {
      primary: '#ffffff',  // Ensure text stands out on dark backgrounds
      secondary: '#e0e0e0',  // Slightly lighter for less prominent text
    },
    error: {
      main: '#f44336',  // Red for errors
    },
    warning: {
      main: '#ff9800',  // Orange for warnings
    },
    info: {
      main: '#2196f3',  // Blue for informational messages
    },
    success: {
      main: '#4caf50',  // Green for success messages
    },
  },
  typography: {
    fontFamily: 'Poppins, sans-serif', // Set Poppins as the default font
    h1: {
      fontSize: '2.4rem',
      fontWeight: 500,
      color: '#ffffff',  // White for headers
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      color: '#ffffff',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      color: '#ffffff',
    },
    body1: {
      fontSize: '1rem',
      color: '#e0e0e0',
    },
    body2: {
      fontSize: '0.875rem',
      color: '#bdbdbd',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: '#ff4081',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#f50057',  // Slightly darker pink on hover
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#1d1d1d',  // Dark background for the AppBar
        },
      },
    },
  },
});

export default theme;
