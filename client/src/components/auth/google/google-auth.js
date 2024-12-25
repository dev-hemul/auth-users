import { useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const GoogleAuth = ({ onUserAuthenticated }) => {
	
  const GOOGLE_AUTH_URL = 'http://localhost:4000/auth/google';

  useEffect(() => {
    const handleAuthentication = async () => {
      const query = new URLSearchParams(window.location.search);
      const token = query.get('token');
      if (token) {
        try {
          // Сохраняем токен в localStorage
          localStorage.setItem('token', token);

          // Запрашиваем данные пользователя
          const response = await axios.get('http://localhost:4000/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.data.success) {
            toast.success('Успешная авторизация через Google!');
            onUserAuthenticated(response.data.user); // Передаем данные пользователя
            window.history.replaceState(null, '', '/'); // Убираем токен из URL
          } else {
            toast.error('Ошибка при проверке пользователя.');
          }
        } catch (error) {
          toast.error('Не удалось подключиться к серверу.');
        }
      }
    };

    handleAuthentication();
  }, [onUserAuthenticated]);

  return null; // Компонент не отображает UI
};

export default GoogleAuth;