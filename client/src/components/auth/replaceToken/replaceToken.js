import axios from 'axios';

const replaceToken = (accessToken, refreshToken) => {
  console.log('Access Token в начале функции:', accessToken);
    console.log('Refresh Token в начале функции:', refreshToken);
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

  const expirationTime = getTokenExpiration(accessToken);

  if (!expirationTime) {
    console.error('Cannot determine token expiration time');
    return;
  }

  const currentTime = Date.now();
  const refreshTime = expirationTime - 60 * 1000; // Обновить за минуту до истечения

  const delay = refreshTime - currentTime;

  if (delay > 0) {
    setTimeout(async () => {
      try {
        const apiUrl = process.env.REACT_APP_REPLACE_TOKENS;
        const { data } = await axios.post(apiUrl, { accessT: accessToken, refreshT: refreshToken });
        console.log("Тут должны прийти новые токены от сервера", data.accessToken, data.refreshToken);
        localStorage.setItem('accessToken', data.payload.Newtokens.accessToken);
        localStorage.setItem('refreshToken', data.payload.Newtokens.refreshToken);
        replaceToken(data.payload.Newtokens.accessToken, data.payload.Newtokens.refreshToken); // Запланировать обновление для новых токенов
      } catch (error) {
        console.error('Failed to refresh tokens', error);
      }
    }, delay);
  } else {
    console.warn('Token is expired or about to expire soon. Immediate refresh required.');
  }
};

export default replaceToken;
