import userModel from '../model/user-info.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto'; // Для генерації токенів скидання пароля
import sendResetPasswordEmail from './emailController.js';

const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Контролер для запиту на скидання пароля
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Користувача з таким email не знайдено!' });
    }

    // Генерація токена скидання пароля
    const resetToken = generateResetToken();
    const resetTokenExpiration = Date.now() + 3600000; // Токен дійсний 1 год

    // Зберігаємо токен та термін його дії в базі
    user.resetToken = resetToken;
    user.resetTokenExpiration = resetTokenExpiration;
    await user.save();

    // Надсилання листа з посиланням на скидання пароля
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
    await sendResetPasswordEmail(user.email, resetLink);

    return res.status(200).json({ status: 'ok', message: 'Посилання для скидання пароля відправлено на ваш email' });
  } catch (error) {
    console.error('Помилка при запиті на скидання пароля:', error);
    return res.status(500).json({ error: 'Помилка при обробці запиту на скидання пароля' });
  }
};

// Контролер для скидання пароля
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Знаходимо користувача за токеном скидання
    const user = await userModel.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Неправильний чи прострочений токен!' });
    }

    // Хешуємо новий пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Оновлюємо пароль користувача
    user.password = hashedPassword;
    user.resetToken = undefined; // Очищаємо токен
    user.resetTokenExpiration = undefined; // Очищаємо термін дії токена
    await user.save();

    return res.json({ message: 'Пароль успішно скинутий' });
  } catch (error) {
    console.error('Помилка під час скидання пароля:', error);
    return res.status(500).json({ error: 'Помилка під час скидання пароля' });
  }
};
