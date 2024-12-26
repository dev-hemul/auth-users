// GoogleAuthButton.js
import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google'; // Импортируем GoogleLogin
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GoogleAuthButton = () => {
  const navigate = useNavigate();
  const handleGoogleAuth = async (response) => {
    try {
      // Логируем сам ответ от Google
      console.log('Google response:', response);

      if (!response.credential) {
        toast.error('Ошибка авторизации через Google');
        return;
      }

      const apiUrl = process.env.REACT_APP_GOOGLE_AUTH_URL; // URL на сервер для обработки Google авторизации
      console.log('API URL:', apiUrl); // Логируем URL, по которому отправляется запрос

      // Отправляем запрос на сервер с токеном Google
      const { data } = await axios.post(apiUrl, {
        token: response.credential, // Токен из Google
      });

      // Логируем ответ от сервера
      console.log('Server response:', data);

      if (data.status === 'ok') {
        toast.success('Успешный вход через Google');
        localStorage.setItem('accessToken', data.message.accessT);
        localStorage.setItem('refreshToken', data.message.refreshT);
        // Здесь можно перенаправить пользователя на нужную страницу
        navigate('/profile');
      } else {
        toast.error('Ошибка авторизации через Google');
      }
    } catch (error) {
      // Логируем ошибку, если она возникает
      console.error('Ошибка при авторизации через Google:', error.message);
      toast.error('Произошла ошибка при авторизации через Google');
    }
  };

  return (
    <GoogleLogin
      onSuccess={(response) => {
        console.log('Google login successful:', response); // Логируем успешную авторизацию
        handleGoogleAuth(response); // Вызываем обработчик для дальнейшей обработки
      }}
      onError={() => toast.error('Ошибка при авторизации через Google')} // Логируем ошибку, если она произошла
      useOneTap
    >
      <button
        type="button"
        className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100"
      >
        <FcGoogle size={25} />
        Увійти через Google
      </button>
    </GoogleLogin>
  );
};

export default GoogleAuthButton;
