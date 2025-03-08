import User from '../model/user-info.js';
import { getPayloadAccessT } from './auth.js';

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    const authHeader = req.headers.authorization;
    console.log(`Сам токен ${authHeader}`);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const token = authHeader.split(' ')[1];
    console.log(`часть токена ${token}`)

    let userId;
    try {
      const payload = getPayloadAccessT(token);
      console.log(`Сам payload: ${JSON.stringify(payload)}`);
      userId = payload.iss; // Получаем ID пользователя
      console.log(`ID пользователя ${userId}`)
    } catch (error) {
      return res.status(403).json({ message: 'Некорректный токен' });
    }

    const avatarUrl = req.file.path;

    // Сохраняем URL в БД
    const user = await User.findByIdAndUpdate(userId, { avatar: avatarUrl }, { new: true });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({ avatar: avatarUrl, message: 'Аватар успешно обновлён' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при загрузке аватара' });
  }
};
