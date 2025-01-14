import axios from 'axios';

const replaceToken = async (accessToken, refreshToken) => {
  console.log("Актуальные токены после авторизации", accessToken, refreshToken);
  
  const getTokenExpiration = (token) => {
  console.log("Актуальный токен доступа", token)
  /*if (!token || typeof token !== 'string' || !token.includes('.')) {
    console.error('Invalid token provided');
    return null;
  }*/

  try {
    const payload = JSON.parse(atob(token.split('.')[1])); // Декодирование payload из JWT
    console.log("Это payload", payload)
    return payload.exp; // exp в секундах, переводим в миллисекунды
  } catch (error) {
    console.error('Invalid token structure', error);
    return null;
  }
};
  
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
      console.log("Новые сгенерированые токены", data)

      // Сохранение новых токенов в localStorage
      const newAccessToken = data.accessT;
      const newRefreshToken = data.refreshT;
      console.log("Новый Токен доступа", newAccessToken);
      console.log("Новый refresh токен", newRefreshToken);

      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      /*console.log('%cTokens successfully refreshed:', 'color: green', { newAccessToken, newRefreshToken });*/

      // Запуск нового цикла обновления токенов
      await replaceToken(newAccessToken, newRefreshToken);
    } catch (error) {
      /*console.error('Failed to refresh tokens', error);*/
    }
  };

  // Если токен еще действителен
  if (delay > 0) {
    /*console.log(`Token will be refreshed in ${Math.round(delay / 1000)} seconds`);*/
    setTimeout(refreshTokens, delay);
  } else {
    console.warn('Token is expired or will expire soon. Refreshing immediately.');
    await refreshTokens();
  }
  
  /*console.log("Итоговые логи", delay, currentTime, refreshTime, expirationTime);*/
};

export default replaceToken;
