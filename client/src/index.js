import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';  // Імпортуємо GoogleOAuthProvider

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID_GOOGLE;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <GoogleOAuthProvider clientId={CLIENT_ID}>  {/* Потрібно помістити компонент App у GoogleOAuthProvider */}
      <App />
    </GoogleOAuthProvider>
  // </React.StrictMode>
);
