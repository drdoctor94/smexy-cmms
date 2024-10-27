import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import AuthProvider from './context/AuthContext';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline'; 
import theme from './theme'; // Import the custom dark theme

ReactDOM.render(
  <AuthProvider>
    <ThemeProvider theme={theme}> {/* Wrap app in custom theme */}
      <CssBaseline /> {/* Normalize CSS across browsers */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </AuthProvider>,
  document.getElementById('root')
);
