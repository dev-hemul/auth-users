import axios from 'axios';

const getTokenExpiration = (token) => {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    console.error('Invalid token provided');
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1])); // Декодирование payload из JWT
    return payload.exp * 1000; // exp в секундах, переводим в миллисекунды
  } catch (error) {
    console.error('Invalid token structure', error);
    return null;
  }
};

const replaceToken = async (accessToken, refreshToken) => {
  const expirationTime = getTokenExpiration(accessToken);
  if (!expirationTime) {
    console.error('Cannot determine token expiration time');
    return;
  }

  const currentTime = Date.now();
  const refreshTime = expirationTime - 60 * 1000; // Обновить за минуту до истечения
  console.log("Срок действия токена в милисекундах", refreshTime)
  const delay = refreshTime - currentTime;

  // Функция для выполнения обновления токенов
  const refreshTokens = async () => {
    try {
      const apiUrl = process.env.REACT_APP_REPLACE_TOKENS;
      const { data } = await axios.post(apiUrl, { accessT: accessToken, refreshT: refreshToken });

      // Сохранение новых токенов в localStorage
      const newAccessToken = data.payload.Newtokens.accessToken;
      const newRefreshToken = data.payload.Newtokens.refreshToken;

      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      console.log('%cTokens successfully refreshed:', 'color: green', { newAccessToken, newRefreshToken });

      // Запуск нового цикла обновления токенов
      await replaceToken(newAccessToken, newRefreshToken);
    } catch (error) {
      console.error('Failed to refresh tokens', error);
    }
  };

  // Если токен еще действителен
  if (delay > 0) {
    console.log(`Token will be refreshed in ${Math.round(delay / 1000)} seconds`);
    setTimeout(refreshTokens, delay);
  } else {
    console.warn('Token is expired or will expire soon. Refreshing immediately.');
    await refreshTokens();
  }
  
  console.log("Итоговые логи", delay, currentTime, refreshTime, expirationTime);
};

export default replaceToken;
