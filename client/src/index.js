import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';  // Импортируем GoogleOAuthProvider

const CLIENT_ID = '288840059247-56r332s5l963dotrg6a1h382k3hbk8g3.apps.googleusercontent.com'; // Замените на ваш Google Client ID

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={CLIENT_ID}>  {/* Оборачиваем компонент App в GoogleOAuthProvider */}
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
