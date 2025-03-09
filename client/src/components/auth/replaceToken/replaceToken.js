import axios from 'axios';

const replaceToken = async (accessToken, refreshToken) => {
  
  const getTokenExpiration = (token) => {

  try {
    const payload = JSON.parse(atob(token.split('.')[1])); // Декодування payload з JWT
    return payload.exp;
  } catch (error) {
    console.error('Недійсна структура токена', error);
    return null;
  }
};
  
  const expirationTime = getTokenExpiration(accessToken);
  if (!expirationTime) {
    console.error('Неможливо визначити термін дії токену');
    return;
  }

  const currentTime = Date.now();
  const refreshTime = expirationTime - 60 * 1000; // Оновити за хвилину до закінчення
  const delay = refreshTime - currentTime;

  // Функція для оновлення токенів
  const refreshTokens = async () => {
  try {
    const apiUrl = process.env.REACT_APP_REPLACE_TOKENS;
    const { data } = await axios.post(apiUrl, { accessT: accessToken, refreshT: refreshToken });

    if (!data.accessT || !data.refreshT) {
      throw new Error('Сервер не вернул новые токены');
    }

    // Обновляем токены в localStorage
    localStorage.setItem('accessToken', data.accessT);
    localStorage.setItem('refreshToken', data.refreshT);

    // Перезапускаем механизм обновления
    await replaceToken(data.accessT, data.refreshT);
  } catch (error) {
    console.error('Не удалось обновить токен:', error);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/'; // Выкидываем на страницу логина
  }
};

// Если токен уже истек, сразу обновляем его
if (delay > 0) {
  setTimeout(refreshTokens, delay);
} else {
  console.warn('Токен истек, пытаемся обновить сразу.');
  await refreshTokens();
}
};

export default replaceToken;
