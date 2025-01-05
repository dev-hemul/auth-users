import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaFacebookF } from "react-icons/fa6";

const FacebookAuthButton = () => {
  const authUrl = process.env.REACT_APP_FACEBOOK_AUTH_URL; // URL авторизации, указанный на сервере
  const navigate = useNavigate();
  
  // Этот useEffect будет срабатывать после редиректа
  useEffect(() => {
    // Если в строке запроса есть параметры, обрабатываем их
    const params = new URLSearchParams(window.location.search); // Читаем параметры из адресной строки
    const accessT = params.get('accessT'); // Получаем accessToken
    const refreshT = params.get('refreshT'); // Получаем refreshToken

    if (accessT && refreshT) {

      // Сохраняем токены в localStorage
      localStorage.setItem('accessToken', accessT);
      localStorage.setItem('refreshToken', refreshT);

      // Убираем параметры из адресной строки, чтобы не было лишних данных
      window.history.replaceState({}, document.title, '/profile');

      // Показываем уведомление о успешной авторизации
      toast.success('Успішна авторизація через Facebook');
      navigate('/profile'); // Перенаправляем на страницу профиля
    }
  }, []); // Здесь нет зависимостей, этот эффект сработает только один раз, когда загрузится страница

  // Обработчик кнопки входа
  const handleLoginWithFacebook = () => {
    // Перенаправление пользователя на маршрут авторизации через Facebook
    window.location.href = authUrl;
  };
  
  return (
    <button
      type="button"
      className="flex items-center gap-2 border border-gray-300 px-4 py-2 bg-blue-700 rounded-md hover:bg-blue-600"
      onClick={handleLoginWithFacebook}
    >
      <FaFacebookF className="text-white" size={22} />
    </button>
  );
};

export default FacebookAuthButton;
