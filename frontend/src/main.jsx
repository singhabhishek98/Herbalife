import React from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import './styles.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

function AppProviders({ children }) {
  if (!googleClientId) {
    return children;
  }

  return <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>;
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProviders>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#08a045',
            borderRadius: 16,
            fontFamily: 'Inter, system-ui, Arial, sans-serif'
          },
          components: {
            Button: { controlHeight: 42 },
            Input: { controlHeight: 42 },
            Select: { controlHeight: 42 }
          }
        }}
      >
        <App />
      </ConfigProvider>
    </AppProviders>
  </React.StrictMode>
);
