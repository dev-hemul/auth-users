import axios from 'axios';

const replaceToken = async (accessToken, refreshToken) => {
  console.log("Актуальные токены после авторизации", accessToken, refreshToken);
  
  const getTokenExpiration = (token) => {
  console.log("Актуальный токен доступа", token)

  try {
    const payload = JSON.parse(atob(token.split('.')[1])); // Декодування payload з JWT
    console.log("Это payload", payload)
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
  console.log("Термін дії токена в мілісекундах", refreshTime)
  const delay = refreshTime - currentTime;

  // Функція для оновлення токенів
  const refreshTokens = async () => {
    try {
      const apiUrl = process.env.REACT_APP_REPLACE_TOKENS;
      const { data } = await axios.post(apiUrl, { accessT: accessToken, refreshT: refreshToken });

      // Збереження нових токенів у localStorage
      const newAccessToken = data.accessT;
      const newRefreshToken = data.refreshT;

      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      // Запуск нового циклу оновлення токенів
      await replaceToken(newAccessToken, newRefreshToken);
    } catch (error) {
      console.error('Не вдалося оновити токен', error);
    }
  };

  // Якщо токен ще дійсний
  if (delay > 0) {
    console.log(`Токен буде оновлено ${Math.round(delay / 1000)} секунд`);
    setTimeout(refreshTokens, delay);
  } else {
    console.warn('Термін дії токена минув або скоро закінчиться. Відразу оновлюємо');
    await refreshTokens();
  }
};

export default replaceToken;
