import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google'; // Імпортуємо GoogleLogin
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GoogleAuthButton = () => {
  const navigate = useNavigate();
  const handleGoogleAuth = async (response) => {
    try {
      // Логіруємо відповідь від Google
      console.log('Google response:', response);

      if (!response.credential) {
        toast.error('Помилка авторизації через Google');
        return;
      }

      const apiUrl = process.env.REACT_APP_GOOGLE_AUTH_URL; // URL на сервер для обробки Google авторизації
      console.log('API URL:', apiUrl); // Логуємо URL, яким надсилається запит

      // Надсилаємо запит на сервер із токеном Google
      const { data } = await axios.post(apiUrl, {
        token: response.credential, // Токен з Google
      });
      console.log(`Дані які надсилаємо серверу: ${data}`);

      // Логуємо відповідь від сервера
      console.log('Server response:', data);

      if (data.status === 'ok') {
        toast.success('Успішний вхід через Google');
        localStorage.setItem('accessToken', data.message.accessT);
        localStorage.setItem('refreshToken', data.message.refreshT);
        // перенаправити користувача на потрібну сторінку при успішному вході
        navigate('/profile');
      } else {
        toast.error('Помилка авторизації через Google');
      }
    } catch (error) {
      // Логуємо помилку, якщо вона виникає
      console.error('Помилка авторизації через Google:', error.message);
      toast.error('Виникла помилка при авторизації через Google');
    }
  };

  return (
    <GoogleLogin
      onSuccess={(response) => {
        console.log('Google login successful:', response); // Логуємо успішну авторизацію
          handleGoogleAuth(response); // Викликаємо обробник для подальшої обробки
      }}
      onError={() => toast.error('Помилка авторизації через Google')} // Логуємо помилку, якщо вона сталася
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
