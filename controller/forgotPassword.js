import userModel from '../model/user-info.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto'; // Для генерації токенів скидання пароля
import sendResetPasswordEmail from './emailController.js';

// Функція для генерації токена
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Контролер для запиту скидання пароля
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Пользователь с таким email не найден!' });
    }

    // Генерація токена для скидання пароля
    const resetToken = generateResetToken();
    const resetTokenExpiration = Date.now() + 3600000; // Токен діє 1 годину

    // Зберігаємо токен та термін дії в базі даних
    user.resetTokenPassword = resetToken;
    user.resetTokenExpirationPassword = resetTokenExpiration;
    await user.save();

    // Надсилаємо листа з посиланням для скидання пароля
    const url = process.env.NODE_ENV === 'production'
      ? 'https://evgeniiviter.site/'
      : 'http://localhost:3000/';
    const resetLink = `${url}reset-password/${resetToken}`;
    await sendResetPasswordEmail(user.email, resetLink);

    return res.status(200).json({ status: 'ok', message: 'Посилання для скидання пароля відправлено на ваш email' });
  } catch (error) {
    console.error('Помилка при запиті скидання пароля:', error);
    return res.status(500).json({ error: 'Помилка при обробці запиту на скидання пароля' });
  }
};

// Контролер для скидання пароля
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Знаходимо користувача за токеном скидання
    const user = await userModel.findOne({
      resetTokenPassword: token,
      resetTokenExpirationPassword: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Вийшов термін дії токену' });
    }

    // Хешуємо новий пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Оновлюємо пароль користувача
    user.password = hashedPassword;
    user.resetTokenPassword = null; // Очищаємо токен
    user.resetTokenExpirationPassword = null; // Очищаємо термін дії токена
    await user.save();

    return res.json({ message: 'Пароль успішно скинутий' });
  } catch (error) {
    console.error('Помилка під час скидання пароля:', error);
    return res.status(500).json({ error: 'Помилка під час скидання пароля' });
  }
};
