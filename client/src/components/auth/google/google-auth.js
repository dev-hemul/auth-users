import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-toastify';
import { useGoogleLogin } from '@react-oauth/google'; // Імпортуємо useGoogleLogin
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GoogleAuthButton = () => {
  const navigate = useNavigate();

  // Инициализация useGoogleLogin
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        console.log('Google Token Response:', tokenResponse);

        // Проверяем, есть ли credential
        if (!tokenResponse?.access_token) {
          toast.error('Помилка авторизації через Google (отсутствует access_token)');
          return;
        }

        const apiUrl = process.env.REACT_APP_GOOGLE_AUTH_URL; // URL на сервер для обробки Google авторизації

        // Надсилаємо запит на сервер із токеном Google
        const { data } = await axios.post(apiUrl, {
          token: tokenResponse.access_token, // Используем access_token
        });

        console.log('Server response:', data);

        // Проверка ответа сервера
        if (data.status === 'ok') {
          toast.success('Успішний вхід через Google');
          localStorage.setItem('accessToken', data.message.accessT);
          localStorage.setItem('refreshToken', data.message.refreshT);
          navigate('/profile');
        } else {
          toast.error('Помилка авторизації через Google (неуспішно)');
        }
      } catch (error) {
        console.error('Помилка авторизації через Google:', error.message);
        toast.error('Виникла помилка при авторизації через Google');
      }
    },
    onError: (error) => {
      console.error('Google Auth Error:', error);
      toast.error('Помилка авторизації через Google');
    },
  });

  return (
    <button
      type="button"
      onClick={login}
      className="flex items-center justify-center gap-2 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100"
    >
      <FcGoogle size={25} /> {/* Только иконка без текста */}
    </button>
  );
};

export default GoogleAuthButton;
