import React from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
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
  </React.StrictMode>
);
